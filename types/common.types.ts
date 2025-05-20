export type DataObjectType = {
  _id?: string;
};

export type OptionType = {
  value: string;
  label: string;
};

export type CodeNamePair = {
  code: string;
  name: string;
};

export type ConstantsBundleResponseType = {
  customerIssues: OptionType[];
  pageTypeOptions: OptionType[];
  sectors: OptionType[];
};
