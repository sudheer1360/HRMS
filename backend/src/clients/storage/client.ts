/**
 * clients/storage/client.ts — File / object storage client.
 *
 * Provides a unified interface for file operations.
 * Currently backed by local filesystem; swap provider for AWS S3, GCS, etc.
 *
 * Usage:
 *   import { storageClient } from '@clients/storage/client.js';
 *   const url = await storageClient.upload('documents', 'offer-letter.pdf', buffer, 'application/pdf');
 */
import fs from 'fs';
import path from 'path';
import { loggingHandler } from '../../common/utils/LoggingHandler.js';

const MODULE = 'storage.client';
const BASE_UPLOAD_DIR = path.resolve(process.cwd(), '..', 'storage', 'uploads');

interface UploadResult {
  key: string;
  url: string;
  size: number;
  mimeType: string;
}

class StorageClient {
  private readonly logging = loggingHandler;

  private ensureDir(dir: string): void {
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }
  }

  /**
   * Upload a file to the storage backend.
   * @param bucket  Logical bucket / folder (e.g. 'documents', 'photos', 'payslips')
   * @param filename Target filename
   * @param data    File buffer or base64 string
   * @param mimeType MIME type
   */
  async upload(
    bucket: string,
    filename: string,
    data: Buffer | string,
    mimeType: string
  ): Promise<UploadResult> {
    const dir = path.join(BASE_UPLOAD_DIR, bucket);
    this.ensureDir(dir);

    const key = `${bucket}/${Date.now()}-${filename}`;
    const fullPath = path.join(BASE_UPLOAD_DIR, key);
    const buffer = typeof data === 'string' ? Buffer.from(data, 'base64') : data;

    fs.writeFileSync(fullPath, buffer);

    const url = `/uploads/${key}`;
    this.logging.info(MODULE, 'File uploaded', { key, size: buffer.length, mimeType });

    return { key, url, size: buffer.length, mimeType };
  }

  /**
   * Download / read a file by its key.
   */
  async download(key: string): Promise<Buffer> {
    const fullPath = path.join(BASE_UPLOAD_DIR, key);
    if (!fs.existsSync(fullPath)) {
      throw new Error(`File not found: ${key}`);
    }
    return fs.readFileSync(fullPath);
  }

  /**
   * Delete a file by its key.
   */
  async delete(key: string): Promise<void> {
    const fullPath = path.join(BASE_UPLOAD_DIR, key);
    if (fs.existsSync(fullPath)) {
      fs.unlinkSync(fullPath);
      this.logging.info(MODULE, 'File deleted', { key });
    }
  }

  /**
   * Check whether a file exists.
   */
  async exists(key: string): Promise<boolean> {
    return fs.existsSync(path.join(BASE_UPLOAD_DIR, key));
  }

  /**
   * Get a pre-signed / direct URL for a file.
   * In local mode, returns the relative URL; replace with signed S3 URL in production.
   */
  getUrl(key: string): string {
    return `/uploads/${key}`;
  }
}

export const storageClient = new StorageClient();
export default storageClient;
