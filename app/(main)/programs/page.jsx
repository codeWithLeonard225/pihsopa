import Link from 'next/link';
import { FaGraduationCap, FaTools, FaUsers, FaChild, FaLaptopCode, FaHandshake, FaGlobe, FaClinicMedical } from 'react-icons/fa';

// Program Data structured around core objectives
const programsData = [
  {
    category: "Socio-Economic Empowerment & Vocational Education",
    icon: FaGraduationCap,
    description: "Targeted initiatives focusing on self-sufficiency, skill acquisition, and economic inclusion for vulnerable groups.",
    color: "border-green-500",
    details: [
      {
        title: "Vocational Skills Acquisition for Girls and Women",
        subtitle: "Catering for the less privileged to acquire vocation education.",
        icon: FaTools,
        aim: "To cater for less privileged girls and women to acquired vocation education."
      },
      {
        title: "Grassroots Mobilization and Financial Literacy",
        subtitle: "Organizing communities for socio-economic proposals.",
        icon: FaUsers,
        aim: "To mobilise and organised grassroots people from various communities for socio-economic proposes and development."
      },
      {
        title: "Development Activity Identification & Implementation",
        subtitle: "Bringing potential development activities to fruition.",
        icon: FaLaptopCode,
        aim: "To help identify and bring potential development and activities for the general good of the organisation and beyond."
      },
    ],
  },
  {
    category: "Community Development & Peace Building",
    icon: FaHandshake,
    description: "Activities aimed at fostering unity, preaching stability, and engaging in collaborative development across different communities.",
    color: "border-indigo-500",
    details: [
      {
        title: "Inter-Community Development Initiatives",
        subtitle: "Engaging in joint community development activities.",
        icon: FaGlobe,
        aim: "To engage in inter communities' development activities."
      },
      {
        title: "Peace and Stability Advocacy",
        subtitle: "Promoting better relationships and stability.",
        icon: FaHandshake,
        aim: "To promote and foster better relationship between communities and even beyond for development and peace. / To preach peace and stability among communities."
      },
      {
        title: "National Development Participation",
        subtitle: "Contributing to large-scale national efforts.",
        icon: FaGlobe,
        aim: "To engage and participate in national development activities."
      },
    ],
  },
  {
    category: "Health, Education & Welfare",
    icon: FaClinicMedical,
    description: "Holistic support programs ensuring a better quality of life and access to essential services for families and individuals.",
    color: "border-red-500",
    details: [
      {
        title: "Community Health and Education Campaigns",
        subtitle: "Promoting well-being through outreach and awareness.",
        icon: FaClinicMedical,
        aim: "To promote and engage in community's health and education activities."
      },
      {
        title: "Livelihood & Family Support",
        subtitle: "Ensuring better life and lively hood among people and family.",
        icon: FaChild,
        aim: "To ensure a better life and a good communities lively hood among people and family."
      },
    ],
  },
];


export const metadata = {
  title: "Our Programs | Happy Life Organization | Empowerment, Peace, and Development",
  description: "Discover the core programs of the Happy Life Organization, including vocational training for women, grassroots mobilization, community peace-building, and health initiatives.",
};

export default function ProgramsPage() {
  return (
    <div className="programs-page-content">

      {/* =====================================================
          1. HERO HEADER: Programs Overview
      ====================================================== */}
      <section className="bg-indigo-700 py-20 px-6 text-white text-center">
        <h1 className="text-4xl md:text-5xl font-extrabold mb-3">
          Our Programs in Action
        </h1>
        <p className="text-xl max-w-3xl mx-auto opacity-90">
          We translate our Aims and Objectives into tangible results through structured programs that empower individuals and build peaceful, socio-economically stable communities.
        </p>
      </section>

      {/* =====================================================
          2. DETAILED PROGRAM CATEGORIES
      ====================================================== */}
      <section className="py-16 px-6 max-w-7xl mx-auto space-y-16">
        
        {programsData.map((category, index) => (
          <div 
            key={category.category} 
            className="bg-gray-50 p-8 rounded-xl shadow-lg"
          >
            {/* Category Header */}
            <div className={`flex items-center space-x-4 mb-8 pb-4 border-b-4 ${category.color}`}>
              <category.icon className="text-4xl text-indigo-600" />
              <h2 className="text-3xl font-bold text-gray-800">{category.category}</h2>
            </div>
            
            <p className="text-lg text-gray-700 mb-10 italic">
              {category.description}
            </p>
            
            {/* Individual Programs Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {category.details.map((program, i) => (
                <div 
                  key={i} 
                  className="bg-white p-6 rounded-lg shadow-md hover:shadow-xl transition duration-300 border border-gray-200"
                >
                  <div className="flex items-center space-x-3 mb-3">
                    <program.icon className="text-2xl text-green-500" />
                    <h3 className="text-xl font-semibold text-indigo-700">{program.title}</h3>
                  </div>
                  <p className="text-gray-600 text-sm italic mb-3">{program.subtitle}</p>
                  <p className="text-xs text-gray-500 mt-2 border-l-2 pl-2 border-gray-300">
                    * Directly supports the objective: {program.aim}
                  </p>
                </div>
              ))}
            </div>
          </div>
        ))}
      </section>

      {/* =====================================================
          3. Call to Action: Support Programs
      ====================================================== */}
      <section className="bg-green-500 py-12 border-t border-gray-200">
        <div className="max-w-4xl mx-auto text-center p-6 text-white">
          <h2 className="text-3xl font-bold mb-4">Support Our Programs</h2>
          <p className="text-lg opacity-90 mb-6">
            Your generous contribution directly funds these vital initiatives, helping us achieve lasting impact in our communities.
          </p>
          <Link
            href="/donate"
            className="bg-white text-green-600 hover:bg-gray-200 text-lg font-bold px-8 py-3 rounded-full shadow-lg transition duration-300"
          >
            Invest in a Happy Life &rarr;
          </Link>
        </div>
      </section>

    </div>
  );
}