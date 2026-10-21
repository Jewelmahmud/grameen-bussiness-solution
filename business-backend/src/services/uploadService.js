const fs = require('fs').promises;
const path = require('path');
const { randomUUID } = require('crypto');

const ALLOWED_IMAGE_MIMES = ['image/jpeg', 'image/png', 'image/webp', 'image/gif'];
const MIME_EXT = { 'image/jpeg': '.jpg', 'image/png': '.png', 'image/webp': '.webp', 'image/gif': '.gif' };

/**
 * Upload service - driver from UPLOAD_DRIVER env (local | s3).
 * UPLOAD_LOCAL_PATH = folder for local storage (configurable).
 * S3 vars used when UPLOAD_DRIVER=s3.
 */
class UploadService {
  static getDriver() {
    const d = (process.env.UPLOAD_DRIVER || 'local').toLowerCase();
    return d === 's3' ? 's3' : 'local';
  }

  static getLocalPath() {
    const p = process.env.UPLOAD_LOCAL_PATH || '';
    if (!p) {
      throw new Error('UPLOAD_LOCAL_PATH is required when UPLOAD_DRIVER=local');
    }
    return path.resolve(p);
  }

  static getMaxFileSize() {
    const n = parseInt(process.env.UPLOAD_MAX_FILE_SIZE, 10);
    return Number.isFinite(n) && n > 0 ? n : 5 * 1024 * 1024; // 5MB default
  }

  /**
   * Check mimetype is allowed for images
   */
  static isAllowedImageMime(mimetype) {
    return ALLOWED_IMAGE_MIMES.includes(mimetype);
  }

  /**
   * Upload image buffer. Returns URL path to store in DB (e.g. /uploads/categories/xxx.jpg or S3 URL).
   * @param {Buffer} buffer
   * @param {{ subdir: string, mimetype: string, originalName?: string }} options
   * @returns {Promise<string>} URL or path to store as image_url
   */
  static async upload(buffer, options = {}) {
    const { subdir = 'uploads', mimetype, originalName } = options;
    if (!buffer || !Buffer.isBuffer(buffer)) {
      throw new Error('Upload expects a buffer');
    }
    if (!this.isAllowedImageMime(mimetype)) {
      throw new Error(`Invalid image type: ${mimetype}. Allowed: ${ALLOWED_IMAGE_MIMES.join(', ')}`);
    }
    const maxSize = this.getMaxFileSize();
    if (buffer.length > maxSize) {
      throw new Error(`File too large. Max size: ${Math.round(maxSize / 1024)}KB`);
    }

    const driver = this.getDriver();
    if (driver === 's3') {
      return this.uploadS3(buffer, { subdir, mimetype, originalName });
    }
    return this.uploadLocal(buffer, { subdir, mimetype });
  }

  /**
   * Local disk upload: save under UPLOAD_LOCAL_PATH/subdir, return path like /uploads/subdir/filename
   */
  static async uploadLocal(buffer, { subdir, mimetype }) {
    const baseDir = this.getLocalPath();
    const dir = path.join(baseDir, subdir);
    await fs.mkdir(dir, { recursive: true });
    const ext = MIME_EXT[mimetype] || '.jpg';
    const filename = `${randomUUID()}${ext}`;
    const filePath = path.join(dir, filename);
    await fs.writeFile(filePath, buffer);
    return `/uploads/${subdir}/${filename}`;
  }

  /**
   * S3 upload - stub; implement with @aws-sdk/client-s3 when needed.
   */
  static async uploadS3(buffer, { subdir, mimetype, originalName }) {
    const S3_BUCKET = process.env.S3_BUCKET;
    const S3_REGION = process.env.S3_REGION;
    const S3_ACCESS_KEY = process.env.S3_ACCESS_KEY;
    const S3_SECRET_KEY = process.env.S3_SECRET_KEY;
    if (!S3_BUCKET || !S3_ACCESS_KEY || !S3_SECRET_KEY) {
      throw new Error('S3 is not configured. Set S3_BUCKET, S3_ACCESS_KEY, S3_SECRET_KEY (and optionally S3_REGION, S3_ENDPOINT).');
    }
    try {
      const { S3Client, PutObjectCommand } = require('@aws-sdk/client-s3');
      const ext = MIME_EXT[mimetype] || '.jpg';
      const key = `${subdir}/${randomUUID()}${ext}`;
      const endpoint = process.env.S3_ENDPOINT || undefined;
      const client = new S3Client({
        region: S3_REGION || 'us-east-1',
        ...(endpoint && { endpoint, forcePathStyle: true }),
        credentials: { accessKeyId: S3_ACCESS_KEY, secretAccessKey: S3_SECRET_KEY },
      });
      await client.send(new PutObjectCommand({
        Bucket: S3_BUCKET,
        Key: key,
        Body: buffer,
        ContentType: mimetype,
      }));
      const baseUrl = process.env.S3_PUBLIC_BASE_URL;
      if (baseUrl) {
        return `${baseUrl.replace(/\/$/, '')}/${key}`;
      }
      if (endpoint) {
        return `${endpoint}/${S3_BUCKET}/${key}`;
      }
      return `https://${S3_BUCKET}.s3.${S3_REGION || 'us-east-1'}.amazonaws.com/${key}`;
    } catch (err) {
      if (err.code === 'MODULE_NOT_FOUND') {
        throw new Error('S3 upload requires @aws-sdk/client-s3. Run: npm install @aws-sdk/client-s3');
      }
      throw err;
    }
  }

  /**
   * Return public URL for a stored image_url value (for local, may need base URL prepended by client).
   */
  static getPublicUrl(storedPath) {
    if (!storedPath) return null;
    const driver = this.getDriver();
    if (driver === 's3') {
      return storedPath; // already full URL
    }
    return storedPath; // relative path like /uploads/categories/xxx.jpg; client uses BACKEND_URL + path
  }
}

module.exports = UploadService;
