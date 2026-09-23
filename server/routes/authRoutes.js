import express from "express"
import { changePassword, googleAuth, signin, signup } from "../controller/authController.js"
import { auth } from "../middleware/authMiddleware.js"

const authRouter = express.Router()

authRouter.post("/signup",signup)
authRouter.post("/signin",signin)
authRouter.post("/google-auth",googleAuth)
authRouter.post("/change-password",auth,changePassword)






export default authRouter