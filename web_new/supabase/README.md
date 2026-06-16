# web_new Supabase Setup

This folder is for the independent `web_new` Supabase project.

## 1. Create The Project

Create a new Supabase project in the Supabase dashboard. This must not be the old personal-site project.

After creation, copy:

- Project URL
- anon public key
- service_role key

## 2. Initialize The Database

Open the new project's SQL editor and run:

```sql
-- paste web_new/supabase/schema.sql here
```

Then create an Auth user in the new project dashboard. That user is the login for `web_new/admin.html`.

## 3. Point web_new To The New Project

Edit `web_new/config.js`:

```js
window.REY_CMS_CONFIG = {
  supabaseUrl: "https://your-new-project.supabase.co",
  supabaseAnonKey: "your-new-anon-key",
};
```

## 4. Seed Current Local Content

Run from the repo root:

```bash
WEB_NEW_SUPABASE_URL="https://your-new-project.supabase.co" \
WEB_NEW_SUPABASE_SERVICE_ROLE_KEY="your-service-role-key" \
node web_new/scripts/seed-web-new-supabase.mjs
```

The seed script imports local `web_new/data/posts.json` and `web_new/data/products.json`.
