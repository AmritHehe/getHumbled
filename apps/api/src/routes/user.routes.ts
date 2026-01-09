import Router from "express"
import { SignUp } from "../controllers/user.controller"

const router = Router()

router.route("/user/signup").post(SignUp)


export default router;