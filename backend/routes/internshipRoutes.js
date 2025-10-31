import express from "express";
import { getInternships, createInternship } from "../controllers/internshipController.js"; // You will create this controller file

const router = express.Router();

// Define API routes for internships

// GET all internships
router.get("/", getInternships);

// POST a new internship
router.post("/", createInternship);

export default router;