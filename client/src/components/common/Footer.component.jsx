import React from "react";
import { Link } from "react-router-dom";
import { GiKnifeFork } from "react-icons/gi";
import { FaInstagram, FaTwitter, FaGithub } from "react-icons/fa";
import { HiInformationCircle, HiMail, HiShieldCheck } from "react-icons/hi";

export default function Footer() {
    return (
        <footer className="mt-20 bg-gradient-to-b from-[#120617] to-[#0a060d] border-t border-[#2b1e2b] text-slate-300">
            <div className="max-w-7xl mx-auto px-6 py-10">

                {/* Top Section */ }
                <div className="flex flex-col sm:flex-row justify-between items-start gap-8">

                    {/* Brand */ }
                    <div className="space-y-3">
                        <Link
                            to="/"
                            className="flex items-center gap-3 text-2xl font-extrabold text-orange-400"
                        >
                            <span className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-gradient-to-br from-[#ff7a1a] to-[#ff3b00] text-black shadow-md">
                                <GiKnifeFork className="w-6 h-6" />
                            </span>
                            RecipeFinder
                        </Link>

                        <p className="text-sm text-slate-400">
                            © { new Date().getFullYear() } • Crafted with flavor. All rights reserved.
                        </p>
                    </div>

                    {/* Quick Links */ }
                    <nav className="flex flex-col gap-3 text-sm">
                        <Link
                            to="/about"
                            className="flex items-center gap-2 px-3 py-2 rounded-full hover:bg-[#1c0f1d] hover:text-orange-300 transition border border-transparent hover:border-[#2b1e2b]"
                        >
                            <HiInformationCircle className="w-5 h-5" />
                            About Us
                        </Link>

                        <Link
                            to="/contact"
                            className="flex items-center gap-2 px-3 py-2 rounded-full hover:bg-[#1c0f1d] hover:text-orange-300 transition border border-transparent hover:border-[#2b1e2b]"
                        >
                            <HiMail className="w-5 h-5" />
                            Contact
                        </Link>

                        <Link
                            to="/terms"
                            className="flex items-center gap-2 px-3 py-2 rounded-full hover:bg-[#1c0f1d] hover:text-orange-300 transition border border-transparent hover:border-[#2b1e2b]"
                        >
                            <HiShieldCheck className="w-5 h-5" />
                            Terms & Policies
                        </Link>
                    </nav>

                    {/* Social Icons */ }
                    <div className="flex gap-4 text-xl">
                        {/* Icon Button */ }
                        <a
                            href="https://instagram.com"
                            target="_blank"
                            rel="noreferrer"
                            className="w-10 h-10 rounded-full flex items-center justify-center bg-[#1a0f1d] border border-[#2b1e2b] text-slate-400 hover:text-orange-300 hover:border-orange-400 transition"
                        >
                            <FaInstagram />
                        </a>

                        <a
                            href="https://twitter.com"
                            target="_blank"
                            rel="noreferrer"
                            className="w-10 h-10 rounded-full flex items-center justify-center bg-[#1a0f1d] border border-[#2b1e2b] text-slate-400 hover:text-orange-300 hover:border-orange-400 transition"
                        >
                            <FaTwitter />
                        </a>

                        <a
                            href="https://github.com"
                            target="_blank"
                            rel="noreferrer"
                            className="w-10 h-10 rounded-full flex items-center justify-center bg-[#1a0f1d] border border-[#2b1e2b] text-slate-400 hover:text-orange-300 hover:border-orange-400 transition"
                        >
                            <FaGithub />
                        </a>
                    </div>
                </div>

                {/* Bottom Divider */ }
                <div className="mt-10 border-t border-[#2b1e2b] pt-4 text-center text-xs text-slate-500">
                    Designed for food lovers • Built with passion 🍽️
                </div>
            </div>
        </footer>
    );
}
