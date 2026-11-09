import fs from "fs";
import path from "path";
import { marked } from "marked";

import { readPost } from "../../lib/posts.js";

function replaceDiscordTimestamps(markdown) {
  return markdown.replace(
    /<t:(\d+)(?::([tTdDfFR]))?>/g,
    (_, timestamp, style = "f") => {
      return `<time class="discord-timestamp" data-timestamp="${timestamp}" data-style="${style}"><t:${timestamp}:${style}></time>`;
    },
  );
}

export default async function handler(req, res) {
  const { slug } = req.query;
  const templatePath = path.join(process.cwd(), "public", "views", "blog.html");
  const template = fs.readFileSync(templatePath, "utf-8");

  try {
    const post = readPost(slug);
    if (!post) {
      res.status(404).send("Post not found");
      return;
    }

    const { title, categories = [], markdown = "" } = post;

    let contentMarkdown = markdown.replace(/^# .*\n?/gm, "");
    contentMarkdown = contentMarkdown.replace(/.*Categories:.*\n?/gi, "");
    contentMarkdown = replaceDiscordTimestamps(contentMarkdown);

    const content = marked.parse(contentMarkdown);
    const catHtml =
      categories.length > 0
        ? `<div class="categories-container">${categories.map((c) => `<a href="/blog?category=${encodeURIComponent(c)}" class="category-tag">${c}</a>`).join("")}</div>`
        : "";

    const html = template
      .replace(/{{title}}/g, title || slug)
      .replace(/{{content}}/g, catHtml + content);

    res.setHeader("Content-Type", "text/html");
    res.status(200).send(html);
  } catch (error) {
    console.error("[blog/:slug] Local post error:", error);
    const html = template
      .replace(/{{title}}/g, "Blog unavailable")
      .replace(
        /{{content}}/g,
        "<p>This blog post is temporarily unavailable. Please try again later.</p>",
      );
    res.setHeader("Content-Type", "text/html");
    res.status(503).send(html);
  }
}
