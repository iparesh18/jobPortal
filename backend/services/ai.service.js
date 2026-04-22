import { GoogleGenAI } from "@google/genai";
import { Job } from "../models/job.model.js";
import { generateVector } from "./gemini.service.js";
import { createMemory, queryMemory } from "./memory.service.js";
import { deleteVector } from "./pinecone.service.js";

const SKILL_MODEL = process.env.GEMINI_TEXT_MODEL || "gemini-2.0-flash";

let aiClient = null;

const getTextAiClient = () => {
    if (aiClient) return aiClient;

    const apiKey = process.env.GEMINI_;
    if (!apiKey) return null;

    aiClient = new GoogleGenAI({ apiKey });
    return aiClient;
};

const isQuotaError = (error) => {
    const raw = JSON.stringify(error || {}).toLowerCase();
    const msg = String(error?.message || "").toLowerCase();
    return raw.includes("resource_exhausted") || raw.includes("quota") || msg.includes("429") || msg.includes("quota");
};

const COMMON_SKILLS = [
    "javascript", "typescript", "react", "next.js", "node.js", "express", "mongodb", "mysql", "postgresql",
    "redis", "docker", "kubernetes", "aws", "azure", "gcp", "html", "css", "tailwind", "bootstrap",
    "python", "java", "c++", "c", "go", "php", "rest api", "graphql", "jwt", "git", "github",
    "redux", "vite", "mongoose", "sql", "nosql", "linux", "firebase", "socket.io", "jest", "mocha",
    "mern", "mern stack", "tailwindcss", "nodejs",
];

const SKILL_ALIASES = {
    "nodejs": ["nodejs", "node.js", "node"],
    "node.js": ["nodejs", "node.js", "node"],
    "tailwindcss": ["tailwindcss", "tailwind", "tailwind css"],
    "tailwind": ["tailwindcss", "tailwind", "tailwind css"],
    "panda": ["panda", "pandas"],
    "pandas": ["pandas", "panda"],
    "mern": ["mern", "mern stack", "mongodb", "express", "react", "nodejs", "node.js"],
    "mern stack": ["mern", "mern stack", "mongodb", "express", "react", "nodejs", "node.js"],
};

const canonicalSkill = (skill) => {
    const s = String(skill || "").trim().toLowerCase().replace(/\s+/g, " ");
    if (s === "nodejs" || s === "node") return "node.js";
    if (s === "tailwind css") return "tailwindcss";
    if (s === "panda") return "pandas";
    return s;
};

const getJobSearchText = (job) => {
    return [
        job.title || "",
        job.description || "",
        ...(Array.isArray(job.requirements) ? job.requirements : []),
    ]
        .join(" ")
        .toLowerCase();
};

const computeSkillMatchScore = (job, normalizedSkills = []) => {
    if (!normalizedSkills.length) return 0;
    const hay = getJobSearchText(job);

    const matched = normalizedSkills.filter((skill) => {
        const escapedSkill = skill.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
        return new RegExp(`(^|[^a-z0-9+.#-])${escapedSkill}([^a-z0-9+.#-]|$)`, "i").test(hay);
    }).length;

    return matched / normalizedSkills.length;
};

const expandSkills = (skills = []) => {
    const base = normalizeSkills(skills).map(canonicalSkill);
    const expanded = new Set(base);

    for (const skill of base) {
        const aliases = SKILL_ALIASES[skill] || [skill];
        aliases.forEach((alias) => expanded.add(canonicalSkill(alias)));
    }

    // Infer MERN if core stack exists in profile skills.
    const hasMernParts = ["mongodb", "react", "express"].every((s) => expanded.has(s))
        && (expanded.has("node.js") || expanded.has("nodejs") || expanded.has("node"));
    if (hasMernParts) {
        expanded.add("mern");
        expanded.add("mern stack");
    }

    return [...expanded];
};

const fallbackExtractSkills = (inputText) => {
    const text = String(inputText || "").toLowerCase();
    const found = [];

    for (const skill of COMMON_SKILLS) {
        const escaped = skill.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
        const pattern = new RegExp(`(^|[^a-z0-9+.#-])${escaped}([^a-z0-9+.#-]|$)`, "i");
        if (pattern.test(text)) found.push(skill);
    }

    return normalizeSkills(found).slice(0, 20);
};

const fallbackJobRecommendationsFromSkills = async (skills = [], topK = 15) => {
    const normalized = expandSkills(skills);
    if (!normalized.length) return [];

    const escaped = normalized.map((skill) => skill.replace(/[.*+?^${}()|[\]\\]/g, "\\$&"));
    const pattern = escaped.join("|");
    const regex = new RegExp(pattern, "i");

    const jobs = await Job.find({
        $or: [
            { title: { $regex: regex } },
            { description: { $regex: regex } },
            { requirements: { $elemMatch: { $regex: regex } } },
        ],
    })
        .populate("company")
        .sort({ createdAt: -1 })
        .limit(topK);

    return jobs.map((job) => {
        const score = computeSkillMatchScore(job, normalized);
        return {
            ...job.toObject(),
            matchScore: Number(score.toFixed(4)),
        };
    });
};

const extractGeneratedText = (result) => {
    if (typeof result?.text === "string" && result.text.trim()) {
        return result.text.trim();
    }

    if (typeof result?.response?.text === "function") {
        const text = result.response.text();
        if (typeof text === "string" && text.trim()) return text.trim();
    }

    const parts = result?.candidates?.[0]?.content?.parts || [];
    const joined = parts
        .map((part) => (typeof part?.text === "string" ? part.text : ""))
        .join("\n")
        .trim();

    return joined;
};

const normalizeSkills = (skills = []) => {
    const normalized = skills
        .map((skill) => String(skill || "").trim().toLowerCase())
        .filter(Boolean)
        .map((skill) => skill.replace(/\s+/g, " "));

    return [...new Set(normalized)];
};

const getJobEmbeddingText = (job) => {
    const reqs = Array.isArray(job.requirements) ? job.requirements.join(", ") : "";
    const companyName = job.company?.name || "";
    return [
        `title: ${job.title || ""}`,
        `description: ${job.description || ""}`,
        `requirements: ${reqs}`,
        `job type: ${job.jobType || ""}`,
        `location: ${job.location || ""}`,
        `company: ${companyName}`,
    ].join("\n");
};

export const getEmbedding = async (text) => {
    return generateVector(text);
};

export const extractSkillsFromProfileText = async (inputText) => {
    const ai = getTextAiClient();
    if (!ai) {
        return fallbackExtractSkills(inputText);
    }

    const skillModels = [
        SKILL_MODEL,
        "gemini-2.0-flash",
        "gemini-2.0-flash-lite",
    ];

    const prompt = `Extract technical/professional skills from this profile text and return ONLY a JSON array of strings.\nRules:\n- lower-case skills\n- short skill names\n- no explanation\n- max 20 skills\n\nText:\n${inputText}`;

    let text = "[]";
    let lastError;

    for (const modelName of skillModels) {
        try {
            const result = await ai.models.generateContent({
                model: modelName,
                contents: prompt,
            });
            text = extractGeneratedText(result) || "[]";
            if (text) break;
        } catch (error) {
            lastError = error;
            if (isQuotaError(error)) {
                return fallbackExtractSkills(inputText);
            }
        }
    }

    if (!text || text === "[]") {
        if (lastError && isQuotaError(lastError)) {
            return fallbackExtractSkills(inputText);
        }
        if (lastError) throw lastError;
        return fallbackExtractSkills(inputText);
    }

    let parsed = [];
    try {
        parsed = JSON.parse(text);
    } catch {
        const safe = text.replace(/```json|```/g, "").trim();
        parsed = JSON.parse(safe);
    }

    if (!Array.isArray(parsed)) {
        throw new Error("Invalid skills response from Gemini");
    }

    return normalizeSkills(parsed);
};

export const upsertJobVector = async (jobDoc) => {
    const job = jobDoc.toObject ? jobDoc.toObject() : jobDoc;
    if (!job?._id) return;

    const embeddingText = getJobEmbeddingText(job);
    await createMemory({
        id: String(job._id),
        content: embeddingText,
        metadata: {
            jobId: String(job._id),
            title: job.title || "",
            location: job.location || "",
            jobType: job.jobType || "",
            company: job.company?.name || "",
            createdAt: String(job.createdAt || ""),
        },
        namespace: process.env.PINECONE_NAMESPACE || "jobs",
    });
};

export const deleteJobVector = async (jobId) => {
    await deleteVector({
        id: String(jobId),
        namespace: process.env.PINECONE_NAMESPACE || "jobs",
    });
};

export const getJobRecommendationsFromSkills = async (skills = [], topK = 15) => {
    const normalized = expandSkills(skills);
    if (!normalized.length) return [];

    let matches;
    try {
        matches = await queryMemory({
            query: `skills: ${normalized.join(", ")}`,
            limit: topK,
            namespace: process.env.PINECONE_NAMESPACE || "jobs",
        });
    } catch (error) {
        console.log("AI RECOMMENDATIONS SOURCE: mongodb-fallback");
        return fallbackJobRecommendationsFromSkills(normalized, topK);
    }

    const ids = (matches || []).map((match) => String(match.id || match?.metadata?.jobId || "")).filter(Boolean);
    if (!ids.length) {
        console.log("AI RECOMMENDATIONS SOURCE: mongodb-fallback");
        return fallbackJobRecommendationsFromSkills(normalized, topK);
    }

    const scoreById = new Map((matches || []).map((match) => [String(match.id || match?.metadata?.jobId || ""), match.score || 0]));

    const jobs = await Job.find({ _id: { $in: ids } }).populate("company");
    const jobsById = new Map(jobs.map((job) => [String(job._id), job]));

    const vectorResults = ids
        .map((id) => {
            const job = jobsById.get(id);
            if (!job) return null;

            const vectorScore = Number((scoreById.get(id) || 0).toFixed(4));
            const lexicalScore = Number(computeSkillMatchScore(job, normalized).toFixed(4));
            const combinedScore = Number((lexicalScore * 0.7 + vectorScore * 0.3).toFixed(4));

            return {
                ...job.toObject(),
                matchScore: combinedScore,
                lexicalScore,
                vectorScore,
            };
        })
        .filter(Boolean);

    const fallbackResults = await fallbackJobRecommendationsFromSkills(normalized, topK);
    const merged = new Map();

    for (const job of fallbackResults) {
        merged.set(String(job._id), job);
    }

    for (const job of vectorResults) {
        const existing = merged.get(String(job._id));
        if (!existing || (job.matchScore || 0) > (existing.matchScore || 0)) {
            merged.set(String(job._id), job);
        }
    }

    const ranked = [...merged.values()]
        .sort((a, b) => {
            const scoreDiff = (b.matchScore || 0) - (a.matchScore || 0);
            if (scoreDiff !== 0) return scoreDiff;
            return new Date(b.createdAt || 0).getTime() - new Date(a.createdAt || 0).getTime();
        })
        .slice(0, topK);

    console.log("AI RECOMMENDATIONS SOURCE: hybrid-vector+mongodb");
    return ranked;
};

export const getLatestJobs = async (limit = 8) => {
    return Job.find({})
        .populate("company")
        .sort({ createdAt: -1 })
        .limit(limit);
};