# Esports at UCF (EUCF) Website

The official website for **Esports at UCF (EUCF)** — the esports club at the
University of Central Florida. It showcases the club's teams, rosters, officers,
sponsors, and featured stories across its competitive game titles.

Built with [Next.js](https://nextjs.org) (static export) and styled with
Tailwind CSS. Roster and content data is synced from Airtable at build time into
`eucf-website/src/data/generated/*.json` by `eucf-website/scripts/sync-airtable.ts`.

## Getting started

```bash
cd eucf-website
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) to view the site.

## Environment setup

Content sync requires Airtable credentials. Copy the example file and fill in
your own values — **never commit real credentials** (`.env.local` is gitignored):

```bash
cp eucf-website/.env.local.example eucf-website/.env.local
```

Required variables:

- `AIRTABLE_TOKEN` — Airtable Personal Access Token
- `AIRTABLE_BASE_ID` — the Airtable base ID

Then sync content with `npm run sync:content` (also runs automatically on `npm run build`).

## License

Code is licensed under the **MIT License** (see [LICENSE](LICENSE)).

Brand assets and third-party logos are **not** covered by the MIT grant — see
[NOTICE.md](NOTICE.md) for details.

© 2026 Esports at UCF (EUCF). Developed by Erika D'alzina and Tulio Contramaestre.
