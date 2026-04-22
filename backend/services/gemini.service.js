import { GoogleGenAI } from "@google/genai";

const EMBEDDING_MODEL = "gemini-embedding-001";
const EMBEDDING_DIM = 768;

let aiClient = null;

const getGeminiClient = () => {
    if (aiClient) return aiClient;

    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) return null;

    aiClient = new GoogleGenAI({ apiKey });
    return aiClient;
};

export async function generateVector(content) {
    const ai = getGeminiClient();
    if (!ai) {
        throw new Error("Gemini client is not configured");
    }

    const response = await ai.models.embedContent({
        model: EMBEDDING_MODEL,
        contents: content,
        config: {
            outputDimensionality: EMBEDDING_DIM,
        },
    });

    const vector = response?.embeddings?.[0]?.values;

    if (!Array.isArray(vector) || vector.length === 0) {
        throw new Error("Failed to generate embedding");
    }

    if (vector.length !== EMBEDDING_DIM) {
        throw new Error(`Expected ${EMBEDDING_DIM}-dim embedding, got ${vector.length}`);
    }

    return vector;
}
