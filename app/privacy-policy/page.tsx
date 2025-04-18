"use client";
import Link from "next/link";
import { ChevronLeft, ArrowRight, Clock, Shield, FileText } from "lucide-react";
import { useState, useEffect } from "react";

export default function PrivacyPolicyPage() {
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
                  <span>Your data is protected</span>
                </div>
              </div>

              <nav className="space-y-1">
                <p className="text-sm font-medium text-gray-500 mb-2">
                  ON THIS PAGE
                </p>
                {[
                  { id: "acceptance", label: "Your Acceptance" },
                  { id: "questions", label: "Questions" },
                  { id: "notices", label: "Privacy Notices" },
                  { id: "collection", label: "Information Collection" },
                  { id: "usage", label: "Information Usage" },
                  { id: "sharing", label: "Information Sharing" },
                  { id: "opt-out", label: "Opting Out" },
                  { id: "rights", label: "Your Rights" },
                  { id: "security", label: "Security" },
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
                  href="/terms"
                  className="flex items-center justify-between text-[#C25B3F] p-3 bg-[#FDF0ED] rounded-lg hover:bg-[#FBDED6] transition-colors"
                >
                  <div className="flex items-center">
                    <FileText className="h-4 w-4 mr-2" />
                    <span className="font-medium">Terms of Service</span>
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
                Privacy Policy
              </h1>

              <div className="prose prose-gray max-w-none">
                <p className="text-lg">
                  This is the Privacy Policy for{" "}
                  <a
                    href="http://uxmust.com"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-[#C25B3F]"
                  >
                    www.uxmust.com
                  </a>{" "}
                  (&quot;Site&quot;), which is owned and operated by Uxmust OÜ,
                  (&quot;Company&quot; or &quot;we&quot; or &quot;us&quot;).
                </p>

                <p className="text-lg">
                  The following policy explains how we collect and use personal
                  information in detail. If you have any concerns about this
                  policy, please feel free to contact us at{" "}
                  <a
                    href="mailto:connect@uxmust.com"
                    className="text-[#C25B3F]"
                  >
                    connect@uxmust.com
                  </a>
                </p>

                <h2
                  id="acceptance"
                  className="text-2xl font-bold mt-12 mb-4 scroll-mt-20"
                >
                  Your Acceptance of this Privacy Policy
                </h2>

                <div className="bg-[#FDF0ED] p-6 rounded-xl my-6">
                  <p>
                    By registering and using this Site, including, without
                    limitation, signing up for offers and/or continuing to
                    receive information from Company, you signify your
                    acceptance of this Policy, and you expressly consent to our
                    use and disclosure of your personal information in
                    accordance with this Privacy Policy.
                  </p>
                </div>

                <p>
                  This Privacy Policy is subject to the Terms of Use posted on
                  the Site. If you do not agree to the terms of this Policy, in
                  whole or part, you should not use this Site, and should
                  instantly cancel your registration (if you have signed up) by
                  following the directions in the section &quot;Opting-Out of
                  Further Communications:&quot;
                </p>

                <h2
                  id="questions"
                  className="text-2xl font-bold mt-12 mb-4 scroll-mt-20"
                >
                  Questions Concerning Our Online Privacy Practices
                </h2>

                <p>
                  If you have any questions or concerns regarding this Online
                  Privacy Statement or our privacy practices, please email at{" "}
                  <a
                    href="mailto:connect@uxmust.com"
                    className="text-[#C25B3F]"
                  >
                    connect@uxmust.com
                  </a>
                </p>

                <h2
                  id="notices"
                  className="text-2xl font-bold mt-12 mb-4 scroll-mt-20"
                >
                  Privacy Notices
                </h2>

                <p>
                  This Online Privacy Statement may be supplemented or amended
                  from time to time by &quot;privacy notices&quot; posted on
                  this site. We reserve the right to update or modify this
                  Online Privacy Statement, at any time and without prior
                  notice, by posting the revised version on this site. Your use
                  of this site following any such change constitutes your
                  agreement that all personal information collected from or
                  about you through connect@uxmust.com after the revised Online
                  Privacy Statement is posted will be subject to the terms of
                  the revised Online Privacy Statement.
                </p>

                <h2
                  id="collection"
                  className="text-2xl font-bold mt-12 mb-4 scroll-mt-20"
                >
                  What Personal Information Do We Collect?
                </h2>

                <div className="grid md:grid-cols-2 gap-6 my-8">
                  <div className="bg-white border border-gray-200 rounded-xl p-6 shadow-sm hover:shadow-md transition-shadow">
                    <h3 className="text-xl font-semibold mb-3">
                      Information You Give Us
                    </h3>
                    <p>
                      We collect the personal information you knowingly and
                      voluntarily provide when you use connect@uxmust.com, our
                      application, and our delivery portal (e.g., for example,
                      the information you provide when you register, sign-in,
                      search, purchase products, sign up for our e-mails,
                      communicate with customer service, etc.).
                    </p>
                  </div>

                  <div className="bg-white border border-gray-200 rounded-xl p-6 shadow-sm hover:shadow-md transition-shadow">
                    <h3 className="text-xl font-semibold mb-3">
                      Information From Cookies & Technologies
                    </h3>
                    <p>
                      We collect information that is sent to us by your web
                      browser, including but not limited to your IP address, the
                      address of the web page you were visiting when you
                      accessed connect@uxmust.com the date and time of your
                      visit, and information about your computer&apos;s
                      operating system or mobile device.
                    </p>
                  </div>
                </div>

                <p>
                  We use &quot;cookies&quot; and other web technologies to
                  collect information and support certain features of this site.
                  For example, we use these technologies to collect information
                  about the ways visitors use our site (e.g., which pages they
                  visit, which links they use, and how long they stay on each
                  page). Cookies and other web technologies are also used to
                  support the features and functionality of our site (e.g., to
                  track the contents of your shopping cart as you move from page
                  to page, etc.). This allows us to keep a record of your
                  previous choices and preferences so that we can personalize
                  your experience. Generally, the information we collect using
                  these web technologies does not identify you personally. If
                  you do not wish to receive cookies, you may set your browser
                  to reject cookies or to alert you when a cookie is placed on
                  your computer.
                </p>

                <h3 className="text-xl font-semibold mt-6 mb-3">
                  Use of Cookies by Our Advertisers and Affiliates
                </h3>

                <p>
                  We may work with third-party marketing and advertising
                  companies (&quot;Ad Networks&quot;). These companies may
                  collect and use information about your use of the Site or
                  services in order to provide advertisements about goods and
                  services that may be of interest to you. Advertisements may be
                  shown via the Site, the services, or third-party sites. These
                  companies may place or recognize a unique cookie on your
                  computer or use other technologies such as Web beacons. Our
                  Privacy Policy does not cover any use of information that an
                  Ad Network may collect from you. It also does not cover any
                  information that you may choose to provide to an Ad Network or
                  to an advertiser whose goods or services are advertised
                  through the Site.
                </p>

                <h2
                  id="usage"
                  className="text-2xl font-bold mt-12 mb-4 scroll-mt-20"
                >
                  How Do We Use Your Personal Information?
                </h2>

                <p>
                  We may use the personal information we collect through
                  connect@uxmust.com:
                </p>

                <div className="grid md:grid-cols-2 gap-4 my-6">
                  <ul className="list-none space-y-2">
                    <li className="flex items-start">
                      <div className="bg-[#E84C30] rounded-full w-5 h-5 flex items-center justify-center mt-0.5 mr-2 flex-shrink-0">
                        <span className="text-white text-xs">✓</span>
                      </div>
                      <span>To fulfill your order</span>
                    </li>
                    <li className="flex items-start">
                      <div className="bg-[#E84C30] rounded-full w-5 h-5 flex items-center justify-center mt-0.5 mr-2 flex-shrink-0">
                        <span className="text-white text-xs">✓</span>
                      </div>
                      <span>To provide you with a personalized experience</span>
                    </li>
                    <li className="flex items-start">
                      <div className="bg-[#E84C30] rounded-full w-5 h-5 flex items-center justify-center mt-0.5 mr-2 flex-shrink-0">
                        <span className="text-white text-xs">✓</span>
                      </div>
                      <span>
                        For security, credit or fraud prevention purposes
                      </span>
                    </li>
                    <li className="flex items-start">
                      <div className="bg-[#E84C30] rounded-full w-5 h-5 flex items-center justify-center mt-0.5 mr-2 flex-shrink-0">
                        <span className="text-white text-xs">✓</span>
                      </div>
                      <span>To provide you with customer service</span>
                    </li>
                    <li className="flex items-start">
                      <div className="bg-[#E84C30] rounded-full w-5 h-5 flex items-center justify-center mt-0.5 mr-2 flex-shrink-0">
                        <span className="text-white text-xs">✓</span>
                      </div>
                      <span>
                        To improve the content, functionality and usability of
                        this site
                      </span>
                    </li>
                  </ul>
                  <ul className="list-none space-y-2">
                    <li className="flex items-start">
                      <div className="bg-[#E84C30] rounded-full w-5 h-5 flex items-center justify-center mt-0.5 mr-2 flex-shrink-0">
                        <span className="text-white text-xs">✓</span>
                      </div>
                      <span>
                        To contact you with special offers and other information
                      </span>
                    </li>
                    <li className="flex items-start">
                      <div className="bg-[#E84C30] rounded-full w-5 h-5 flex items-center justify-center mt-0.5 mr-2 flex-shrink-0">
                        <span className="text-white text-xs">✓</span>
                      </div>
                      <span>To improve our products and services</span>
                    </li>
                    <li className="flex items-start">
                      <div className="bg-[#E84C30] rounded-full w-5 h-5 flex items-center justify-center mt-0.5 mr-2 flex-shrink-0">
                        <span className="text-white text-xs">✓</span>
                      </div>
                      <span>For marketing purposes</span>
                    </li>
                    <li className="flex items-start">
                      <div className="bg-[#E84C30] rounded-full w-5 h-5 flex items-center justify-center mt-0.5 mr-2 flex-shrink-0">
                        <span className="text-white text-xs">✓</span>
                      </div>
                      <span>To provide to third party service providers</span>
                    </li>
                    <li className="flex items-start">
                      <div className="bg-[#E84C30] rounded-full w-5 h-5 flex items-center justify-center mt-0.5 mr-2 flex-shrink-0">
                        <span className="text-white text-xs">✓</span>
                      </div>
                      <span>
                        For any other purpose we identify in our privacy policy
                      </span>
                    </li>
                  </ul>
                </div>

                <h2
                  id="sharing"
                  className="text-2xl font-bold mt-12 mb-4 scroll-mt-20"
                >
                  With Whom Do We Share Your Personal Information?
                </h2>

                <div className="space-y-6 my-8">
                  <div className="bg-white border border-gray-200 rounded-xl p-6 shadow-sm">
                    <h3 className="text-xl font-semibold mb-3">
                      Our Corporate Affiliates
                    </h3>
                    <p>
                      We may share your personal information with our
                      subsidiaries and parent and sister corporations (our
                      &quot;corporate affiliates&quot;), who may use this
                      information to contact you with information and offers we
                      or they believe will be of interest to you. The corporate
                      affiliates&apos; use of your personal information shall be
                      subject to this Online Privacy Statement.
                    </p>
                  </div>

                  <div className="bg-white border border-gray-200 rounded-xl p-6 shadow-sm">
                    <h3 className="text-xl font-semibold mb-3">
                      Our Service Providers
                    </h3>
                    <p>
                      We may share your personal information with companies that
                      perform services on our behalf. Or with companies that
                      transact business on your behalf. Our service providers
                      are required to protect the confidentiality of the
                      personal information we share with them and to use it only
                      to provide services, locally market to you, or enhance
                      your experience.
                    </p>
                  </div>

                  <div className="bg-white border border-gray-200 rounded-xl p-6 shadow-sm">
                    <h3 className="text-xl font-semibold mb-3">
                      Other Business Partners
                    </h3>
                    <p>
                      We work closely with certain business partners, and
                      restaurants to provide you with access to their product
                      offerings. We may share personally identifiable
                      information about you with these business partners or
                      selected vendors, and they may use this information to
                      offer you products and/or services that they believe will
                      be of interest to you.
                    </p>
                  </div>
                </div>

                <h2
                  id="opt-out"
                  className="text-2xl font-bold mt-12 mb-4 scroll-mt-20"
                >
                  Opting-Out of Further Communications
                </h2>

                <div className="bg-[#FDF0ED] p-6 rounded-xl my-6">
                  <p>
                    Site or application registrants may opt-out of receiving
                    further communications from Company. Registrants may, at any
                    time, choose not to receive promotional emails from Company
                    or Network Sites by (1) following the
                    &quot;unsubscribe&quot; instructions in any such e-mail
                    received by registrant, or (2) writing to{" "}
                    <a
                      href="mailto:connect@uxmust.com"
                      className="text-[#C25B3F] font-medium"
                    >
                      connect@uxmust.com
                    </a>
                    . Additionally, Registrants may at any time modify their
                    information by writing to connect@uxmust.com
                  </p>
                </div>

                <p>
                  Note that unsubscribing from one email list does not
                  automatically unsubscribe you from any other email list that
                  you may be on. Please read the email carefully to find out
                  which list you are unsubscribing from. Registrants also may
                  opt out of receiving telephone calls from Company or Network
                  Sites with whom we have shared your information by requesting
                  to be placed on its company-specific do-not-call list.
                </p>

                <h2
                  id="rights"
                  className="text-2xl font-bold mt-12 mb-4 scroll-mt-20"
                >
                  Your Rights
                </h2>

                <div className="grid md:grid-cols-2 gap-6 my-8">
                  <div className="bg-white border border-gray-200 rounded-xl p-6 shadow-sm">
                    <h3 className="text-xl font-semibold mb-3">
                      Right to be Forgotten
                    </h3>
                    <p>
                      Site registrants may by writing to connect@uxmust.com
                      request that all personal identifiable information about
                      them is permanently deleted after providing confirmation
                      of their identity. After such verified request all contact
                      information and personal information will be removed from
                      Company Servers.
                    </p>
                  </div>

                  <div className="bg-white border border-gray-200 rounded-xl p-6 shadow-sm">
                    <h3 className="text-xl font-semibold mb-3">
                      Right to Your Information
                    </h3>
                    <p>
                      In certain circumstances, you have a right to access or
                      object to the use of personal information held about you.
                      You can also ask us to rectify, update, erase, restrict or
                      to share your information in a usable format with another
                      company.
                    </p>
                  </div>
                </div>

                <p>
                  We encourage you to contact us to update or correct your
                  information if it changes or if the personal information we
                  hold about you is inaccurate.
                </p>

                <p>
                  If you would like to discuss or exercise such rights, please
                  contact us at connect@uxmust.com. We will contact you if we
                  need additional information from you in order to honor your
                  requests.
                </p>

                <h2
                  id="security"
                  className="text-2xl font-bold mt-12 mb-4 scroll-mt-20"
                >
                  Security, Fraud, and Abuse
                </h2>

                <p>
                  This site has security measures in place to protect the loss,
                  misuse, and alteration of the information under our control.
                  Company regularly reviews these measures to better protect
                  you. However, we do not and cannot guarantee the security or
                  integrity of the information, and we have no liability for
                  breaches of said security or integrity or third-party
                  interception in transit. Please be advised that any
                  transmission of data at or through the Site is at your own
                  risk.
                </p>

                <h3 className="text-xl font-semibold mt-6 mb-3">
                  Must Be 18 Years or Older
                </h3>

                <p>
                  Neither Company nor the Network Sites are intended for, or
                  directed to, children under the age of 18. If we learn that a
                  person who registers on the Site is under the age of 18, we
                  will promptly delete that individual&apos;s registration.
                </p>

                <h3 className="text-xl font-semibold mt-6 mb-3">
                  Links to Other Sites
                </h3>

                <p>
                  The Site may contain links to other sites, or allow others to
                  send you such links. A link to a third party&apos;s site does
                  not mean we endorse it or are affiliated with it. We exercise
                  no control over third-party sites and are not responsible for
                  the privacy practices or content of those sites. Your access
                  to such third-party sites or content is at your own risk. You
                  should always read the privacy policy of a third-party site
                  before providing any information to the site.
                </p>

                <h3 className="text-xl font-semibold mt-6 mb-3">
                  Change in Policy
                </h3>

                <p>
                  Company may, from time to time, amend this Policy, in whole or
                  part, in its sole discretion. Depending on the nature of the
                  change, we will either announce the change (1) on the privacy
                  policy page of the site, or (2) provide such notice via e-mail
                  to registrants or via pop-up on site arrival. Those changes
                  will go into effect on the revision date shown in the revised
                  Privacy Policy. Your continued use of our Site and services
                  constitutes your consent to be bound by the revised Privacy
                  Policy. If you do not agree with the terms of this Policy, as
                  it may be amended from time to time, in whole or part, you
                  must terminate your registration by emailing
                  connect@uxmust.com
                </p>

                <h3 className="text-xl font-semibold mt-6 mb-3">
                  Contacting Us
                </h3>

                <p>
                  If you have any questions or concerns about this Privacy
                  Policy or our privacy practices, you may write to us at:{" "}
                  <a
                    href="mailto:connect@uxmust.com"
                    className="text-[#C25B3F]"
                  >
                    connect@uxmust.com
                  </a>
                  . Please provide complete information to facilitate your
                  request, as well as your complete contact information.
                </p>
              </div>

              <div className="mt-12 flex flex-col sm:flex-row justify-center gap-4">
                <Link
                  href="/terms"
                  className="px-6 py-3 bg-[#B04E34] hover:bg-[#963F28] text-white rounded-lg transition-colors flex items-center justify-center"
                >
                  <span>View Terms of Service</span>
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
