import express from "express";
import { login, logout, register, updateProfile } from "../controllers/user.controller.js";
import { extractProfileSkills, getAiRecommendations } from "../controllers/ai.controller.js";
import isAuthenticated from "../middlewares/isAuthenticated.js";
import { singleUpload } from "../middlewares/mutler.js";
 
const router = express.Router();

router.route("/register").post(singleUpload,register);
router.route("/login").post(login);
router.route("/logout").get(logout);
router.route("/profile/update").post(isAuthenticated,singleUpload,updateProfile);
router.route("/profile/skills/extract").post(isAuthenticated, extractProfileSkills);
router.route("/jobs/recommendations").get(isAuthenticated, getAiRecommendations);

export default router;

