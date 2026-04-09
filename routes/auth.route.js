import express from "express"
import {Signup,login,logout,UpdateProfile,checkAuth} from "../controllers/auth.controller.js"
import { protectRoute } from "../middleware/Auth.middleware.js"
const route = express.Router()

route.post('/signup',Signup)
route.post('/login',login)
route.get('/logout',logout)
route.put('/update-profile',protectRoute , UpdateProfile)

route.get('/check',protectRoute,checkAuth)

export default route