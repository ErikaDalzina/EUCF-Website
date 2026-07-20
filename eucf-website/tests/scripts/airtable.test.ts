import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

type AirtableModule = typeof import("../../scripts/lib/airtable");

// The module reads AIRTABLE_TOKEN/AIRTABLE_BASE_ID at import time, so each
// test stubs env first and imports a fresh copy.
async function loadModule(env: Record<string, string> = {}): Promise<AirtableModule> {
  vi.resetModules();
  vi.stubEnv("AIRTABLE_TOKEN", env.AIRTABLE_TOKEN ?? "test-token");
  vi.stubEnv("AIRTABLE_BASE_ID", env.AIRTABLE_BASE_ID ?? "appTEST");
  return import("../../scripts/lib/airtable");
}

const okJson = (body: unknown) =>
  ({ ok: true, status: 200, json: async () => body, text: async () => JSON.stringify(body) }) as Response;
const errRes = (status: number, body = "err") =>
  ({ ok: false, status, json: async () => ({}), text: async () => body }) as Response;

let fetchMock: ReturnType<typeof vi.fn>;
let warn: ReturnType<typeof vi.spyOn>;

beforeEach(() => {
  vi.useFakeTimers();
  fetchMock = vi.fn();
  vi.stubGlobal("fetch", fetchMock);
  warn = vi.spyOn(console, "warn").mockImplementation(() => {});
});

afterEach(() => {
  vi.useRealTimers();
  vi.unstubAllEnvs();
  vi.unstubAllGlobals();
  warn.mockRestore();
});

describe("hasAirtableCreds", () => {
  it("is true when both token and base id are set", async () => {
    const mod = await loadModule();
    expect(mod.hasAirtableCreds()).toBe(true);
  });

  it("is false when either is missing", async () => {
    const noToken = await loadModule({ AIRTABLE_TOKEN: "" });
    expect(noToken.hasAirtableCreds()).toBe(false);
    const noBase = await loadModule({ AIRTABLE_BASE_ID: "" });
    expect(noBase.hasAirtableCreds()).toBe(false);
  });
});

describe("fetchAll", () => {
  it("fetches a single page with view, pageSize, auth header, and encoded table name", async () => {
    const mod = await loadModule();
    fetchMock.mockResolvedValueOnce(okJson({ records: [{ id: "r1", fields: {} }] }));

    const records = await mod.fetchAll("my table", "Grid view");

    expect(records).toEqual([{ id: "r1", fields: {} }]);
    expect(fetchMock).toHaveBeenCalledTimes(1);
    const [url, init] = fetchMock.mock.calls[0] as [URL, RequestInit];
    expect(url.pathname).toBe("/v0/appTEST/my%20table");
    expect(url.searchParams.get("view")).toBe("Grid view");
    expect(url.searchParams.get("pageSize")).toBe("100");
    expect((init.headers as Record<string, string>).Authorization).toBe("Bearer test-token");
  });

  it("follows pagination offsets until exhausted", async () => {
    const mod = await loadModule();
    fetchMock
      .mockResolvedValueOnce(okJson({ records: [{ id: "r1", fields: {} }], offset: "off1" }))
      .mockResolvedValueOnce(okJson({ records: [{ id: "r2", fields: {} }] }));

    const records = await mod.fetchAll("players");

    expect(records.map((r) => r.id)).toEqual(["r1", "r2"]);
    const secondUrl = fetchMock.mock.calls[1][0] as URL;
    expect(secondUrl.searchParams.get("offset")).toBe("off1");
  });

  it("retries a 429 with backoff and succeeds", async () => {
    const mod = await loadModule();
    fetchMock
      .mockResolvedValueOnce(errRes(429))
      .mockResolvedValueOnce(okJson({ records: [{ id: "r1", fields: {} }] }));

    const promise = mod.fetchAll("players");
    await vi.advanceTimersByTimeAsync(1000);
    const records = await promise;

    expect(records).toHaveLength(1);
    expect(fetchMock).toHaveBeenCalledTimes(2);
  });

  it("gives up after 5 retries of 429", async () => {
    const mod = await loadModule();
    fetchMock.mockResolvedValue(errRes(429, "rate limited"));

    const promise = mod.fetchAll("players");
    const assertion = expect(promise).rejects.toThrow('Airtable "players" 429');
    await vi.advanceTimersByTimeAsync(1000 + 2000 + 3000 + 4000 + 5000);
    await assertion;
    expect(fetchMock).toHaveBeenCalledTimes(6);
  });

  it("falls back to fetching without a view on 422", async () => {
    const mod = await loadModule();
    fetchMock
      .mockResolvedValueOnce(errRes(422))
      .mockResolvedValueOnce(okJson({ records: [{ id: "r1", fields: {} }] }));

    const records = await mod.fetchAll("titles", "Missing view");

    expect(records).toHaveLength(1);
    expect(warn).toHaveBeenCalledWith(expect.stringContaining('view "Missing view" not found'));
    const secondUrl = fetchMock.mock.calls[1][0] as URL;
    expect(secondUrl.searchParams.get("view")).toBeNull();
  });

  it("throws on 422 when no view was requested", async () => {
    const mod = await loadModule();
    fetchMock.mockResolvedValueOnce(errRes(422, "bad request"));
    await expect(mod.fetchAll("titles")).rejects.toThrow('Airtable "titles" 422: bad request');
  });

  it("throws on other HTTP errors with status and body", async () => {
    const mod = await loadModule();
    fetchMock.mockResolvedValueOnce(errRes(500, "boom"));
    await expect(mod.fetchAll("titles")).rejects.toThrow('Airtable "titles" 500: boom');
  });
});

describe("patchRecords", () => {
  const updates = (n: number) =>
    Array.from({ length: n }, (_, i) => ({ id: `r${i}`, fields: { x: i } }));

  it("chunks updates into batches of 10 with a delay between chunks", async () => {
    const mod = await loadModule();
    fetchMock.mockResolvedValue(okJson({}));

    const promise = mod.patchRecords("players", updates(23));
    await vi.advanceTimersByTimeAsync(500);
    await promise;

    expect(fetchMock).toHaveBeenCalledTimes(3);
    const sizes = fetchMock.mock.calls.map(
      (c) => (JSON.parse((c[1] as RequestInit).body as string) as { records: unknown[] }).records.length
    );
    expect(sizes).toEqual([10, 10, 3]);
    const [endpoint, init] = fetchMock.mock.calls[0] as [string, RequestInit];
    expect(endpoint).toBe("https://api.airtable.com/v0/appTEST/players");
    expect(init.method).toBe("PATCH");
  });

  it("retries a chunk on 429", async () => {
    const mod = await loadModule();
    fetchMock.mockResolvedValueOnce(errRes(429)).mockResolvedValue(okJson({}));

    const promise = mod.patchRecords("players", updates(5));
    await vi.advanceTimersByTimeAsync(1000);
    await promise;

    expect(fetchMock).toHaveBeenCalledTimes(2);
  });

  it("throws when a chunk fails with a non-429 error", async () => {
    const mod = await loadModule();
    fetchMock.mockResolvedValueOnce(errRes(403, "forbidden"));
    await expect(mod.patchRecords("players", updates(1))).rejects.toThrow(
      'Airtable PATCH "players" 403: forbidden'
    );
  });
});
