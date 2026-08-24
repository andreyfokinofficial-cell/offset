import { defineStackbitConfig } from "@stackbit/types";
import { GitContentSource } from "@stackbit/cms-git";

export default defineStackbitConfig({
  stackbitVersion: "~0.6.0",
  ssgName: "custom",
  nodeVersion: "22",
  devCommand: "node scripts/dev.mjs --port {PORT}",
  contentSources: [
    new GitContentSource({
      rootPath: __dirname,
      contentDirs: ["content"],
      assetsConfig: {
        referenceType: "static",
        staticDir: "public",
        uploadDir: "images",
        publicPath: "/"
      },
      models: [
        {
          name: "Article",
          label: "Articles",
          type: "page",
          urlPath: "/articles/{slug}/",
          filePath: "content/articles/{slug}.json",
          fields: [
            { name: "title", label: "Title", type: "string", required: true },
            { name: "slug", label: "Slug", type: "slug", required: true },
            { name: "date", label: "Publication date", type: "date", required: true },
            { name: "category", label: "Category", type: "string" },
            { name: "excerpt", label: "Short preview", type: "text" },
            { name: "featureImage", label: "Feature image", type: "image" },
            { name: "featureImageAlt", label: "Image description", type: "string" },
            { name: "body", label: "Article", type: "markdown", required: true }
          ]
        }
      ]
    })
  ]
});
