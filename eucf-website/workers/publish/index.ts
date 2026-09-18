import { createRemoteJWKSet, jwtVerify, type JWTVerifyGetKey } from "jose";

export type Env = {
  DEPLOY_HOOK_URL: string;
  ACCESS_TEAM_DOMAIN: string;
  ACCESS_AUD: string;
};

const SECURITY_HEADERS = {
  "Content-Security-Policy":
    "default-src 'none'; style-src 'unsafe-inline'; form-action 'self'; frame-ancestors 'none'; base-uri 'none'",
  "Cache-Control": "no-store",
  "X-Content-Type-Options": "nosniff",
  "Referrer-Policy": "same-origin",
};

const text = (body: string, status: number, headers: Record<string, string> = {}) =>
  new Response(body, {
    status,
    headers: { ...SECURITY_HEADERS, "Content-Type": "text/plain; charset=utf-8", ...headers },
  });

const redirect = (location: string) =>
  new Response(null, { status: 303, headers: { ...SECURITY_HEADERS, Location: location } });

function banner(params: URLSearchParams): string {
  const status = params.get("status");
  if (status === "started") {
    return `<p class="ok">Build started. The site updates in a few minutes.</p>`;
  }
  if (status === "failed") {
    const code = Number(params.get("code"));
    const detail = Number.isInteger(code) && code >= 100 && code <= 599 ? ` (status ${code})` : "";
    return `<p class="err">Publish failed${detail}. Ask a developer to check the deploy hook.</p>`;
  }
  return "";
}

const page = (notice: string, started: boolean) => `<!doctype html>
<html lang="en">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>Publish esportsatucf.com</title>
<style>
body{font-family:system-ui,sans-serif;max-width:32rem;margin:4rem auto;padding:0 1rem;line-height:1.5}
button{font:inherit;padding:.6rem 1.2rem;cursor:pointer}
.ok{color:#15603a}
.err{color:#a3261a}
</style>
</head>
<body>
<h1>Publish esportsatucf.com</h1>
${notice}
${
  started
    ? `<p>Check the site in a few minutes.</p>
<p><a href="/">Publish again</a></p>`
    : `<p>Publishing rebuilds the site from whatever is in Airtable right now.</p>
<form method="post"><button type="submit">Publish now</button></form>`
}
</body>
</html>`;

export function createWorker(getKeys: (env: Env) => JWTVerifyGetKey) {
  async function isAuthorized(request: Request, env: Env): Promise<boolean> {
    const token = request.headers.get("Cf-Access-Jwt-Assertion");
    if (!token) return false;
    try {
      await jwtVerify(token, getKeys(env), {
        issuer: env.ACCESS_TEAM_DOMAIN.replace(/\/+$/, ""),
        audience: env.ACCESS_AUD,
        algorithms: ["RS256"],
      });
      return true;
    } catch (e) {
      console.error("access token rejected:", e instanceof Error ? e.message : e);
      return false;
    }
  }

  async function triggerBuild(env: Env): Promise<string> {
    try {
      const res = await fetch(env.DEPLOY_HOOK_URL, { method: "POST" });
      if (res.ok) return "/?status=started";
      console.error(`deploy hook returned ${res.status}`);
      return `/?status=failed&code=${res.status}`;
    } catch (e) {
      console.error("deploy hook unreachable:", e);
      return "/?status=failed";
    }
  }

  return {
    async fetch(request: Request, env: Env): Promise<Response> {
      if (!env.DEPLOY_HOOK_URL || !env.ACCESS_TEAM_DOMAIN || !env.ACCESS_AUD) {
        return text("Publish page is not configured.", 500);
      }

      const url = new URL(request.url);
      if (url.pathname !== "/") return text("Not found", 404);
      if (!(await isAuthorized(request, env))) return text("Forbidden", 403);

      if (request.method === "GET") {
        const params = url.searchParams;
        return new Response(page(banner(params), params.get("status") === "started"), {
          headers: { ...SECURITY_HEADERS, "Content-Type": "text/html; charset=utf-8" },
        });
      }
      if (request.method !== "POST") {
        return text("Method not allowed", 405, { Allow: "GET, POST" });
      }
      if (request.headers.get("Origin") !== url.origin) return text("Forbidden", 403);

      return redirect(await triggerBuild(env));
    },
  };
}

let remoteKeys: JWTVerifyGetKey | undefined;

export default createWorker(
  (env) =>
    (remoteKeys ??= createRemoteJWKSet(new URL("/cdn-cgi/access/certs", env.ACCESS_TEAM_DOMAIN)))
);
