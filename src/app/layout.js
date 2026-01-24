import "./globals.css";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import NotificationManager from "@/components/NotificationManager";
import { Providers } from "@/components/Providers";




export const metadata = {
  title: "BloodLink - Connect, Donate, Save Lives",
  description: "Instant blood matching platform connecting donors with those in need.",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body className={`antialiased min-h-screen flex flex-col`}>
        <Providers>
          <NotificationManager />
          <Navbar />
          <main className="flex-1">
            {children}
          </main>
          <Footer />
        </Providers>
      </body>
    </html>
  );
}
