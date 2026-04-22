import { Pinecone } from "@pinecone-database/pinecone";

let pineconeClient = null;

const getPineconeClient = () => {
    if (pineconeClient) return pineconeClient;

    const apiKey = process.env.PINECONE_API_KEY;
    if (!apiKey) return null;

    pineconeClient = new Pinecone({ apiKey });
    return pineconeClient;
};

const getIndex = () => {
    const pc = getPineconeClient();
    if (!pc || !process.env.PINECONE_INDEX_NAME) return null;

    if (process.env.PINECONE_HOST) {
        return pc.index(process.env.PINECONE_INDEX_NAME, process.env.PINECONE_HOST);
    }

    return pc.index(process.env.PINECONE_INDEX_NAME);
};

export async function upsertVector({ id, values, metadata, namespace = "default" }) {
    const index = getIndex();
    if (!index) return;

    await index.namespace(namespace).upsert({
        records: [
            {
                id,
                values,
                metadata,
            },
        ],
    });
}

export async function queryVector({ vector, topK = 5, namespace = "default", filter }) {
    const index = getIndex();
    if (!index) return [];

    const res = await index.namespace(namespace).query({
        vector,
        topK,
        includeMetadata: true,
        filter,
    });

    return res?.matches || [];
}

export async function deleteVector({ id, namespace = "default" }) {
    const index = getIndex();
    if (!index) return;

    await index.namespace(namespace).deleteOne(String(id));
}
