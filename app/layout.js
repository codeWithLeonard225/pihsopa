import "./globals.css";
// app/layout.js

export const metadata = {
  title:
    "PIHSOPA – Providence International High School Old Pupils Association | Sierra Leone",
  description:
    "The official digital identity and membership verification registry portal for PIHSOPA (Providence International High School Old Pupils Association) in Sierra Leone.",

  manifest: "/manifest.webmanifest",

  icons: {
    icon: [
      { url: "/icons/icon-192x192.png", sizes: "192x192", type: "image/png" },
      { url: "/icons/icon-512x512.png", sizes: "512x512", type: "image/png" }
    ],
    shortcut: "/icons/icon-192x192.png",
    apple: "/icons/icon-192x192.png"
  },

  keywords: [
    "PIHSOPA",
    "PIHS",
    "Providence International High School Old Pupils Association",
    "Providence International High School Alumni",
    "PIHS Alumni Sierra Leone",
    "Alumni Association Sierra Leone",
    "Former PIHS Students",
    "Community Development Alumni",
    "Student Alumni Portal",
    "PIHSOPA Portal"
  ],

  authors: [{ name: "Providence International High School Old Pupils Association" }],
  creator: "Providence International High School Old Pupils Association",
  publisher: "Providence International High School Old Pupils Association",

  metadataBase: new URL("https://www.pihsopa.org"), // Update with your actual domain when live
  applicationName: "PIHSOPA Portal",
  classification: "Alumni / Community Association",

  robots: { index: true, follow: true },
  referrer: "strict-origin-when-cross-origin",

  alternates: {
    canonical: "https://www.pihsopa.org"
  },

  openGraph: {
    title:
      "PIHSOPA – Providence International High School Old Pupils Association",
    description:
      "Uniting former students of Providence International High School to promote lifelong connections, professional networks, and community development in Sierra Leone.",
    url: "https://www.pihsopa.org",
    siteName: "PIHSOPA",
    type: "website",
    locale: "en_US",
    images: [
      {
        url: "/images/alumni-hero.jpg", // optional banner image path
        width: 1200,
        height: 630,
        alt: "PIHSOPA Alumni Community"
      }
    ]
  },

  twitter: {
    card: "summary_large_image",
    title: "PIHSOPA – Providence International High School Old Pupils Association",
    description:
      "The official digital platform and identity verification gateway for PIHSOPA Old Pupils Association.",
    images: ["/images/alumni-hero.jpg"]
  }
};

export const viewport = {
  width: "device-width",
  initialScale: 1,
  themeColor: "#0284c7" // Adjusted theme color to a vibrant Sky Blue matching your ID card layouts
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}