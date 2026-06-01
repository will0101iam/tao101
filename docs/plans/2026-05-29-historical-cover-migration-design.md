# Historical Cover Migration Design

**Goal**

Restore original cover images for legacy seeded posts in Supabase without reintroducing automatic cover generation for new posts.

**Chosen Approach**

Use only the original cover image field from the legacy seed data when backfilling historical posts. Do not infer covers from article body images during migration. Keep the existing rule that newly created or edited posts have no default cover unless the user explicitly uploads one or selects one from article images.

**Why This Approach**

- Restores the visual quality of the public homepage for historical content.
- Preserves the user's current editing rule: no hidden automatic cover generation.
- Limits the migration to deterministic data we already trust from the old static site.

**Data Flow**

- Add a legacy-cover-aware seed path for historical posts.
- Backfill Supabase rows that currently have an empty `cover_image_url` and match historical seeded posts.
- Leave posts untouched when they already have an explicit cover in Supabase.
- Leave newly created CMS posts untouched.

**Guardrails**

- Never generate a cover from the first body image during this migration.
- Never overwrite a non-empty `cover_image_url`.
- Preserve current `coverSource` behavior for explicitly chosen covers.

**Verification**

- Query Supabase after migration to confirm historical posts now have non-empty `cover_image_url` values.
- Verify `http://localhost:5181/` shows restored covers for historical blog cards.
- Verify a newly created post with no explicit cover still renders with no cover.
