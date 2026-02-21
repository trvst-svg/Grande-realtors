import fs from "fs/promises";

export default async function cleanupUploads(files = []) {
  await Promise.all(
    files.map((filePath) =>
      fs.unlink(filePath).catch(() => {
        /* ignore cleanup errors */
      })
    )
  );
}
