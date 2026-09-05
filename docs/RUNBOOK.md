# EUCF Website — Content Runbook

For officers and anyone editing the site's content. Developer setup lives in the
[README](../README.md).

## What publishes the site

Airtable is the CMS. At build time, `eucf-website/scripts/sync-airtable.ts`
pulls every table into `eucf-website/src/data/generated/*.json`, and the site is
built as static HTML and served by Cloudflare Pages.

Nothing is read from Airtable while people are browsing the site. **A change in
Airtable is only live after a rebuild.**

## Airtable field contract

> **Column names are code.** Every field below is looked up by its exact name in
> `F` in [`eucf-website/scripts/lib/airtable.ts`](../eucf-website/scripts/lib/airtable.ts).
> Renaming a column in Airtable without changing that file does not cause an
> obvious error — it makes the affected content silently disappear. If a name
> really must change, change it in both places, or set the matching
> `AIRTABLE_TABLE_*` / `AIRTABLE_VIEW_*` environment variable.
>
> Adding new columns is always safe. The sync ignores anything it isn't told to read.

### `titles` — one row per game

| Field | Type | What it does |
| --- | --- | --- |
| `name` | text | Display name, e.g. "Marvel Rivals" |
| `slug` | text | The URL: `/titles/<slug>`. Must be unique. Changing it changes the page's address and breaks existing links |
| `description` | text | Blurb under the title heading |
| `icon` | text / URL | Title logo. Filled in automatically from `icon upload` |
| `icon upload` | attachment | Drop a new logo here — see [Images](../README.md#images-airtable--r2-pipeline) |

### `teams` — one row per roster

| Field | Type | What it does |
| --- | --- | --- |
| `team name` | text | The heading above the roster, e.g. "Marvel Rivals A Team" |
| `title` | link → `titles` | Which game page this team appears on |

Three things to know:

- **Rosters are grouped by `team name` as text.** Two team rows with the same
  name under the same title merge into a single roster on the site.
- **If `title` is empty, every player on that team disappears from the site.**
  The team has no page to appear on.
- **Team sections appear in the order the rows sit in this table** — the higher
  row renders higher on the game page. Drag a row to reorder. `team name` is
  only a heading and has no say in the order, so "Gold" / "Black" or
  "Knights" / "Academy" work exactly as well as "A Team" / "B Team".

A title's rows don't have to be next to each other — only which row is higher
matters. With this grid:

| row | team name |
| --- | --- |
| 1 | Marvel Rivals B Team |
| 2 | Valorant A Team |
| 3 | Valorant B Team |
| 4 | Marvel Rivals A Team |

the Marvel Rivals page shows **B Team then A Team**, and Valorant shows A then B.
Keeping each game's rows together is still worth doing so the page order is
readable at a glance — but it's a courtesy to the next editor, not a rule.

Two consequences worth knowing: **dragging a row silently reorders a game page**,
and **a sort on the `teams` Grid view breaks this** — Airtable disables
drag-to-reorder on a sorted view and hands the site the sorted order instead.
Leave that view unsorted.

### `players` — one row per person

| Field | Type | What it does |
| --- | --- | --- |
| `ign` | text | **Required.** The name shown on the card |
| `real name` | text | Optional, shown in the pop-up |
| `main teams` | link → `teams`, **multiple** | Every team where they are a main roster player |
| `sub teams` | link → `teams`, **multiple** | Every team where they are a substitute |
| `role` | text | Optional, e.g. "Duelist" |
| `order` | number | Sort position within a roster. Missing counts as `0` |
| `bio` | text | Optional, shown in the pop-up |
| `image` | text / URL | Player photo. Filled in automatically from `image upload` |
| `image upload` | attachment | Drop a new photo here |
| `x`, `twitch`, `youtube`, `instagram`, `tiktok` | URL | Optional. **Must start with `https://`** or they are dropped |

How main vs sub is decided: **purely by which field the link is in.** There is no
separate "main or sub" column. A player appears on every team listed across both
fields, and can be a main on one team and a sub on another.

### `officers`, `sponsors`, `featuredstory`, `about`

| Table | Fields |
| --- | --- |
| `officers` | `name`, `position`, `image`, `image upload` |
| `sponsors` | `name`, `website` (https only), `logo`, `logo upload` |
| `featuredstory` | `title`, `body`, `href` (https only), `image`, `image upload`, `image alt` |
| `about` | `title`, `eyebrow`, `description`, `image`, `image upload`, `image alt` |

`about` drives the whole `/about` page — one row per pillar, rendered as a row of
tabs with one pillar shown at a time. Top-to-bottom order in the grid becomes
left-to-right tab order. Add a row to add a tab; delete one to remove it.
`image alt` describes the image for screen readers and can be left empty when the
image is purely decorative.

Two things worth knowing before you edit `about`:

- **`title` is also the tab label**, so keep it to one or two words. Long titles
  wrap onto two lines and squeeze the other tabs.
- **`eyebrow` is the small gold kicker above each heading** ("Who we are", "On
  the stage", …). Keep it to two or three words. Leaving it blank is fine — the
  pillar just renders without a kicker, and nothing fails.

One thing on the About page is *not* editable here: the small pill tags under
the Compete description. They're a fixed list in
[`src/data/about.ts`](../eucf-website/src/data/about.ts) and need a developer to
change.

### Views

Every table except `players` is read through a view named **`Grid view`**, which
is what gives them their top-to-bottom order. Renaming that view doesn't break
the build, but the order becomes arbitrary (a warning appears in the build log).

For `teams` that order is what decides which roster renders first on a game page
(see [`teams`](#teams--one-row-per-roster) above), so a renamed or sorted
`teams` view scrambles the A/B/C order rather than just shuffling a fetch.

`titles` is the exception: the Titles page lists games **alphabetically by
`name`**, whatever order the rows are in. Dragging rows in `titles` changes
nothing you can see on the site.

`players` is read without a view — its order comes from the `order` field
instead, so it doesn't matter how the grid is sorted.

## What fails the build, and why that's safe

Before anything is published, the content is checked by
[`validate.ts`](../eucf-website/scripts/lib/validate.ts). If any of these are
true, the build stops:

- A title has no `name` or no `slug`
- Two titles share the same `slug`
- The `titles` table is empty
- The `about` table is empty, or a section in it has no `title`
- A team has no `team name`
- A player has no `ign`
- **Two players with the same `ign` on the same team**
- **Player rows exist in Airtable but none of them landed on any team**
- Any image, logo, `website`, or `href` that isn't `https://` or a `/path`
- A roster grouped under a slug with no matching title

**A failed build changes nothing.** The site that's currently live stays live,
exactly as it is. There is no half-published state, and nothing to undo — fix
the problem in Airtable and publish again. The reason is printed in the
Cloudflare build log, prefixed with `content validation failed:`.

Two of these deserve a note:

**"Two players with the same ign on the same team"** — almost always the intake
form submitted twice by the same person. Delete the extra row. The same IGN on
*different* teams is fine and will never be flagged: that's either one player on
two rosters, or two different people who picked similar handles.

**"Player rows exist but none landed on any team"** — this is not the same as an
empty roster. It means the links stopped resolving: a renamed column, or teams
missing their `title` link. Check `main teams` / `sub teams` on `players`, and
`title` on `teams`.

**An empty roster is not an error.** A title with no players publishes normally
and shows "Roster coming soon; check back later!" on its page. That's expected
for a new game, or during intake after a season changeover.

## Editing content

**Add a new player** — send them the intake form, or add a row to `players`
directly. At minimum they need an `ign` and at least one entry in `main teams`
or `sub teams`.

**A returning player** — **edit their existing row. Do not send them the form
again.** Re-submitting creates a second row, which produces a duplicate card and
fails the build. Editing in place also keeps their bio, photo, and socials
instead of making them re-enter everything.

**Move a player between teams** — change their `main teams` / `sub teams` links.
Nothing else needs updating.

**Put a player on two teams** — add both teams to `main teams`. If they're a main
on one and a sub on the other, put each team in the matching field.

**Change someone from main to sub** — move the team link from `main teams` to
`sub teams`.

**Remove a player** — delete the row, or clear both team links. Either removes
them from the site; clearing the links keeps their record around.

**Add a team to a game** — add a row to `teams` with a `team name` and the
`title` link, drag it into position among that game's other rows, then link
players to it from `main teams` / `sub teams`. A C team needs no code change and
no developer; the page grows a third section on the next publish.

> **The team won't appear until at least one player links to it.** Rosters are
> built from player links, so a `teams` row nobody is on produces nothing at all
> — no heading, no empty section. Publishing the row by itself looks like a
> broken publish, but the row is fine; there is simply nothing on it yet.

**Remove a team** — clear it from every player's `main teams` / `sub teams`, then
delete the row. If it was the game's only team, the page still publishes and
shows "Roster coming soon; check back later!".

**Add a game title** — add a row to `titles` with `name`, `slug`, `description`,
and a logo in `icon upload`. The page at `/titles/<slug>`, its card on the Titles
page, and its sitemap entry all appear automatically.

**Retire a game title** — delete its `teams` rows **before** the `titles` row. A
team whose `title` link points at nothing silently drops all of its players
instead of failing the build, so doing it in the other order hides the mistake.
Note the old `/titles/<slug>` URL will 404 afterwards — there is no redirect, so
anything linking to it (socials, printed material) goes dead.

**Change a photo** — drag a new image into the `image upload` field. See
[Images](../README.md#images-airtable--r2-pipeline) in the README for how the
pipeline works and what happens to the original.

## Season changeover

Airtable's free tier caps the base at 1,000 records, so old rosters can't
accumulate there. **Git is the archive** — every sync commits the generated JSON,
so each season is preserved permanently in the repo.

**Archive before you clear anything:**

```bash
cd eucf-website
npm run sync:content
git add src/data/generated/
git commit -m "chore: snapshot 2026-27 roster"
git tag roster-2026-27
git push origin main --tags
```

To read a past season back:

```bash
git show roster-2026-27:eucf-website/src/data/generated/players.json
```

Then, in order:

1. Delete the rows for players who have left.
2. Edit returning players in place — update their `main teams` / `sub teams`.
3. Send the intake form to new members only.

Between clearing and the first submissions, the site will show "Roster coming
soon" on the affected pages. That's expected and publishes fine.

> **Windows note:** any Windows shell works — PowerShell, Git Bash, or cmd.
> Avoid **WSL**: `node_modules` holds Windows-native binaries (esbuild, sharp),
> so Linux-side Node can't run them. See the
> [README](../README.md#environment-setup).

## Publishing

> Setting up the publish button itself — the deploy hook, the `deploy` table, and
> the automation behind it — is documented in [SETUP.md](SETUP.md#part-4--publishing-from-airtable).

Editing Airtable does **not** change the site. The site is rebuilt from scratch
each time you publish, and whatever is in Airtable at that moment is what ships.

To publish:

1. Make and review all your changes in Airtable.
2. Open the **`deploy`** table and tick the **`publish`** checkbox.
3. The checkbox unticks itself once the build has been triggered — that's your
   confirmation the request went through, not that the build finished.
4. Wait a few minutes, then hard-refresh the site and check your change.

A few things worth knowing:

- **Publishing is all-or-nothing.** Every pending change in Airtable goes live
  together. There's no way to publish one team and hold back another — stage
  edits so the base is always in a state you're happy to ship.
- **Ticking the box again starts another build.** If nothing seems to be
  happening, work through the section below rather than ticking repeatedly.
- **Code changes publish separately.** Anything merged to the `main` branch
  rebuilds the site on its own; you don't need to publish for that.

## When a publish doesn't go through

Work down this list in order — each step tells you which system to look at next.

**1. Did the `publish` checkbox untick itself?**
If it's still ticked, the Airtable automation never ran. Open **Automations**,
find the publish automation, and check its **run history** for the failed run
and its error.

**2. Did a new deployment appear in Cloudflare Pages?**
If the checkbox cleared but no deployment started, the automation ran but the
request to Cloudflare failed. The error will be on the script step in that same
run history — most likely the deploy hook URL is wrong or was regenerated.

**3. Did the deployment fail?**
Open the build log and search for `content validation failed:`. If it's there,
this is a **content problem, not a site problem** — the message names the table,
the team, and usually the player. Fix it in Airtable and publish again. See
[What fails the build](#what-fails-the-build-and-why-thats-safe).

**Nothing was published, and the live site is untouched.** A failed build never
takes the site down.

**4. Build succeeded but your change isn't visible?**
Hard-refresh the page first. Then confirm you edited the right record, and that
the field you changed is one the sync actually reads — see
[Airtable field contract](#airtable-field-contract). A field the sync ignores
will never appear on the site no matter how many times you publish.

**5. Rosters show `The Goat`, `Player2`, `Player3`…?**
Those are placeholder names. The build couldn't reach Airtable and fell back to
the sample data committed in the repo. The Airtable environment variables on the
Cloudflare Pages project are missing, wrong, or the token expired. This one needs
a developer.

## Rolling back

If a publish put something wrong on the site, you don't need to fix Airtable
first — you can put the previous version back immediately.

In the Cloudflare Pages project, open **Deployments**, find the last deployment
you know was good, and use its **Rollback** action. It takes effect right away;
no rebuild runs, and nothing in Airtable or the repo changes.

> **Rolling back does not fix Airtable.** The site reverts, but the bad content
> is still sitting in the base — so the *next* publish, by anyone, ships it
> again. Always correct the content in Airtable too, then publish normally.

You don't need to roll back a **failed** build. A build that fails never
replaces the live site, so there's nothing to undo.

## Image hosting (for developers)

Photos and logos are served from `assets.esportsatucf.com`, backed by the
Cloudflare R2 bucket `eucf-images`. The bucket is **world-readable** — anything
put in it is public. Never use it for backups, exports, or member data.

The R2 API token has no expiry, so image uploads can't silently break
mid-semester. It should still be **rotated at officer turnover** — the procedure
is in [SETUP.md](SETUP.md#rotating-credentials).

If images stop updating, the token is the first thing to check: a bad token
fails the image step only — the build still succeeds and the site still
publishes, just without the new photos.
