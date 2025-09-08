const notFoundItem = { value: "not_found", label: "Not found" } as const;
import { OptionType } from "@/types/common.types";

const getOption = (array: OptionType[], targetValue: string): OptionType => {
  if (!targetValue) return notFoundItem;

  const result = array.find((item) => item.value === targetValue);

  return result ?? notFoundItem;
};

const getOptions = (array: OptionType[], selectedValues: string[]): OptionType[] => {
  if (!selectedValues.length) return [notFoundItem];
  const result: OptionType[] = [];

  selectedValues.forEach((value) => {
    const target = getOption(array, value);
    if (target) result.push(target);
  });

  return result;
};

export { getOption, getOptions };
