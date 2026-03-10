#!/usr/bin/env node
/**
 * fetch-programs.mjs
 *
 * Downloads (or refreshes) locally cached conference program PDFs.
 * Run with:  npm run fetch-programs
 *
 * For each entry below, the script fetches `sourceUrl` and writes the result
 * to `public/assets/programs/<filename>`.  When the upstream source publishes
 * a new version the cached copy can be refreshed by running this script again.
 *
 * After downloading a new file, update `conferenceProgramUrl` in
 * src/data/all-conferences.ts to point to `/assets/programs/<filename>` and
 * set `conferenceProgramSourceUrl` to the `sourceUrl` used here.
 */

import { createWriteStream, mkdirSync } from "node:fs";
import { resolve, dirname } from "node:path";
import { fileURLToPath } from "node:url";
import { get as httpsGet } from "node:https";
import { get as httpGet } from "node:http";

const __dirname = dirname(fileURLToPath(import.meta.url));
const OUTPUT_DIR = resolve(__dirname, "../public/assets/programs");

mkdirSync(OUTPUT_DIR, { recursive: true });

/**
 * Conference program sources.
 *
 * - conferenceId : matches Conference.id in all-conferences.ts
 * - filename     : saved as public/assets/programs/<filename>
 * - sourceUrl    : upstream download URL (matches Conference.conferenceProgramSourceUrl)
 */
const PROGRAMS = [
  {
    conferenceId: "hamvention-2026",
    filename: "hamvention-2026-program.pdf",
    sourceUrl:
      "https://hamvention.org/wp-content/uploads/2025/05/2025-Program-Web3.pdf",
  },
  {
    conferenceId: "huntsville-2026",
    filename: "huntsville-hamfest-2026-program.pdf",
    sourceUrl:
      "https://hamfest.org/wp-content/uploads/2025/08/Hamfest-Program-2025-08-FINAL.pdf",
  },
  {
    conferenceId: "pacificon-2026",
    filename: "pacificon-2026-program.pdf",
    sourceUrl:
      "https://drive.google.com/uc?export=download&id=1TlaEhDC0xvCEiQgJc5QUYApp0WIpHvNm",
  },
  {
    conferenceId: "hamcation-2026",
    filename: "hamcation-2026-program.pdf",
    sourceUrl: "https://www.hamcation.com/PDF/HamCation-2026-Program.pdf",
  },
  {
    conferenceId: "hamcation-2027",
    filename: "hamcation-2027-program.pdf",
    sourceUrl: "https://www.hamcation.com/PDF/HamCation-2027-Program.pdf",
  },
];

/**
 * Download a URL to a local file, following redirects.
 * @param {string} url
 * @param {string} dest  absolute path
 * @returns {Promise<void>}
 */
function download(url, dest) {
  return new Promise((resolve, reject) => {
    const getter = url.startsWith("https://") ? httpsGet : httpGet;
    getter(url, (res) => {
      if (
        res.statusCode >= 300 &&
        res.statusCode < 400 &&
        res.headers.location
      ) {
        // Follow redirect
        download(res.headers.location, dest).then(resolve).catch(reject);
        return;
      }
      if (res.statusCode !== 200) {
        reject(new Error(`HTTP ${res.statusCode} for ${url}`));
        return;
      }
      const file = createWriteStream(dest);
      res.pipe(file);
      file.on("finish", () => file.close(resolve));
      file.on("error", reject);
    }).on("error", reject);
  });
}

async function main() {
  let anyFailure = false;
  for (const { conferenceId, filename, sourceUrl } of PROGRAMS) {
    const dest = resolve(OUTPUT_DIR, filename);
    process.stdout.write(
      `[${conferenceId}] Fetching ${sourceUrl} → ${filename} … `,
    );
    try {
      await download(sourceUrl, dest);
      console.log("✓");
    } catch (err) {
      console.log(`✗  (${err.message})`);
      anyFailure = true;
    }
  }
  if (anyFailure) {
    console.warn(
      "\nOne or more downloads failed. Check the URLs above and ensure " +
        "network access is available, then update conferenceProgramSourceUrl " +
        "in src/data/all-conferences.ts if the upstream path has changed.",
    );
    process.exit(1);
  }
}

main();
