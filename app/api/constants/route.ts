import { OptionType } from "@/types/common.types";
import { NextResponse } from "next/server";

export const sectorOptions: OptionType[] = [
  { value: "healt", label: "Healthcare" },
  { value: "finance", label: "Finance" },
  { value: "education", label: "Education" },
  { value: "eCommerce", label: "E-commerce" },
  { value: "technology", label: "Technology / Software" },
  { value: "realEstate", label: "Real Estate" },
  { value: "entertaintment", label: "Entertainment & Media" },
  { value: "tourism", label: "Tourism & Travel" },
  { value: "socialNetwork", label: "Social Networking" },
  { value: "manufacturing", label: "Manufacturing" },
  { value: "consulting", label: "Consulting & Professional Services" },
  { value: "nonprofit", label: "Nonprofit/NGO" },
  { value: "retail", label: "Retail" },
  { value: "telecom", label: "Telecommunications" },
  { value: "automotive", label: "Automotive" },
] as const;

export const pageTypeOptions: OptionType[] = [
  { value: "home", label: "Homepage" },
  { value: "service", label: "Product/Service Page" },
  { value: "about", label: "About Page" },
  { value: "blog", label: "Blog Page" },
  { value: "contact", label: "Contact Page" },
  { value: "faq", label: "FAQ Page" },
  { value: "product", label: "E-commerce Product Page" },
  { value: "pricing", label: "Pricing Page" },
] as const;

export const customerIssues: OptionType[] = [
  { value: "keyFeatures", label: "Users are struggling to complete key tasks" },
  { value: "lowConversion", label: "Low conversion rates or sales" },
  { value: "dropOffOrBounce", label: "High drop-off or bounce rates on the page" },
  { value: "navigation", label: "Confusing or inconsistent navigation/UI" },
  { value: "redesign", label: "Preparing for a redesign or product refresh" },
  { value: "userFeedback", label: "Improving user satisfaction&feedback" },
  { value: "accessibility", label: "Accessibility/WCAG compliance concerns" },
  { value: "onboarding", label: "Onboarding or user flow issues" },
  { value: "preLanchValidation", label: "Need expert validation before launching" },
  { value: "other", label: "Other" },
];

export function GET() {
  try {
    const responseObject = {
      sectorOptions,
      pageTypeOptions,
      customerIssues,
    };
    return NextResponse.json(responseObject, { status: 200 });
  } catch (error: any) {
    console.error("Error fetching issues list:", error.message);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
