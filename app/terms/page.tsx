"use client";
import Link from "next/link";
import { ChevronLeft, ArrowRight, Clock, Shield, FileText } from "lucide-react";
import { useState, useEffect } from "react";

export default function TermsPage() {
  const [activeSection, setActiveSection] = useState("");
  const [scrollProgress, setScrollProgress] = useState(0);

  // Track scroll progress
  useEffect(() => {
    const handleScroll = () => {
      const totalHeight = document.body.scrollHeight - window.innerHeight;
      const progress = (window.scrollY / totalHeight) * 100;
      setScrollProgress(progress);
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  // Update active section based on scroll position
  useEffect(() => {
    const sections = document.querySelectorAll("h2[id]");
    const checkSection = () => {
      const scrollPosition = window.scrollY + 100;

      sections.forEach((section) => {
        const sectionTop = (section as HTMLElement).offsetTop;
        const sectionId = section.getAttribute("id") || "";

        if (scrollPosition >= sectionTop) {
          setActiveSection(sectionId);
        }
      });
    };

    window.addEventListener("scroll", checkSection);
    return () => window.removeEventListener("scroll", checkSection);
  }, []);

  const scrollToSection = (id: string) => {
    const element = document.getElementById(id);
    if (element) {
      window.scrollTo({
        top: element.offsetTop - 80,
        behavior: "smooth",
      });
      setActiveSection(id);
    }
  };

  return (
    <div className="bg-gray-50 min-h-screen">
      {/* Progress bar */}
      <div className="fixed top-0 left-0 w-full h-1 z-50">
        <div
          className="h-full bg-[#E84C30] transition-all duration-300 ease-out"
          style={{ width: `${scrollProgress}%` }}
        ></div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-8">
        <Link
          href="/"
          className="inline-flex items-center text-[#C25B3F] mb-8 hover:opacity-80 transition-opacity"
        >
          <ChevronLeft className="h-4 w-4 mr-2" />
          <span>Back to homepage</span>
        </Link>

        <div className="flex flex-col lg:flex-row gap-8">
          {/* Sidebar */}
          <div className="lg:w-1/4">
            <div className="bg-white rounded-xl shadow-sm p-6 sticky top-20">
              <div className="flex items-center mb-6">
                <div className="bg-[#E84C30] rounded-full w-12 h-12 flex items-center justify-center">
                  <span className="text-white text-lg font-bold">0.0</span>
                </div>
                <h2 className="text-xl font-bold ml-3">UXMust</h2>
              </div>

              <div className="mb-6">
                <div className="flex items-center text-sm text-gray-500 mb-2">
                  <Clock className="h-4 w-4 mr-2" />
                  <span>Last updated: April 16, 2025</span>
                </div>
                <div className="flex items-center text-sm text-gray-500">
                  <Shield className="h-4 w-4 mr-2" />
                  <span>Legal document</span>
                </div>
              </div>

              <nav className="space-y-1">
                <p className="text-sm font-medium text-gray-500 mb-2">
                  ON THIS PAGE
                </p>
                {[
                  { id: "use", label: "Use of Website" },
                  { id: "intellectual", label: "Intellectual Property" },
                  { id: "disclaimer", label: "Disclaimer" },
                  { id: "liability", label: "Limitation of Liability" },
                  { id: "privacy", label: "Privacy" },
                  { id: "governing", label: "Governing Law" },
                  { id: "changes", label: "Changes to Terms" },
                ].map((section) => (
                  <button
                    key={section.id}
                    onClick={() => scrollToSection(section.id)}
                    className={`block w-full text-left px-3 py-2 text-sm rounded-lg transition-colors ${
                      activeSection === section.id
                        ? "bg-[#FDF0ED] text-[#C25B3F] font-medium"
                        : "text-gray-600 hover:bg-gray-100"
                    }`}
                  >
                    {section.label}
                  </button>
                ))}
              </nav>

              <div className="mt-8 pt-6 border-t border-gray-100">
                <Link
                  href="/privacy-policy"
                  className="flex items-center justify-between text-[#C25B3F] p-3 bg-[#FDF0ED] rounded-lg hover:bg-[#FBDED6] transition-colors"
                >
                  <div className="flex items-center">
                    <FileText className="h-4 w-4 mr-2" />
                    <span className="font-medium">Privacy Policy</span>
                  </div>
                  <ArrowRight className="h-4 w-4" />
                </Link>
              </div>
            </div>
          </div>

          {/* Main content */}
          <div className="lg:w-3/4">
            <div className="bg-white rounded-xl shadow-sm p-8 md:p-12">
              <h1 className="text-3xl md:text-4xl font-bold mb-6">
                Terms and Conditions
              </h1>
              <p className="text-gray-600 mb-8">Last updated: April 16, 2025</p>

              <div className="prose prose-gray max-w-none">
                <p className="text-lg">
                  Welcome to UXMust! By accessing or using our website (
                  <a
                    href="https://uxmust.com"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-[#C25B3F]"
                  >
                    https://uxmust.com
                  </a>
                  ), you agree to be bound by the following Terms and
                  Conditions. Please read them carefully.
                </p>

                <div className="bg-[#FDF0ED] p-6 rounded-xl my-6">
                  <p>
                    <strong>Important:</strong> By using this website, you
                    acknowledge that you have read, understood, and agree to be
                    bound by these Terms and Conditions. If you do not agree
                    with any part of these terms, please do not use our website
                    or services.
                  </p>
                </div>

                <h2
                  id="use"
                  className="text-2xl font-bold mt-12 mb-4 scroll-mt-20"
                >
                  1. Use of Website
                </h2>

                <p>
                  Our website is intended for informational and business
                  purposes related to UXMust services. You agree not to misuse
                  the content or attempt to harm the website&apos;s integrity or
                  performance.
                </p>

                <div className="my-6 p-6 border border-gray-200 rounded-xl">
                  <h3 className="text-lg font-semibold mb-3">Acceptable Use</h3>
                  <p className="mb-4">
                    You agree to use our website only for lawful purposes and in
                    a way that does not infringe upon the rights of others or
                    restrict their use of the website.
                  </p>

                  <h3 className="text-lg font-semibold mb-3">
                    Prohibited Activities
                  </h3>
                  <ul className="list-disc pl-6 space-y-2">
                    <li>
                      Attempting to gain unauthorized access to our systems
                    </li>
                    <li>
                      Using the website to transmit harmful code or malware
                    </li>
                    <li>Scraping or collecting data without permission</li>
                    <li>Impersonating another person or entity</li>
                  </ul>
                </div>

                <h2
                  id="intellectual"
                  className="text-2xl font-bold mt-12 mb-4 scroll-mt-20"
                >
                  2. Intellectual Property
                </h2>

                <p>
                  All content, branding, and materials on this website are owned
                  by UXMust or its partners. You may not copy, distribute, or
                  use any part of the site without prior written consent.
                </p>

                <p>
                  The UXMust name, logo, and all related names, logos, product
                  and service names, designs, and slogans are trademarks of
                  UXMust or its affiliates. You must not use such marks without
                  our prior written permission.
                </p>

                <h2
                  id="disclaimer"
                  className="text-2xl font-bold mt-12 mb-4 scroll-mt-20"
                >
                  3. Disclaimer
                </h2>

                <div className="bg-gray-50 p-6 rounded-xl my-6 border border-gray-200">
                  <p className="font-medium mb-2">
                    The content on our site is provided "as is" and without
                    warranties of any kind.
                  </p>
                  <p>
                    We do our best to keep it accurate and up to date, but we do
                    not guarantee its completeness or reliability. Any reliance
                    you place on such information is strictly at your own risk.
                  </p>
                </div>

                <h2
                  id="liability"
                  className="text-2xl font-bold mt-12 mb-4 scroll-mt-20"
                >
                  4. Limitation of Liability
                </h2>

                <p>
                  UXMust will not be liable for any indirect, incidental, or
                  consequential damages arising from your use of the website or
                  reliance on its content.
                </p>

                <p>
                  In no event shall UXMust, its directors, employees, partners,
                  agents, suppliers, or affiliates be liable for any damages,
                  including without limitation damages for loss of data or
                  profit, arising out of the use or inability to use the
                  materials on UXMust's website.
                </p>

                <h2
                  id="privacy"
                  className="text-2xl font-bold mt-12 mb-4 scroll-mt-20"
                >
                  5. Privacy
                </h2>

                <p>
                  Please refer to our{" "}
                  <Link
                    href="/privacy-policy"
                    className="text-[#C25B3F] hover:underline"
                  >
                    Privacy Policy
                  </Link>{" "}
                  for information on how we collect, use, and protect your
                  personal data.
                </p>

                <p>
                  Your use of UXMust is also subject to our Privacy Policy. By
                  using UXMust, you consent to all actions we take with respect
                  to your information in compliance with our Privacy Policy.
                </p>

                <h2
                  id="governing"
                  className="text-2xl font-bold mt-12 mb-4 scroll-mt-20"
                >
                  6. Governing Law
                </h2>

                <p>
                  These terms are governed by the laws of the Republic of
                  Estonia. Any disputes shall be resolved in Estonian courts.
                </p>

                <p>
                  You agree that any legal action or proceeding between UXMust
                  and you related to these Terms and Conditions shall be brought
                  exclusively in a court of competent jurisdiction in Estonia.
                </p>

                <h2
                  id="changes"
                  className="text-2xl font-bold mt-12 mb-4 scroll-mt-20"
                >
                  7. Changes to These Terms
                </h2>

                <p>
                  We may update these Terms from time to time. Continued use of
                  the website after changes means you accept the new Terms.
                </p>

                <p>
                  We will notify users of any material changes to these Terms by
                  posting a notice on our website. Your continued use of the
                  website following the posting of revised Terms means you
                  accept and agree to the changes.
                </p>
              </div>

              <div className="mt-12 flex flex-col sm:flex-row justify-center gap-4">
                <Link
                  href="/privacy-policy"
                  className="px-6 py-3 bg-[#B04E34] hover:bg-[#963F28] text-white rounded-lg transition-colors flex items-center justify-center"
                >
                  <span>View Privacy Policy</span>
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Link>
                <Link
                  href="/"
                  className="px-6 py-3 bg-gray-100 hover:bg-gray-200 text-gray-800 rounded-lg transition-colors flex items-center justify-center"
                >
                  Return to Home
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
