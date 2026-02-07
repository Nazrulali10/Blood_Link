'use client';

import { Zap, MapPin, Bell } from 'lucide-react';

export default function AIMatchingHero() {
    return (
        <section className="relative overflow-hidden bg-gradient-to-br from-gray-900 to-gray-800 text-white py-16 rounded-3xl mx-4 shadow-2xl">
            {/* Background Animated Elements */}
            <div className="absolute top-0 left-0 w-full h-full overflow-hidden opacity-20 pointer-events-none">
                <div className="absolute top-1/4 left-1/4 w-64 h-64 bg-red-600 rounded-full mix-blend-multiply filter blur-3xl animate-blob"></div>
                <div className="absolute top-1/3 right-1/4 w-64 h-64 bg-purple-600 rounded-full mix-blend-multiply filter blur-3xl animate-blob animation-delay-2000"></div>
                <div className="absolute bottom-1/4 left-1/3 w-64 h-64 bg-pink-600 rounded-full mix-blend-multiply filter blur-3xl animate-blob animation-delay-4000"></div>
            </div>

            <div className="container mx-auto px-6 relative z-10">
                <div className="flex flex-col md:flex-row items-center justify-between gap-8 md:gap-12">

                    {/* Text Content */}
                    <div className="md:w-1/2 space-y-4 md:space-y-6 text-center md:text-left">
                        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-red-500/20 border border-red-500/30 text-red-300 text-xs md:text-sm font-semibold">
                            <Zap className="w-3 h-3 md:w-4 md:h-4 fill-current" />
                            <span>AI-Powered Matching</span>
                        </div>

                        <h2 className="text-xl md:text-3xl font-bold leading-tight">
                            Instantly Connect with <span className="text-transparent bg-clip-text bg-gradient-to-r from-red-400 to-pink-500">Nearby Donors</span>
                        </h2>

                        <p className="text-gray-300 text-base md:text-lg">
                            Our advanced AI algorithm automatically finds compatible donors within minutes using real-time geolocation and notifies them instantly.
                        </p>

                    </div>

                  

                </div>
            </div>

            {/* CSS for custom animations */}
            <style jsx>{`
        @keyframes blob {
          0% { transform: translate(0px, 0px) scale(1); }
          33% { transform: translate(30px, -50px) scale(1.1); }
          66% { transform: translate(-20px, 20px) scale(0.9); }
          100% { transform: translate(0px, 0px) scale(1); }
        }
        .animate-blob {
          animation: blob 7s infinite;
        }
        .animation-delay-2000 {
          animation-delay: 2s;
        }
        .animation-delay-4000 {
          animation-delay: 4s;
        }
      `}</style>
        </section>
    );
}
