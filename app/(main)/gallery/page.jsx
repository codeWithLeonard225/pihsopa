import Image from 'next/image';
import Link from 'next/link';
import { FaImages, FaPlayCircle, FaChevronRight } from 'react-icons/fa';

export const metadata = {
  title: "Photo & Video Gallery | Happy Life Organization | Our Impact in Pictures",
  description: "View photo and video evidence of our work, including vocational training, community mobilization drives, peace-building events, and organizational meetings.",
};

// Placeholder data for the Gallery, organized by thematic categories
const galleryCategories = [
  {
    id: 'vocational',
    name: "Vocational Skills & Empowerment",
    description: "Images from our programs catering to less privileged girls and women to acquire vocation education.",
    media: [
      { id: 1, type: 'image', url: '/images/gallery/voca-1.jpg', alt: 'Women learning tailoring in workshop' },
      { id: 2, type: 'image', url: '/images/gallery/voca-2.jpg', alt: 'Graduation ceremony for vocational students' },
      { id: 3, type: 'image', url: '/images/gallery/voca-3.jpg', alt: 'Instructor demonstrating skill to students' },
      { id: 4, type: 'video', url: 'https://youtube.com/happylife-voc.mp4', alt: 'Short clip of vocational training' },
    ],
  },
  {
    id: 'community',
    name: "Community Mobilization & Peace Building",
    description: "Photos of grassroots organization, inter-community dialogues, and peace advocacy campaigns.",
    media: [
      { id: 11, type: 'image', url: '/images/gallery/comm-1.jpg', alt: 'Large community meeting in town square' },
      { id: 12, type: 'image', url: '/images/gallery/comm-2.jpg', alt: 'Leaders shaking hands at peace event' },
      { id: 13, type: 'image', url: '/images/gallery/comm-3.jpg', alt: 'Group photo of mobilized community members' },
    ],
  },
  {
    id: 'events',
    name: "Organizational Meetings & Occasions",
    description: "Visuals from executive meetings, official launches, and major association occasions.",
    media: [
      { id: 21, type: 'image', url: '/images/gallery/event-1.jpg', alt: 'Executive board members seated at table' },
      { id: 22, type: 'image', url: '/images/gallery/event-2.jpg', alt: 'Annual awareness campaign launch' },
      { id: 23, type: 'image', url: '/images/gallery/event-3.jpg', alt: 'Volunteers setting up for occasion' },
      { id: 24, type: 'video', url: 'https://youtube.com/happylife-launch.mp4', alt: 'Launch event highlights' },
    ],
  },
];

const MediaCard = ({ item }) => (
  <div className="relative h-60 w-full overflow-hidden rounded-lg shadow-lg group">
    <Image
      src={item.url.includes('.mp4') ? '/images/video-placeholder.jpg' : item.url}
      alt={item.alt}
      fill
      className="object-cover transition duration-500 ease-in-out group-hover:scale-105"
      sizes="(max-width: 768px) 100vw, 33vw"
    />
    <div className="absolute inset-0 bg-black bg-opacity-30 flex items-center justify-center opacity-0 group-hover:opacity-100 transition duration-300">
      {item.type === 'video' ? (
        <FaPlayCircle className="text-6xl text-white opacity-90" />
      ) : (
        <FaImages className="text-6xl text-white opacity-90" />
      )}
    </div>
    <div className="absolute bottom-0 left-0 right-0 p-3 bg-gradient-to-t from-black/70 to-transparent">
        <p className="text-white text-sm font-medium">{item.alt}</p>
    </div>
  </div>
);


export default function GalleryPage() {
  return (
    <div className="gallery-page-content">

      {/* =====================================================
          1. HERO HEADER: Gallery
      ====================================================== */}
      <section className="bg-indigo-700 py-20 px-6 text-white text-center">
        <h1 className="text-4xl md:text-5xl font-extrabold mb-3">
          Our Impact, Visualized
        </h1>
        <p className="text-xl max-w-3xl mx-auto opacity-90">
          Explore the photos and videos that document our commitment to peace, development, and a happy life for every community member.
        </p>
      </section>

      {/* =====================================================
          2. GALLERY CATEGORIES
      ====================================================== */}
      <section className="py-16 px-6 max-w-7xl mx-auto space-y-16">
        
        {galleryCategories.map((category) => (
          <div key={category.id} className="space-y-8">
            <h2 className="text-3xl font-bold text-indigo-700 border-b-2 border-green-500 inline-block pb-1">
              {category.name}
            </h2>
            <p className="text-lg text-gray-700">{category.description}</p>
            
            {/* Media Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {category.media.map((item) => (
                <MediaCard key={item.id} item={item} />
              ))}
            </div>
            
            {/* Placeholder for "View More" link or pagination */}
            <div className="text-right">
                <Link
                    href={`/gallery?category=${category.id}`} 
                    className="inline-flex items-center text-indigo-600 hover:text-indigo-800 font-medium transition duration-300"
                >
                    View Full {category.name} Album <FaChevronRight className="ml-2 text-sm" />
                </Link>
            </div>
          </div>
        ))}
      </section>

      {/* =====================================================
          3. Call to Action: Learn More
      ====================================================== */}
      <section className="bg-gray-100 py-12 border-t border-gray-200">
        <div className="max-w-4xl mx-auto text-center p-6">
          <h2 className="text-3xl font-bold text-indigo-800 mb-4">Inspired by Our Work?</h2>
          <p className="text-gray-600 text-lg mb-6">
            Get a deeper understanding of our mission and how we achieve these visible results.
          </p>
          <Link
            href="/about"
            className="bg-green-600 hover:bg-green-700 text-white text-lg font-bold px-8 py-3 rounded-full shadow-lg transition duration-300"
          >
            Read Our Full Aims & Objectives &rarr;
          </Link>
        </div>
      </section>

    </div>
  );
}