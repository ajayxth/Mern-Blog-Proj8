import express from "express"
import "dotenv/config"
import connectDB from "./config/db.js"
import cors from "cors"
import { initializeApp, cert } from "firebase-admin/app"
import serviceAccountKey from "./mern-blog-42ba5-firebase-adminsdk-fbsvc-5528e6c3c0.json" with { type: "json" }

import { S3Client } from "@aws-sdk/client-s3";





//routes import
import authRouter from "./routes/authRoutes.js"
import blogRouter from "./routes/blogRoutes.js"


initializeApp({
    credential: cert(serviceAccountKey)
})




const app = express()
app.use(express.json())

app.use(cors())

const PORT = process.env.PORT

await connectDB()

//setting up bucket
export const s3 = new S3Client({
  region: "ap-south-1",
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
  },
});




//routes use
app.use("/api/auth",authRouter)
app.use("/blog",blogRouter)


app.get("/",(req,res)=>{
    res.send("Server is running...")
})

app.listen(PORT,()=>{
    console.log(`Server running on port ${PORT}`)
})
