import express from "express"
import { googleAuth, signin, signup } from "../controller/authController.js"

const authRouter = express.Router()

authRouter.post("/signup",signup)
authRouter.post("/signin",signin)
authRouter.post("/google-auth",googleAuth)





export default authRouter