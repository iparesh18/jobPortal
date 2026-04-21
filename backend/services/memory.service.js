import { generateVector } from "./gemini.service.js";
import { upsertVector, queryVector } from "./pinecone.service.js";

export async function createMemory({ content, metadata, id, namespace = "memory" }) {
    const vector = await generateVector(content);

    await upsertVector({
        id,
        values: vector,
        metadata,
        namespace,
    });
}

export async function queryMemory({ query, limit = 5, namespace = "memory", filter }) {
    const vector = await generateVector(query);

    return queryVector({
        vector,
        topK: limit,
        namespace,
        filter,
    });
}
