"use client";

import { useState } from "react";
import { db } from "@/app/lib/firebase";
import { useRouter } from "next/navigation";
import { 
  collection, serverTimestamp, 
  query, where, getDocs, doc, writeBatch 
} from "firebase/firestore";
import imageCompression from 'browser-image-compression';
import { MdErrorOutline, MdFingerprint, MdWarningAmber, MdSchool } from "react-icons/md";
import { uploadToCloudinary } from "@/app/lib/cloudinaryUpload";
import IDCardModal from "../../components/IDCardModal";

export default function RegisterPage() {
  const router = useRouter();
  const [error, setError] = useState("");
  const [validationErrors, setValidationErrors] = useState({});
  const [photo, setPhoto] = useState(null);
  const [photoPreview, setPhotoPreview] = useState(null);
  const [loading, setLoading] = useState(false);
  const [registeredClient, setRegisteredClient] = useState(null);

  const [showKeyModal, setShowKeyModal] = useState(true);
  const [accessKey, setAccessKey] = useState("");
  const [keyError, setKeyError] = useState("");
  const [verifiedKey, setVerifiedKey] = useState("");

  const [autoFullname, setAutoFullname] = useState("");
  const [autoMembershipId, setAutoMembershipId] = useState("");
  const [autoOrgId, setAutoOrgId] = useState("");

  // ⭐ Track state of the exit status to conditionally render the graduation class dropdown
  const [exitStatus, setExitStatus] = useState("");

  // Generate years array from 2007 to 2025
  const graduationYears = Array.from({ length: 2025 - 2007 + 1 }, (_, i) => 2007 + i);

  const closeModal = () => {
    router.push("/");
  };

  const verifyAccessKey = async () => {
    setLoading(true);
    setKeyError("");

    try {
      const q = query(
        collection(db, "reg_codes"),
        where("code", "==", accessKey.trim())
      );

      const snap = await getDocs(q);

      if (snap.empty) {
        setKeyError("Invalid Access Key");
        setLoading(false);
        return;
      }

      const docData = snap.docs[0].data();

      if (docData.status === "used") {
        setKeyError("This key has already been used for registration.");
        setLoading(false);
        return;
      }

      setAutoFullname(docData.assignedTo || "");
      setAutoMembershipId(docData.membershipId || "");
      setAutoOrgId(docData.orgId || "SHERGOSA"); 

      setVerifiedKey(accessKey);
      setShowKeyModal(false);

    } catch (err) {
      setKeyError("Error verifying key.");
    }

    setLoading(false);
  };

  const validateForm = (formData) => {
    const errors = {};
    if (!photo) errors.photo = "Passport photo is required";
    if (!formData.get("manualClientId")) errors.manualClientId = "Unique Client ID is required";
    if (!formData.get("fullname")) errors.fullname = "Full name is required";
    if (!formData.get("pob")) errors.pob = "Place of birth is required";
    if (!formData.get("dob")) errors.dob = "Date of birth is required";
    if (!formData.get("gender")) errors.gender = "Please select a gender";
    if (!formData.get("tel")) errors.tel = "Phone number is required";
    if (!formData.get("occupation")) errors.occupation = "Occupation is required";
    if (!formData.get("address")) errors.address = "Address is required";

    if (!formData.get("eduPeriod")) errors.eduPeriod = "Years attended layout is required (e.g. 2011-2013)";
    if (!formData.get("exitStatus")) errors.exitStatus = "Please state your historical student exit status";
    
    // Only validate className if the student selected "Graduated"
    if (exitStatus === "Graduated" && !formData.get("className")) {
      errors.className = "Please select your graduation class year";
    }
    
    if (!formData.get("classOccupied")) errors.classOccupied = "Please specify the classes or streams you occupied";

    setValidationErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handlePhotoChange = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setValidationErrors(prev => ({ ...prev, photo: null }));

    const options = { maxSizeMB: 0.2, maxWidthOrHeight: 600, useWebWorker: true };
    try {
      setLoading(true);
      const compressedFile = await imageCompression(file, options);
      setPhoto(compressedFile);
      setPhotoPreview(URL.createObjectURL(compressedFile));
    } catch (err) {
      setError("Failed to process image.");
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const form = e.target;
    const formData = new FormData(form);

    if (!validateForm(formData)) {
      window.scrollTo({ top: 0, behavior: 'smooth' });
      return;
    }

    setLoading(true);
    setError("");

    try {
      const codeQuery = query(collection(db, "reg_codes"), where("code", "==", verifiedKey));
      const codeSnap = await getDocs(codeQuery);

      if (codeSnap.empty) {
        setError("Registration key no longer valid.");
        setLoading(false);
        return;
      }

      const regCodeDoc = codeSnap.docs[0];
      const manualClientId = formData.get("manualClientId").trim().toUpperCase();

      const idDuplicateQuery = query(
        collection(db, "clients"), 
        where("orgId", "==", autoOrgId),
        where("clientId", "==", manualClientId)
      );
      const idDuplicateSnap = await getDocs(idDuplicateQuery);

      if (!idDuplicateSnap.empty) {
        setValidationErrors(prev => ({ ...prev, manualClientId: "This ID is already registered in this system." }));
        setLoading(false);
        return;
      }

      const photoURL = await uploadToCloudinary(photo);

      const clientData = {
        clientId: manualClientId,
        fullname: autoFullname.trim().toUpperCase(),
        orgId: autoOrgId, 
        role: "client",
        pob: formData.get("pob").trim(),
        dob: formData.get("dob"),
        gender: formData.get("gender"),
        tel: formData.get("tel").replace(/\s+/g, ""),
        occupation: formData.get("occupation").trim(),
        address: formData.get("address").trim(),
        eduPeriod: formData.get("eduPeriod").trim(),
        exitStatus: formData.get("exitStatus"), 
        // Save graduation year if graduated, otherwise save an empty string or null
        className: exitStatus === "Graduated" ? formData.get("className") : "",
        classOccupied: formData.get("classOccupied").trim(),
        regCode: verifiedKey,
        membershipTier: formData.get("membershipTier") || "Standard",
        photoURL,
        createdAt: serverTimestamp(),
      };

      const batch = writeBatch(db);

      const newClientRef = doc(collection(db, "clients"));
      batch.set(newClientRef, clientData);

      const regCodeRef = doc(db, "reg_codes", regCodeDoc.id);
      batch.update(regCodeRef, { 
        status: "used",
        usedAt: serverTimestamp(),
        usedBy: manualClientId
      });

      await batch.commit();

      setRegisteredClient(clientData);
      form.reset();
      setPhotoPreview(null);
      setPhoto(null);
      setExitStatus("");
      setValidationErrors({});

    } catch (err) {
      console.error("Submit Error:", err);
      setError("Registration failed. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const InputError = ({ name }) => (
    validationErrors[name] ? (
      <p className="flex items-center gap-1 text-[10px] text-red-500 font-bold mt-1 ml-1 animate-pulse">
        <MdWarningAmber /> {validationErrors[name]}
      </p>
    ) : null
  );

  return (
    <>
      {showKeyModal && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 backdrop-blur-sm">
          <div className="bg-white p-8 rounded-2xl shadow-xl w-[350px] relative animate-in zoom-in-95 duration-300">
            <button
              onClick={closeModal}
              className="absolute top-4 right-4 text-gray-400 hover:text-red-500 transition-colors p-1"
              aria-label="Close and go to home"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>

            <h2 className="text-xl font-bold text-center mb-4 text-blue-900">
              Membership Access Key
            </h2>

            <p className="text-sm text-gray-500 text-center mb-6">
              Enter your registration key to continue
            </p>

            <input
              value={accessKey}
              onChange={(e) => setAccessKey(e.target.value.toUpperCase())}
              placeholder="PREFIX-XXXXXX"
              className="w-full p-3 border-2 border-blue-50 rounded-lg text-center font-mono tracking-widest focus:border-sky-400 outline-none transition-all"
            />

            {keyError && (
              <p className="text-red-500 text-xs mt-2 text-center font-bold">
                {keyError}
              </p>
            )}

            <button
              onClick={verifyAccessKey}
              disabled={loading}
              className={`w-full mt-4 py-3 rounded-lg font-bold text-white transition-all ${loading ? "bg-gray-400" : "bg-sky-500 hover:bg-sky-600 shadow-md active:scale-95"}`}
            >
              {loading ? "Checking..." : "Verify Key"}
            </button>
          </div>
        </div>
      )}

      <main className="min-h-screen bg-slate-50 flex justify-center px-6 py-10">
        <div className="w-full max-w-3xl bg-white rounded-3xl shadow-2xl p-8 border-t-8 border-sky-400">

          <div className="text-center mb-10">
            <h1 className="text-3xl font-black text-blue-900 tracking-tighter uppercase">Alumni Membership</h1>
            <p className="text-gray-500 font-medium">Digital Registration Workspace Portal</p>
          </div>

          <form onSubmit={handleSubmit} noValidate className="grid grid-cols-1 md:grid-cols-2 gap-5">

            {/* PHOTO UPLOAD */}
            <div className="md:col-span-2 flex flex-col items-center pb-4">
              <div className={`w-32 h-40 rounded-lg border-2 border-dashed overflow-hidden mb-4 bg-gray-50 flex items-center justify-center ${validationErrors.photo ? 'border-red-400' : 'border-blue-200'}`}>
                {photoPreview ? <img src={photoPreview} alt="Preview" className="w-full h-full object-cover" /> : <span className="text-gray-300 text-xs text-center p-4">Member Photo</span>}
              </div>
              <input id="photo" type="file" accept="image/*" onChange={handlePhotoChange} className="hidden" />
              <label htmlFor="photo" className="bg-sky-500 text-white px-6 py-2 rounded-full text-[10px] font-black uppercase cursor-pointer hover:bg-sky-600 transition-all">Upload Photo</label>
              <InputError name="photo" />
            </div>

            {/* ASSIGN ID */}
            <div className={`md:col-span-2 p-4 rounded-2xl border ${validationErrors.manualClientId ? 'bg-red-50 border-red-200' : 'bg-blue-50 border-blue-100'}`}>
              <label className="text-[10px] font-black text-blue-600 uppercase mb-1 flex items-center gap-1">
                Assign Membership ID <MdFingerprint />
              </label>
              <input
                name="manualClientId"
                value={autoMembershipId}
                readOnly
                className="input-field border-2 text-blue-800 bg-blue-100"
              />
              <InputError name="manualClientId" />
            </div>

            {/* PERSONAL DETAILS SECTION */}
            <div className="md:col-span-2 text-sky-600 font-black text-[10px] uppercase tracking-[0.2em] border-b pb-1 mb-2 mt-4">Personal Details</div>

            <div className="md:col-span-2">
              <input
                name="fullname"
                value={autoFullname}
                readOnly
                className="input-field bg-gray-100"
              />
              <InputError name="fullname" />
            </div>

            <div>
              <input name="pob" className="input-field" placeholder="Place of Birth" />
              <InputError name="pob" />
            </div>

            <div>
              <label className="text-[10px] font-bold text-gray-500 uppercase ml-1">
                Date of Birth
              </label>
              <input type="date" name="dob" className="input-field" />
              <InputError name="dob" />
            </div>

            <div>
              <select name="gender" className="input-field">
                <option value="">Select Gender</option>
                <option>Male</option>
                <option>Female</option>
              </select>
              <InputError name="gender" />
            </div>

            <div>
              <input name="tel" className="input-field" placeholder="Phone Number" />
              <InputError name="tel" />
            </div>

            <div className="md:col-span-2">
              <input name="occupation" className="input-field" placeholder="Occupation" />
              <InputError name="occupation" />
            </div>

            <div className="md:col-span-2">
              <input name="address" className="input-field" placeholder="Residential Address" />
              <InputError name="address" />
            </div>

            {/* SCHOOL RECORDS SECTION */}
            <div className="md:col-span-2 text-sky-600 font-black text-[10px] uppercase tracking-[0.2em] border-b pb-1 mt-6 mb-2">
              School Records <MdSchool className="inline ml-1" />
            </div>

            <div>
              <input
                name="eduPeriod"
                className="input-field"
                placeholder="Years Attended (e.g. 2005-2007 or 2011)"
              />
              <span className="text-[9px] text-gray-400 block mt-1 ml-1 leading-none">Specify your specific period spent on campus.</span>
              <InputError name="eduPeriod" />
            </div>

            {/* Enrollment Exit Status Dropset */}
            <div>
              <select 
                name="exitStatus" 
                className="input-field"
                value={exitStatus}
                onChange={(e) => setExitStatus(e.target.value)}
              >
                <option value="">-- Student Exit Type --</option>
                <option value="Graduated">Completed / Graduated here</option>
                <option value="Transferred">Transferred out early</option>
                <option value="Other">Other / Short stay</option>
              </select>
              <InputError name="exitStatus" />
            </div>

            {/* ⭐ CONDITIONAL RENDERING: Only shows if exitStatus === "Graduated" */}
            {exitStatus === "Graduated" && (
              <div className="md:col-span-2 transition-all duration-300">
                <label className="text-[10px] font-bold text-gray-500 uppercase ml-1">
                  Graduating Class Year
                </label>
                <select name="className" className="input-field mt-1">
                  <option value="">-- Select Graduation Year --</option>
                  {graduationYears.map((year) => (
                    <option key={year} value={year}>
                      {year}
                    </option>
                  ))}
                </select>
                <span className="text-[9px] text-gray-400 block mt-1 ml-1 leading-none">
                  Select your exact validation assignment batch class.
                </span>
                <InputError name="className" />
              </div>
            )}

            <div className="md:col-span-2">
              <input 
                name="classOccupied" 
                className="input-field" 
                placeholder="Class Streams Occupied (e.g., SSS 1 Com 1 to SSS 3 Com)" 
              />
              <span className="text-[9px] text-gray-400 block mt-1 ml-1 leading-none">
                Specify the specific streams or arms you transitioned through.
              </span>
              <InputError name="classOccupied" />
            </div>

            {error && (
              <div className="md:col-span-2 flex items-center gap-3 bg-red-50 p-4 rounded-xl border border-red-100">
                <MdErrorOutline className="text-red-500 text-xl" />
                <p className="text-red-700 text-sm font-bold">{error}</p>
              </div>
            )}

            <button disabled={loading} className={`md:col-span-2 py-4 rounded-xl font-black text-white uppercase tracking-widest transition-all ${loading ? "bg-gray-300" : "bg-sky-500 hover:bg-sky-600 shadow-lg active:scale-95"}`}>
              {loading ? "Registering..." : "Complete Registration"}
            </button>
          </form>
        </div>
      </main>

      {registeredClient && <IDCardModal client={registeredClient} onClose={() => setRegisteredClient(null)} />}

      <style jsx>{`
        .input-field {
          width: 100%;
          padding: 1rem;
          background-color: #f8fafc;
          border-radius: 1rem;
          outline: none;
          font-weight: 700;
          font-size: 0.875rem;
          border: 1px solid transparent;
          transition: all 0.2s;
        }
        .input-field:focus {
          border-color: #38bdf8;
          background-color: white;
          box-shadow: 0 0 0 4px #e0f2fe;
        }
      `}</style>
    </>
  );
}