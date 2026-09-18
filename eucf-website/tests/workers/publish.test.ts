import { afterEach, beforeAll, beforeEach, describe, expect, it, vi } from "vitest";
import { SignJWT, createLocalJWKSet, exportJWK, generateKeyPair } from "jose";
import { createWorker, type Env } from "../../workers/publish/index";

type PrivateKey = Awaited<ReturnType<typeof generateKeyPair>>["privateKey"];

const TEAM = "https://eucf-test.cloudflareaccess.com";
const AUD = "test-aud";
const ORIGIN = "https://publish.example.com";
const env: Env = {
  DEPLOY_HOOK_URL: "https://hooks.example/deploy",
  ACCESS_TEAM_DOMAIN: TEAM,
  ACCESS_AUD: AUD,
};

let worker: ReturnType<typeof createWorker>;
let signingKey: PrivateKey;
let fetchMock: ReturnType<typeof vi.fn>;

async function keyPair() {
  const { publicKey, privateKey } = await generateKeyPair("RS256");
  return { privateKey, jwk: { ...(await exportJWK(publicKey)), kid: "k1", alg: "RS256" } };
}

function sign(opts: { aud?: string; exp?: number | string; key?: PrivateKey } = {}) {
  return new SignJWT({})
    .setProtectedHeader({ alg: "RS256", kid: "k1" })
    .setIssuer(TEAM)
    .setAudience(opts.aud ?? AUD)
    .setIssuedAt()
    .setExpirationTime(opts.exp ?? "1h")
    .sign(opts.key ?? signingKey);
}

type CallOptions = {
  method?: string;
  path?: string;
  token?: string | null;
  origin?: string | null;
  env?: Env;
};

async function call(opts: CallOptions = {}): Promise<Response> {
  const headers = new Headers();
  const token = opts.token === undefined ? await sign() : opts.token;
  if (token) headers.set("Cf-Access-Jwt-Assertion", token);
  const origin = opts.origin === undefined ? ORIGIN : opts.origin;
  if (origin) headers.set("Origin", origin);
  const request = new Request(`${ORIGIN}${opts.path ?? "/"}`, {
    method: opts.method ?? "GET",
    headers,
  });
  return worker.fetch(request, opts.env ?? env);
}

beforeAll(async () => {
  const { privateKey, jwk } = await keyPair();
  signingKey = privateKey;
  const keys = createLocalJWKSet({ keys: [jwk] });
  worker = createWorker(() => keys);
});

beforeEach(() => {
  fetchMock = vi.fn().mockResolvedValue(new Response(null, { status: 200 }));
  vi.stubGlobal("fetch", fetchMock);
  vi.spyOn(console, "error").mockImplementation(() => {});
});

afterEach(() => {
  vi.unstubAllGlobals();
  vi.restoreAllMocks();
});

describe("access check", () => {
  it("rejects requests without an Access token", async () => {
    const res = await call({ method: "POST", token: null });
    expect(res.status).toBe(403);
    expect(fetchMock).not.toHaveBeenCalled();
  });

  it("rejects a token issued for a different Access application", async () => {
    const res = await call({ method: "POST", token: await sign({ aud: "other-app" }) });
    expect(res.status).toBe(403);
    expect(fetchMock).not.toHaveBeenCalled();
  });

  it("rejects an expired token", async () => {
    const res = await call({ token: await sign({ exp: Math.floor(Date.now() / 1000) - 60 }) });
    expect(res.status).toBe(403);
  });

  it("rejects a token signed by a key Access doesn't publish", async () => {
    const { privateKey } = await keyPair();
    const res = await call({ method: "POST", token: await sign({ key: privateKey }) });
    expect(res.status).toBe(403);
    expect(fetchMock).not.toHaveBeenCalled();
  });

  it("refuses to run when a setting is missing", async () => {
    const res = await call({ method: "POST", env: { ...env, ACCESS_AUD: "" } });
    expect(res.status).toBe(500);
    expect(fetchMock).not.toHaveBeenCalled();
  });
});

describe("publishing", () => {
  it("shows the confirmation form on GET without starting a build", async () => {
    const res = await call();
    expect(res.status).toBe(200);
    expect(res.headers.get("content-type")).toContain("text/html");
    expect(res.headers.get("content-security-policy")).toContain("default-src 'none'");
    expect(res.headers.get("cache-control")).toBe("no-store");
    expect(await res.text()).toContain('<form method="post">');
    expect(fetchMock).not.toHaveBeenCalled();
  });

  it("sets a referrer policy that still sends Origin on the form POST", async () => {
    const res = await call();
    expect(res.headers.get("referrer-policy")).toBe("same-origin");
  });

  it("POSTs the deploy hook once and redirects to the started banner", async () => {
    const res = await call({ method: "POST" });
    expect(res.status).toBe(303);
    expect(res.headers.get("location")).toBe("/?status=started");
    expect(fetchMock).toHaveBeenCalledTimes(1);
    expect(fetchMock).toHaveBeenCalledWith(env.DEPLOY_HOOK_URL, { method: "POST" });
  });

  it("rejects a POST from another origin", async () => {
    const res = await call({ method: "POST", origin: "https://evil.example" });
    expect(res.status).toBe(403);
    expect(fetchMock).not.toHaveBeenCalled();
  });

  it("rejects a POST with no Origin header", async () => {
    const res = await call({ method: "POST", origin: null });
    expect(res.status).toBe(403);
    expect(fetchMock).not.toHaveBeenCalled();
  });

  it("redirects to the failure banner with the hook's status", async () => {
    fetchMock.mockResolvedValueOnce(new Response("nope", { status: 500 }));
    const res = await call({ method: "POST" });
    expect(res.status).toBe(303);
    expect(res.headers.get("location")).toBe("/?status=failed&code=500");
  });

  it("reports a failure when the hook can't be reached", async () => {
    fetchMock.mockRejectedValueOnce(new TypeError("fetch failed"));
    const res = await call({ method: "POST" });
    expect(res.status).toBe(303);
    expect(res.headers.get("location")).toBe("/?status=failed");
  });

  it("renders the result banners", async () => {
    expect(await (await call({ path: "/?status=started" })).text()).toContain("Build started");
    expect(await (await call({ path: "/?status=failed&code=500" })).text()).toContain(
      "Publish failed (status 500)"
    );
  });

  it("drops the button once a build has started, and keeps it when one failed", async () => {
    const started = await (await call({ path: "/?status=started" })).text();
    expect(started).toContain("Build started");
    expect(started).not.toContain("<form");

    const failed = await (await call({ path: "/?status=failed&code=500" })).text();
    expect(failed).toContain('<form method="post">');
  });

  it("never echoes query text into the page", async () => {
    const res = await call({ path: "/?status=failed&code=<script>alert(1)</script>" });
    const body = await res.text();
    expect(body).toContain("Publish failed.");
    expect(body).not.toContain("<script");
  });
});

describe("routing", () => {
  it("rejects other methods with an Allow header", async () => {
    const res = await call({ method: "PUT" });
    expect(res.status).toBe(405);
    expect(res.headers.get("allow")).toBe("GET, POST");
  });

  it("returns 404 for any other path", async () => {
    const res = await call({ path: "/favicon.ico" });
    expect(res.status).toBe(404);
  });
});
