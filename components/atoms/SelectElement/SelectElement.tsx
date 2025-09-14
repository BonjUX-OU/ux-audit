import { OptionType } from "@/types/common.types";

import { Select } from "../Select";

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
      {label && <label className="mb-1.5 block text-sm font-medium">{label}</label>}
      <Select value={selected} onValueChange={onValueChange}>
        <Select.Trigger>
          <Select.Value placeholder={placeholder} />
        </Select.Trigger>
        <Select.Content>
          <Select.Group>
            {options.map((option) => (
              <Select.Item key={option.value} value={option.value}>
                {option.label}
              </Select.Item>
            ))}
          </Select.Group>
        </Select.Content>
      </Select>
    </>
  );
};

export default SelectElement;
