import { User } from "../models/user.model.js";

// ================= SAVE JOB =================
export const saveJob = async (req, res) => {
    try {
        const userId = req.id; // from auth middleware
        const { jobId } = req.params;

        const user = await User.findById(userId);

        if (!user) {
            return res.status(404).json({
                success: false,
                message: "User not found"
            });
        }

        // Prevent duplicate save
        if (user.savedJobs.includes(jobId)) {
            return res.status(400).json({
                success: false,
                message: "Job already saved"
            });
        }

        user.savedJobs.push(jobId);
        await user.save();

        res.status(200).json({
            success: true,
            message: "Job saved successfully"
        });

    } catch (error) {
        console.log(error);
        res.status(500).json({
            success: false,
            message: "Server error"
        });
    }
};

// ================= UNSAVE JOB =================
export const unsaveJob = async (req, res) => {
    try {
        const userId = req.id;
        const { jobId } = req.params;

        const user = await User.findById(userId);

        if (!user) {
            return res.status(404).json({
                success: false,
                message: "User not found"
            });
        }

        user.savedJobs = user.savedJobs.filter(
            (id) => id.toString() !== jobId
        );

        await user.save();

        res.status(200).json({
            success: true,
            message: "Job removed from saved list"
        });

    } catch (error) {
        console.log(error);
        res.status(500).json({
            success: false,
            message: "Server error"
        });
    }
};

// ================= GET SAVED JOBS =================
// ================= GET SAVED JOBS =================
export const getSavedJobs = async (req, res) => {
    try {
        const userId = req.id;

        const user = await User.findById(userId)
            .populate({
                path: "savedJobs",
                populate: {
                    path: "company"   // 🔥 THIS IS THE FIX
                }
            });

        res.status(200).json({
            success: true,
            savedJobs: user.savedJobs
        });

    } catch (error) {
        console.log(error);
        res.status(500).json({
            success: false,
            message: "Server error"
        });
    }
};