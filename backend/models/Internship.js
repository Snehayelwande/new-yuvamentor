import mongoose from "mongoose";

const internshipSchema = new mongoose.Schema({
  title: String,
  description: String,
  skillsRequired: [String],
  organization: String,
  postedBy: { type: mongoose.Schema.Types.ObjectId, ref: "User" }
});

export default mongoose.model("Internship", internshipSchema);
