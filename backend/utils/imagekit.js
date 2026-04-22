import ImageKit from "imagekit";

let imagekitInstance = null;

function getImageKitInstance() {
    if (imagekitInstance) return imagekitInstance;

    const publicKey = process.env.IMAGEKIT_PUBLIC_KEY;
    const privateKey = process.env.IMAGEKIT_PRIVATE_KEY;
    const urlEndpoint = process.env.IMAGEKIT_URL_ENDPOINT;

    if (!publicKey || !privateKey || !urlEndpoint) {
        // Defer throwing to upload time; return null so callers can handle missing config gracefully
        return null;
    }

    imagekitInstance = new ImageKit({
        publicKey,
        privateKey,
        urlEndpoint,
    });

    return imagekitInstance;
}

export const uploadToImageKit = async ({ file, folder }) => {
    if (!file) return null;

    const ik = getImageKitInstance();
    if (!ik) {
        console.warn(
            'ImageKit not configured. Set IMAGEKIT_PUBLIC_KEY, IMAGEKIT_PRIVATE_KEY, and IMAGEKIT_URL_ENDPOINT in .env to enable uploads.'
        );
        return null;
    }

    try {
        const fileBase64 = file.buffer.toString("base64");
        return await ik.upload({
            file: fileBase64,
            fileName: file.originalname || "upload",
            folder,
            useUniqueFileName: true,
        });
    } catch (err) {
        console.warn('ImageKit upload failed:', err.message || err);
        return null;
    }
};

export default getImageKitInstance;
