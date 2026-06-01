# Product Editor Parity Design

**Goal**

Make the product editor feel almost identical to the blog editor while preserving product-specific fields and adding dedicated screenshot gallery management.

**Chosen Direction**

Use the blog editor as the base editing experience for products. Keep the same visual layout, cover workflow, rich text editor, save/publish controls, and feedback patterns. Preserve `Publish Date` for products as requested. Add product-specific screenshot gallery management as a separate module, and keep link/button fields optional.

**Why This Direction**

- Keeps the admin experience consistent across blog and product content.
- Reduces cognitive switching when editing different content types.
- Preserves a product's need for a dedicated cover plus a separate screenshot gallery.
- Supports products that have no public URL yet, because the written content remains the primary explanation layer.

**Shared Editor Structure**

- `Title`
- `Excerpt`
- `Publish Date`
- `Status`
- `Cover Media`
- `Body`
- success/error feedback
- `Save Draft / Publish`

**Product-Specific Differences**

- `Screenshots` becomes a dedicated multi-image module.
- `Cover` stays separately managed and is not derived from screenshots automatically.
- `CTA Label` and `CTA URL` remain optional.
- If link fields are empty, the frontend product page should simply omit the CTA button.

**Screenshot Gallery Rules**

- Supports multiple uploaded images.
- Shows preview cards in the editor.
- Allows removing items from the gallery.
- Cover and screenshot gallery stay independent.
- Future frontend product detail pages can render the gallery as a carousel or stacked media section.

**Data Model Direction**

- Keep existing product fields.
- Preserve `date` / publish date on the product model.
- Add `screenshots: string[]`.
- Leave CTA fields optional.

**Frontend Behavior**

- Product cards continue using the single selected cover.
- Product detail pages show the cover first.
- Screenshot gallery appears as an additional media section below the cover.
- CTA button renders only when link data exists.

**Non-Goals**

- No mandatory product URL.
- No multi-CTA system.
- No advanced ordering, drag-and-drop sorting, versioning, or pricing metadata in this pass.
