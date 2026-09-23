import express from "express"

import { getProfile, searchUsers } from "../controller/userController.js"

const userRouter = express.Router()


userRouter.post("/search-users",searchUsers)
userRouter.post("/get-profile",getProfile)



export default userRouter