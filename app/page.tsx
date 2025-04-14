"use client";
import { useState } from "react";
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
  Settings,
  GitCompare,
  FileSpreadsheet,
  Radar,
  BadgeCheck,
} from "lucide-react";
import Image from "next/image";
import Link from "next/link";

// A reusable JoinForm component to handle email submissions and feedback.
function JoinForm() {
  const [email, setEmail] = useState("");
  const [feedback, setFeedback] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const validateEmail = (email: string) => {
    const emailRegex = /^\S+@\S+\.\S+$/;
    return emailRegex.test(email);
  };

  const handleJoin = async () => {
    if (!email) {
      setFeedback("Please enter your email.");
      return;
    }
    if (!validateEmail(email)) {
      setFeedback("Please enter a valid email address.");
      return;
    }
    setIsLoading(true);
    setFeedback("");

    try {
      const res = await fetch("/api/emails", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email }),
      });
      const data = await res.json();

      if (res.status === 200) {
        setFeedback("Email already subscribed ✅");
      } else if (res.status === 201) {
        setFeedback("You're In! 🎉");
      } else {
        setFeedback("Something went wrong 😥");
      }
    } catch (error) {
      console.error("Error:", error);
      setFeedback("An unexpected error occurred.");
    } finally {
      setIsLoading(false);
      setEmail("");
    }
  };

  return (
    <div className="flex flex-col items-center">
      <div className="flex max-w-md mx-auto gap-2">
        <Input
          type="email"
          placeholder="Enter your email"
          className="bg-white w-80 md:w-96"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />

        <div className="px-2">
          <Button
            className="bg-[#B04E34] hover:bg-[#963F28] text-white -ml-36 w-28"
            onClick={handleJoin}
            disabled={isLoading}
          >
            {isLoading ? "Joining..." : "Join"}
          </Button>
        </div>
      </div>
      {feedback && (
        <p className="mt-2 text-sm text-gray-500 font-semibold">{feedback}</p>
      )}
    </div>
  );
}

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-[#FFF1E0] flex flex-col">
      {/* Header */}
      <header className="bg-white border-b">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          {/* Logo */}
          <div className="flex items-center space-x-3">
            <Image
              src="/images/logo.png"
              alt="UXMust Logo"
              width={120}
              height={40}
              className="h-8 w-auto"
            />
          </div>
          {/* Nav Right */}
          <div className="flex items-center space-x-4">
            <Link href="/signin">
              <Button
                variant="outline"
                className="border-none hover:bg-gray-100"
              >
                Login
              </Button>
            </Link>
            <Link href="/signup">
              <Button className="bg-[#B04E34] hover:bg-[#963F28] text-white">
                Join us as a Beta User
              </Button>
            </Link>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="bg-[#FFF1E0]">
        <div className="container mx-auto px-4 py-12 text-center">
          <h1 className="text-[#2D3648] text-4xl md:text-5xl font-bold mt-10 mb-4">
            Ensure User-Friendly Experiences
          </h1>
          <p className="text-gray-600 max-w-2xl mx-auto mb-8">
            Discover how your design choices impact user experience and keep
            improving with actionable insights for your website. UXMust provides
            ways to design user-friendly solutions.
          </p>
          <div className="mb-2">
            <Link href="/signup">
              <Button className="bg-[#B04E34] hover:bg-[#963F28] text-white px-6 py-3 font-semibold">
                Join us as a Beta User*
              </Button>
            </Link>
          </div>
          <p className="text-sm text-gray-500 italic mb-12">
            *Get the chance to subscribe only for 4.99 € valid for 6 months
          </p>

          {/* Dashboard Previews */}
          <div className="relative w-full max-w-5xl mx-auto">
            <div className="flex justify-center items-center md:space-x-[-30px]">
              <Image
                src="/images/image1.jpeg"
                alt="UXMust Dashboard View 1"
                width={390}
                height={175}
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
                src="/images/image3.jpeg"
                alt="UXMust Dashboard View 3"
                width={390}
                height={175}
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
        <JoinForm />
      </section>

      {/* FAQ Section */}
      <section className="bg-stone-100">
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
                  report in less than 2 minutes!
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
      "Design is a continuous process. Keep track on how your design iterations evolve throughout time.",
  },
];
