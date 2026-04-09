import express from "express"
import { server,app } from "../lib/socket.js"

import cookie_parser from "cookie-parser"
import dotenv from "dotenv"
dotenv.config()
import cors from 'cors'


const port = process.env.PORT
import connectDB from "../lib/db.js"
if (connectDB()) {
    console.log("database connected successfully");
    
}else{
    console.log("connection error");
}

app.use(cors({
    origin:"http://localhost:5173",
    credentials:true
}))
app.use(cookie_parser())
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ limit: '10mb', extended: true }));

import AuthRoute from "../routes/auth.route.js" 
import MessageRoute from "../routes/message.route.js"


app.use('/api/auth',AuthRoute)
app.use('/api/messages',MessageRoute)


server.listen(port , ()=>{
    console.log(`server is running on port ${port}`);
    }
)