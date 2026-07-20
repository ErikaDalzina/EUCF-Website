import { createHash } from "node:crypto";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import type { Attachment } from "../../scripts/lib/airtable";
import {
  firstAttachment,
  mapLimit,
  objectKey,
  originalExt,
  pendingOf,
  r2Env,
  type ImageJob,
} from "../../scripts/sync-images";

let warn: ReturnType<typeof vi.spyOn>;
beforeEach(() => {
  warn = vi.spyOn(console, "warn").mockImplementation(() => {});
});
afterEach(() => {
  warn.mockRestore();
  vi.unstubAllEnvs();
});

describe("originalExt", () => {
  it("maps known content types", () => {
    expect(originalExt("image/png", "a.png")).toBe("png");
    expect(originalExt("image/jpeg", "a")).toBe("jpg");
    expect(originalExt("image/svg+xml", "a")).toBe("svg");
  });

  it("strips content-type parameters", () => {
    expect(originalExt("image/jpeg; charset=binary", "a")).toBe("jpg");
  });

  it("falls back to the lowercased filename extension for unknown types", () => {
    expect(originalExt("application/octet-stream", "Photo.JPG")).toBe("jpg");
  });

  it("defaults to bin when nothing matches", () => {
    expect(originalExt("", "noextension")).toBe("bin");
  });
});

describe("objectKey", () => {
  it("builds images/<sha256>.<ext> from the content", () => {
    const data = Buffer.from("hello");
    const hash = createHash("sha256").update(data).digest("hex");
    expect(objectKey(data, "webp")).toBe(`images/${hash}.webp`);
  });

  it("is stable for identical bytes and distinct for different bytes", () => {
    const a = Buffer.from("same");
    expect(objectKey(a, "png")).toBe(objectKey(Buffer.from("same"), "png"));
    expect(objectKey(a, "png")).not.toBe(objectKey(Buffer.from("other"), "png"));
  });
});

describe("firstAttachment", () => {
  const att: Attachment = { id: "att1", url: "https://a.example/x.png" };

  it("returns the first valid attachment", () => {
    expect(firstAttachment([att, { id: "att2", url: "https://a.example/y.png" }])).toBe(att);
  });

  it("returns null for non-arrays, empty arrays, and malformed entries", () => {
    expect(firstAttachment("https://a.example/x.png")).toBeNull();
    expect(firstAttachment([])).toBeNull();
    expect(firstAttachment([{ id: "att1" }])).toBeNull();
  });
});

describe("pendingOf", () => {
  const job = (records: ImageJob["records"]): ImageJob => ({
    table: "players",
    records,
    attachmentField: "image upload",
    urlField: "image",
    profile: "photo",
    label: "players",
  });

  it("returns one pending entry per record with an attachment", () => {
    const withAtt = {
      id: "r1",
      fields: { "image upload": [{ id: "att1", url: "https://a.example/x.png" }] },
    };
    const withoutAtt = { id: "r2", fields: { image: "https://cdn.example/x.webp" } };

    const pending = pendingOf(job([withAtt, withoutAtt]));

    expect(pending).toHaveLength(1);
    expect(pending[0].record).toBe(withAtt);
    expect(pending[0].att.id).toBe("att1");
  });

  it("returns nothing when no record has attachments", () => {
    expect(pendingOf(job([{ id: "r1", fields: {} }]))).toEqual([]);
  });
});

describe("mapLimit", () => {
  it("preserves result order regardless of completion order", async () => {
    const delays = [30, 0, 15];
    const out = await mapLimit(delays, 2, async (d) => {
      await new Promise((r) => setTimeout(r, d));
      return d;
    });
    expect(out).toEqual(delays);
  });

  it("never runs more than `limit` tasks at once", async () => {
    let inFlight = 0;
    let peak = 0;
    await mapLimit([1, 2, 3, 4, 5], 2, async () => {
      inFlight++;
      peak = Math.max(peak, inFlight);
      await new Promise((r) => setTimeout(r, 5));
      inFlight--;
    });
    expect(peak).toBeLessThanOrEqual(2);
  });

  it("handles limits larger than the input and empty input", async () => {
    expect(await mapLimit([1, 2], 10, async (n) => n * 2)).toEqual([2, 4]);
    expect(await mapLimit([], 4, async () => "x")).toEqual([]);
  });
});

describe("r2Env", () => {
  const ALL = {
    R2_ACCOUNT_ID: "acct",
    R2_ACCESS_KEY_ID: "key",
    R2_SECRET_ACCESS_KEY: "secret",
    R2_BUCKET: "bucket",
    R2_PUBLIC_BASE_URL: "https://img.example.com/",
  };

  it("returns the config with the trailing slash stripped from the public URL", () => {
    for (const [k, v] of Object.entries(ALL)) vi.stubEnv(k, v);
    expect(r2Env()).toEqual({
      accountId: "acct",
      accessKeyId: "key",
      secretAccessKey: "secret",
      bucket: "bucket",
      publicBaseUrl: "https://img.example.com",
    });
  });

  it("returns null and warns, naming the missing variable", () => {
    for (const [k, v] of Object.entries(ALL)) vi.stubEnv(k, v);
    vi.stubEnv("R2_BUCKET", "");
    expect(r2Env()).toBeNull();
    expect(warn).toHaveBeenCalledWith(expect.stringContaining("R2_BUCKET"));
  });
});
