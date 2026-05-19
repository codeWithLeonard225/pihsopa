import Link from 'next/link';
import { FaCalendarAlt, FaBullhorn, FaUsers, FaArrowRight, FaClock, FaMapMarkerAlt } from 'react-icons/fa';
import { allNewsData } from '@/app/data/allNewsData';

export const metadata = {
  title: "News & Events | PIHSOPA Portal | Meetings, Updates, and Announcements",
  description: "Stay up to date with the latest alumni updates, structural reorganizations, committee meetings, and upcoming 20-year anniversary preparations.",
};

// Data-driven Upcoming Events based on recent assembly decisions
const upcomingEvents = [
  {
    id: "su-follow-up-meeting",
    title: "Scripture Union Executive Selection Session",
    date: "Wednesday (Bi-weekly)",
    time: "11:40 AM",
    location: "School Campus (Arranged by Rev. Williams)",
    type: "Fellowship Meeting",
    icon: FaUsers,
    description: "Gathering committed members during lunch break to finalize candidate lists for vacant executive seats ahead of the upcoming induction ceremony."
  },
  {
    id: "pihsopa-pre-anniversary-elections",
    title: "General Alumni Executive Elections",
    date: "August 2026",
    time: "TBA",
    location: "Main Assembly Hall / Online Portal",
    type: "Official Election",
    icon: FaCalendarAlt,
    description: "Conducting a completely transparent, open election process across all graduating sets to establish an official, accountable PIHSOPA executive body."
  },
  {
    id: "pihsopa-20-years-launch",
    title: "Official PIHS 20 Years Anniversary Launch",
    date: "Sept 18, 2026",
    time: "10:00 AM",
    location: "Providence International High School Compound",
    type: "Anniversary Celebration",
    icon: FaBullhorn,
    description: "The official grand launch featuring alumni dinner networks, fundraising events, and the release of custom anniversary Lacoste shirts and wristbands. Dress code: Official."
  },
];

export default function NewsEventsPage() {
  return (
    <div className="min-h-screen bg-slate-50 pt-24 pb-12">

      {/* =====================================================
          1. HERO HEADER: PIHSOPA Media Center
      ====================================================== */}
      <section className="bg-gradient-to-r from-sky-700 to-indigo-800 py-20 px-6 text-white text-center shadow-md">
        <div className="max-w-4xl mx-auto">
          <h1 className="text-4xl md:text-5xl font-black mb-4 tracking-tight">
            News, Meetings & Alumni Activities
          </h1>
          <p className="text-lg md:text-xl opacity-90 font-medium max-w-2xl mx-auto leading-relaxed">
            Stay plugged in with live updates from the Old Pupils Association, upcoming planning assemblies, and structural school news.
          </p>
        </div>
      </section>

      {/* =====================================================
          2. UPCOMING EVENTS (Meetings & Milestone Occasions)
      ====================================================== */}
      <section className="py-16 px-4 sm:px-6 max-w-6xl mx-auto">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-black text-slate-800 inline-block border-b-4 border-sky-500 pb-2">
            Upcoming Events & Milestones
          </h2>
          <p className="text-sm text-slate-500 mt-2">Mark your calendars for upcoming structural milestones.</p>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {upcomingEvents.map((event) => (
            <div 
              key={event.id} 
              className="bg-white p-6 rounded-3xl shadow-sm border border-slate-100 flex flex-col justify-between hover:shadow-md hover:-translate-y-1 transition-all duration-300"
            >
              <div>
                <div className="flex items-center justify-between gap-3 mb-4">
                  <div className="bg-sky-50 p-3 rounded-2xl text-sky-600">
                    <event.icon className="text-xl" />
                  </div>
                  <span className="text-xs font-bold text-sky-700 bg-sky-50 px-3 py-1 rounded-md uppercase tracking-wider">
                    {event.type}
                  </span>
                </div>
                
                <h3 className="text-lg font-black text-slate-800 mb-2 leading-snug">{event.title}</h3>
                <p className="text-slate-600 mb-6 text-xs leading-relaxed">{event.description}</p>
              </div>

              <div className="space-y-2 border-t border-slate-50 pt-4 text-xs font-medium text-slate-500">
                <div className="flex items-center gap-2">
                  <FaCalendarAlt className="text-slate-400" />
                  <span><strong className="text-slate-700">Date:</strong> {event.date}</span>
                </div>
                <div className="flex items-center gap-2">
                  <FaClock className="text-slate-400" />
                  <span><strong className="text-slate-700">Time:</strong> {event.time}</span>
                </div>
                <div className="flex items-center gap-2">
                  <FaMapMarkerAlt className="text-slate-400 shrink-0" />
                  <span className="line-clamp-1"><strong className="text-slate-700">Location:</strong> {event.location}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* =====================================================
          3. RECENT NEWS / PAST ACTIVITIES (Dynamic Mapping)
      ====================================================== */}
      <section className="py-16 px-4 sm:px-6 bg-slate-100/60 border-t border-slate-200/50">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-black text-slate-800 inline-block border-b-4 border-indigo-500 pb-2">
              Recent News & Portal Updates
            </h2>
            <p className="text-sm text-slate-500 mt-2">Latest verified reporting from old pupil and school executive branches.</p>
          </div>

          <div className="space-y-6">
            {allNewsData.map((article) => (
              <div 
                key={article.id} 
                className="bg-white p-6 sm:p-8 rounded-3xl shadow-sm border border-slate-100 hover:shadow-md transition duration-300 border-l-4 border-sky-600"
              >
                <div className="flex items-center gap-3 text-xs text-slate-400 mb-2 font-medium">
                  <span>{article.date}</span>
                  <span>•</span>
                  <span className="text-sky-600 font-bold uppercase tracking-wider">{article.category}</span>
                </div>
                
                <h3 className="text-xl font-black text-slate-800 mb-2 leading-tight hover:text-sky-600 transition-colors">
                  <Link href={`/news/${article.id}`}>{article.title}</Link>
                </h3>
                
                <p className="text-slate-600 mb-4 text-sm leading-relaxed line-clamp-2">
                  {article.excerpt}
                </p>
                
                <Link 
                  href={`/news/${article.id}`} 
                  className="inline-flex items-center gap-2 text-sky-600 hover:text-sky-800 font-bold text-xs uppercase tracking-wider group transition duration-200"
                >
                  Read Full Update 
                  <FaArrowRight className="text-[10px] transform group-hover:translate-x-1 transition-transform" />
                </Link>
              </div>
            ))}
            
            {/* View Gallery Directory Redirect Option */}
            <div className="text-center pt-8">
              <Link
                href="/gallery"
                className="inline-block bg-sky-600 hover:bg-sky-700 text-white font-bold text-sm py-3.5 px-8 rounded-xl transition duration-300 shadow-md hover:shadow-lg transform active:scale-95"
              >
                View Portal Photo Gallery & Archive &rarr;
              </Link>
            </div>
          </div>
        </div>
      </section>

    </div>
  );
}