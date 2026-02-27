import express from "express";
import { saveJob, unsaveJob, getSavedJobs } from "../controllers/savedJob.controller.js";
import isAuthenticated from "../middlewares/isAuthenticated.js";

const router = express.Router();

router.get("/saved", isAuthenticated, getSavedJobs);
router.post("/save/:jobId", isAuthenticated, saveJob);
router.delete("/unsave/:jobId", isAuthenticated, unsaveJob);

export default router;