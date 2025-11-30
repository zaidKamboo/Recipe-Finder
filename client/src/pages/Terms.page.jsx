import React from "react";
import Navbar from "../components/common/Navbar.component";
import Footer from "../components/common/Footer.component";
import { GiKnifeFork } from "react-icons/gi";

export default function Terms() {
    return (
        <div className="min-h-screen bg-gradient-to-b from-[#06040a] via-[#120617] to-[#24122a] text-slate-100 transition-colors">
            <Navbar />

            <header className="pt-24 pb-8">
                <div className="max-w-4xl mx-auto px-4 text-center">
                    <div className="inline-flex items-center justify-center mb-4">
                        <span className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-gradient-to-br from-[#ff7a1a] to-[#ff3b00] text-black mr-3 shadow">
                            <GiKnifeFork className="w-6 h-6" />
                        </span>
                    </div>

                    <h1 className="text-3xl sm:text-4xl font-extrabold mb-2">Terms & Policies</h1>
                    <p className="text-sm text-slate-400 max-w-2xl mx-auto">
                        These Terms of Service, Privacy Policy summary and related policies describe how Recipe Finder works,
                        what we expect from users, and your rights and responsibilities. Please read carefully.
                    </p>

                    {/* Quick actions */ }
                    <div className="mt-6 flex items-center justify-center gap-3 flex-wrap">
                        <a
                            href="#terms-of-service"
                            className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-[#0b0710] border border-[#2b1e2b] text-sm text-slate-200 hover:bg-[#111018] transition"
                        >
                            Jump to Terms
                        </a>
                        <a
                            href="#privacy-policy"
                            className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-[#0b0710] border border-[#2b1e2b] text-sm text-slate-200 hover:bg-[#111018] transition"
                        >
                            Privacy Policy
                        </a>
                    </div>
                </div>
            </header>

            <main className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 pb-20">
                {/* Table of contents */ }
                <nav className="mb-8 rounded-2xl bg-[#0b0710] border border-[#2b1e2b] p-4">
                    <h2 className="text-lg font-semibold mb-3">Contents</h2>
                    <ul className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-sm text-slate-300">
                        <li>
                            <a href="#terms-of-service" className="block px-3 py-2 rounded-full hover:bg-[#111018] transition">
                                Terms of Service (Overview)
                            </a>
                        </li>
                        <li>
                            <a href="#privacy-policy" className="block px-3 py-2 rounded-full hover:bg-[#111018] transition">
                                Privacy Policy (Summary)
                            </a>
                        </li>
                        <li>
                            <a href="#cookies" className="block px-3 py-2 rounded-full hover:bg-[#111018] transition">
                                Cookies & Tracking
                            </a>
                        </li>
                        <li>
                            <a href="#user-conduct" className="block px-3 py-2 rounded-full hover:bg-[#111018] transition">
                                User Conduct & Content
                            </a>
                        </li>
                        <li>
                            <a href="#intellectual-property" className="block px-3 py-2 rounded-full hover:bg-[#111018] transition">
                                Intellectual Property
                            </a>
                        </li>
                        <li>
                            <a href="#disclaimer" className="block px-3 py-2 rounded-full hover:bg-[#111018] transition">
                                Disclaimers & Liability
                            </a>
                        </li>
                        <li>
                            <a href="#changes" className="block px-3 py-2 rounded-full hover:bg-[#111018] transition">
                                Changes & Contact
                            </a>
                        </li>
                    </ul>
                </nav>

                {/* Terms of Service */ }
                <section id="terms-of-service" className="mb-8">
                    <h3 className="text-xl font-semibold mb-3">Terms of Service (Overview)</h3>

                    <div className="space-y-4 text-slate-300">
                        <p>
                            These Terms govern your access to and use of the Recipe Finder website and services.
                            By creating an account or using our services you agree to these terms. If you do not agree,
                            please do not use the service.
                        </p>

                        <div>
                            <h4 className="font-semibold">Eligibility</h4>
                            <p className="text-sm text-slate-400">
                                You must be at least 13 years old (or older if your country requires) to use Recipe Finder.
                                Minors should use the service with parental permission.
                            </p>
                        </div>

                        <div>
                            <h4 className="font-semibold">Accounts</h4>
                            <p className="text-sm text-slate-400">
                                You are responsible for keeping your account credentials secure. You must provide accurate
                                account information and promptly update it if it changes.
                            </p>
                        </div>

                        <div>
                            <h4 className="font-semibold">Acceptable use</h4>
                            <p className="text-sm text-slate-400">
                                Do not use Recipe Finder to upload illegal, infringing, harmful, or abusive content.
                                You agree to follow community guidelines and applicable laws when using the service.
                            </p>
                        </div>
                    </div>
                </section>

                {/* Privacy Policy summary */ }
                <section id="privacy-policy" className="mb-8">
                    <h3 className="text-xl font-semibold mb-3">Privacy Policy — Summary</h3>

                    <div className="space-y-4 text-slate-300">
                        <p>
                            Recipe Finder collects certain information to operate and improve the service. This section summarizes
                            key points — see the full policy (link provided in footer or contact us) for details.
                        </p>

                        <div>
                            <h4 className="font-semibold">What we collect</h4>
                            <ul className="list-disc list-inside text-sm text-slate-400">
                                <li>Account details (email, username)</li>
                                <li>Recipes you save, create, or interact with</li>
                                <li>Usage data (searches, clicks, device)</li>
                                <li>Optional profile data if you provide it</li>
                            </ul>
                        </div>

                        <div>
                            <h4 className="font-semibold">How we use data</h4>
                            <p className="text-sm text-slate-400">
                                To provide, maintain and improve features, personalize recommendations, detect abuse, and communicate with you.
                                We do not sell your personal information.
                            </p>
                        </div>

                        <div>
                            <h4 className="font-semibold">Third parties</h4>
                            <p className="text-sm text-slate-400">
                                We may share aggregated or de-identified data with partners. Integrations (e.g., social logins) may share
                                limited information — you can control these in account settings.
                            </p>
                        </div>

                        <div>
                            <h4 className="font-semibold">Your choices</h4>
                            <p className="text-sm text-slate-400">
                                You can update or delete your account, manage email preferences, and opt-out of certain data uses through your profile settings.
                                For full deletion requests, contact support.
                            </p>
                        </div>
                    </div>
                </section>

                {/* Cookies */ }
                <section id="cookies" className="mb-8">
                    <h3 className="text-xl font-semibold mb-3">Cookies & Tracking</h3>

                    <div className="space-y-4 text-slate-300">
                        <p className="text-sm text-slate-400">
                            We use cookies and similar technologies to operate the service, keep you signed in, remember preferences,
                            and analyze usage to improve the product. You can control cookies in your browser settings.
                        </p>

                        <p className="text-sm text-slate-400">
                            We also use analytics providers (e.g., Google Analytics) to measure usage. These tools help us understand how
                            the service is used and where to focus improvements.
                        </p>
                    </div>
                </section>

                {/* User Conduct */ }
                <section id="user-conduct" className="mb-8">
                    <h3 className="text-xl font-semibold mb-3">User Conduct & Content</h3>

                    <div className="space-y-4 text-slate-300">
                        <p className="text-sm text-slate-400">
                            Users may post recipes, comments and other content. You retain ownership of content you post, but by posting
                            you grant Recipe Finder a license to display and distribute it within the service.
                        </p>

                        <div>
                            <h4 className="font-semibold">Prohibited content</h4>
                            <ul className="list-disc list-inside text-sm text-slate-400">
                                <li>Illegal material, hate speech, violent/abusive content</li>
                                <li>Content that infringes intellectual property rights</li>
                                <li>Personal data of others posted without consent</li>
                            </ul>
                        </div>

                        <div>
                            <h4 className="font-semibold">Moderation</h4>
                            <p className="text-sm text-slate-400">
                                We may remove or moderate content that violates the rules. Repeated violations can result in account suspension.
                            </p>
                        </div>
                    </div>
                </section>

                {/* IP */ }
                <section id="intellectual-property" className="mb-8">
                    <h3 className="text-xl font-semibold mb-3">Intellectual Property</h3>

                    <div className="space-y-4 text-slate-300">
                        <p className="text-sm text-slate-400">
                            Recipe Finder and its design, logos, and marks are owned by the service. You may not use trademarks without permission.
                        </p>

                        <p className="text-sm text-slate-400">
                            For copyright concerns or takedown requests, follow the DMCA process and provide contact details and evidence of ownership.
                        </p>
                    </div>
                </section>

                {/* Disclaimer & liability */ }
                <section id="disclaimer" className="mb-8">
                    <h3 className="text-xl font-semibold mb-3">Disclaimer & Limitation of Liability</h3>

                    <div className="space-y-4 text-slate-300">
                        <p className="text-sm text-slate-400">
                            Content on Recipe Finder is provided for informational purposes. We do not guarantee accuracy of user-submitted recipes,
                            nutritional information, or results. Use recipes at your own discretion.
                        </p>

                        <p className="text-sm text-slate-400">
                            To the fullest extent permitted by law, Recipe Finder and its affiliates are not liable for indirect, incidental, or consequential damages.
                        </p>
                    </div>
                </section>

                {/* Changes / contact */ }
                <section id="changes" className="mb-12">
                    <h3 className="text-xl font-semibold mb-3">Changes, Updates & Contact</h3>

                    <div className="space-y-4 text-slate-300">
                        <p className="text-sm text-slate-400">
                            We may update these Terms & Policies occasionally. If we make material changes, we’ll notify you by email or via a site notice.
                        </p>

                        <p className="text-sm text-slate-400">
                            Questions or requests (privacy, DMCA, support):{ " " }
                            <a
                                href="/contact"
                                className="rounded-full px-2 py-1 bg-[#0b0710] border border-[#2b1e2b] text-slate-200 hover:bg-[#111018] transition"
                            >
                                Contact Us
                            </a>
                        </p>

                        <p className="text-xs text-slate-500">
                            Last updated: { new Date().toLocaleDateString() }
                        </p>
                    </div>
                </section>

                {/* Small acknowledgement / footer CTA */ }
                <div className="rounded-2xl bg-[#0b0710] border border-[#2b1e2b] p-4 text-sm text-slate-300">
                    <strong className="text-slate-100">Note:</strong>{ " " }
                    These terms are a summary to help you navigate our policies quickly. For a complete policy and legal terms please refer to the full documentation
                    or contact our legal team via the Contact page.
                </div>
            </main>

            <Footer />
        </div>
    );
}
