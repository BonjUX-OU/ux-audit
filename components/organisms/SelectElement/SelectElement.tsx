import { Select, SelectContent, SelectGroup, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { OptionType } from "@/types/common.types";

type SelectElementProps = {
  label: string;
  options: OptionType[];
  selected: string;
  placeholder?: string;
  onValueChange: (optionValue: string) => void;
};

const SelectElement = ({
  label,
  selected,
  options,
  placeholder = "Please select",
  onValueChange,
}: SelectElementProps) => {
  return (
    <>
      {label && <label className="block text-sm font-medium mb-1.5">{label}</label>}
      <Select value={selected} onValueChange={onValueChange}>
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
