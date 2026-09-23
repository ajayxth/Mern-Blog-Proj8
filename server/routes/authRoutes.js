import express from "express"
import { changePassword, googleAuth, signin, signup,updateProfileImage,updateProfile } from "../controller/authController.js"
import { auth } from "../middleware/authMiddleware.js"

const authRouter = express.Router()

authRouter.post("/signup",signup)
authRouter.post("/signin",signin)
authRouter.post("/google-auth",googleAuth)
authRouter.post("/change-password",auth,changePassword)
authRouter.post("/update-profile-img",auth,updateProfileImage)
authRouter.post("/update-profile",auth,updateProfile)







export default authRouter