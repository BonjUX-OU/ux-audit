// components/dashboard/ReportForm.tsx
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectGroup,
  SelectItem,
} from "@/components/ui/select";
import { Globe } from "lucide-react";
import type { Project } from "@/types/dashboard";

export default function ReportForm({
  url,
  setUrl,
  sectors,
  onSectorSelect,
  selectedSector,
  pageTypes,
  onPageTypeSelect,
  selectedPageType,
  onSubmit,
  generating,
}: {
  url: string;
  setUrl: (v: string) => void;
  sectors: string[];
  onSectorSelect: (v: string) => void;
  selectedSector: string;
  pageTypes: string[];
  onPageTypeSelect: (v: string) => void;
  selectedPageType: string;
  onSubmit: (e: React.FormEvent) => void;
  generating: boolean;
}) {
  return (
    <Card className="mb-6 shadow-lg bg-white hover:shadow-xl">
      <CardHeader>
        <CardTitle className="text-2xl">Generate a New Report</CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={onSubmit} className="grid md:grid-cols-12 gap-4">
          <div className="md:col-span-5">
            <label className="block text-sm mb-1">Page URL</label>
            <div className="relative">
              <Input
                type="url"
                placeholder="https://example.com"
                value={url}
                onChange={(e) => setUrl(e.target.value)}
                required
                className="pl-9"
              />
              <Globe className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            </div>
          </div>
          <div className="md:col-span-3">
            <label className="block text-sm mb-1">Sector</label>
            <Select value={selectedSector} onValueChange={onSectorSelect}>
              <SelectTrigger>
                <SelectValue placeholder="Select Sector" />
              </SelectTrigger>
              <SelectContent>
                <SelectGroup>
                  {sectors.map((s) => (
                    <SelectItem key={s} value={s}>
                      {s}
                    </SelectItem>
                  ))}
                  <SelectItem
                    value="add-new-sector"
                    className="italic text-gray-500"
                  >
                    + Add new sector...
                  </SelectItem>
                </SelectGroup>
              </SelectContent>
            </Select>
          </div>
          <div className="md:col-span-2">
            <label className="block text-sm mb-1">Page Type</label>
            <Select value={selectedPageType} onValueChange={onPageTypeSelect}>
              <SelectTrigger>
                <SelectValue placeholder="Page Type" />
              </SelectTrigger>
              <SelectContent>
                <SelectGroup>
                  {pageTypes.map((p) => (
                    <SelectItem key={p} value={p}>
                      {p}
                    </SelectItem>
                  ))}
                  <SelectItem
                    value="add-new-pagetype"
                    className="italic text-gray-500"
                  >
                    + Add new page type...
                  </SelectItem>
                </SelectGroup>
              </SelectContent>
            </Select>
          </div>
          <div className="md:col-span-2">
            <Button
              type="submit"
              disabled={generating}
              className="w-full bg-[#B04E34] text-white"
            >
              {generating ? "Generating..." : "Generate"}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}
