# 🚀 MD Blog

**MD Blog** is a serverless-friendly version of the original [MDXpress Blog](https://github.com/eshan-singh78/MDXpress-Blog/), reworked to deploy seamlessly on platforms like **Vercel** using **Serverless Functions**.

It’s a markdown-powered, minimal blogging platform that compiles content on-the-fly without any backend server, database, or complex setup.

## 📁 Project Structure

```
mdxpress-blog-cnp/
├── api/                 # Serverless function handlers
│   ├── index.js         # Homepage rendering
│   ├── blog.js          # Blog listing route
│   └── blog/[slug].js   # Dynamic blog rendering
├── public/
│   ├── blogs/           # Markdown files for each blog post
│   ├── styles/          # CSS with dark mode support
│   └── views/           # HTML templates
├── vercel.json          # Vercel routing and config
├── package.json         # Metadata and dependencies
└── README.md            # This file
```

---

## 🧪 How to Run Locally

1. **Clone the Repository**
   ```bash
   git clone https://github.com/FreetimeMaker/MD-Blog
   cd MD-Blog
   ```

2. **Install Dependencies**
   ```bash
   npm install
   ```

3. **Run Locally with Vercel**
   ```bash
   vercel dev
   ```

4. **Visit the App**
   Open [http://localhost:3000](http://localhost:3000) in your browser.

---

## 🚀 How to deploy it on Vercel?

1. Fork this Repository or click on 'Use this Template'.
2. Clone it to your Machine with 
```bash
git clone https://github.com/FreetimeMaker/MDXpress-Blog-CPN-But-Better MD-Blog
cd MD-Blog
```

3. Configure it how you like.
4. Commit and push your local changes to github with
```bash
git add .
git commit -m "Configured MD-Blog"
git push
```

5. Login to [Vercel](https://vercel.com).
6. Login via [GitHub](https://github.com).
7. Add your [GitHub](https://github.com) Repository and deploy it like it is.
8. Define a Custom Domain or use the [Vercel](https://vercel.com) Subdomain.
9. Your finished.

## 📌 How It Works on Vercel

- All backend logic is handled via Serverless Functions in `/api`.
- Static assets (styles, markdown files) are served from `/public`.
- HTML templates are combined with rendered Markdown and returned as HTML.

---

## 🙋‍♂️ About the Creator

Crafted by [Freetime Maker](mailto:FreetimeMaker@proton.me), a Android and Web dev & enthusiast exploring the balance of performance and simplicity in web apps.

---