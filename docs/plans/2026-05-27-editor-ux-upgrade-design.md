# Editor UX Upgrade Design

**Goal**

Upgrade the admin post editor so it feels like a polished publishing tool instead of a raw HTML wrapper. The editor should support practical cover workflows, editable links, richer formatting, and a compact icon-based toolbar that matches the site's dark editorial visual system.

## Scope

This upgrade covers three user-visible areas:

1. Cover image workflow
2. Body link workflow
3. Toolbar capability and presentation

It does not introduce slash commands yet. It also does not replace TipTap with another editor. The current architecture remains TipTap-based, and this round focuses on making that choice actually usable.

## Recommended Approach

Keep the existing `RichTextEditor` and `PostEditor`, but expand them into a more complete composing surface.

The recommended direction is:

- keep `coverImage` as a dedicated field
- support two cover entry methods:
  - upload a new image
  - choose from images already present in the article body
- make links visible and editable from the editor instead of feeling invisible once inserted
- upgrade the toolbar from large text buttons to compact icon actions with tooltips
- extend the formatting set to cover the expected editorial basics:
  - paragraph
  - H2
  - H3
  - bold
  - italic
  - underline
  - blockquote
  - code block
  - bullet list
  - ordered list
  - align left
  - align center
  - link
  - image

This is the best balance between usability, visual quality, and implementation risk. It solves the current pain points without turning this iteration into a full Notion clone.

## Alternatives Considered

### Option A: Minimal patch only

Patch the current text-button toolbar and add just enough logic for cover upload and links.

Pros:
- smallest code delta
- fastest delivery

Cons:
- still feels unfinished
- still visually inconsistent with the site
- likely to require another rewrite soon

### Option B: Recommended icon toolbar upgrade

Keep TipTap and add a proper compact toolbar, cover media controls, and explicit link editing.

Pros:
- solves real usability issues
- fits the site's black editorial aesthetic
- keeps implementation bounded

Cons:
- moderate amount of editor UI work

### Option C: Full block editor rethink

Move toward a block-based composer with slash menu and richer structural editing.

Pros:
- strongest long-term flexibility

Cons:
- much larger scope
- higher regression risk
- not necessary to solve the current problems

## Interaction Design

### Cover Image

The cover area should become its own small media control panel above the body.

It should support:

- URL input for manual override
- upload button for a fresh file
- a "use from article" strip that shows selectable thumbnails extracted from the current editor content
- preview card showing the currently selected cover
- helper text that explains cover vs body images

Selection priority:

1. explicit uploaded image
2. manually entered cover URL
3. user-selected body image
4. auto-selected valid body image
5. empty cover

The cover should never silently fall back to known bad legacy images or placeholder images.

### Links

Links currently exist in content but are hard to reason about while editing. The editor should make them obvious and editable.

The upgraded behavior:

- linked text keeps visible underline/color styling in the editor
- clicking the link toolbar action while text is selected opens a small prompt flow for URL editing
- if the cursor is already inside a link, the same action edits the existing URL
- provide a remove-link action in the toolbar or via repeated toggle behavior

This keeps the interaction simple while making links discoverable and maintainable.

### Toolbar

The toolbar should become a compact icon rail with subtle separators and tooltip labels.

Visual direction:

- black or near-black surface
- low-contrast borders
- pale text/icons
- warm accent for active states
- icon-only buttons sized tightly enough to feel premium, not like dashboard admin controls

Grouping should follow editing intent:

- text structure
- emphasis
- lists and quotes
- alignment
- link and image

## Architecture

### Editor Extensions

We should keep `StarterKit`, `Link`, and `Image`, then add the missing extensions needed for richer editorial formatting.

Expected additions:

- `@tiptap/extension-underline`
- `@tiptap/extension-text-align`

Bold and italic already come from `StarterKit`, but the toolbar currently does not expose them.

### Body Image Extraction

`PostEditor` should derive body image candidates from the current HTML content. This can be done by extracting `<img src>` values from the editor HTML whenever content changes.

The cover picker should only show distinct, valid image URLs.

### Shared Styling

The existing `content-surface` approach remains correct. We should extend it so editor content and public post rendering share:

- link styling
- selection visibility
- emphasis visibility
- list spacing
- quote appearance
- code block styling
- alignment classes

## Error Handling

- Invalid upload should show inline error text near the cover controls.
- Empty or malformed URLs should not crash the editor; they should simply be rejected or cleared.
- If no body image exists, the "use from article" area should show an empty-state message instead of blank space.

## Testing Strategy

Add targeted tests for:

- cover upload callback wiring
- selecting a body image as cover
- toolbar rendering for new icon actions
- bold/italic/underline/alignment actions existing in the UI
- link editing and removal behavior
- editor link styling presence

Manual browser verification should cover:

- upload a cover
- choose a body image as cover
- insert a link and re-edit it
- apply bold, italic, underline, center alignment
- verify the public post still renders correctly

## Success Criteria

This upgrade is successful if:

- cover images can be uploaded directly from the post editor
- cover images can be selected from body images already inserted in the article
- links are visible and editable in the backend editor
- the toolbar exposes the expected editorial formatting set
- the toolbar looks compact, icon-based, and visually aligned with the current site
- frontend post rendering remains intact
