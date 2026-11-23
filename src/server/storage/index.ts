import fs from "fs/promises";
import path from "path";
import { randomUUID } from "crypto";

const LOCAL_STORAGE_DIR =
  process.env.STORAGE_LOCAL_DIR ||
  (process.env.VERCEL ? "/tmp/submissions" : "./storage/submissions");

/**
 * Ensures the private storage directory exists.
 */
async function ensureStorageDir(): Promise<string> {
  const absolutePath = path.resolve(process.cwd(), LOCAL_STORAGE_DIR);
  try {
    await fs.mkdir(absolutePath, { recursive: true });
  } catch {
    // Already exists
  }
  return absolutePath;
}

export interface SaveFileResult {
  fileObjectKey: string;
  originalFilename: string;
  fileSize: number;
  mimeType: string;
}

/**
 * Saves an uploaded file to private server storage.
 * Does not expose it to the web root.
 */
export async function savePrivateFile(
  file: File,
  prefix: string = "sub"
): Promise<SaveFileResult> {
  const baseDir = await ensureStorageDir();
  const fileExtension = path.extname(file.name) || ".bin";
  const safeFilename = `${prefix}_${Date.now()}_${randomUUID()}${fileExtension}`;
  const targetPath = path.join(baseDir, safeFilename);

  const arrayBuffer = await file.arrayBuffer();
  const buffer = Buffer.from(arrayBuffer);

  await fs.writeFile(targetPath, buffer);

  return {
    fileObjectKey: safeFilename,
    originalFilename: file.name,
    fileSize: file.size,
    mimeType: file.type || "application/octet-stream",
  };
}

/**
 * Reads a private file from storage.
 */
export async function readPrivateFile(
  fileObjectKey: string
): Promise<{ buffer: Buffer; path: string }> {
  const baseDir = await ensureStorageDir();
  const sanitizedKey = path.basename(fileObjectKey); // prevent directory traversal
  const filePath = path.join(baseDir, sanitizedKey);

  const buffer = await fs.readFile(filePath);
  return { buffer, path: filePath };
}
