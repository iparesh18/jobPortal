import express from "express";
import isAuthenticated from "../middlewares/isAuthenticated.js";
import {
  getAdminJobs,
  getAllJobs,
  getJobById,
  postJob,
  updateJob,
  deleteJob
} from "../controllers/job.controller.js";

const router = express.Router();

// CREATE
router.post("/post", isAuthenticated, postJob);

// GET ALL
router.get("/get", getAllJobs);

// GET ADMIN
router.get("/getadminjobs", isAuthenticated, getAdminJobs);

// GET SINGLE
router.get("/get/:id", getJobById);

// UPDATE (IMPORTANT CHANGE)
router.put("/update/:id", isAuthenticated, updateJob);

// DELETE (IMPORTANT CHANGE)
router.delete("/delete/:id", isAuthenticated, deleteJob);

export default router;