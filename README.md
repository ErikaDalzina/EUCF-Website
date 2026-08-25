# Esports at UCF (EUCF) Website

The official website for **Esports at UCF (EUCF)**. The esports club at the
University of Central Florida. It showcases the club's teams, rosters, officers,
sponsors, and featured stories across its competitive game titles.

Built with [Next.js](https://nextjs.org) (static export) and styled with
Tailwind CSS. Roster and content data is synced from Airtable at build time into
`eucf-website/src/data/generated/*.json` by `eucf-website/scripts/sync-airtable.ts`.

> Editing rosters or other content in Airtable? See the
> **[Content Runbook](docs/RUNBOOK.md)**: field names, what fails a build, and
> the season changeover process.

## Getting started

```bash
cd eucf-website
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) to view the site.

## Environment setup

Content sync requires Airtable credentials. Copy the example file and fill in
your own values, **never commit real credentials** (`.env.local` is gitignored):

```bash
cp eucf-website/.env.local.example eucf-website/.env.local
```

Required variables:

- `AIRTABLE_TOKEN`: Airtable Personal Access Token with scopes
  `data.records:read` **and** `data.records:write` on the base (write is used by
  the image pipeline to store R2 URLs back into records)
- `AIRTABLE_BASE_ID`: the Airtable base ID
- `R2_ACCOUNT_ID`, `R2_ACCESS_KEY_ID`, `R2_SECRET_ACCESS_KEY`, `R2_BUCKET`,
  `R2_PUBLIC_BASE_URL`: Cloudflare R2 credentials for the image pipeline (see
  below). If unset, the image step is skipped with a warning and the rest of the
  sync still works.

Then sync content with `npm run sync:content` (also runs automatically on `npm run build`).

> **Windows note:** run npm commands from a **Windows shell** — PowerShell, Git
> Bash, and cmd all work. Avoid **WSL**: `node_modules` must stay Windows-native
> (esbuild/sharp ship per-platform binaries) and Linux-side Node can't run them.
> If it was ever installed from WSL by mistake, delete `node_modules` and re-run
> `npm ci` from a Windows shell — `Remove-Item -Recurse node_modules; npm ci`
> (PowerShell) or `rm -rf node_modules && npm ci` (Git Bash).

## Images (Airtable → R2 pipeline)

Airtable attachment URLs expire ~2 hours after fetch, so images can't be served
from Airtable. Instead, `eucf-website/scripts/sync-images.ts` runs before every
build (and manually via `npm run sync:images`) and, for each record with an
attachment in its `* upload` column:

1. downloads the attachment and optimizes it with sharp (resized, converted to
   webp, transparency is preserved; SVG/GIF pass through untouched),
2. uploads it to R2 under a content-hash key (identical images are stored once)
   with immutable cache headers,
3. writes the public R2 URL into the main image column (`image` / `icon` /
   `logo`) and **clears the upload attachment** (keeps the base under
   Airtable's free-tier 1GB attachment cap, only the optimized copy is kept,
   in R2).

**Editor workflow:** drag an image into the upload field (`image upload` /
`icon upload` / `logo upload`) and trigger a rebuild. The next build fills the
`image` / `icon` / `logo` column with the image's URL and removes the upload.
**To replace an image, just upload a new attachment**: the column is
overwritten. Keep your own copy of originals; Airtable does not retain them
after processing.

Static site assets referenced by path (e.g. `/VALlogo.png` for title logos,
served from `eucf-website/public/`) keep working as-is: the pipeline only acts
on upload attachments and never touches path values in the image columns.

**One-time setup** (Cloudflare dashboard):

1. R2 → create bucket `eucf-images`, location hint **ENAM**, storage class
   **Standard**. Not Infrequent Access: the library sits well inside R2's free
   10 GB, while IA adds a per-GB retrieval fee on every CDN cache miss and a
   30-day minimum storage duration on orphaned replacements.
2. Bucket → Settings → Public access: leave the **r2.dev subdomain disabled**
   (uncached, rate-limited, dev-only) and **Connect Domain** →
   `assets.esportsatucf.com`. That hostname serves read-only GETs through
   Cloudflare's CDN; the S3 API endpoint stays credential-only. It is already
   listed in `img-src` in `eucf-website/public/_headers`.
   The bucket is a public asset host — never put anything in it that isn't
   meant to be world-readable.
3. R2 → API tokens → create a token scoped to **`eucf-images` only** with
   *Object Read & Write* (read is required for the HEAD-before-PUT dedup) and
   **no expiry** → gives the access key id + secret. Rotate at officer
   turnover; see the [runbook](docs/RUNBOOK.md#image-hosting-for-developers).
4. Add the `R2_*` variables and the write-scoped `AIRTABLE_TOKEN` to the
   Cloudflare Pages project's environment variables (Production + Preview),
   marking the keys and tokens as **Secret / encrypted**, not plaintext.
5. In Airtable, add an **attachment**-type field next to each image column:
   `titles` → `icon upload`, `players` → `image upload`, `officers` →
   `image upload`, `sponsors` → `logo upload`, `featuredstory` →
   `image upload`, `about` → `image upload` (names must match `F` in
   `eucf-website/scripts/lib/airtable.ts` exactly). The existing image columns
   stay as they are, any text-ish type (long text, single line, URL) works.

Old images left in R2 by replacements are ~20–400KB each and are deliberately
not garbage-collected (the whole library is a few tens of MB against R2's free
10GB); a manual GC script can be added if storage ever becomes a concern.

## License

© 2026 Esports at UCF (EUCF). **All Rights Reserved.** This project is
proprietary — the source code is **not** offered under an open-source license
(see [LICENSE](LICENSE)).

Third-party trademarks, logos, and roster personal data are **not** owned by EUCF
and are not covered by this claim — see [NOTICE.md](NOTICE.md).

Developed by Erika D'Alzina and Tulio Contramaestre.
