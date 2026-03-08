import "./globals.css";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import NotificationManager from "@/components/NotificationManager";
import { Providers } from "@/components/Providers";




export const metadata = {
  title: "BloodLink - Connect, Donate, Save Lives",
  description: "Instant blood matching platform connecting donors with those in need. Save lives today by joining our community.",
  metadataBase: new URL('http://localhost:3000'), // Replace with actual URL in production
  manifest: '/manifest.json',
  openGraph: {
    title: "BloodLink | Save Lives, Donate Blood",
    description: "Connect with donors instantly and save lives. The fastest way to match blood requirements with active donors.",
    url: '/',
    siteName: 'BloodLink',
    images: [
      {
        url: '/og-image.png',
        width: 1200,
        height: 630,
        alt: 'BloodLink - Save Lives',
      },
    ],
    locale: 'en_US',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'BloodLink | Save Lives, Donate Blood',
    description: 'Connect with donors instantly and save lives. The fastest way to match blood requirements.',
    images: ['/og-image.png'],
  },
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body className={`antialiased min-h-screen flex flex-col`}>
        <Providers>
          <NotificationManager />
          <Navbar />
          <main className="flex-1 w-full max-w-[1920px] mx-auto pt-6 px-4 md:px-6 lg:px-8">
            {children}
          </main>
          <Footer />
        </Providers>
      </body>
    </html>
  );
}
