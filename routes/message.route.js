import express from 'express'
import {protectRoute} from '../middleware/Auth.middleware.js'
import {getUsersForSidebar,getMessages,sendMessage} from '../controllers/message.controller.js'
const route = express.Router()

route.get('/users',protectRoute,getUsersForSidebar)
route.get('/:id',protectRoute,getMessages)
route.post('/send/:id',protectRoute,sendMessage)

export default route 