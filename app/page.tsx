"use client";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import {
  BarChart3,
  LineChart,
  Settings,
  GitCompare,
  FileSpreadsheet,
  Radar,
  BadgeCheck,
} from "lucide-react";
import Image from "next/image";

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-[#FFF1E0]">
      {/* Header */}
      <header className="mx-auto px-4 py-3 bg-white flex justify-center items-center text-center ">
        <Image
          src="/images/logo.png"
          alt="UXMust Logo"
          width={120}
          height={40}
          className="w-auto h-8"
        />
      </header>

      {/* Hero Section */}
      <section className="container mx-auto px-4 py-12 text-center">
        <h1 className="text-[#2D3648] text-4xl md:text-5xl font-bold mb-4 mt-20">
          Ensure User-Friendly Experiences
        </h1>
        <p className="text-gray-600 max-w-2xl mx-auto mb-8">
          Discover how your design choices impact user experience and keep
          improving with actionable insights for your website. UXMust provides
          you ways to design user-friendly solutions.
        </p>
        <div className="flex max-w-md mx-auto gap-2 mb-16">
          <Input
            type="email"
            placeholder="Enter your email"
            className="bg-white"
          />
          <div className="px-2">
            <Button className="bg-[#B04E34] hover:bg-[#963F28] text-white -ml-36 w-28">
              Join
            </Button>
          </div>
        </div>
        <div className="relative w-full max-w-5xl mx-auto -mb-32">
          <div className="relative flex justify-center items-center space-x-[-30px]">
            <Image
              src="/images/image1.jpeg"
              alt="UXMust Dashboard View 1"
              width={390}
              height={175}
              className="rounded-lg shadow-xl relative z-10"
            />
            <Image
              src="/images/image2.png"
              alt="UXMust Dashboard View 2"
              width={580}
              height={325}
              className="rounded-lg shadow-xl relative z-20 -ml-24"
            />
            <Image
              src="/images/image3.jpeg"
              alt="UXMust Dashboard View 3"
              width={390}
              height={175}
              className="rounded-lg shadow-xl relative z-10 -ml-24"
            />
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="  bg-slate-50">
        <div className="container mx-auto px-4 py-24">
          <div className="text-center mb-16 mt-28">
            <h2 className="text-[#2D3648] text-2xl md:text-3xl font-bold mb-4">
              Evaluate, Improve, Evolve.
            </h2>
            <p className="text-gray-600">
              Take the guesswork out of test-work, discover what performs and
              what doesn't on your website.
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 px-6">
            {features.map((feature, index) => (
              <div
                key={index}
                className="flex flex-col bg-white px-4 py-10 rounded-lg shadow-md items-center justify-center text-center"
              >
                <feature.icon className="w-8 h-8 text-gray-800" />
                <h3 className="text-gray-700 text-lg font-semibold mb-2">
                  {feature.title}
                </h3>
                <p className="text-gray-600 text-sm">{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="container mx-auto px-4 py-24 text-center">
        <h2 className="text-[#2D3648] text-3xl md:text-4xl font-bold mb-4">
          Stay tuned, coming soon!
        </h2>
        <p className="text-gray-600 mb-8">
          Join our list and be the first to know.
        </p>
        <div className="flex max-w-md mx-auto gap-2">
          <Input
            type="email"
            placeholder="Enter your email"
            className="bg-white"
          />
          <div className="px-2">
            <Button className="bg-[#B04E34] hover:bg-[#963F28] text-white -ml-36 w-28">
              Join
            </Button>
          </div>
        </div>
      </section>

      {/* FAQ Section */}
      <section className="  bg-slate-50">
        <div className="container mx-auto px-4 py-24">
          <h2 className="text-[#2D3648] text-3xl md:text-4xl font-bold text-center mb-4">
            Frequently Asked Questions
          </h2>
          <p className="text-gray-600 text-center mb-12">
            View the most common questions asked
          </p>
          <div className="max-w-2xl mx-auto">
            <Accordion type="single" collapsible>
              <AccordionItem
                value="item-1"
                className="mb-4 bg-white p-4 rounded-md"
              >
                <AccordionTrigger>
                  How long does it take to generate a report?
                </AccordionTrigger>
                <AccordionContent>
                  We try our best to ensure a good quality report which can take
                  some time to generate. However, you can expect to receive your
                  report in less than 7 minutes!
                </AccordionContent>
              </AccordionItem>
              <AccordionItem
                value="item-2"
                className="mb-4 bg-white p-4 rounded-md"
              >
                <AccordionTrigger>
                  Can I export reports in different formats?
                </AccordionTrigger>
                <AccordionContent>
                  Yes! Besides viewing it on your dashboard, you can export the
                  report as PDF.
                </AccordionContent>
              </AccordionItem>
              <AccordionItem
                value="item-3"
                className="mb-4 bg-white p-4 rounded-md"
              >
                <AccordionTrigger>
                  I reached my report limits for this month, can I get more?
                </AccordionTrigger>
                <AccordionContent>
                  If you have ran extensive evaluations but still need more, you
                  can purchase tokens that will allow you to generate additional
                  reports.
                </AccordionContent>
              </AccordionItem>
            </Accordion>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-white mx-auto px-4 py-8 text-center text-gray-600 border-t">
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
    description:
      "Each page gets a detailed usability score, pin-pointing the exact location of error.",
  },
  {
    icon: Settings,
    title: "Design Recommendations",
    description:
      "Suggestions are crucial for improvements. Iterate your designs intelligently.",
  },
  {
    icon: BadgeCheck,
    title: "Proven Methodological Effectiveness",
    description:
      "Nielsen Norman's 10 Usability Heuristics have proven, effective, and extensive practical use.",
  },
  {
    icon: GitCompare,
    title: "Benchmarking",
    description: "Compare how well your design stands within your domain.",
  },
  {
    icon: Radar,
    title: "Track Evolution",
    description:
      "Design is a continous process. Keep track on how your design iterations evolve throughout time.",
  },
];
