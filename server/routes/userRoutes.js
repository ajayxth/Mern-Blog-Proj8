import express from "express"

import { searchUsers } from "../controller/userController.js"

const userRouter = express.Router()


userRouter.post("/search-users",searchUsers)

export default userRouter