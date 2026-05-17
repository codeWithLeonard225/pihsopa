import Link from 'next/link';
import Image from 'next/image'; // Import Image component for team photos
import { FaHeart, FaUnity, FaHandshake, FaBullseye, FaBook, FaGlobe, FaPeace, FaUsers, FaQuoteLeft } from 'react-icons/fa';

// Data based strictly on the provided image (Article Two (2) Aims and Objective)
const aimsAndObjectives = [
  {
    icon: FaUnity,
    title: "Foster Unity & Cooperation",
    description: "To better organize and bring less privileged people under one umbrella, in order to foster unity, cooperation with vibrant and effective organization.",
  },
  {
    icon: FaBullseye,
    title: "Identify & Implement Development Activities",
    description: "To help identify and bring potential development and activities for the general good of the organisation and beyond.",
  },
  {
    icon: FaHandshake,
    title: "Promote Community Relationships",
    description: "To promote and foster better relationship between communities and even beyond for development and peace.",
  },
  {
    icon: FaUsers,
    title: "Socio-Economic Mobilization",
    description: "To mobilise and organised grassroots people from various communities for socio-economic proposes and development.",
  },
  {
    icon: FaBook,
    title: "Vocational Education for Girls/Women",
    description: "To cater for less privileged girls and women to acquired vocation education.",
  },
  {
    icon: FaGlobe,
    title: "Engage in Inter-Community Development",
    description: "To engage in inter communities' development activities.",
  },
  {
    icon: FaGlobe,
    title: "Participate in National Development",
    description: "To engage and participate in national development activities.",
  },
  {
    icon: FaPeace,
    title: "Preach Peace and Stability",
    description: "To preach peace and stability among communities.",
  },
  {
    icon: FaHeart,
    title: "Ensure Better Life and Lively Hood",
    description: "To ensure a better life and a good communities lively hood among people and family.",
  },
  {
    icon: FaBook,
    title: "Promote Health and Education",
    description: "To promote and engage in community's health and education activities.",
  },
];

// --- NEW LEADERSHIP DATA ---

const ceoData = {
  name: "Dr. Aliyah Hassan",
  title: "Chief Executive Officer (CEO)",
  message: "“Our commitment to the less privileged is the cornerstone of our work. By focusing on unity, vocational education, and grassroots mobilization, we are not just providing aid—we are building a foundation for sustainable happy lives across all our communities.”",
  photoUrl: "/images/team/ceo-aliyah.jpg", // Placeholder path
};

const executiveMembers = [
  {
    name: "Mr. Benjamin Cole",
    title: "Director of Programs",
    photoUrl: "/images/team/exec-benjamin.jpg", // Placeholder path
    bio: "Oversees the implementation of all socio-economic and educational programs, ensuring alignment with our core objectives.",
  },
  {
    name: "Ms. Sofia Khan",
    title: "Head of Community Relations",
    photoUrl: "/images/team/exec-sofia.jpg", // Placeholder path
    bio: "Leads efforts to promote and foster better relationships and peace between our partnering communities.",
  },
  {
    name: "Engr. Leo Martins",
    title: "Head of National Development",
    photoUrl: "/images/team/exec-leo.jpg", // Placeholder path
    bio: "Responsible for coordinating our participation in large-scale national development activities and advocacy.",
  },
    {
    name: "Mr. Benjamin Cole",
    title: "Director of Programs",
    photoUrl: "/images/team/exec-benjamin.jpg", // Placeholder path
    bio: "Oversees the implementation of all socio-economic and educational programs, ensuring alignment with our core objectives.",
  },
  {
    name: "Ms. Sofia Khan",
    title: "Head of Community Relations",
    photoUrl: "/images/team/exec-sofia.jpg", // Placeholder path
    bio: "Leads efforts to promote and foster better relationships and peace between our partnering communities.",
  },
];

// --- END NEW LEADERSHIP DATA ---

export const metadata = {
  title: "About Us | Happy Life Organization | Mission and Objectives",
  description: "Learn about the mission, vision, specific aims, and meet the leadership team of the Happy Life Organization, dedicated to uplifting the less privileged and fostering community peace and development.",
};

export default function AboutPage() {
  return (
    <div className="about-page-content">

      {/* =====================================================
          1. HERO HEADER: About Us
      ====================================================== */}
      <section className="bg-indigo-600 py-20 px-6 text-white text-center">
        <h1 className="text-4xl md:text-5xl font-extrabold mb-3">
          Our Story, Our Purpose
        </h1>
        <p className="text-xl max-w-3xl mx-auto opacity-90">
          The Happy Life Organization is committed to bringing less privileged people under one umbrella to foster unity, cooperation, and sustainable socio-economic development.
        </p>
      </section>

      {/* =====================================================
          2. MISSION & VISION
      ====================================================== */}
      <section className="py-16 px-6 max-w-6xl mx-auto">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
          
          {/* Mission */}
          <div className="p-6 border-l-4 border-green-500 shadow-lg rounded-lg bg-gray-50">
            <h2 className="text-3xl font-bold text-indigo-700 mb-4 flex items-center">
                <FaHeart className="mr-3 text-green-500" /> Our Mission
            </h2>
            <p className="text-gray-700 text-lg leading-relaxed">
              Our mission is to empower communities, promote peace, and identify development activities that lead to a better life and a vibrant, effective organization for all.
            </p>
          </div>

          {/* Vision */}
          <div className="p-6 border-l-4 border-indigo-500 shadow-lg rounded-lg bg-gray-50">
            <h2 className="text-3xl font-bold text-indigo-700 mb-4 flex items-center">
                <FaBullseye className="mr-3 text-indigo-500" /> Our Vision
            </h2>
            <p className="text-gray-700 text-lg leading-relaxed">
              We envision a future where all communities enjoy stability, robust socio-economic opportunities, and strong relationships built on development and peace.
            </p>
          </div>
        </div>
      </section>

      {/* =====================================================
          3. OUR LEADERSHIP (CEO and Executive Team)
      ====================================================== */}
      <section className="py-16 px-6 bg-gray-100">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-4xl font-extrabold text-center text-indigo-700 mb-12">
            Meet Our Leadership
          </h2>

          {/* --- CEO Section --- */}
          <div className="bg-white p-8 rounded-xl shadow-xl flex flex-col lg:flex-row items-center lg:items-start gap-8 mb-12 border-t-4 border-indigo-500">
            
            {/* CEO Photo and Title */}
            <div className="flex flex-col items-center lg:w-1/3">
              <div className="relative w-40 h-40 rounded-full overflow-hidden shadow-lg border-4 border-green-500">
                <Image
                  src={ceoData.photoUrl}
                  alt={`Photo of ${ceoData.name}`}
                  fill
                  style={{ objectFit: 'cover' }}
                  sizes="160px"
                />
              </div>
              <h3 className="text-xl font-bold text-gray-800 mt-4">{ceoData.name}</h3>
              <p className="text-indigo-600 font-medium italic">{ceoData.title}</p>
            </div>

            {/* CEO Message/Quote */}
            <div className="lg:w-2/3 mt-4 lg:mt-0">
              <FaQuoteLeft className="text-4xl text-green-500 opacity-70 mb-3" />
              <blockquote className="text-gray-700 text-lg italic leading-relaxed">
                {ceoData.message}
              </blockquote>
              <p className="text-right text-gray-500 mt-4">- {ceoData.name}, {ceoData.title}</p>
            </div>
          </div>

          {/* --- Executive Team Section --- */}
          <h3 className="text-3xl font-bold text-center text-indigo-700 mb-8 mt-12">
            Executive Management Team
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {executiveMembers.map((member, index) => (
              <div 
                key={index} 
                className="bg-white p-6 rounded-xl shadow-md text-center border-b-4 border-green-400"
              >
                <div className="relative w-28 h-28 mx-auto rounded-full overflow-hidden shadow-md border-2 border-gray-200 mb-4">
                  <Image
                    src={member.photoUrl}
                    alt={`Photo of ${member.name}`}
                    fill
                    style={{ objectFit: 'cover' }}
                    sizes="112px"
                  />
                </div>
                <h4 className="text-lg font-bold text-gray-800">{member.name}</h4>
                <p className="text-sm text-indigo-600 font-medium mb-3">{member.title}</p>
                <p className="text-xs text-gray-600 italic">{member.bio}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* =====================================================
          4. AIMS AND OBJECTIVES (From Image)
      ====================================================== */}
      <section className="py-16 px-6 bg-white border-t">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-4xl font-extrabold text-center text-indigo-700 mb-12">
            Specific Aims & Objectives
          </h2>
          <p className="text-center text-lg text-gray-600 mb-10">
            Guided by Article Two (2) of our charter, our work focuses on the following core areas:
          </p>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {aimsAndObjectives.map((aim, index) => (
              <div 
                key={index} 
                className="bg-gray-50 p-6 rounded-xl shadow-md border-t-2 border-indigo-400 hover:shadow-lg transition duration-300"
              >
                <aim.icon className="text-3xl text-green-600 mb-3" />
                <h3 className="text-xl font-bold text-gray-800 mb-2">{aim.title}</h3>
                <p className="text-gray-600 text-sm">{aim.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* =====================================================
          5. Call to Action
      ====================================================== */}
      <section className="py-12 px-6 bg-green-500 text-white text-center">
        <div className="max-w-4xl mx-auto">
          <h2 className="text-3xl font-bold mb-3">Partner with Us</h2>
          <p className="text-lg mb-6 opacity-90">
            Ready to help us achieve these vital objectives? Your participation makes all the difference.
          </p>
          <Link
            href="/contact"
            className="bg-white text-green-600 hover:bg-gray-100 font-bold text-lg py-3 px-8 rounded-full shadow-xl transition duration-300"
          >
            Get Involved
          </Link>
        </div>
      </section>

    </div>
  );
}