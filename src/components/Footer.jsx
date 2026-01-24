
import Link from 'next/link';

export default function Footer() {
    return (
        <footer className="mt-20 border-t border-gray-100 bg-white pt-12 pb-8">
            <div className="container mx-auto px-4">
                <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-8">
                    <div className="col-span-1 md:col-span-1">
                        <Link href="/" className="flex items-center gap-2 mb-4">
                            <div className="w-8 h-8 rounded-full bg-[var(--primary)] flex items-center justify-center text-white font-bold text-lg">
                                B
                            </div>
                            <span className="text-xl font-bold text-[var(--foreground)] tracking-tight">
                                BloodLink
                            </span>
                        </Link>
                        <p className="text-sm text-gray-500 leading-relaxed">
                            Connecting donors with those in need. Fast, secure, and life-saving.
                        </p>
                    </div>

                    <div>
                        <h4 className="font-bold text-gray-900 mb-4">Platform</h4>
                        <ul className="space-y-2 text-sm text-gray-600">
                            <li><Link href="/" className="hover:text-[var(--primary)]">Home</Link></li>
                            <li><Link href="/#requests" className="hover:text-[var(--primary)]">Browse Requests</Link></li>
                            <li><Link href="/#requests" className="hover:text-[var(--primary)]">Donation Guide</Link></li>
                        </ul>
                    </div>

                    <div>
                        <h4 className="font-bold text-gray-900 mb-4">Community</h4>
                        <ul className="space-y-2 text-sm text-gray-600">
                            <li><Link href="/#" className="hover:text-[var(--primary)]">Success Stories</Link></li>
                            <li><Link href="/donors" className="hover:text-[var(--primary)]">Top Donors</Link></li>
                            <li><Link href="/#" className="hover:text-[var(--primary)]">Blog</Link></li>
                        </ul>
                    </div>

                    <div>
                        <h4 className="font-bold text-gray-900 mb-4">Support</h4>
                        <ul className="space-y-2 text-sm text-gray-600">
                            <li><Link href="/#" className="hover:text-[var(--primary)]">Contact Us</Link></li>
                            <li><Link href="/#" className="hover:text-[var(--primary)]">FAQs</Link></li>
                            <li><Link href="/#" className="hover:text-[var(--primary)]">Privacy Policy</Link></li>
                        </ul>
                    </div>
                </div>

                <div className="border-t border-gray-100 pt-8 flex flex-col sm:flex-row justify-between items-center gap-4">
                    <p className="text-sm text-gray-400">
                        © {new Date().getFullYear()} BloodLink. All rights reserved.
                    </p>
                    <div className="flex gap-4">
                        {/* Social icons placeholders */}
                        <div className="w-8 h-8 rounded bg-gray-100 hover:bg-gray-200 cursor-pointer"></div>
                        <div className="w-8 h-8 rounded bg-gray-100 hover:bg-gray-200 cursor-pointer"></div>
                        <div className="w-8 h-8 rounded bg-gray-100 hover:bg-gray-200 cursor-pointer"></div>
                    </div>
                </div>
            </div>
        </footer>
    );
}
