import { nanoid } from "nanoid";
import { CreateUploadUrl } from "../utils/CreateUploadUrl.js";
import blogModel from "../models/blogModel.js";
import userModel from "../models/userModel.js";
import notificationModel from "../models/Notification.js";
import commentModel from "../models/Comment.js"

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

  const { title, banner, tags, content, des, draft,id } = req.body;
  const isDraft = draft === true || draft === "true";

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

  const blog_id = id ||
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
    if(id){
      try{
        const existingBlog = await blogModel.findOne({ blog_id, author: authorId });

        if (!existingBlog) {
          return res.status(404).json({ error: "Blog not found." });
        }

        const blog = await blogModel.findOneAndUpdate(
          { blog_id, author: authorId },
          {
            title,
            des: des || "",
            banner: banner || "",
            content: content || { blocks: [] },
            tags: lowercaseTags,
            draft: isDraft,
          },
          { new: true },
        );

        if (!blog) {
          return res.status(404).json({ error: "Blog not found." });
        }

        if (existingBlog.draft !== isDraft) {
          await userModel.findByIdAndUpdate(authorId, {
            $inc: { "account_info.total_posts": isDraft ? -1 : 1 },
          });
        }

      return res.status(200).json({
        id: blog_id
      })
      }catch(error){
        console.log("CREATE BLOG ERROR:", err);

    return res.status(500).json({
      error: "Failed to update blog."
    });
      }


    }else{
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

    }
    
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

export const getAlgorithmBlogs = async (req, res) => {
  try {
    const blogs = await blogModel
      .find({ draft: false })
      .populate(
        "author",
        "personal_info.profile_img personal_info.username personal_info.fullname -_id",
      )
      .sort({ publishedAt: -1 })
      .select("blog_id title des banner activity tags publishedAt author -_id")
      .limit(30);

    return res.status(200).json({ blogs });
  } catch (error) {
    return res.status(500).json({
      error: error instanceof Error ? error.message : "Something went wrong",
    });
  }
};

export const searchBlogs = async (req, res) => {
  try {
    const { tag, query, author, page,limit,eliminate_blog } = req.body;

    let findQuery;
    if (tag) {
      findQuery = { tags: tag, draft: false,blog_id:{$ne:eliminate_blog} };
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
    const maxLimit = limit ? limit : 2;

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


export const getBlog =async (req,res) =>{
  try{
    let {blog_id,draft,mode} = req.body
    let incrementVal = mode != 'edit' ? 1 : 0

    const blog=await blogModel.findOneAndUpdate({blog_id},{$inc:{"activity.total_reads":incrementVal}})
    .populate("author","personal_info.fullname personal_info.username personal_info.profile_img")
    .select("title des content banner activity publishedAt blog_id tags")

    await userModel.findOneAndUpdate({"personal_info.username": blog.author.personal_info.username},{
      $inc:{"account_info.total_reads":incrementVal}
    })
    if(blog.draft && !draft){
      return res.status(500).json({
        error : "You cannot access drafted blogs."
      })
    }

    return res.status(200).json({blog})

  }catch(error){
    return res.status(500).json({
      error: err instanceof Error ? err.message : "Something went wrong",
    });
  }
}


//likes

export const likeBlog =async (req,res)=>{
  const user_id = req.user

  const {_id,isLikedByUser} = req.body
  let incrementalValue = !isLikedByUser ? 1 : -1

  try{
    const blog = await blogModel.findOneAndUpdate({_id},{$inc:{"activity.total_likes": incrementalValue}})

    if (!blog) {
  return res.status(404).json({ error: "Blog not found." });
}
    if(!isLikedByUser){
      let like = new notificationModel({
        type: "like",
        blog:blog._id,
        notification_for:  blog.author,
        user:user_id,

      })
      const notification = await like.save()
      return res.status(200).json({
        liked_by_user: true
      })
    }else{
      const data =await notificationModel.findOneAndDelete({user:user_id, blog:_id,type:"like"})
      return res.status(200).json({
        liked_by_user: false
      })
    }
  }catch(error){
    console.log(error)
    return res.status(500).json({
      error: error instanceof Error ? error.message : "Something went wrong",
    });
  }

}

export const getIsLikedByUser =async (req,res)=>{
  const user_id = req.user
  const {_id } = req.body

  try{
    const result = await notificationModel.exists({user:user_id,type:"like",blog:_id})

  return res.status(200).json({result})

  }catch(error){
    return res.status(500).json({
      error: error instanceof Error ? error.message : "Something went wrong",
    });
  }


}

export const addComment = async (req, res) => {
  const user_id = req.user;

  const { _id, comment, blog_author,replying_to } = req.body;

  if (!comment.length) {
    return res.status(403).json({
      error: "Write something to leave a comment.",
    });
  }

  try {
    // Create comment document
    const commentObj ={
      blog_id: _id,
      blog_author,
      comment,
      commented_by: user_id,
      isReply: Boolean(replying_to),
    };
    if(replying_to){
      commentObj.parent = replying_to
    }

    const commentFile = await new commentModel(commentObj).save();

    const {
      comment: savedComment,
      commentedAt,
      children,
    } = commentFile;

    // Add comment to blog
    const blog = await blogModel.findOneAndUpdate(
      { _id },
      { 
        $push: {
          comments: commentFile._id,
        },
        $inc: {
          "activity.total_comments": 1,
          "activity.total_parent_comments":replying_to ? 0: 1,
        },
      }
    );

    console.log("new comment created");

    // Create notification
    const notificationObj = {
      type:replying_to ? "reply" : "comment",
      blog: _id,
      notification_for: blog_author,
      user: user_id,
      comment: commentFile._id,
    };
    if(replying_to){
      notificationObj.replied_on_comment = replying_to
      const replyingToCommentDoc =await commentModel.findOneAndUpdate({_id:replying_to},{$push:{children:commentFile._id}})
      notificationObj.notification_for = replyingToCommentDoc.commented_by;
      
    }

    await new notificationModel(notificationObj).save();

    console.log("new notification created");

    return res.status(200).json({
      comment: savedComment,
      commentedAt,
      _id: commentFile._id,
      user_id,
      children,
    });
  } catch (error) {
    console.log("ADD COMMENT ERROR:", error);

    return res.status(500).json({
      error:
        error instanceof Error
          ? error.message
          : "Something went wrong",
    });
  }
};


export const getBlogComments =async (req,res)=>{
  const {blog_id,skip} = req.body
  const maxLimit = 5

  try{
    const comment = await commentModel.find({blog_id,isReply:false})
  .populate("commented_by","personal_info.username personal_info.fullname personal_info.profile_img")
  .populate({
    path: "children",
    populate: {
      path: "commented_by",
      select: "personal_info.username personal_info.fullname personal_info.profile_img",
    },
  })
  .skip(skip)
  .limit(maxLimit)
  .sort({
    "commentedAt":-1
  })

  return res.status(200).json(comment)
  }catch(error){
    return res.status(500).json({
      error:
        error instanceof Error
          ? error.message
          : "Something went wrong",
    });
  }

} 

export const deleteComment = async (req, res) => {
  const user_id = req.user;
  const { _id } = req.body;

  try {
    const comment = await commentModel.findById(_id);

    if (!comment) {
      return res.status(404).json({ error: "Comment not found." });
    }

    if (!user_id || !comment.commented_by || comment.commented_by.toString() !== String(user_id)) {
      return res.status(403).json({ error: "You can only delete your own comment." });
    }

    const commentsToDelete = [comment._id];
    let parentIds = [comment._id];

    while (parentIds.length) {
      const children = await commentModel
        .find({ parent: { $in: parentIds } })
        .select("_id");
      parentIds = children.map((child) => child._id);
      commentsToDelete.push(...parentIds);
    }

    await commentModel.deleteMany({ _id: { $in: commentsToDelete } });
    await notificationModel.deleteMany({ comment: { $in: commentsToDelete } });

    const update = {
      $pull: { comments: { $in: commentsToDelete } },
      $inc: {
        "activity.total_comments": -commentsToDelete.length,
        "activity.total_parent_comments": comment.isReply ? 0 : -1,
      },
    };

    await blogModel.findByIdAndUpdate(comment.blog_id, update);

    if (comment.parent) {
      await commentModel.findByIdAndUpdate(comment.parent, {
        $pull: { children: comment._id },
      });
    }

    return res.status(200).json({
      deleted_id: comment._id,
      deleted_count: commentsToDelete.length,
      deleted_parent_count: comment.isReply ? 0 : 1,
    });
  } catch (error) {
    console.log("DELETE COMMENT ERROR:", error);
    return res.status(500).json({
      error: error instanceof Error ? error.message : "Something went wrong",
    });
  }
};


export const userWrittenBlogs =async (req,res)=>{
  const user_id =req.user
  
  const {page,draft,query,deletedDocCount} = req.body

  const maxLimit = 4

  const skipDocs = (page-1) * maxLimit
  if(deletedDocCount){
    skipDocs-=deletedDocCount
  }
  try{
    const blogs =await blogModel.find({author: user_id, draft,title:new RegExp(query,'i') })
    .skip(skipDocs)
    .limit(maxLimit)
    .sort({publishedAt:-1})
    .select("title banner publishedAt blog_id activity des draft -_id")

    return res.status(200).json({blogs})
    

  }catch(error){
    return res.status(500).json({
      error: error instanceof Error ? error.message : "Something went wrong",
    });
  }



}

export const userWrittenBlogsCount =async (req,res)=>{
  const user_id =req.user
  
  const {draft,query} = req.body
  try{
   const count = await blogModel.countDocuments({author: user_id, draft,title:new RegExp(query,'i') })
   return res.status(200).json({totalDocs :count})
  }catch(error){
    return res.status(500).json({
      error: error instanceof Error ? error.message : "Something went wrong",
    });
  }

  



}

export const deleteBlog = async (req, res) => {
  const { blog_id } = req.body;

  try {
    const blog = await blogModel.findOneAndDelete({
      blog_id,
      author: req.user,
    });

    if (!blog) {
      return res.status(404).json({ error: "Blog not found." });
    }

    if (!blog.draft) {
      await userModel.findByIdAndUpdate(req.user, {
        $inc: { "account_info.total_posts": -1 },
      });
    }

    return res.status(200).json({ deleted_id: blog_id });
  } catch (error) {
    return res.status(500).json({
      error: error instanceof Error ? error.message : "Something went wrong",
    });
  }
};