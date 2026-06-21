import { Storage } from "@google-cloud/storage";
import type { Readable } from "node:stream";

const bucketName = process.env.GCS_BUCKET_NAME ?? "";
const projectId = process.env.GCS_PROJECT_ID ?? "";

function createStorageClient(): Storage {
    const credentialsJson = process.env.GCS_CREDENTIALS_JSON;
    if (credentialsJson) {
        const credentials = JSON.parse(credentialsJson) as Record<string, unknown>;
        return new Storage({ projectId, credentials });
    }

    return new Storage({ projectId });
}

const storage = createStorageClient();

function getBucket() {
    if (!bucketName) {
        throw new Error("GCS_BUCKET_NAME não configurado");
    }
    return storage.bucket(bucketName);
}

export async function uploadBuffer(
    objectKey: string,
    buffer: Buffer,
    contentType: string
): Promise<void> {
    const file = getBucket().file(objectKey);
    await file.save(buffer, {
        contentType,
        resumable: false,
        metadata: { contentType },
    });
}

export async function deleteObject(objectKey: string): Promise<void> {
    await getBucket().file(objectKey).delete({ ignoreNotFound: true });
}

export function getReadStream(objectKey: string): Readable {
    return getBucket().file(objectKey).createReadStream();
}

export function getContentTypeFromKey(objectKey: string): string {
    if (objectKey.endsWith(".png")) return "image/png";
    return "image/jpeg";
}
