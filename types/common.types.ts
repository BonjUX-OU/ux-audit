import { ObjectId } from "mongoose";

export type DataObjectType = {
  _id: ObjectId;
};

export type OptionType = {
  value: string;
  label: string;
};
