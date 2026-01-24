"use client";
import { useState } from 'react';
import Link from 'next/link';
import { Menu, X } from 'lucide-react';
import { useSession, signOut } from 'next-auth/react';

export default function Navbar() {
    const [isMenuOpen, setIsMenuOpen] = useState(false);
    const { data: session } = useSession();

    const toggleMenu = () => setIsMenuOpen(!isMenuOpen);

    return (
        <nav className="sticky top-0 z-50 w-full bg-white/80 backdrop-blur-md border-b border-gray-100 shadow-sm">
            <div className="container mx-auto px-4 h-16 flex items-center justify-between">
                {/* Logo */}
                <Link href="/" className="flex items-center gap-2 group">
                    <div className="w-8 h-8 rounded-full bg-[var(--primary)] flex items-center justify-center text-white font-bold text-lg group-hover:scale-105 transition-transform">
                        B
                    </div>
                    <span className="text-xl font-bold text-[var(--foreground)] tracking-tight">
                        BloodLink
                    </span>
                </Link>

                {/* Desktop Nav */}
                <div className="hidden md:flex items-center gap-8">
                    {session?.user?.role === 'admin' ? (
                        <>
                            <Link href="/donors" className="text-sm font-medium text-gray-600 hover:text-[var(--primary)] transition-colors">
                                Donors
                            </Link>
                            <Link href="/profile" className="text-sm font-medium text-gray-600 hover:text-[var(--primary)] transition-colors">
                                Profile
                            </Link>
                        </>
                    ) : (
                        <>
                            <Link href="/" className="text-sm font-medium text-[var(--primary)]">
                                Home
                            </Link>
                            <Link href="/#requests" className="text-sm font-medium text-gray-600 hover:text-[var(--primary)] transition-colors">
                                Requests
                            </Link>
                            <Link href="/donors" className="text-sm font-medium text-gray-600 hover:text-[var(--primary)] transition-colors">
                                Donors
                            </Link>
                            <Link
                                href="/profile"
                                onClick={(e) => {
                                    if (!session) {
                                        e.preventDefault();
                                        alert("you should login");
                                        window.location.href = "/login";
                                    }
                                }}
                                className="text-sm font-medium text-gray-600 hover:text-[var(--primary)] transition-colors"
                            >
                                Profile
                            </Link>
                        </>
                    )}
                </div>

                {/* Auth Buttons */}
                <div className="hidden md:flex items-center gap-4">
                    {!session ? (
                        <>
                            <Link
                                href="/become-donor"
                                className="text-sm font-medium text-red-600 border border-red-600 px-3 py-1.5 rounded-md hover:bg-red-50 transition-colors"
                            >
                                Become a Donor
                            </Link>
                            <Link href="/login" className="text-sm font-medium text-gray-600 hover:text-gray-900">
                                Login
                            </Link>
                            <Link
                                href="/register"
                                className="bg-[var(--primary)] text-white px-4 py-2 rounded-[var(--radius)] text-sm font-medium hover:bg-red-800 transition-colors shadow-sm hover:shadow-md"
                            >
                                Register
                            </Link>
                        </>
                    ) : (
                        <div className="flex items-center gap-4">
                            {session.user.role === 'requester' && (
                                <Link
                                    href="/become-donor"
                                    className="text-sm font-medium text-red-600 border border-red-600 px-3 py-1.5 rounded-md hover:bg-red-50 transition-colors"
                                >
                                    Become a Donor
                                </Link>
                            )}
                            <button
                                onClick={() => signOut()}
                                className="text-sm font-medium text-gray-600 hover:text-red-600 transition-colors"
                            >
                                Logout
                            </button>
                        </div>
                    )}
                </div>

                {/* Mobile Menu Button */}
                <button
                    onClick={toggleMenu}
                    className="md:hidden p-2 text-gray-600 hover:bg-gray-100 rounded-full transition-colors"
                    aria-label="Toggle menu"
                >
                    {isMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
                </button>
            </div>

            {/* Mobile Menu */}
            {isMenuOpen && (
                <div className="md:hidden absolute top-16 left-0 w-full bg-white border-b border-gray-100 shadow-lg animate-in slide-in-from-top-5">
                    <div className="container mx-auto px-4 py-4 flex flex-col gap-4">
                        {session?.user?.role === 'admin' ? (
                            <>
                                <Link
                                    href="/donors"
                                    className="text-sm font-medium text-gray-600 hover:text-[var(--primary)] py-2 border-b border-gray-50"
                                    onClick={() => setIsMenuOpen(false)}
                                >
                                    Donors
                                </Link>
                                <Link
                                    href="/profile"
                                    className="text-sm font-medium text-gray-600 hover:text-[var(--primary)] py-2 border-b border-gray-50"
                                    onClick={() => setIsMenuOpen(false)}
                                >
                                    Profile
                                </Link>
                            </>
                        ) : (
                            <>
                                <Link
                                    href="/"
                                    className="text-sm font-medium text-[var(--primary)] py-2 border-b border-gray-50"
                                    onClick={() => setIsMenuOpen(false)}
                                >
                                    Home
                                </Link>
                                <Link
                                    href="/#requests"
                                    className="text-sm font-medium text-gray-600 hover:text-[var(--primary)] py-2 border-b border-gray-50"
                                    onClick={() => setIsMenuOpen(false)}
                                >
                                    Requests
                                </Link>
                                <Link
                                    href="/donors"
                                    className="text-sm font-medium text-gray-600 hover:text-[var(--primary)] py-2 border-b border-gray-50"
                                    onClick={() => setIsMenuOpen(false)}
                                >
                                    Donors
                                </Link>
                                <Link
                                    href="/profile"
                                    onClick={(e) => {
                                        if (!session) {
                                            e.preventDefault();
                                            setIsMenuOpen(false);
                                            alert("you should login");
                                            window.location.href = "/login";
                                        } else {
                                            setIsMenuOpen(false);
                                        }
                                    }}
                                    className="text-sm font-medium text-gray-600 hover:text-[var(--primary)] py-2 border-b border-gray-50"
                                >
                                    Profile
                                </Link>
                            </>
                        )}

                        <div className="flex flex-col gap-3 mt-2">
                            {!session ? (
                                <>
                                    <Link
                                        href="/become-donor"
                                        className="text-center text-sm font-medium text-red-600 border border-red-600 px-3 py-2 rounded-md hover:bg-red-50 transition-colors"
                                        onClick={() => setIsMenuOpen(false)}
                                    >
                                        Become a Donor
                                    </Link>
                                    <div className="flex gap-3">
                                        <Link
                                            href="/login"
                                            className="flex-1 text-center text-sm font-medium text-gray-600 hover:text-gray-900 border border-gray-200 px-3 py-2 rounded-md"
                                            onClick={() => setIsMenuOpen(false)}
                                        >
                                            Login
                                        </Link>
                                        <Link
                                            href="/register"
                                            className="flex-1 text-center bg-[var(--primary)] text-white px-4 py-2 rounded-[var(--radius)] text-sm font-medium hover:bg-red-800 transition-colors shadow-sm"
                                            onClick={() => setIsMenuOpen(false)}
                                        >
                                            Register
                                        </Link>
                                    </div>
                                </>
                            ) : (
                                <div className="flex flex-col gap-3">
                                    {session.user.role === 'requester' && (
                                        <Link
                                            href="/become-donor"
                                            className="text-center text-sm font-medium text-red-600 border border-red-600 px-3 py-2 rounded-md hover:bg-red-50 transition-colors"
                                            onClick={() => setIsMenuOpen(false)}
                                        >
                                            Become a Donor
                                        </Link>
                                    )}
                                    <button
                                        onClick={() => {
                                            signOut();
                                            setIsMenuOpen(false);
                                        }}
                                        className="text-center text-sm font-medium text-red-600 border border-red-200 px-3 py-2 rounded-md hover:bg-red-50 transition-colors"
                                    >
                                        Logout
                                    </button>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            )}
        </nav>
    );
}
