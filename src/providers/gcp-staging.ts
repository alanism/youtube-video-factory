import { execFile } from "node:child_process";
import { existsSync } from "node:fs";
import { join } from "node:path";
import { promisify } from "node:util";
import { canonicalHash, sha256File } from "../core/files.js";

const execFileAsync = promisify(execFile);

export interface StagedFrame {
  objectKey: string;
  publicUrl: string;
  hash: string;
}

export class GcpFrameStager {
  constructor(
    private readonly bucket = process.env.GCP_STAGING_BUCKET,
    private readonly projectId = process.env.GCP_STAGING_PROJECT,
    private readonly executable = process.env.GCLOUD_STORAGE_CLI ?? "gcloud",
    private readonly run: (executable: string, arguments_: string[]) => Promise<unknown> =
      (executable, arguments_) => execFileAsync(executable, arguments_),
    private readonly fetchImplementation: typeof fetch = fetch,
  ) {}

  private requireConfig(): { bucket: string; projectId: string } {
    if (!this.bucket || !this.projectId) {
      throw new Error("GCP_STAGING_BUCKET and GCP_STAGING_PROJECT are required.");
    }
    return { bucket:this.bucket.replace(/^gs:\/\//, "").replace(/\/+$/, ""), projectId:this.projectId };
  }

  async stage(localPath: string, projectId: string, requestHash: string): Promise<StagedFrame> {
    if (!existsSync(localPath)) throw new Error(`Frame does not exist: ${localPath}`);
    const config = this.requireConfig();
    const hash = await sha256File(localPath);
    const objectKey = `ucc-staging/${projectId}/${requestHash}/${hash}.png`;
    await this.run(this.executable, [
      "storage","cp",localPath,`gs://${config.bucket}/${objectKey}`,
      "--project",config.projectId,
      "--content-type=image/png",
    ]);
    const publicUrl = `https://storage.googleapis.com/${config.bucket}/${objectKey}`;
    const response = await this.fetchImplementation(publicUrl, { method:"HEAD" });
    if (!response.ok || !response.headers.get("content-type")?.startsWith("image/")) {
      throw new Error("GCP staged frame failed public verification.");
    }
    return { objectKey, publicUrl, hash };
  }

  async release(frame: StagedFrame): Promise<void> {
    const config = this.requireConfig();
    await this.run(this.executable, [
      "storage","rm",`gs://${config.bucket}/${frame.objectKey}`,
      "--project",config.projectId,
    ]);
  }

  requestHash(paths: string[]): string {
    return canonicalHash(paths);
  }
}
