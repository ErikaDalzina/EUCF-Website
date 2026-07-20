/**
 * Build-time image pipeline: Airtable attachments -> optimized images on R2.
 *
 * For every record whose `* upload` *attachment* field is non-empty:
 *   download -> optimize/resize (sharp, webp) -> upload to R2 under a
 *   content-hash key -> PATCH the record: public R2 URL into the main text
 *   image column (`icon`/`image`/`logo`) + upload attachment cleared (keeps
 *   the base under Airtable's free-tier 1GB attachment cap). An attachment
 *   being present is the only "to do" marker, so replacing an image is just
 *   uploading a new attachment; builds with no new attachments make zero R2
 *   calls. Site-relative paths (e.g. /VALlogo.png, served from public/) in
 *   the image columns are never touched — no attachment, nothing to process.
 *
 * Hash-named objects make everything idempotent: identical bytes map to the
 * same key (no duplicate storage), a HEAD hit skips the re-upload, and a
 * failed PATCH is simply retried by the next build. Originals are not kept —
 * only the optimized version is stored.
 *
 * Missing R2_* or Airtable env vars skip the pipeline with a warning (build
 * still succeeds). One bad image logs an error for that record only.
 *
 * Run with:  npm run sync:images   (also runs inside `npm run sync:content`)
 */
import { createHash } from "node:crypto";
import { pathToFileURL } from "node:url";
import type { S3Client } from "@aws-sdk/client-s3";
import {
  F,
  TABLES,
  VIEWS,
  fetchAll,
  hasAirtableCreds,
  patchRecords,
  type AirtableRecord,
  type Attachment,
  type RecordUpdate,
} from "./lib/airtable";

type Profile = "photo" | "logo" | "hero";

// Max dimensions cap the layout's largest rendering; webp keeps alpha, so
// transparent logos survive. Images are never enlarged.
const PROFILES: Record<Profile, { maxW: number; maxH: number; quality: number }> = {
  photo: { maxW: 800, maxH: 800, quality: 80 }, // players, officers
  logo: { maxW: 512, maxH: 512, quality: 90 }, // titles.icon, sponsors.logo
  hero: { maxW: 1600, maxH: 1600, quality: 80 }, // featuredstory
};

export type ImageJob = {
  table: string; // real Airtable table name (from TABLES)
  records: AirtableRecord[]; // in-memory records — mutated on success
  attachmentField: string;
  urlField: string;
  profile: Profile;
  label: string; // for logs
};

type Pending = { job: ImageJob; record: AirtableRecord; att: Attachment };

type R2Env = {
  accountId: string;
  accessKeyId: string;
  secretAccessKey: string;
  bucket: string;
  publicBaseUrl: string;
};

function r2Env(): R2Env | null {
  const names = [
    "R2_ACCOUNT_ID",
    "R2_ACCESS_KEY_ID",
    "R2_SECRET_ACCESS_KEY",
    "R2_BUCKET",
    "R2_PUBLIC_BASE_URL",
  ] as const;
  const missing = names.filter((n) => !process.env[n]);
  if (missing.length) {
    console.warn(
      `[sync-images] ${missing.join(", ")} not set — skipping image sync; ` +
        `attachments stay in Airtable until the pipeline runs.`
    );
    return null;
  }
  return {
    accountId: process.env.R2_ACCOUNT_ID!,
    accessKeyId: process.env.R2_ACCESS_KEY_ID!,
    secretAccessKey: process.env.R2_SECRET_ACCESS_KEY!,
    bucket: process.env.R2_BUCKET!,
    publicBaseUrl: process.env.R2_PUBLIC_BASE_URL!.replace(/\/+$/, ""),
  };
}

function firstAttachment(v: unknown): Attachment | null {
  if (!Array.isArray(v)) return null;
  const first = v[0];
  if (
    first &&
    typeof first === "object" &&
    "url" in first &&
    typeof (first as { url: unknown }).url === "string"
  ) {
    return first as Attachment;
  }
  return null;
}

// An attachment being present is the whole "needs processing" signal — the URL
// field's current value is irrelevant (a new attachment on a record with an
// existing URL is a replacement and overwrites it).
function pendingOf(job: ImageJob): Pending[] {
  const out: Pending[] = [];
  for (const record of job.records) {
    const att = firstAttachment(record.fields[job.attachmentField]);
    if (att) out.push({ job, record, att });
  }
  return out;
}

async function download(att: Attachment): Promise<{ buf: Buffer; type: string }> {
  // Attachment URLs are pre-signed — no auth header, but they expire ~2h
  // after the records were fetched, which is far longer than a build.
  const res = await fetch(att.url);
  if (!res.ok) {
    throw new Error(`download failed ${res.status}: ${att.filename ?? att.url.slice(0, 60)}`);
  }
  const type = res.headers.get("content-type") || att.type || "";
  return { buf: Buffer.from(await res.arrayBuffer()), type };
}

const EXT_BY_TYPE: Record<string, string> = {
  "image/png": "png",
  "image/jpeg": "jpg",
  "image/webp": "webp",
  "image/gif": "gif",
  "image/svg+xml": "svg",
  "image/avif": "avif",
};

function originalExt(type: string, filename: string): string {
  const fromType = EXT_BY_TYPE[type.split(";")[0].trim()];
  if (fromType) return fromType;
  const fromName = /\.([a-z0-9]+)$/i.exec(filename)?.[1]?.toLowerCase();
  return fromName ?? "bin";
}

type Optimized = { data: Buffer; ext: string; contentType: string };

// sharp's declarations use `export =`, so its module type is the callable
// itself; at runtime node's ESM→CJS interop exposes it on `.default`.
type SharpModule = typeof import("sharp");

async function optimize(
  sharp: SharpModule,
  buf: Buffer,
  type: string,
  filename: string,
  profile: Profile
): Promise<Optimized> {
  const ext = originalExt(type, filename);

  // SVGs are already tiny and scale-free; recoding a GIF would drop animation.
  if (ext === "svg") return { data: buf, ext, contentType: "image/svg+xml" };
  if (ext === "gif") return { data: buf, ext, contentType: "image/gif" };

  const { maxW, maxH, quality } = PROFILES[profile];
  try {
    const data = await sharp(buf)
      .rotate() // honor EXIF orientation before it's stripped
      .resize(maxW, maxH, { fit: "inside", withoutEnlargement: true })
      .webp({ quality, effort: 6 })
      .toBuffer();
    return { data, ext: "webp", contentType: "image/webp" };
  } catch (e) {
    // Corrupt or unsupported input: a big original beats a broken image.
    console.warn(`[sync-images] optimize failed for "${filename}" — uploading original:`, e);
    return { data: buf, ext, contentType: type || "application/octet-stream" };
  }
}

// Key = hash of the *processed* bytes: identical outputs dedupe to one object,
// and a changed image gets a new key (old URLs in deployed builds keep working).
const objectKey = (data: Buffer, ext: string): string =>
  `images/${createHash("sha256").update(data).digest("hex")}.${ext}`;

async function ensureUploaded(
  s3: typeof import("@aws-sdk/client-s3"),
  client: S3Client,
  bucket: string,
  key: string,
  data: Buffer,
  contentType: string
): Promise<"uploaded" | "reused"> {
  try {
    await client.send(new s3.HeadObjectCommand({ Bucket: bucket, Key: key }));
    return "reused"; // HEAD (cheap class B op) hit — same bytes already live
  } catch (e) {
    const status = (e as { $metadata?: { httpStatusCode?: number } }).$metadata?.httpStatusCode;
    if (status !== 404 && (e as Error).name !== "NotFound") throw e;
  }
  await client.send(
    new s3.PutObjectCommand({
      Bucket: bucket,
      Key: key,
      Body: data,
      ContentType: contentType,
      // Safe to cache forever: a different image always gets a different key.
      CacheControl: "public, max-age=31536000, immutable",
    })
  );
  return "uploaded";
}

async function mapLimit<T, R>(
  items: T[],
  limit: number,
  fn: (item: T) => Promise<R>
): Promise<R[]> {
  const results: R[] = new Array(items.length);
  let next = 0;
  const worker = async () => {
    for (let i = next++; i < items.length; i = next++) {
      results[i] = await fn(items[i]);
    }
  };
  await Promise.all(Array.from({ length: Math.min(limit, items.length) }, worker));
  return results;
}

type Success = { pending: Pending; url: string; outcome: "uploaded" | "reused" };

export async function syncImages(jobs: ImageJob[]): Promise<void> {
  const env = r2Env();
  if (!env) return;

  const pending = jobs.flatMap(pendingOf);
  if (pending.length === 0) {
    console.log("[sync-images] no new attachments — nothing to do.");
    return;
  }

  // Deps load lazily so a broken native binary (sharp) or missing install
  // degrades to a warning instead of crashing the whole prebuild at import.
  let sharp: SharpModule;
  let s3: typeof import("@aws-sdk/client-s3");
  try {
    sharp = (await import("sharp") as unknown as { default: SharpModule }).default;
    s3 = await import("@aws-sdk/client-s3");
  } catch (e) {
    console.warn(
      "[sync-images] sharp/@aws-sdk/client-s3 unavailable — skipping image sync " +
        "(run `npm install` from PowerShell):",
      e
    );
    return;
  }

  const client = new s3.S3Client({
    region: "auto",
    endpoint: `https://${env.accountId}.r2.cloudflarestorage.com`,
    credentials: { accessKeyId: env.accessKeyId, secretAccessKey: env.secretAccessKey },
  });

  let failed = 0;
  const successes = (
    await mapLimit(pending, 4, async (p): Promise<Success | null> => {
      const name = `${p.job.label}/${p.att.filename ?? p.att.id}`;
      try {
        const { buf, type } = await download(p.att);
        const opt = await optimize(sharp, buf, type, p.att.filename ?? "", p.job.profile);
        const key = objectKey(opt.data, opt.ext);
        const outcome = await ensureUploaded(s3, client, env.bucket, key, opt.data, opt.contentType);
        return { pending: p, url: `${env.publicBaseUrl}/${key}`, outcome };
      } catch (e) {
        failed++;
        console.error(`[sync-images] failed for ${name} — will retry next build:`, e);
        return null;
      }
    })
  ).filter((r): r is Success => r !== null);

  // Write back per table: URL field set + attachment cleared in one atomic
  // update, only after the R2 upload is confirmed. If the PATCH itself fails,
  // the attachment survives and the next build retries idempotently.
  const byTable = new Map<string, { updates: RecordUpdate[]; items: Success[] }>();
  for (const success of successes) {
    const { job, record } = success.pending;
    const entry = byTable.get(job.table) ?? { updates: [], items: [] };
    entry.updates.push({
      id: record.id,
      fields: { [job.urlField]: success.url, [job.attachmentField]: [] },
    });
    entry.items.push(success);
    byTable.set(job.table, entry);
  }

  let written = 0;
  for (const [table, { updates, items }] of byTable) {
    try {
      await patchRecords(table, updates);
      // Mirror the write into the in-memory records so JSON generated later in
      // this same build already carries the R2 URLs.
      for (const item of items) {
        const { job, record } = item.pending;
        record.fields[job.urlField] = item.url;
        record.fields[job.attachmentField] = [];
      }
      written += updates.length;
    } catch (e) {
      failed += updates.length;
      console.error(
        `[sync-images] write-back to "${table}" failed (images are on R2; next build retries):`,
        e
      );
    }
  }

  const uploaded = successes.filter((r) => r.outcome === "uploaded").length;
  const reused = successes.length - uploaded;
  console.log(
    `[sync-images] ${pending.length} attachment(s): ${uploaded} uploaded, ` +
      `${reused} reused (dedup), ${written} record(s) updated, ${failed} failed.`
  );
}

export function buildImageJobs(t: {
  titles: AirtableRecord[];
  players: AirtableRecord[];
  officers: AirtableRecord[];
  sponsors: AirtableRecord[];
  stories: AirtableRecord[];
}): ImageJob[] {
  return [
    { table: TABLES.titles, records: t.titles, attachmentField: F.titleImageUpload, urlField: F.titleImage, profile: "logo", label: "titles" },
    { table: TABLES.players, records: t.players, attachmentField: F.playerImageUpload, urlField: F.playerImage, profile: "photo", label: "players" },
    { table: TABLES.officers, records: t.officers, attachmentField: F.officerImageUpload, urlField: F.officerImage, profile: "photo", label: "officers" },
    { table: TABLES.sponsors, records: t.sponsors, attachmentField: F.sponsorImageUpload, urlField: F.sponsorImage, profile: "logo", label: "sponsors" },
    { table: TABLES.featuredStory, records: t.stories, attachmentField: F.storyImageUpload, urlField: F.storyImage, profile: "hero", label: "featuredstory" },
  ];
}

// Standalone mode (`npm run sync:images`): fetch just the image-bearing tables
// and run the pipeline — no JSON regeneration. Manual runs fail loudly.
if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) {
  if (!hasAirtableCreds()) {
    console.warn("[sync-images] AIRTABLE_TOKEN/AIRTABLE_BASE_ID not set — nothing to sync.");
    process.exit(0);
  }
  (async () => {
    const [titles, players, officers, sponsors, stories] = await Promise.all([
      fetchAll(TABLES.titles, VIEWS.titles),
      fetchAll(TABLES.players),
      fetchAll(TABLES.officers, VIEWS.officers),
      fetchAll(TABLES.sponsors, VIEWS.sponsors),
      fetchAll(TABLES.featuredStory, VIEWS.featuredStory),
    ]);
    await syncImages(buildImageJobs({ titles, players, officers, sponsors, stories }));
  })().catch((e) => {
    console.error("[sync-images] failed:", e);
    process.exit(1);
  });
}
