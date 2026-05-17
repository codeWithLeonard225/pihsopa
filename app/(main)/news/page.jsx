import Link from 'next/link';
import { FaCalendarAlt, FaBullhorn, FaUsers, FaArrowRight } from 'react-icons/fa';

export const metadata = {
  title: "News & Events | Happy Life Organization | Meetings, Campaigns, and Updates",
  description: "Stay updated with the latest news, upcoming meetings, community occasions, and peace-building campaigns organized by the Happy Life Organization.",
};

// Placeholder data for Upcoming Events
const upcomingEvents = [
  {
    id: 1,
    title: "Quarterly Executive Planning Meeting",
    date: "Dec 20, 2025",
    time: "10:00 AM",
    location: "Head Office Conference Room",
    type: "Meeting",
    icon: FaCalendarAlt,
    description: "Review of 2025 performance and final planning for 2026 Q1 programs."
  },
  {
    id: 2,
    title: "Vocational Skills Graduation Ceremony",
    date: "Jan 15, 2026",
    time: "2:00 PM",
    location: "Community Hall A",
    type: "Occasion",
    icon: FaBullhorn,
    description: "Celebrating the graduation of 50 women from our tailoring and catering programs."
  },
  {
    id: 3,
    title: "Inter-Community Peace Dialogue",
    date: "Feb 5, 2026",
    time: "9:30 AM",
    location: "Central Town Square",
    type: "Campaign",
    icon: FaUsers,
    description: "A collaborative event to preach peace and stability among communities, focusing on conflict resolution."
  },
];

// Placeholder data for Recent News/Past Activities
const recentNews = [
  {
    id: 101,
    title: "Successful Launch of Health Awareness Drive",
    date: "Nov 28, 2025",
    summary: "Our community health initiative reached over 500 families with essential information on hygiene and preventative care.",
  },
  {
    id: 102,
    title: "Grassroots Mobilization Achieves 100% Enrollment",
    date: "Nov 1, 2025",
    summary: "Report on the successful mobilization efforts aimed at socio-economic empowerment in the Northern District.",
  },
];


export default function NewsEventsPage() {
  return (
    <div className="news-events-page-content">

      {/* =====================================================
          1. HERO HEADER: News & Events
      ====================================================== */}
      <section className="bg-green-600 py-20 px-6 text-white text-center">
        <h1 className="text-4xl md:text-5xl font-extrabold mb-3">
          News, Meetings & Occasions
        </h1>
        <p className="text-xl max-w-3xl mx-auto opacity-90">
          Stay informed about our upcoming activities, organizational meetings, and the impact of our recent campaigns.
        </p>
      </section>

      {/* =====================================================
          2. UPCOMING EVENTS (Meetings & Occasions)
      ====================================================== */}
      <section className="py-16 px-6 max-w-6xl mx-auto">
        <h2 className="text-3xl font-bold text-indigo-700 text-center mb-10 border-b-2 border-green-500 inline-block pb-1 mx-auto">
          Upcoming Events and Meetings
        </h2>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {upcomingEvents.map((event) => (
            <div 
              key={event.id} 
              className="bg-white p-6 rounded-lg shadow-lg border-t-4 border-indigo-400 hover:shadow-xl transition duration-300"
            >
              <div className="flex items-center space-x-3 mb-3">
                <event.icon className="text-3xl text-green-600" />
                <span className="text-sm font-semibold text-gray-500 bg-gray-200 px-3 py-1 rounded-full">{event.type}</span>
              </div>
              
              <h3 className="text-xl font-bold text-gray-800 mb-2">{event.title}</h3>
              <p className="text-gray-600 mb-4 text-sm">{event.description}</p>

              <div className="space-y-1 text-sm text-gray-700">
                <p><span className="font-semibold">Date:</span> {event.date}</p>
                <p><span className="font-semibold">Time:</span> {event.time}</p>
                <p><span className="font-semibold">Location:</span> {event.location}</p>
              </div>

              <Link href={`/events/${event.id}`} className="mt-4 inline-flex items-center text-indigo-600 hover:text-indigo-800 font-medium transition duration-300">
                View Details <FaArrowRight className="ml-2 text-xs" />
              </Link>
            </div>
          ))}
        </div>
      </section>

      {/* =====================================================
          3. RECENT NEWS / PAST ACTIVITIES
      ====================================================== */}
      <section className="py-16 px-6 bg-gray-50">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-3xl font-bold text-indigo-700 text-center mb-10 border-b-2 border-green-500 inline-block pb-1">
            Recent News & Past Activities
          </h2>

          <div className="space-y-6 max-w-4xl mx-auto">
            {recentNews.map((article) => (
              <div key={article.id} className="bg-white p-6 rounded-lg shadow-md hover:shadow-lg transition duration-300 border-l-4 border-green-500">
                <p className="text-sm text-gray-500 mb-1">{article.date}</p>
                <h3 className="text-xl font-semibold text-gray-800 mb-2">{article.title}</h3>
                <p className="text-gray-600 mb-3">{article.summary}</p>
                <Link href={`/news/${article.id}`} className="flex items-center text-indigo-600 hover:text-indigo-800 font-medium">
                  Read Full Update <FaArrowRight className="ml-2 text-xs" />
                </Link>
              </div>
            ))}
            
            {/* Link to Archive/Gallery */}
            <div className="text-center pt-8">
              <Link
                href="/gallery" // Assuming you'll make a gallery page next
                className="bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-3 px-6 rounded-full transition duration-300 shadow-lg"
              >
                View Photo Gallery & Archive &rarr;
              </Link>
            </div>
          </div>
        </div>
      </section>

    </div>
  );
}