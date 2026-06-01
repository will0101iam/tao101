# Guotao Tao Site

Personal one-page portfolio with a real `/admin` CMS for managing posts and products.

## Stack
- `React 19`
- `Vite`
- `TypeScript`
- `React Router`
- `Supabase Auth + Database + Storage`
- `TipTap` rich text editor

## Local Development
1. Install dependencies:

```bash
npm install
```

2. Start in local fallback mode:

```bash
npm run dev
```

3. Open:
- Public site: [http://localhost:5173](http://localhost:5173)
- Admin login: [http://localhost:5173/admin/login](http://localhost:5173/admin/login)

Without Supabase env vars, the app stores admin content in `localStorage`. This is the fastest way to edit copy locally before wiring a real backend.

## Local Admin Mode
- Default email: `admin@example.com`
- Default password: `admin`
- Posts and products save to browser `localStorage`
- Published content appears on the public pages immediately

## Supabase Setup
1. Copy the example env file:

```bash
cp .env.example .env
```

2. Fill in:

```env
VITE_SUPABASE_URL=...
VITE_SUPABASE_ANON_KEY=...
```

3. In Supabase SQL Editor, run:
- `supabase/schema.sql`
- `supabase/policies.sql`

4. In Supabase Auth, create at least one email/password user for admin access.

5. Restart the dev server:

```bash
npm run dev
```

Once the env vars are present, `/admin/login` switches from local fallback auth to real Supabase Auth. Public pages also refresh published posts and products from Supabase.

## Database Notes
- `posts`: public blog content with publish state, cover image, author, and HTML body
- `products`: public product cards and detail pages with CTA fields
- `media` bucket: public image bucket used by the editor upload flow

Current policies allow:
- anyone to read published posts/products and public media
- any authenticated Supabase user to manage posts, products, and media

If you want a stricter single-admin setup later, tighten the RLS policies to a specific user id or email-backed profile table.

## Verification
Run the project checks with:

```bash
npm test
npm run lint
npm run build
```
