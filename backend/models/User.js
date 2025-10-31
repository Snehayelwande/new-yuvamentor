import mongoose from "mongoose";

const userSchema = new mongoose.Schema({
  name: String,
  email: { type: String, unique: true },
  password: String,
  role: { type: String, enum: ["student", "mentor", "organization", "admin"], default: "student" },
  interests: [String],
  skills: [String],
});

export default mongoose.model("User", userSchema);
