import React, { FormEvent, useState } from "react";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useSession } from "next-auth/react";
import { Input } from "@/components/ui/input";
import { Globe } from "lucide-react";
import { Select, SelectContent, SelectGroup, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { PageTypes, Sectors } from "./WelcomeCard.constants";
import { Button } from "@/components/ui/button";

type WelcomeCardProps = {
  selectedSector: string;
  selectedPageType: string;
  isAnalysisModalOpen: boolean;
  onCreateAnalysis: (e: FormEvent) => void;
  onSectorSelect: (value: string) => void;
  onPageTypeSelect: (value: string) => void;
  onUrlChanged: (newVal: string) => void;
};

const WelcomeCard = ({
  selectedSector,
  selectedPageType,
  isAnalysisModalOpen,
  onCreateAnalysis,
  onSectorSelect,
  onPageTypeSelect,
  onUrlChanged,
}: WelcomeCardProps) => {
  const { data: session }: any = useSession();
  const [url, setUrl] = useState<string>();

  const handleUrlChanged = (newUrl: string) => {
    setUrl(newUrl);
    onUrlChanged(newUrl);
  };

  return (
    <Card className="mb-6 border-none shadow-lg bg-white transition-all duration-300 hover:shadow-xl">
      <CardHeader className="pb-0">
        <CardTitle className="text-2xl font-normal flex items-center">
          Welcome, {session?.user?.name?.split(" ")[0]}! 👋
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="mt-4">
          <h3 className="text-lg font-medium mb-4">Generate a New Report</h3>
          <form onSubmit={onCreateAnalysis} className="grid grid-cols-1 md:grid-cols-12 gap-4 items-end">
            <div className="md:col-span-5">
              <label className="block text-sm font-medium mb-1.5 ">Page URL</label>
              <div className="relative">
                <Input
                  type="text"
                  placeholder="https://example.com"
                  value={url}
                  onChange={(e) => handleUrlChanged(e.target.value)}
                  required
                  className="pl-9 shadow-sm focus:ring-2 focus:ring-[#B04E34] focus:ring-opacity-50 transition-all duration-200"
                />
                <Globe className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              </div>
            </div>

            {/* Sector */}
            <div className="md:col-span-3">
              <label className="block text-sm font-medium mb-1.5">Sector</label>
              <Select value={selectedSector} onValueChange={onSectorSelect}>
                <SelectTrigger className="shadow-sm focus:ring-2 focus:ring-[#B04E34] focus:ring-opacity-50 transition-all duration-200">
                  <SelectValue placeholder="Select Sector" />
                </SelectTrigger>
                <SelectContent>
                  <SelectGroup>
                    {Sectors.map((sec) => (
                      <SelectItem key={sec} value={sec}>
                        {sec}
                      </SelectItem>
                    ))}
                  </SelectGroup>
                </SelectContent>
              </Select>
            </div>

            {/* Page Type */}
            <div className="md:col-span-2">
              <label className="block text-sm font-medium mb-1.5">Page Type</label>
              <Select value={selectedPageType} onValueChange={onPageTypeSelect}>
                <SelectTrigger className="shadow-sm focus:ring-2 focus:ring-[#B04E34] focus:ring-opacity-50 transition-all duration-200">
                  <SelectValue placeholder="Page Type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectGroup>
                    {PageTypes.map((pt) => (
                      <SelectItem key={pt} value={pt}>
                        {pt}
                      </SelectItem>
                    ))}
                  </SelectGroup>
                </SelectContent>
              </Select>
            </div>

            {/* Generate Button */}
            <div className="md:col-span-2">
              {isAnalysisModalOpen ? (
                <Button
                  type="submit"
                  disabled
                  className="w-full bg-[#B04E34] text-white shadow-md hover:shadow-lg transition-all duration-200">
                  Generating...
                </Button>
              ) : (
                <Button
                  type="submit"
                  className="w-full bg-[#B04E34] hover:bg-[#963F28] text-white shadow-md hover:shadow-lg transition-all duration-200">
                  Generate
                </Button>
              )}
            </div>
          </form>
        </div>
      </CardContent>
    </Card>
  );
};

export default WelcomeCard;
