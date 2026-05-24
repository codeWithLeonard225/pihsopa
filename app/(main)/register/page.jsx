"use client";

import { useState } from "react";
import { db } from "@/app/lib/firebase";
import { useRouter } from "next/navigation";
import { 
  collection, serverTimestamp, 
  query, where, getDocs, doc, writeBatch 
} from "firebase/firestore";
import imageCompression from 'browser-image-compression';
import { MdErrorOutline, MdFingerprint, MdWarningAmber, MdSchool, MdWork, MdLayers } from "react-icons/md";
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

  // Professional status visibility toggle helper state
  const [employmentStatus, setEmploymentStatus] = useState("");

  // Timeline lookup collections helper ranges
  const enrollmentYears = Array.from({ length: 2026 - 2000 + 1 }, (_, i) => 2000 + i);
  const calendarDays = Array.from({ length: 31 }, (_, i) => i + 1);
  const calendarMonths = [
    "January", "February", "March", "April", "May", "June", 
    "July", "August", "September", "October", "November", "December"
  ];

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
    if (!formData.get("manualClientId")) errors.manualClientId = "Admission Number is required";
    if (!formData.get("fullname")) errors.fullname = "Full name is required";
    if (!formData.get("address")) errors.address = "Current residential address is required";
    if (!formData.get("tel")) errors.tel = "Contact phone number is required";
    
    // Birth fields validation check
    if (!formData.get("dobMonth")) errors.dobMonth = "Select birth month";
    if (!formData.get("dobDay")) errors.dobDay = "Select birth day";
    if (!formData.get("dobYear")) errors.dobYear = "Select birth year";
    if (!formData.get("gender")) errors.gender = "Please select a gender";

    // Academic information validations
    if (!formData.get("yearAdmission")) errors.yearAdmission = "Year of admission is required";
    if (!formData.get("formAdmitted")) errors.formAdmitted = "Specify form admitted into";
    if (!formData.get("formAttained")) errors.formAttained = "Specify form completed";
    if (!formData.get("yearGraduation")) errors.yearGraduation = "Year of graduation or leaving is required";

    // Post-Secondary / Tertiary Information validations (Enforced Required)
    if (!formData.get("tertiaryCollege") || !formData.get("tertiaryCollege").trim()) {
      errors.tertiaryCollege = "College or University name is required";
    }
    if (!formData.get("tertiaryProgram") || !formData.get("tertiaryProgram").trim()) {
      errors.tertiaryProgram = "Area of study / program is required";
    }
    if (!formData.get("tertiaryQualifications") || !formData.get("tertiaryQualifications").trim()) {
      errors.tertiaryQualifications = "Attained qualification is required";
    }

    // Professional status layout verification
    if (!formData.get("professionalStatus")) errors.professionalStatus = "Please declare your current status";
    if ((employmentStatus === "Employed" || employmentStatus === "Private Business") && !formData.get("placeOfWork")) {
      errors.placeOfWork = "Workplace or business address context is required";
    }

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
        setValidationErrors(prev => ({ ...prev, manualClientId: "This Admission Number is already registered in this system." }));
        setLoading(false);
        return;
      }

      const photoURL = await uploadToCloudinary(photo);

      // Consolidate full split structural components into safe flat record formats
      const fullDobString = `${formData.get("dobMonth")} ${formData.get("dobDay")}, ${formData.get("dobYear")}`;

      const clientData = {
        clientId: manualClientId,
        fullname: autoFullname.trim().toUpperCase(),
        orgId: autoOrgId, 
        role: "client",
        address: formData.get("address").trim(),
        tel: formData.get("tel").replace(/\s+/g, ""),
        dob: fullDobString,
        gender: formData.get("gender"),

        // Academic profile fields tracking mapping setup
        yearAdmission: formData.get("yearAdmission"),
        formAdmitted: formData.get("formAdmitted").trim(),
        formAttained: formData.get("formAttained").trim(),
        yearGraduation: formData.get("yearGraduation"),

        // Higher education fields tracker attributes
        tertiaryCollege: formData.get("tertiaryCollege").trim(),
        tertiaryProgram: formData.get("tertiaryProgram").trim(),
        tertiaryYearEnrolled: formData.get("tertiaryYearEnrolled") || "N/A",
        tertiaryYearCompleted: formData.get("tertiaryYearCompleted") || "N/A",
        tertiaryQualifications: formData.get("tertiaryQualifications").trim(),

        // Professional alignment details tracking context variables
        professionalStatus: formData.get("professionalStatus"),
        placeOfWork: formData.get("placeOfWork")?.trim() || "N/A",

        regCode: verifiedKey,
        membershipTier: "Standard",
        photoURL,
        createdAt: serverTimestamp(),
      };

      const batch = writeBatch(db);

      const newClientRef = doc(collection(db, "clients"));
      const regCodeRef = doc(db, "reg_codes", regCodeDoc.id);
      
      batch.set(newClientRef, clientData);
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
      setEmploymentStatus("");
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
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 backdrop-blur-sm px-4">
          <div className="bg-white p-6 md:p-8 rounded-2xl shadow-xl w-full max-w-[350px] relative animate-in zoom-in-95 duration-300">
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

      <main className="min-h-screen bg-slate-50 flex justify-center px-4 md:px-6 py-6 md:py-10">
        <div className="w-full max-w-3xl bg-white rounded-3xl shadow-2xl p-5 md:p-8 border-t-8 border-sky-400">

          <div className="text-center mb-8">
            <h1 className="text-2xl md:text-3xl font-black text-blue-900 tracking-tighter uppercase">PIHS OPA Registration</h1>
            <p className="text-gray-500 text-sm font-medium">Official Old Pupils Profile Ledger Setup</p>
          </div>

          <form onSubmit={handleSubmit} noValidate className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-5">

            {/* PHOTO UPLOAD */}
            <div className="md:col-span-2 flex flex-col items-center pb-2">
              <div className={`w-32 h-40 rounded-lg border-2 border-dashed overflow-hidden mb-3 bg-gray-50 flex items-center justify-center ${validationErrors.photo ? 'border-red-400' : 'border-blue-200'}`}>
                {photoPreview ? <img src={photoPreview} alt="Preview" className="w-full h-full object-cover" /> : <span className="text-gray-300 text-xs text-center p-4">Member Photo</span>}
              </div>
              <input id="photo" type="file" accept="image/*" onChange={handlePhotoChange} className="hidden" />
              <label htmlFor="photo" className="bg-sky-500 text-white px-6 py-2 rounded-full text-[10px] font-black uppercase cursor-pointer hover:bg-sky-600 transition-all">Upload Passport</label>
              <InputError name="photo" />
            </div>

            {/* SECTION 1: PERSONAL INFORMATION */}
            <div className="md:col-span-2 text-sky-600 font-black text-[10px] uppercase tracking-[0.2em] border-b pb-1 mb-1 mt-2">
              Personal Information
            </div>

            <div className="md:col-span-2">
              <label className="text-[10px] font-bold text-gray-400 uppercase ml-1 block mb-1">Fullname</label>
              <input
                name="fullname"
                value={autoFullname}
                readOnly
                className="input-field bg-gray-100 text-gray-500 cursor-not-allowed"
              />
              <InputError name="fullname" />
            </div>

            <div className="md:col-span-2">
              <label className="text-[10px] font-black text-blue-600 uppercase mb-1 flex items-center gap-1 ml-1">
                Admission No (Assigned System ID) <MdFingerprint />
              </label>
              <input
                name="manualClientId"
                value={autoMembershipId}
                readOnly
                className="input-field border-2 text-blue-800 bg-blue-50/50 font-bold"
              />
              <InputError name="manualClientId" />
            </div>

            <div className="md:col-span-2">
              <label className="text-[10px] font-bold text-gray-400 uppercase ml-1 block mb-1">Current Address</label>
              <input name="address" className="input-field" placeholder="Enter residential address" />
              <InputError name="address" />
            </div>

            <div className="md:col-span-2">
              <label className="text-[10px] font-bold text-gray-400 uppercase ml-1 block mb-1">Contact Phone Number</label>
              <input name="tel" className="input-field" placeholder="e.g. +232 XX XXXXXX" />
              <InputError name="tel" />
            </div>

            {/* Date of Birth Selection Strings */}
            <div className="md:col-span-2">
              <label className="text-[10px] font-bold text-gray-400 uppercase ml-1 block mb-1">Date of Birth</label>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                <div>
                  <select name="dobMonth" className="input-field">
                    <option value="">Month</option>
                    {calendarMonths.map(m => <option key={m} value={m}>{m}</option>)}
                  </select>
                  <InputError name="dobMonth" />
                </div>
                <div>
                  <select name="dobDay" className="input-field">
                    <option value="">Day</option>
                    {calendarDays.map(d => <option key={d} value={d}>{d}</option>)}
                  </select>
                  <InputError name="dobDay" />
                </div>
                <div>
                  <select name="dobYear" className="input-field">
                    <option value="">Year</option>
                    {Array.from({ length: 70 }, (_, i) => 2016 - i).map(y => (
                      <option key={y} value={y}>{y}</option>
                    ))}
                  </select>
                  <InputError name="dobYear" />
                </div>
              </div>
            </div>

            <div className="md:col-span-2">
              <label className="text-[10px] font-bold text-gray-400 uppercase ml-1 block mb-1">Gender</label>
              <div className="flex gap-6 ml-1 mt-2">
                <label className="flex items-center gap-2 text-sm font-bold text-slate-700 cursor-pointer">
                  <input type="radio" name="gender" value="Male" className="accent-sky-500 scale-110" /> Male
                </label>
                <label className="flex items-center gap-2 text-sm font-bold text-slate-700 cursor-pointer">
                  <input type="radio" name="gender" value="Female" className="accent-sky-500 scale-110" /> Female
                </label>
              </div>
              <InputError name="gender" />
            </div>

            {/* SECTION 2: ACADEMIC INFORMATION */}
            <div className="md:col-span-2 text-sky-600 font-black text-[10px] uppercase tracking-[0.2em] border-b pb-1 mt-4 mb-1">
              Academic Information <MdSchool className="inline ml-1 text-sm" />
            </div>

            <div>
              <label className="text-[10px] font-bold text-gray-400 uppercase ml-1 block mb-1">Year of Admission</label>
              <select name="yearAdmission" className="input-field">
                <option value="">Select Year</option>
                {enrollmentYears.reverse().map(y => <option key={y} value={y}>{y}</option>)}
              </select>
              <InputError name="yearAdmission" />
            </div>

            <div>
              <label className="text-[10px] font-bold text-gray-400 uppercase ml-1 block mb-1">Form Admitted</label>
              <input name="formAdmitted" className="input-field" placeholder="e.g. JSS 1 / SSS 1" />
              <InputError name="formAdmitted" />
            </div>

            <div>
              <label className="text-[10px] font-bold text-gray-400 uppercase ml-1 block mb-1">Form Attained / Completed</label>
              <input name="formAttained" className="input-field" placeholder="e.g. SSS 3" />
              <InputError name="formAttained" />
            </div>

            <div>
              <label className="text-[10px] font-bold text-gray-400 uppercase ml-1 block mb-1">Year of Graduation / Left</label>
              <select name="yearGraduation" className="input-field">
                <option value="">Select Year</option>
                {Array.from({ length: 2026 - 2007 + 1 }, (_, i) => 2007 + i).reverse().map(y => (
                  <option key={y} value={y}>{y}</option>
                ))}
              </select>
              <InputError name="yearGraduation" />
            </div>

            {/* SECTION 3: POST-SECONDARY / TERTIARY INFORMATION */}
            <div className="md:col-span-2 text-sky-600 font-black text-[10px] uppercase tracking-[0.2em] border-b pb-1 mt-4 mb-1">
              Post-Secondary / Tertiary Information <MdLayers className="inline ml-1 text-sm" />
            </div>

            <div className="md:col-span-2">
              <label className="text-[10px] font-bold text-gray-400 uppercase ml-1 block mb-1">College / University Attended</label>
              <input name="tertiaryCollege" className="input-field" placeholder="Enter institution name" />
              <InputError name="tertiaryCollege" />
            </div>

            <div className="md:col-span-2">
              <label className="text-[10px] font-bold text-gray-400 uppercase ml-1 block mb-1">Area of Study / Program</label>
              <input name="tertiaryProgram" className="input-field" placeholder="e.g. Management Information Systems, Computer Science" />
              <InputError name="tertiaryProgram" />
            </div>

            <div>
              <label className="text-[10px] font-bold text-gray-400 uppercase ml-1 block mb-1">Year Enrolled</label>
              <input name="tertiaryYearEnrolled" type="number" min="1990" max="2026" className="input-field" placeholder="YYYY (Optional)" />
            </div>

            <div>
              <label className="text-[10px] font-bold text-gray-400 uppercase ml-1 block mb-1">Year Completed</label>
              <input name="tertiaryYearCompleted" type="number" min="1990" max="2032" className="input-field" placeholder="YYYY (Optional)" />
            </div>

            <div className="md:col-span-2">
              <label className="text-[10px] font-bold text-gray-400 uppercase ml-1 block mb-1">Qualification(s) Attained</label>
              <input name="tertiaryQualifications" className="input-field" placeholder="e.g. BSc, BA, Higher Diploma" />
              <InputError name="tertiaryQualifications" />
            </div>

            {/* SECTION 4: PROFESSIONAL STATUS */}
            <div className="md:col-span-2 text-sky-600 font-black text-[10px] uppercase tracking-[0.2em] border-b pb-1 mt-4 mb-1">
              Professional Status <MdWork className="inline ml-1 text-sm" />
            </div>

           <div className="md:col-span-2">
  <label className="text-[10px] font-bold text-gray-500 uppercase ml-1 block mb-2">
    Current Status
  </label>

  <div className="flex flex-wrap gap-4 sm:gap-6 ml-1">

    {/* STUDENT */}
    <label className="flex items-center gap-2 text-sm font-bold text-slate-700 cursor-pointer">
      <input 
        type="radio" 
        name="professionalStatus" 
        value="Student" 
        className="accent-sky-500 scale-110"
        onChange={(e) => setEmploymentStatus(e.target.value)} 
      />
      Student
    </label>

    {/* PRIVATE BUSINESS */}
    <label className="flex items-center gap-2 text-sm font-bold text-slate-700 cursor-pointer">
      <input 
        type="radio" 
        name="professionalStatus" 
        value="Private Business" 
        className="accent-sky-500 scale-110"
        onChange={(e) => setEmploymentStatus(e.target.value)} 
      />
      Private Business
    </label>

    {/* EMPLOYED */}
    <label className="flex items-center gap-2 text-sm font-bold text-slate-700 cursor-pointer">
      <input 
        type="radio" 
        name="professionalStatus" 
        value="Employed" 
        className="accent-sky-500 scale-110"
        onChange={(e) => setEmploymentStatus(e.target.value)} 
      />
      Employed
    </label>

    {/* UNEMPLOYED */}
    <label className="flex items-center gap-2 text-sm font-bold text-slate-700 cursor-pointer">
      <input 
        type="radio" 
        name="professionalStatus" 
        value="Unemployed" 
        className="accent-sky-500 scale-110"
        onChange={(e) => setEmploymentStatus(e.target.value)} 
      />
      Unemployed
    </label>

  </div>

  <InputError name="professionalStatus" />
</div>

            {/* Dynamically display field or change context phrasing cleanly */}
           {(
  employmentStatus === "Employed" || 
  employmentStatus === "Private Business" ||
  employmentStatus === "Student"
) && (
              <div className="md:col-span-2 transition-all duration-300 animate-in fade-in-50 slide-in-from-top-2">
               <label className="text-[10px] font-bold text-gray-400 uppercase ml-1 block mb-1">
  {employmentStatus === "Private Business"
    ? "Business Name"
    : employmentStatus === "Student"
    ? "School / College Name"
    : "Place of Work"}
</label>

<input 
  name="placeOfWork" 
  className="input-field" 
  placeholder={
    employmentStatus === "Private Business"
      ? "Enter business name"
      : employmentStatus === "Student"
      ? "Enter school or university name"
      : "Enter company or office name"
  } 
/>
             
                <InputError name="placeOfWork" />
              </div>
            )}

            {/* SUBMIT BUTTON HANDLERS */}
            {error && (
              <div className="md:col-span-2 flex items-center gap-3 bg-red-50 p-4 rounded-xl border border-red-100">
                <MdErrorOutline className="text-red-500 text-xl" />
                <p className="text-red-700 text-sm font-bold">{error}</p>
              </div>
            )}

            <button disabled={loading} className={`md:col-span-2 py-4 rounded-xl font-black text-white uppercase tracking-widest transition-all ${loading ? "bg-gray-300 cursor-not-allowed" : "bg-sky-500 hover:bg-sky-600 shadow-lg active:scale-95"}`}>
              {loading ? "Registering Records..." : "Complete Registration"}
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