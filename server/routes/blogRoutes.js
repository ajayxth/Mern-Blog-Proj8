import express from "express"
import { createBlog, generateUploadUrl, getLatestBlogs, getTrendingBlogs,searchBlogs,allLatestBlogsCount,searchBlogsCount,getBlog,likeBlog,getIsLikedByUser } from "../controller/blogController.js"
import { auth } from "../middleware/authMiddleware.js"


const blogRouter = express.Router()

blogRouter.get("/generate-upload-url",generateUploadUrl)
blogRouter.post("/create-blog",auth,createBlog)
blogRouter.post("/latest-blogs",getLatestBlogs)
// blogRouter.get("/blogs-by-category/:category",getBlogsByCategory)
blogRouter.get("/trending-blogs",getTrendingBlogs)
blogRouter.post("/search-blogs",searchBlogs)
blogRouter.post("/search-blogs-count",searchBlogsCount)
blogRouter.post("/all-latest-blogs-count",allLatestBlogsCount)
blogRouter.post("/get-blog",getBlog)
blogRouter.post("/like-blog",auth,likeBlog)
blogRouter.post("/isLiked-by-user",auth,getIsLikedByUser)




export default blogRouter