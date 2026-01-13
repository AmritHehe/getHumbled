import Router from "express"
import { SignUp  , SignIn} from "../controllers/user.controller"

const UserRouter = Router()

UserRouter.post("/user/signUp" , SignUp) 
UserRouter.post("/user/signIn" , SignIn) 


export default UserRouter;