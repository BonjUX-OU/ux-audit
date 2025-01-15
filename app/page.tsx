import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@radix-ui/react-dropdown-menu";
import { ChevronDown, ArrowRight } from "lucide-react";
import Link from "next/link";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

export default function Home() {
  return (
    <main className="w-full bg-white">
      {/* Navbar */}
      <header className="flex justify-between items-center p-4 border-b">
        <h1 className="text-xl font-bold">UXMust</h1>
        <nav className="flex gap-6">
          <a href="#" className="hover:text-gray-600">
            Features
          </a>
          <a href="#" className="hover:text-gray-600">
            How it works?
          </a>
          <a href="#" className="hover:text-gray-600">
            Pricing
          </a>
          <a href="#" className="hover:text-gray-600">
            FAQ
          </a>
        </nav>
        <Link href="//signin">
          <Button>Login/Register</Button>
        </Link>
      </header>

      {/* Hero Section */}
      <section className="text-center py-12">
        <h2 className="text-4xl font-bold mb-4">
          {"Ensure User-Friendly Experiences"}
        </h2>
        <p className="text-gray-600 mb-6 max-w-lg mx-auto">
          {
            "Discover how your design choices impact user experience and keep improving with actionable insights for your website."
          }
        </p>
        <Button className="px-12">Try it now</Button>
      </section>

      {/* Features Section */}
      <section className="p-8 mb-12 lg:px-12">
        <div className="text-center mb-6">
          <h3 className="text-2xl font-bold  mb-2">
            {"Evaluate, Improve, Evolve."}
          </h3>
          <p>
            {
              "Take the guesswork out of usability, discover what works and what doesn’t on your website."
            }
          </p>
        </div>
        <div className="grid grid-cols-3 gap-6 px-12 ">
          {[
            [
              "Effortless Usability Evaluation",
              "No need for lengthy audits - get clear and to the point feedback to understand how your website can better serve your users.",
            ],
            [
              "Extensive Report for Every Page",
              "Each page gets a detailed usability score, pin-pointing the exact location of error.",
            ],
            [
              "Design Recommendations",
              "Suggestions are crucial for improvements. Iterate your designs accurately.",
            ],
            [
              "Proven Methodological Effectiveness",
              "Nielsen Norman’s 10 Usability Heuristics have been supported by extensive practical use, showcasing its effectiveness in identifying usability issues. ",
            ],
            [
              "Benchmarking",
              "Compare how well your design stands within your domain.",
            ],
            [
              "Track Evolution",
              "Design is a continous process. Keep track on how your design iterations evolve throughout time.",
            ],
          ].map(([title, desc], i) => (
            <div key={i} className="bg-gray-50 p-6 shadow rounded-md">
              <h4 className="font-semibold mb-2">{title}</h4>
              <p className="text-gray-600">{desc}</p>
            </div>
          ))}
        </div>
      </section>
      <section className="p-8 bg-gray-50 mb-12">
        <div className="grid grid-cols-12 p-6 lg:px-16">
          <div className="col-span-6">
            <h3 className="text-4xl font-bold mb-4">
              {"Ready to improve"}
              <br />
              {"your website?"}
            </h3>
            <p className="text-lg mb-4">
              {"Get the necessary insights to create a seamless"}
              <br />
              {" experience for your visitors."}
            </p>
            <p className="text-lg">
              {"It’s time to make your website work for your users!"}
            </p>
          </div>
          <div className="col-span-6">
            <Label className="text-left text-sm mt-2 font-semibold">
              Your website URL
            </Label>
            <Input placeholder="Paste your page's URL" className="max-w-md" />
            <Label className="text-left text-sm mt-2 font-semibold">
              Type of your page
            </Label>
            <Select>
              <SelectTrigger className="max-w-md">
                <SelectValue placeholder="Select the page type" />
              </SelectTrigger>
              <SelectContent>
                <SelectGroup>
                  <SelectItem value="landing">Landing Page</SelectItem>
                  <SelectItem value="dashboard">Dashboard</SelectItem>
                  <SelectItem value="pricing">Pricing</SelectItem>
                  <SelectItem value="checkout">Checkout</SelectItem>
                </SelectGroup>
              </SelectContent>
            </Select>

            <Label className="text-left text-sm mt-2 font-semibold">
              Sector
            </Label>
            <Select>
              <SelectTrigger className="max-w-md">
                <SelectValue placeholder="Select a sector" />
              </SelectTrigger>
              <SelectContent>
                <SelectGroup>
                  <SelectItem value="ecommerce">Ecommerce</SelectItem>
                  <SelectItem value="fintech">Fintech</SelectItem>
                  <SelectItem value="education">Education</SelectItem>
                  <SelectItem value="sports">Sports</SelectItem>
                </SelectGroup>
              </SelectContent>
            </Select>

            <div className="max-w-md">
              <Button className="mt-3 w-full">Get a free sample</Button>
            </div>
          </div>
        </div>
      </section>

      {/* Pricing */}
      <section className="p-8 text-center mb-8 lg:px-16">
        <h3 className="text-2xl font-bold mb-4">
          {"You can have more than a basic sample"}
        </h3>
        <div className="grid grid-cols-3 gap-6">
          {[
            {
              title: "Promo Package",
              price: "19 €",
              desc: ["UX heuristic report", "Limited action report"],
            },
            {
              title: "Basic Package",
              price: "69 €",
              desc: ["Full Action/Suggest Report", "1-1 Mentorship Session"],
            },
            {
              title: "Advanced Package",
              price: "599 €",
              desc: ["Strategy Workshop", "2 Mentorship Sessions"],
            },
          ].map((plan, i) => (
            <div key={i} className="p-6 bg-gray-50 shadow rounded-lg">
              <h4 className="font-semibold text-lg mb-2">{plan.title}</h4>
              <p className="text-3xl font-bold mb-4">{plan.price}</p>
              <ul className="text-left text-gray-600 mb-6">
                {plan.desc.map((item, idx) => (
                  <li key={idx} className="flex items-center">
                    <ArrowRight size={16} className="mr-2" /> {item}
                  </li>
                ))}
              </ul>
              <Button className="w-full">Get Started</Button>
            </div>
          ))}
        </div>
      </section>

      {/* FAQ */}
      <section className="p-8">
        <div className="lg:px-20">
          <h3 className="text-2xl font-bold text-center mb-4">
            {"Frequently Asked Questions"}
          </h3>
          <div className="space-y-4 ">
            {[
              "How long does it take?",
              "Can I...",
              "Lorem ipsum question?",
            ].map((question, i) => (
              <details
                key={i}
                className="p-4 rounded-md border border-gray-300"
              >
                <summary className="cursor-pointer font-medium flex justify-between">
                  {question} <ChevronDown size={16} />
                </summary>
                <p className="text-gray-600 mt-2">
                  Lorem ipsum dolor sit amet, consectetur adipiscing elit.
                </p>
              </details>
            ))}
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-4 bg-gray-200 text-center text-sm text-gray-600">
        &copy; {new Date().getFullYear()} UXMust. All rights reserved.
      </footer>
    </main>
  );
}
