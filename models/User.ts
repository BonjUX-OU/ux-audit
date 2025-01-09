import mongoose from "mongoose";

const UserSchema = new mongoose.Schema({
  email: {
    type: String,
    required: true,
    unique: true,
  },
  name: {
    type: String,
    required: false, // Password is not required for Google users
  },
  industry: {
    type: String,
    default: "",
  },
  profession: {
    type: String,
    default: "",
  },
  experienceLevel: {
    type: String,
    default: "",
  },
  isProfileCompleted: {
    type: Boolean,
    default: false,
  },
  password: {
    type: String,
    required: false,
  },
});

export default mongoose.models.User || mongoose.model("User", UserSchema);
