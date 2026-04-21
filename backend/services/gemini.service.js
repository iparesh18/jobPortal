import { GoogleGenAI } from "@google/genai";

const EMBEDDING_MODEL = "gemini-embedding-001";
const EMBEDDING_DIM = 768;

const ai = process.env.GEMINI_API_KEY
    ? new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY })
    : null;

export async function generateVector(content) {
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
