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
        error: "Provide tags in order to publish the blog, Maximum 10",
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
      },
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

export const getLatestBlogs = async (req, res) => {
  const { page } = req.body;
  try {
    const maxLimit = 5;

    const blogs = await blogModel
      .find({ draft: false })
      .populate(
        "author",
        "personal_info.profile_img personal_info.username personal_info.fullname -_id",
      )
      .sort({ publishedAt: -1 })
      .select("blog_id title des banner activity tags publishedAt -_id")
      .skip((page - 1) * maxLimit)
      .limit(maxLimit);

    return res.status(200).json({ blogs: blogs });
  } catch (err) {
    return res.status(500).json({
      error: err instanceof Error ? err.message : "Something went wrong",
    });
  }
};

export const allLatestBlogsCount = async (req, res) => {
  try {
    const count = await blogModel.countDocuments({ draft: false });
    return res.status(200).json({
      totalDocs: count,
    });
  } catch (error) {
    return res.status(500).json({
      error: err instanceof Error ? err.message : "Something went wrong",
    });
  }
};

export const getTrendingBlogs = async (req, res) => {
  try {
    const blogs = await blogModel
      .find({ draft: false })
      .populate(
        "author",
        "personal_info.profile_img personal_info.username personal_info.fullname -_id",
      )
      .sort({
        "activity.total_read": -1,
        "activity.total_likes": -1,
        publishedAt: -1,
      })
      .select("blog_id title activity tags publishedAt -_id")
      .limit(5);

    return res.status(200).json({ blogs: blogs });
  } catch (err) {
    return res.status(500).json({
      error: err instanceof Error ? err.message : "Something went wrong",
    });
  }
};

export const searchBlogs = async (req, res) => {
  try {
    const { tag, query, author, page } = req.body;

    let findQuery;
    if (tag) {
      findQuery = { tags: tag, draft: false };
    } else if (query) {
      const searchRegex = new RegExp(query, "i");
      findQuery = {
        draft: false,
        $or: [
          { title: searchRegex },
          { des: searchRegex },
          { tags: searchRegex },
        ],
      };
    } else if (author) {
      findQuery = { author, draft: false };
    }
    const maxLimit = 2;

    const blogs = await blogModel
      .find(findQuery)
      .populate(
        "author",
        "personal_info.profile_img personal_info.username personal_info.fullname -_id",
      )
      .sort({ publishedAt: -1 })
      .select("blog_id title des banner activity tags publishedAt -_id")
      .skip((page - 1) * maxLimit)
      .limit(maxLimit);

    return res.status(200).json({ blogs });
  } catch (err) {
    return res.status(500).json({
      error: err instanceof Error ? err.message : "Something went wrong",
    });
  }
};

export const searchBlogsCount = async (req, res) => {
  try {
    const { tag, author, query } = req.body;

    let findQuery;

    if (tag) {
      findQuery = {
        tags: tag,
        draft: false,
      };
    } else if(query) {
      findQuery = {
        draft: false,
        $or: [
          { title: new RegExp(query, "i") },
          { des: new RegExp(query, "i") },
          { tags: new RegExp(query, "i") },
        ],
      };
    }else if (author) {
      findQuery = { author, draft: false };
    }

    const count = await blogModel.countDocuments(findQuery);

    return res.status(200).json({ totalDocs: count });
  } catch (err) {
    return res.status(500).json({
      error: err instanceof Error ? err.message : "Something went wrong",
    });
  }
};
