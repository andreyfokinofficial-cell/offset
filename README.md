# OFFSET — Netlify edition

A minimal black-and-white online newspaper with editable file-based articles.

## What is included
- Homepage with article cards
- Optional feature images
- READ MORE and SHARE
- Full article pages with images inside the text
- Search overlay
- Mobile layout
- 404, sitemap, robots.txt
- Netlify Visual Editor configuration using Git CMS

## Recommended publishing setup (editable)
1. Create a new GitHub repository and upload all files from this source package.
2. In Netlify choose **Add new project → Import an existing project** and connect that repository.
3. Netlify reads `netlify.toml`: build command is `npm run build`, publish directory is `dist`.
4. After the first successful deploy, open **Project configuration → Visual Editor** and create the preview environment.
5. Open **Visual Editor → Content → Articles** to add or edit publications.

Netlify Visual Editor requires a Git-connected repository. A drag-and-drop deploy of `dist` works as a public website, but does not provide file editing in Visual Editor.

## Article fields
Each article is stored as JSON in `content/articles/` and contains:
- `title`
- `slug`
- `date`
- `category`
- `excerpt`
- `featureImage` (optional)
- `featureImageAlt`
- `body` (Markdown)

Images uploaded through the editor are configured to live in `public/images/`.

## Local preview
```bash
npm run build
npm run dev
```
Then open http://localhost:3000

## Replace demo content
The four supplied articles are placeholders. Edit or delete the JSON files in `content/articles/` after deploying, or replace them through Netlify Visual Editor.
