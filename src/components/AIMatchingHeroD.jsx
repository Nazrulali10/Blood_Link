'use client';

import { Zap, MapPin, Bell } from 'lucide-react';

export default function AIMatchingHeroD() {
    return (
        <section className="relative overflow-hidden bg-gradient-to-br from-gray-900 to-gray-800 text-white py-10 rounded-3xl mx-4 shadow-2xl px-12">
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

                        <div className="flex flex-col sm:flex-row gap-4 pt-4 justify-center md:justify-start">
                            <div className="flex items-center gap-3 bg-white/5 px-4 py-3 rounded-xl backdrop-blur-sm border border-white/10">
                                <div className="p-2 bg-green-500/20 rounded-lg text-green-400">
                                    <MapPin className="w-5 h-5 md:w-6 md:h-6" />
                                </div>
                                <div>
                                    <h4 className="font-semibold text-sm">Smart Location</h4>
                                    <p className="text-xs text-gray-400">Finds closest donors</p>
                                </div>
                            </div>

                            <div className="flex items-center gap-3 bg-white/5 px-2 py-1 rounded-xl backdrop-blur-sm border border-white/10">
                                <div className="p-2 bg-blue-500/20 rounded-lg text-blue-400">
                                    <Bell className="w-5 h-5 md:w-6 md:h-6" />
                                </div>
                                <div>
                                    <h4 className="font-semibold text-sm">Instant Alerts</h4>
                                    <p className="text-xs text-gray-400">Push & Email notifications</p>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Visual Elements (Mock UI / Animation) */}
                    <div className="md:w-1/2 flex justify-center mt-8 md:mt-0">
                        <div className="relative w-full max-w-xs md:max-w-sm aspect-square md:aspect-auto h-64 md:h-80">
                            {/* Central Pulse */}
                            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-24 h-24 md:w-32 md:h-32 bg-red-500/30 rounded-full animate-ping"></div>
                            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-16 h-16 md:w-24 md:h-24 bg-red-500/50 rounded-full animate-pulse"></div>

                            {/* Central Icon */}
                            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-10 bg-white p-3 md:p-4 rounded-full shadow-lg w-16 h-16 md:w-20 md:h-20 flex items-center justify-center">
                                <Zap className="w-8 h-8 md:w-10 md:h-10 text-red-600 fill-red-600" />
                            </div>

                            {/* Floating "Donors" */}
                            {/* Donor 1 */}
                            <div className="absolute top-4 left-4 md:top-0 md:left-0 animate-bounce transition-all duration-1000">
                                <div className="bg-white p-2 rounded-lg shadow-md flex items-center gap-2 transform -rotate-6">
                                    <div className="w-6 h-6 md:w-8 md:h-8 bg-gray-200 rounded-full flex items-center justify-center text-[10px] md:text-xs font-bold text-gray-600">AB+</div>
                                    <span className="text-[10px] md:text-xs font-semibold text-gray-700">Matched!</span>
                                </div>
                            </div>

                            {/* Donor 2 */}
                            <div className="absolute bottom-4 right-4 md:bottom-10 md:right-0 animate-bounce transition-all duration-1000 delay-500">
                                <div className="bg-white p-2 rounded-lg shadow-md flex items-center gap-2 transform rotate-3">
                                    <div className="w-6 h-6 md:w-8 md:h-8 bg-gray-200 rounded-full flex items-center justify-center text-[10px] md:text-xs font-bold text-gray-600">O+</div>
                                    <span className="text-[10px] md:text-xs font-semibold text-gray-700">Matched!</span>
                                </div>
                            </div>

                            {/* Connecting Lines (SVG) */}
                            <svg className="absolute top-0 left-0 w-full h-full pointer-events-none" style={{ zIndex: 0 }}>
                                <line x1="50%" y1="50%" x2="20%" y2="20%" stroke="rgba(255,255,255,0.3)" strokeWidth="2" strokeDasharray="4" />
                                <line x1="50%" y1="50%" x2="80%" y2="80%" stroke="rgba(255,255,255,0.3)" strokeWidth="2" strokeDasharray="4" />
                            </svg>
                        </div>
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
