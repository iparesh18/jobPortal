import { User } from "../models/user.model.js";
import {
    extractSkillsFromProfileText,
    getJobRecommendationsFromSkills,
    getLatestJobs,
} from "../services/ai.service.js";

export const extractProfileSkills = async (req, res) => {
    try {
        const userId = req.id;
        const { extraText = "" } = req.body || {};

        const user = await User.findById(userId);
        if (!user) {
            return res.status(404).json({
                message: "User not found.",
                success: false,
            });
        }  

        const currentSkills = Array.isArray(user.profile?.skills) ? user.profile.skills.join(", ") : "";
        const profileText = [
            `name: ${user.fullname || ""}`,
            `bio: ${user.profile?.bio || ""}`,
            `skills: ${currentSkills}`,
            `extra: ${extraText}`,
        ].join("\n");

        const suggestedSkills = await extractSkillsFromProfileText(profileText);

        return res.status(200).json({
            message: "Skill suggestions generated successfully.",
            success: true,
            suggestedSkills,
            skills: suggestedSkills,
            currentSkills: Array.isArray(user.profile?.skills) ? user.profile.skills : [],
            user: {
                _id: user._id,
                fullname: user.fullname,
                email: user.email,
                phoneNumber: user.phoneNumber,
                role: user.role,
                profile: user.profile,
            },
        });
    } catch (error) {
        console.log("EXTRACT PROFILE SKILLS ERROR:", error?.message || error);
        return res.status(500).json({
            message: "Failed to extract skills",
            success: false,
        });
    }
};

export const getAiRecommendations = async (req, res) => {
    try {
        const userId = req.id;
        const user = await User.findById(userId);

        if (!user) {
            return res.status(404).json({
                message: "User not found.",
                success: false,
            });
        }

        const skills = Array.isArray(user.profile?.skills) ? user.profile.skills : [];
        const recommendedJobs = await getJobRecommendationsFromSkills(skills, 15);
        const latestJobs = await getLatestJobs(10);

        return res.status(200).json({
            success: true,
            skills,
            recommendedJobs,
            latestJobs,
        });
    } catch (error) {
        console.log("GET AI RECOMMENDATIONS ERROR:", error?.message || error);
        return res.status(500).json({
            message: "Failed to fetch AI recommendations",
            success: false,
        });
    }
};