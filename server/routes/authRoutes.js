import express from "express"
import { changePassword, googleAuth, signin, signup,updateProfileImage } from "../controller/authController.js"
import { auth } from "../middleware/authMiddleware.js"

const authRouter = express.Router()

authRouter.post("/signup",signup)
authRouter.post("/signin",signin)
authRouter.post("/google-auth",googleAuth)
authRouter.post("/change-password",auth,changePassword)
authRouter.post("/update-profile-img",auth,updateProfileImage)






export default authRouter