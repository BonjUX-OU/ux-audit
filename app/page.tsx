"use client";
import { Button } from "@/components/ui/button";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { BarChart3, Settings, GitCompare, FileSpreadsheet, Radar, BadgeCheck } from "lucide-react";
import Image from "next/image";
import Link from "next/link";

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-[#FFF1E0] flex flex-col">
      {/* Header */}
      <header className="bg-white border-b">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          {/* Logo */}
          <div className="flex items-center space-x-3">
            <Image src="/images/logo.png" alt="UXMust Logo" width={120} height={40} className="h-8 w-auto" />
          </div>
          {/* Nav Right */}
          <div className="flex items-center space-x-4">
            <Link href="/signin">
              <Button variant="outline" className="border-none hover:bg-gray-100">
                Login
              </Button>
            </Link>
            <Link href="/signup">
              <Button className="bg-[#B04E34] hover:bg-[#963F28] text-white">Join Us</Button>
            </Link>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="bg-[#FFF1E0]">
        <div className="container mx-auto px-4 py-12 text-center">
          <h1 className="text-[#2D3648] text-4xl md:text-5xl font-bold mt-10 mb-4">
            Wondering how your design really feels to users?
          </h1>
          <p className="text-gray-600 max-w-2xl mx-auto mb-8">
            UXMust gives you another point of view from real UX professional who spot what you might miss and guide you
            toward smarter design decisions.
          </p>

          <div className="mb-2">
            <Link href="/signup">
              <Button className="bg-[#B04E34] hover:bg-[#963F28] text-white px-6 py-3 font-semibold">
                Register and Request an Audit
              </Button>
            </Link>
          </div>
          <p className="text-sm text-gray-500 italic mb-12">No payment until the report generation</p>

          <div className="relative w-full max-w-5xl mx-auto h-[140px]">
            <div className="absolute flex justify-center items-center md:space-x-[-30px]">
              <Image
                src="/images/image1.png"
                alt="UXMust Dashboard View 1"
                width={390}
                height={243}
                className="hidden md:flex rounded-lg shadow-xl relative z-10"
              />
              <Image
                src="/images/image2.png"
                alt="UXMust Dashboard View 2"
                width={580}
                height={325}
                className="rounded-lg shadow-xl relative z-20 md:-ml-24"
              />
              <Image
                src="/images/image3.png"
                alt="UXMust Dashboard View 3"
                width={390}
                height={243}
                className="hidden md:flex rounded-lg shadow-xl relative z-10 -ml-24"
              />
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="bg-stone-100">
        <div className="container mx-auto px-4 py-24">
          <div className="text-center mb-16 mt-28">
            <h2 className="text-[#2D3648] text-2xl md:text-3xl font-bold mb-4">Evaluate, Improve, Evolve.</h2>
            <p className="text-gray-600">
              Take the guesswork out of test-work, discover what performs and what doesn&apos;t on your website.
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 px-6">
            {features.map((feature, index) => (
              <div
                key={index}
                className="flex flex-col bg-white px-4 py-10 rounded-lg shadow-md items-center justify-center text-center">
                <feature.icon className="w-8 h-8 text-gray-800" />
                <h3 className="text-gray-700 text-lg font-semibold mb-2">{feature.title}</h3>
                <p className="text-gray-600 text-sm">{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* FAQ Section */}
      <section className="bg-stone-100">
        <div className="container mx-auto px-4 py-24">
          <h2 className="text-[#2D3648] text-3xl md:text-4xl font-bold text-center mb-4">Frequently Asked Questions</h2>
          <p className="text-gray-600 text-center mb-12">View the most common questions asked</p>
          <div className="max-w-2xl mx-auto">
            <Accordion type="single" collapsible>
              <AccordionItem value="item-1" className="mb-4 bg-white p-4 rounded-md">
                <AccordionTrigger>How long does it take to generate a report?</AccordionTrigger>
                <AccordionContent>
                  To ensure the accuracy and depth of your report, generation time may vary. We prioritize quality, so
                  please allow some time for the process to complete.
                </AccordionContent>
              </AccordionItem>
              <AccordionItem value="item-2" className="mb-4 bg-white p-4 rounded-md">
                <AccordionTrigger>Can I share reports with my teammates?</AccordionTrigger>
                <AccordionContent>
                  Not at the moment but we are working on it. You will be able to invite your teammates to view and
                  collaborate on the report directly.
                </AccordionContent>
              </AccordionItem>
              <AccordionItem value="item-3" className="mb-4 bg-white p-4 rounded-md">
                <AccordionTrigger>How much does it cost?</AccordionTrigger>
                <AccordionContent>
                  Get comprehensive UX feedback just €14.90 per page. We use stripe for payments.
                </AccordionContent>
              </AccordionItem>
            </Accordion>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-white mx-auto px-4 py-8 text-center text-gray-600 border-t w-full">
        © 2025 UXMust. All rights reserved.
      </footer>
    </div>
  );
}

const features = [
  {
    icon: BarChart3,
    title: "Effortless Usability Evaluation",
    description:
      "No need for lengthy audits - get clear feedback to understand how your website can better serve your users.",
  },
  {
    icon: FileSpreadsheet,
    title: "Extensive Report for Every Page",
    description: "Each page gets a detailed usability score, pin-pointing the exact location of error.",
  },
  {
    icon: Settings,
    title: "Design Recommendations",
    description: "Suggestions are crucial for improvements. Iterate your designs intelligently.",
  },
  {
    icon: BadgeCheck,
    title: "Proven Methodological Effectiveness",
    description: "Nielsen Norman's 10 Usability Heuristics have proven, effective, and extensive practical use.",
  },
  {
    icon: GitCompare,
    title: "Benchmarking",
    description: "Compare how well your design stands within your domain.",
  },
  {
    icon: Radar,
    title: "Track Evolution",
    description: "Design is a continuous process. Keep track on how your design iterations evolve throughout time.",
  },
];
