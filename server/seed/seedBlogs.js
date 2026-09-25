import "dotenv/config";
import mongoose from "mongoose";
import { nanoid } from "nanoid";
import { readFile } from "fs/promises";
import { fileURLToPath } from "url";
import { dirname, join } from "path";
import blogModel from "../models/blogModel.js";
import userModel from "../models/userModel.js";

const __dirname = dirname(fileURLToPath(import.meta.url));

const slugify = (title) =>
  title
    .trim()
    .toLowerCase()
    .replace(/\s+/g, "-")
    .replace(/[^a-z0-9-]/g, "")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "");

const seed = async () => {
  if (!process.env.MONGO_URI) {
    console.error("MONGO_URI is missing. Put it in server/.env");
    process.exit(1);
  }

  await mongoose.connect(process.env.MONGO_URI, { autoIndex: true });
  console.log("Connected to database.");

  const username = process.env.SEED_AUTHOR_USERNAME;
  const author = username
    ? await userModel.findOne({ "personal_info.username": username.toLowerCase() })
    : await userModel.findOne().sort({ joinedAt: 1 });

  if (!author) {
    console.error(
      "No user in the database. Sign up in the app once, then rerun: pnpm seed:blogs",
    );
    await mongoose.disconnect();
    process.exit(1);
  }

  console.log(
    `Seeding as @${author.personal_info.username} (${author.personal_info.email})`,
  );

  const raw = await readFile(join(__dirname, "blogs.json"), "utf8");
  const posts = JSON.parse(raw);

  let created = 0;
  let skipped = 0;

  for (const post of posts) {
    const existing = await blogModel.findOne({
      author: author._id,
      title: post.title,
    });

    if (existing) {
      skipped += 1;
      console.log(`skip  ${post.title}`);
      continue;
    }

    const blog_id = `${slugify(post.title)}-${nanoid()}`;
    const saved = await blogModel.create({
      blog_id,
      title: post.title,
      des: post.des,
      banner: post.banner,
      content: post.content,
      tags: post.tags.map((tag) => tag.toLowerCase()),
      author: author._id,
      draft: false,
    });

    await userModel.findByIdAndUpdate(author._id, {
      $inc: { "account_info.total_posts": 1 },
      $push: { blogs: saved._id },
    });

    created += 1;
    console.log(`ok    ${blog_id}`);
  }

  console.log(`\nDone. created=${created} skipped=${skipped} total=${posts.length}`);
  await mongoose.disconnect();
};

seed().catch(async (err) => {
  console.error(err);
  await mongoose.disconnect().catch(() => {});
  process.exit(1);
});
