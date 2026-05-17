
//app/(main)/page.js
import Link from 'next/link';
// Updated icons to match alumni/educational themes
import { FaGraduationCap, FaHandsHelping, FaUsers, FaSchool, FaHeart, FaAward } from 'react-icons/fa'; 

// Define the organization's details
const ORGANIZATION_NAME = "Shergosa Alumni";
const FULL_NAME = "SOS Children's Villages Old Pupils Association";

// --- UPDATED Aims and Objectives for Shergosa Alumni ---
const aimsAndObjectivesHome = [
  {
    icon: FaUsers,
    title: "Alumni Network",
    description: "Reconnecting old pupils of SOS Children's Villages to build a powerful network of professional and personal support.",
  },
  {
    icon: FaSchool,
    title: "School Development",
    description: "Actively participating in school activities and contributing to the structural and educational growth of our alma mater.",
  },
  {
    icon: FaHandsHelping,
    title: "Mentorship",
    description: "Encouraging old pupils to guide current students through career talks, coaching, and life skills sharing.",
  },
  {
    icon: FaAward,
    title: "Legacy & Excellence",
    description: "Promoting a culture of excellence and ensuring the SOS legacy continues through impactful alumni-led initiatives.",
  },
];

export default function HomePage() {
  return (
    <div className="home-page-content">

      {/* =====================================================
          1. HERO SECTION
      ====================================================== */}
      <section className="relative h-[70vh] flex items-center justify-center bg-gray-900 overflow-hidden">
        {/* Background Overlay */}
        <div className="absolute inset-0 bg-cover bg-center opacity-40" 
             style={{ backgroundImage: "url('/images/alumni-hero.jpg')" }}>
        </div>
        
      
        <div className="relative z-10 text-center p-6 bg-white/80 backdrop-blur-sm rounded-xl shadow-2xl max-w-4xl mx-auto border-t-4 border-indigo-600">
          <h1 className="text-4xl md:text-6xl font-extrabold text-indigo-700 mb-4">
            Welcome to {ORGANIZATION_NAME}
          </h1>

          <p className="text-xl md:text-2xl text-gray-700 font-medium mb-8 max-w-2xl mx-auto">
            A united platform for SOS Children’s Villages old pupils to give back,
            support current students, and strengthen our SOS family.
          </p>

          <div className="flex justify-center space-x-4">
            <Link
              href="/about"
              className="bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-3 px-6 rounded-full transition duration-300 shadow-lg"
            >
              Learn More →
            </Link>

            <Link
              href="/login"
              className="bg-green-500 hover:bg-green-600 text-white font-bold py-3 px-6 rounded-full transition duration-300 shadow-lg"
            >
              Join the Alumni
            </Link>
          </div>
        </div>
      </section>

      {/* ================= MISSION ================= */}
      <section className="py-16 px-6 bg-white">
        <div className="max-w-6xl mx-auto text-center">
          <h2 className="text-3xl font-bold text-gray-800 mb-4 border-b-2 border-green-500 inline-block pb-1">
            Our Mission
          </h2>

          <blockquote className="text-xl italic text-gray-600 max-w-4xl mx-auto leading-relaxed">
            "To bring together SOS Children’s Villages old pupils to actively
            contribute to school development, mentor young learners, promote unity,
            and uphold the values of SOS for future generations."
          </blockquote>
        </div>
      </section>

      {/* =====================================================
          3. CORE PILLARS (Aims & Objectives)
      ====================================================== */}
      <section className="py-16 px-6 bg-gray-50">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-4xl font-extrabold text-center text-blue-800 mb-12">
            Why We Are Here
          </h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {aimsAndObjectivesHome.map((aim, index) => (
              <div 
                key={index} 
                className="bg-white p-8 rounded-2xl shadow-md hover:shadow-2xl hover:-translate-y-2 transition duration-300 border-b-4 border-orange-500 flex flex-col items-center text-center"
              >
                <div className="bg-blue-100 p-4 rounded-full mb-4">
                  <aim.icon className="text-4xl text-blue-700" />
                </div>
                <h3 className="text-xl font-bold text-blue-900 mb-3">{aim.title}</h3>
                <p className="text-gray-600 leading-relaxed">{aim.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>
      
      {/* =====================================================
          4. Call to Action (Engagement)
      ====================================================== */}
      <section className="py-20 px-6 bg-blue-800 text-white text-center">
        <div className="max-w-4xl mx-auto">
          <FaGraduationCap className="text-6xl mx-auto mb-6 text-orange-400" />
          <h2 className="text-4xl font-bold mb-4">Once an SOS Pupil, Always an SOS Supporter</h2>
          <p className="text-xl mb-8 opacity-90">
            Whether you want to mentor, organize an event, or donate to school projects, your involvement matters.
          </p>
          <div className="flex justify-center gap-6">
            <Link
              href="/activities"
              className="bg-orange-500 hover:bg-orange-600 text-white font-bold text-lg py-4 px-10 rounded-full shadow-xl transition duration-300"
            >
              View Upcoming Activities
            </Link>
          </div>
        </div>
      </section>

    </div>
  );
}