import User from "../models/User.js";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";

export const registerUser = async (req, res) => {
  const { name, email, password, role } = req.body;
  try {
    const existing = await User.findOne({ email });
    if (existing) return res.status(400).json({ message: "User already exists" });
    //const hashed = await bcrypt.hash(password, 10);
    const user = await User.create({ name, email, password, role });
    // Filter password out before sending response
    const userResponse = { _id: user._id, name: user.name, email: user.email, role: user.role };
    res.json({ message: "Registered successfully", user: userResponse });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

export const loginUser = async (req, res) => {
  const { email, password } = req.body;
  try {
    const user = await User.findOne({ email });
    if (!user) return res.status(404).json({ message: "User not found" });
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) return res.status(400).json({ message: "Invalid credentials" });
    const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, { expiresIn: "1d" });
    
    // CRITICAL FIX: Filter password out before sending response
    const userResponse = { _id: user._id, name: user.name, email: user.email, role: user.role };
    res.json({ message: "Login successful", token, user: userResponse });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

export const getAllUsers = async (req, res) => {
  const users = await User.find();
  // Filter password out of every user object before sending
  const safeUsers = users.map(u => ({
    _id: u._id,
    name: u.name,
    email: u.email,
    role: u.role,
    // Include other non-sensitive fields
  }));
  res.json(safeUsers);
};