import { FaPhone, FaEnvelope, FaMapMarkerAlt, FaFacebook, FaTwitter, FaLinkedin } from 'react-icons/fa';
import Link from 'next/link';

export const metadata = {
  title: "Contact Us | Happy Life Organization | Get in Touch",
  description: "Contact the Happy Life Organization via phone, email, or visit our office. We welcome inquiries about our programs, membership, and collaboration.",
};

export default function ContactPage() {
  return (
    <div className="contact-page-content">

      {/* =====================================================
          1. HERO HEADER: Contact Us
      ====================================================== */}
      <section className="bg-green-600 py-20 px-6 text-white text-center">
        <h1 className="text-4xl md:text-5xl font-extrabold mb-3">
          Get In Touch
        </h1>
        <p className="text-xl max-w-3xl mx-auto opacity-90">
          We are happy to answer any questions about our mission, programs, and how you can get involved in building a happier life for all.
        </p>
      </section>

      {/* =====================================================
          2. CONTACT DETAILS & FORM
      ====================================================== */}
      <section className="py-16 px-6 max-w-7xl mx-auto">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">

          {/* Contact Details Column (Left) */}
          <div className="lg:col-span-1 space-y-8 p-6 bg-gray-50 rounded-xl shadow-lg border-t-4 border-indigo-500">
            <h2 className="text-3xl font-bold text-indigo-700 mb-6">Contact Information</h2>

            {/* Phone */}
            <div className="flex items-start space-x-4">
              <FaPhone className="text-2xl text-green-600 mt-1 flex-shrink-0" />
              <div>
                <h3 className="text-lg font-semibold text-gray-800">Call Us</h3>
                <p className="text-gray-600">+232 77 123 456 (General Inquiries)</p>
                <p className="text-gray-600">+232 78 987 654 (Program Director)</p>
              </div>
            </div>

            {/* Email */}
            <div className="flex items-start space-x-4">
              <FaEnvelope className="text-2xl text-green-600 mt-1 flex-shrink-0" />
              <div>
                <h3 className="text-lg font-semibold text-gray-800">Email Us</h3>
                <p className="text-gray-600">info@happylifeorg.org</p>
                <p className="text-gray-600">programs@happylifeorg.org</p>
              </div>
            </div>

            {/* Address */}
            <div className="flex items-start space-x-4">
              <FaMapMarkerAlt className="text-2xl text-green-600 mt-1 flex-shrink-0" />
              <div>
                <h3 className="text-lg font-semibold text-gray-800">Our Office</h3>
                <p className="text-gray-600">14 Main Road, Happy Town,</p>
                <p className="text-gray-600">Western Area, Sierra Leone</p>
                <Link href="#map-location" className="text-indigo-600 hover:text-indigo-800 text-sm font-medium mt-1 inline-block">
                    View on Map &darr;
                </Link>
              </div>
            </div>
            
            {/* Social Media */}
            <div className="pt-4 border-t border-gray-300">
                <h3 className="text-lg font-semibold text-gray-800 mb-3">Connect With Us</h3>
                <div className="flex space-x-4">
                    <a href="https://facebook.com/happylifeorg" target="_blank" rel="noopener noreferrer" aria-label="Facebook" className="text-3xl text-indigo-700 hover:text-green-600 transition duration-300">
                        <FaFacebook />
                    </a>
                    <a href="https://twitter.com/happylifeorg" target="_blank" rel="noopener noreferrer" aria-label="Twitter" className="text-3xl text-indigo-700 hover:text-green-600 transition duration-300">
                        <FaTwitter />
                    </a>
                    <a href="https://linkedin.com/company/happylifeorg" target="_blank" rel="noopener noreferrer" aria-label="LinkedIn" className="text-3xl text-indigo-700 hover:text-green-600 transition duration-300">
                        <FaLinkedin />
                    </a>
                </div>
            </div>
          </div>


          {/* Contact Form Column (Right) */}
          <div className="lg:col-span-2 p-8 bg-white rounded-xl shadow-2xl">
            <h2 className="text-3xl font-bold text-indigo-700 mb-6">Send Us a Message</h2>
            
            <form className="space-y-6">
              {/* Name */}
              <div>
                <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">Full Name</label>
                <input
                  type="text"
                  id="name"
                  name="name"
                  required
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-indigo-500 focus:border-indigo-500 transition duration-150"
                  placeholder="Your Name"
                />
              </div>

              {/* Email */}
              <div>
                <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">Email Address</label>
                <input
                  type="email"
                  id="email"
                  name="email"
                  required
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-indigo-500 focus:border-indigo-500 transition duration-150"
                  placeholder="you@example.com"
                />
              </div>

              {/* Subject */}
              <div>
                <label htmlFor="subject" className="block text-sm font-medium text-gray-700 mb-1">Subject</label>
                <input
                  type="text"
                  id="subject"
                  name="subject"
                  required
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-indigo-500 focus:border-indigo-500 transition duration-150"
                  placeholder="Inquiry about donations, partnership, etc."
                />
              </div>

              {/* Message */}
              <div>
                <label htmlFor="message" className="block text-sm font-medium text-gray-700 mb-1">Your Message</label>
                <textarea
                  id="message"
                  name="message"
                  rows="4"
                  required
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-indigo-500 focus:border-indigo-500 transition duration-150"
                  placeholder="How can we help you?"
                />
              </div>

              {/* Submit Button */}
              <button
                type="submit"
                className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-3 px-6 rounded-lg transition duration-300 shadow-lg"
              >
                Send Message
              </button>
            </form>
          </div>
        </div>
      </section>

      {/* =====================================================
          3. MAP LOCATION (Placeholder)
      ====================================================== */}
      <section id="map-location" className="py-12 px-6 bg-gray-100">
        <div className="max-w-7xl mx-auto">
          <h2 className="text-3xl font-bold text-indigo-700 text-center mb-8">
            Find Our Location
          </h2>
          <div className="h-96 w-full bg-gray-200 rounded-xl shadow-xl flex items-center justify-center text-gray-500">
            {/* ⭐ INTEGRATION NOTE: Replace this div with an actual embedded map
              (e.g., Google Maps iframe, or a component using react-leaflet/react-google-maps)
            */}
            <p className="text-xl">Placeholder for Embedded Map (e.g., Google Maps)</p>
          </div>
        </div>
      </section>

    </div>
  );
}