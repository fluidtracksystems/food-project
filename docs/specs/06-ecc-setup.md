# 06 - ECC setup (project-init and configure-ecc)

Status: DRAFT. Re-run from the project root on 2026-11-04 after `ajv` was installed into the ECC plugin cache (option A, done by the owner). Nothing has been applied to this project.

## Re-run results (project root, 2026-11-04)

| Check | Result |
|---|---|
| `install-plan.js --config ecc-install.json --json` | Pass (exit 0) |
| `install-apply.js --dry-run --json --config ecc-install.json` | Pass (exit 0) |
| Unknown key in config (`foo`) | Rejected: "must NOT have additional properties" |
| Invalid include ID (`lang:not-real`) | Rejected: "Unknown install component: lang:not-real" |
| `targetRoot` | `D:\projects\food.quantityhost.com\.claude` (project, not global) |
| Install state file | `.claude\ecc\install-state.json` (would be created) |
| Modules selected / skipped / warnings | 9 / none / none |
| Total copy operations | 683 |
| Existing destinations that would be overwritten | 0 |
| Touches `.claude/PRPs` | No |
| `hooks-runtime` module selected | No. The 31 files with "hook" in the path are per-language `rules/ecc/*/hooks.md` rule files. No `settings.json` or `hooks.json` is written. |

The sections below are kept for history. The blocker is resolved.

## Current state

- `ecc-install.json` (root): `target: claude-project`, `profile: minimal`, `include: ["lang:typescript", "capability:content"]`.
- Root `package.json` contains `typescript`, so `/ecc:project-init` can detect a TypeScript/JavaScript stack from root files. There is no Astro mapping in ECC's `config/project-stack-mappings.json`.

## Blocker found, now resolved: ECC auto-loads `ecc-install.json` and needs `ajv`

- ECC's install scripts load `ecc-install.json` from the current directory by default (`DEFAULT_INSTALL_CONFIG` in `scripts/lib/install/config.js`) and validate it with `ajv`.
- `ajv` is not installed in the ECC plugin cache (`~/.claude/plugins/cache/ecc/ecc/2.2.3/`), because marketplace plugin installs clone the repo without running `npm install`.
- Effect: while `ecc-install.json` exists in the project root, **every ECC install command run from the project root fails** (`install-plan.js`, `install-apply.js`, and therefore `/ecc:project-init` and `/ecc:configure-ecc` flows that call them) with `Error: Missing dependency 'ajv'`.
- Verified: the same command succeeds from a directory without `ecc-install.json`.
- Untested: whether `/ecc:project-init` and `/ecc:configure-ecc` themselves hit this; they use these scripts.
- The unknown-key rejection test could not be run for the same reason.

### Options (owner decision)

| Option | What it does | Trade-off |
|---|---|---|
| A. Install `ajv` into ECC | From the ECC repo root: `npm install --no-save ajv@8.20.0` (ECC's own suggested fix) | Modifies the plugin cache outside this project; a plugin update may remove it |
| B. Move the config aside | Rename `ecc-install.json` to `ecc-install.json.example` until needed | Install commands work; lose the pinned install intent |
| C. Keep as is | No change | ECC commands fail from the project root |

## Dry-run result (claude-project, run from a scratch directory without the config)

Equivalent flags: `--target claude-project --profile minimal --with lang:typescript --with capability:content --dry-run --json`.

- `targetRoot` resolves to `<current directory>\.claude` (confirmed). Run installers from the project root when applying.
- Selected modules: rules-core, agents-core, commands-core, platform-configs, framework-language, skill-unified-memory, workflow-quality, business-content, shared-script-utils. Skipped: none. Warnings: none.
- **683 copy operations** (not the ~428 of the global `minimal` profile):

| Module | Files |
|---|---|
| agents-core | 181 |
| framework-language | 119 |
| rules-core | 122 |
| commands-core | 113 |
| workflow-quality | 109 |
| business-content | 27 |
| platform-configs | 8 |
| shared-script-utils | 3 |
| skill-unified-memory | 1 |

- Largest destinations: `rules/ecc` (122), `.agents/skills` (108), `skills/angular-developer` (36), `skills/skill-comply` (22).
- `lang:typescript` pulls in the whole `framework-language` module (119 files, including unrelated framework skills such as Angular), so it is not a narrow TypeScript-only addition.
- Collisions with this project's `.claude`: 0. Nothing touches `.claude/PRPs`.

## Duplication caveat

The global ECC plugin already provides these agents, skills and commands in this session. A project install copies them again. Rules (`rules/ecc`) are the part I believe the plugin does not provide (unverified). Consider installing only what the plugin lacks.

## Recommended order

1. Decide the `ajv` option above.
2. `git init` (owner).
3. `/ecc:project-init` and review its dry-run (do not apply yet).
4. If you want project-scoped rules: re-run a trimmed dry-run (for example drop `include` to baseline only, or use `--skills`), check the file count, then apply from the project root.
5. Add `CLAUDE.md` separately after the dry-run is approved (per `/project-init` rules).

## Rollback

A project install writes under `./.claude/` and records state in `ecc/install-state.json` there. Before applying, commit the repository so changes can be reviewed and reverted with git.

## Open items

- [x] Choose option A, B or C for `ajv` (A chosen and applied; re-run passes). Repeat after any ECC plugin update that creates a new version folder, and check the second copy under `plugins/marketplaces/ecc` if commands still report the missing package.
- [ ] Decide whether to trim the install (683 files is large for a "minimal" profile)
- [ ] Confirm `/ecc:project-init` detects the stack from the root `package.json`
