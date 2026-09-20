import { nanoid } from "nanoid";
import { CreateUploadUrl } from "../utils/CreateUploadUrl.js";
import blogModel from "../models/blogModel.js";
import userModel from "../models/userModel.js";

export const generateUploadUrl = async (req, res) => {
  try {
    const url = await CreateUploadUrl();

    return res.status(200).json({
      uploadURL: url,
    });
  } catch (err) {
    console.log(err.message);

    return res.status(500).json({
      error: err.message,
    });
  }
};

export const createBlog = async (req, res) => {
  const authorId = req.user;

  const { title, banner, tags, content, des, draft } = req.body;
  const isDraft = Boolean(draft);

  if (!title || !title.length) {
    return res.status(403).json({
      error: "You must provide the title.",
    });
  }

  if (!isDraft) {
    if (!des || !des.length || des.length > 200) {
      return res.status(403).json({
        error: "You must provide blog description under 200 characters",
      });
    }

    if (!banner || !banner.length) {
      return res.status(403).json({
        error: "You must provide blog banner to publish it",
      });
    }

    if (!content || !content.blocks || !content.blocks.length) {
      return res.status(403).json({
        error: "There must be some blog content to publish it",
      });
    }

    if (!tags || !tags.length || tags.length > 10) {
      return res.status(403).json({
        error:
          "Provide tags in order to publish the blog, Maximum 10",
      });
    }
  }

  const lowercaseTags = Array.isArray(tags)
    ? tags.map((tag) => tag.toLowerCase())
    : [];

  const blog_id =
    title
      .trim()
      .toLowerCase()
      .replace(/\s+/g, "-")
      .replace(/[^a-z0-9-]/g, "")
      .replace(/-+/g, "-")
      .replace(/^-|-$/g, "") +
    "-" +
    nanoid();

  const blog = new blogModel({
    title,
    des: des || "",
    banner: banner || "",
    content: content || { blocks: [] },
    tags: lowercaseTags,
    author: authorId,
    blog_id,
    draft: isDraft,
  });

  try {
    const savedBlog = await blog.save();

    const incrementVal = isDraft ? 0 : 1;

    await userModel.findOneAndUpdate(
      { _id: authorId },
      {
        $inc: {
          "account_info.total_posts": incrementVal,
        },
        $push: {
          blogs: savedBlog._id,
        },
      }
    );

    return res.status(200).json({
      id: savedBlog.blog_id,
    });
  } catch (err) {
    console.log("CREATE BLOG ERROR:", err);

    return res.status(500).json({
      error: err.message,
    });
  }
};
