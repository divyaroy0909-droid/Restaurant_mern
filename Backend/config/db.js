import mongoose  from "mongoose";
import dns from "node:dns";

dns.setServers(["8.8.8.8", "8.8.4.4"]);
export const connectDB = async(req , res) =>{
    try{
        await mongoose.connect(process.env.MONGO_URL);
        console.log("Database connected")
    }
    catch(error){
        console.log(`error in connecting Database ${error}`)
    }
}