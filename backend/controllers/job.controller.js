import { Job } from "../models/job.model.js";
import redis from "../utils/redis.js";
import { upsertJobVector, deleteJobVector } from "../services/ai.service.js";

const normalizeRequirements = (requirements) => {
    if (Array.isArray(requirements)) {
        return requirements.map((item) => String(item || "").trim()).filter(Boolean);
    }

    if (typeof requirements === "string") {
        return requirements
            .split(/,|\n/)
            .map((item) => item.trim())
            .filter(Boolean);
    }

    return [];
};


// ===============================
// ADMIN - POST JOB
// ===============================
export const postJob = async (req, res) => {
    try {

        const {
            title,
            description,
            requirements,
            salary,
            location,
            jobType,
            experienceLevel,
            position,
            companyId
        } = req.body;

        const userId = req.id;

        if (
            !title ||
            !description ||
            !requirements ||
            !salary ||
            !location ||
            !jobType ||
            experienceLevel === undefined ||
            !position ||
            !companyId
        ) {
            return res.status(400).json({
                message: "Something is missing.",
                success: false
            });
        }

        await redis.flushall(); // FLUSH CACHE

        const parsedRequirements = normalizeRequirements(requirements);

        const job = await Job.create({
            title,
            description,
            requirements: parsedRequirements,
            salary: Number(salary), // MUST be number (LPA)
            location,
            jobType,
            experienceLevel: Number(experienceLevel),
            position: Number(position),
            company: companyId,
            created_by: userId
        });

        try {
            await job.populate("company");
            await upsertJobVector(job);
        } catch (vectorError) {
            console.log("JOB VECTOR UPSERT ERROR:", vectorError?.message || vectorError);
        }

        return res.status(201).json({
            message: "New job created successfully.",
            success: true,
            job
        });

    } catch (error) {
        console.log("POST JOB ERROR:", error);
        return res.status(500).json({
            message: "Server error",
            success: false
        });
    }
};


// ===============================
// STUDENT - GET ALL JOBS (FILTER ENABLED)
// ===============================
export const getAllJobs = async (req, res) => {
    try {
        const {
            keyword = "",
            location = "",
            industry = "",
            minSalary = "",
            maxSalary = ""
        } = req.query;

        const cacheKey = `jobs:${keyword}:${location}:${industry}:${minSalary}:${maxSalary}`;

        // 🔍 CACHE CHECK
        const cached = await redis.get(cacheKey);
        if (cached) {
            console.log("⚡ CACHE HIT");
            return res.status(200).json(JSON.parse(cached));
        }

        console.log("🐢 CACHE MISS");

        let query = {};

        if (keyword) {
            query.$or = [
                { title: { $regex: keyword, $options: "i" } },
                { description: { $regex: keyword, $options: "i" } }
            ];
        }

        if (location) {
            query.location = { $regex: location, $options: "i" };
        }

        if (industry) {
            query.title = { $regex: industry, $options: "i" };
        }

        if (minSalary && maxSalary) {
            query.salary = {
                $gte: Number(minSalary),
                $lte: Number(maxSalary)
            };
        }

        const jobs = await Job.find(query)
            .populate("company")
            .sort({ createdAt: -1 });

        const response = { jobs, success: true };

        // ⏳ TTL = 60 sec
        await redis.set(cacheKey, JSON.stringify(response), "EX", 60);

        return res.status(200).json(response);

    } catch (error) {
        console.log(error);
        return res.status(500).json({ success: false });
    }
};

// ===============================
// GET JOB BY ID
// ===============================
export const getJobById = async (req, res) => {
    try {
        const jobId = req.params.id;

        const cacheKey = `job:${jobId}`;

        const cached = await redis.get(cacheKey);
        if (cached) {
            console.log("⚡ JOB CACHE HIT");
            return res.status(200).json(JSON.parse(cached));
        }

        console.log("🐢 JOB CACHE MISS");

        const job = await Job.findById(jobId)
            .populate("applications");

        if (!job) {
            return res.status(404).json({
                message: "Job not found",
                success: false
            });
        }

        const response = { job, success: true };

        await redis.set(cacheKey, JSON.stringify(response), "EX", 60);

        return res.status(200).json(response);

    } catch (error) {
        console.log(error);
        return res.status(500).json({ success: false });
    }
};


// ===============================
// ADMIN - GET ADMIN JOBS
// ===============================
export const getAdminJobs = async (req, res) => {
    try {

        const adminId = req.id;

        const jobs = await Job.find({ created_by: adminId })
            .populate({ path: "company" })
            .sort({ createdAt: -1 });

        return res.status(200).json({
            jobs,
            success: true
        });

    } catch (error) {
        console.log(error);
        return res.status(500).json({ success: false });
    }
};


// ===============================
// ADMIN - UPDATE JOB
// ===============================
export const updateJob = async (req, res) => {
    try {
        const jobId = req.params.id;

        const {
            title,
            description,
            requirements,
            salary,
            location,
            jobType,
            experienceLevel,
            position
        } = req.body;

        const parsedRequirements = normalizeRequirements(requirements);

        const updatedJob = await Job.findByIdAndUpdate(
            jobId,
            {
                title,
                description,
            requirements: parsedRequirements,
                salary: Number(salary),
                location,
                jobType,
                experienceLevel: Number(experienceLevel),
                position: Number(position)
            },
            { new: true }
        );

        if (!updatedJob) {
            return res.status(404).json({
                message: "Job not found",
                success: false
            });
        }

        try {
            await updatedJob.populate("company");
            await upsertJobVector(updatedJob);
        } catch (vectorError) {
            console.log("JOB VECTOR RE-UPSERT ERROR:", vectorError?.message || vectorError);
        }

        // Invalidate cache
        await redis.del(`job:${jobId}`);
        await redis.flushall();

        return res.status(200).json({
            message: "Job updated successfully",
            success: true,
            job: updatedJob
        });

    } catch (error) {
        console.log("UPDATE JOB ERROR:", error);
        return res.status(500).json({
            message: "Server error",
            success: false
        });
    }
};


// ===============================
// ADMIN - DELETE JOB
// ===============================
export const deleteJob = async (req, res) => {
    try {

        const jobId = req.params.id;

        // Invalidate cache
        await redis.del(`job:${jobId}`);
        await redis.flushall();

        const job = await Job.findByIdAndDelete(jobId);

        if (!job) {
            return res.status(404).json({
                message: "Job not found",
                success: false
            });
        }

        try {
            await deleteJobVector(jobId);
        } catch (vectorError) {
            console.log("JOB VECTOR DELETE ERROR:", vectorError?.message || vectorError);
        }

        return res.status(200).json({
            message: "Job deleted successfully",
            success: true
        });

    } catch (error) {
        console.log("DELETE JOB ERROR:", error);
        return res.status(500).json({
            message: "Server error",
            success: false
        });
    }
};