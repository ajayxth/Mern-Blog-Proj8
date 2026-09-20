import mongoose from "mongoose";
import dns from "dns"

dns.setServers(["1.1.1.1","1.0.0.1"])

const connectDB = async ()=>{
    try{
        mongoose.connect(process.env.MONGO_URI,{autoIndex: true})
        console.log("Connected to database.")
    }catch(error){
        console.log(error.message)
    }
}

export default connectDB