import { DataObjectType } from "./common.types";

export type ProjectType = DataObjectType & {
  createdBy: string;
  name: string;
  description: string;
};
