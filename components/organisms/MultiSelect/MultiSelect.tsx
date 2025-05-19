import { Check, ChevronDown, Square } from "lucide-react";
import { OptionType } from "@/types/common.types";
import { DropdownMenu, DropdownMenuContent, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { DropdownMenuItem } from "@radix-ui/react-dropdown-menu";
import { useEffect, useRef, useState } from "react";

type MultiSelectProps = {
  label?: string;
  options: OptionType[];
  placeholder?: string;
  selected: string[];
  onChange: (selected: string[]) => void;
};

export const MultiSelect = ({ label, options, placeholder = "Select...", selected, onChange }: MultiSelectProps) => {
  const [triggerWidth, setTriggerWidth] = useState<number | null>(null);
  const triggerRef = useRef<HTMLButtonElement>(null);

  const toggleOption = (value: string) => {
    if (selected.includes(value)) {
      onChange(selected.filter((v) => v !== value));
    } else {
      onChange([...selected, value]);
    }
  };

  useEffect(() => {
    if (triggerRef.current) {
      setTriggerWidth(triggerRef.current.offsetWidth);
    }
  }, []);

  return (
    <>
      {label && <label className="block text-sm font-medium mb-1.5">{label}</label>}
      <DropdownMenu>
        <DropdownMenuTrigger className="focus-within:outline-none" ref={triggerRef} asChild>
          <Button
            variant="outline"
            className="w-full h-10 justify-between shadow-sm border border-input bg-background px-3 py-2 focus:ring-2 focus:ring-[#B04E34] focus-visible:ring-0 focus:ring-opacity-50">
            <span className="text-sm font-normal">{selected.length ? `${selected.length} selected` : placeholder}</span>
            <ChevronDown className="h-4 w-4 opacity-50" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent className="mt-0" style={{ width: triggerWidth ?? "auto" }}>
          {options.map((option) => {
            const isSelected = selected.includes(option.value);
            return (
              <DropdownMenuItem
                key={option.value}
                className="flex items-center gap-2 px-2 py-1.5 text-sm cursor-pointer rounded hover:bg-gray-100 focus-within:outline-none"
                onClick={(e) => {
                  e.preventDefault();
                  toggleOption(option.value);
                }}>
                {isSelected ? <Check /> : <Square color="#E9EBED" />}
                {option.label}
              </DropdownMenuItem>
            );
          })}
        </DropdownMenuContent>
      </DropdownMenu>
    </>
  );
};
