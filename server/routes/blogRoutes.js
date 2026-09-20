import express from "express"
import { createBlog, generateUploadUrl } from "../controller/blogController.js"
import { auth } from "../middleware/authMiddleware.js"

const blogRouter = express.Router()

blogRouter.get("/generate-upload-url",generateUploadUrl)
blogRouter.post("/create-blog",auth,createBlog)

export default blogRouter