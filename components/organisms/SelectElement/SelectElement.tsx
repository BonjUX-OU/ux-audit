import { Select, SelectContent, SelectGroup, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { SelectItemType } from "./SelectElement.types";
import { useState } from "react";

type SelectElementProps = {
  label: string;
  options: SelectItemType[];
  placeholder?: string;
  onValueChange?: (newValue: SelectItemType) => void;
};

const SelectElement = ({ label, options, placeholder = "Please select...", onValueChange }: SelectElementProps) => {
  const [selectedItem, setSelectedItem] = useState<SelectItemType>();

  const handleValueChange = (newValue: string) => {
    const itemIndex = options.findIndex((option) => option.value === newValue);
    if (itemIndex > -1) {
      setSelectedItem(options[itemIndex]);
      onValueChange?.(options[itemIndex]);
    }
  };

  return (
    <>
      {label && <label className="block text-sm font-medium mb-1.5">{label}</label>}
      <Select value={selectedItem?.value} onValueChange={handleValueChange}>
        <SelectTrigger className="shadow-sm focus:ring-2 focus:ring-[#B04E34] focus:ring-opacity-50 transition-all duration-200">
          <SelectValue placeholder={placeholder} />
        </SelectTrigger>
        <SelectContent>
          <SelectGroup>
            {options.map((option) => (
              <SelectItem key={option.value} value={option.value}>
                {option.label}
              </SelectItem>
            ))}
          </SelectGroup>
        </SelectContent>
      </Select>
    </>
  );
};

export default SelectElement;
