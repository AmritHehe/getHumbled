import Router, { request , response } from "express"
import { SignUp , SignIn} from "../controllers/user.controller"

const AdminRouter = Router()

AdminRouter.post("/signUp" , SignUp) 
AdminRouter.post("/signin" , SignIn) 


export default AdminRouter;