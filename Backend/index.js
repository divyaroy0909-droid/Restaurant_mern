import express from "express"
import cors from "cors"
import cookieParser from "cookie-parser"
import { connectDB } from "./config/db.js"
import authRoutes from "./routes/authRoutes.js"
import categoryRoutes from "./routes/categoryRoutes.js"
import menuRoutes from "./routes/menuRoutes.js"
import dotenv from "dotenv"
import connectCloudinary from "./config/cloudinary.js"
dotenv.config()

const app = express()

//database connection
connectDB()
connectCloudinary()

//middlewares
app.use(express.json())
app.use(cors())
app.use(cookieParser())

const PORT = process.env.PORT || 5000

app.get("/" , (req,res) =>{
    res.send("Hello from server")
})

app.use("/api/auth" , authRoutes)
app.use("/api/category" , categoryRoutes)
app.use("/api/menu" , menuRoutes)

app.listen(PORT , () =>{
    console.log(`server is running on port ${PORT}`)
})


