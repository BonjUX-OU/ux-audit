import { useEffect, useRef, useState } from "react";

import { Check, ChevronDown, Square } from "lucide-react";

import { OptionType } from "@/types/common.types";

import { Button } from "./Button";
import { Dropdown } from "./Dropdown";

type MultiSelectProps = {
  label?: string;
  options: OptionType[];
  placeholder?: string;
  selected: string[];
  onChange: (selected: string[]) => void;
};

export const MultiSelect = ({
  label,
  options,
  placeholder = "Select...",
  selected,
  onChange,
}: MultiSelectProps) => {
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
      {label && <label className="mb-1.5 block text-sm font-medium">{label}</label>}
      <Dropdown>
        <Dropdown.Trigger className="focus-within:outline-hidden" ref={triggerRef} asChild>
          <Button
            variant="outline"
            className="border-input bg-background h-10 w-full justify-between border px-3 py-2">
            <span className="text-sm font-normal">
              {selected.length ? `${selected.length} selected` : placeholder}
            </span>
            <ChevronDown className="h-4 w-4 opacity-50" />
          </Button>
        </Dropdown.Trigger>
        <Dropdown.Content className="mt-0" style={{ width: triggerWidth ?? "auto" }}>
          {options.map((option) => {
            const isSelected = selected.includes(option.value);
            return (
              <Dropdown.Item
                key={option.value}
                className="flex cursor-pointer items-center gap-2 rounded px-2 py-1.5 text-sm focus-within:outline-hidden hover:bg-gray-100"
                onClick={(e) => {
                  e.preventDefault();
                  toggleOption(option.value);
                }}>
                {isSelected ? <Check /> : <Square color="#E9EBED" />}
                {option.label}
              </Dropdown.Item>
            );
          })}
        </Dropdown.Content>
      </Dropdown>
    </>
  );
};
