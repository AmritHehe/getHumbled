import Router from "express"
import { CreateContest, CreateMcqQuestion, GetAllContest, GetContest , CreateContestWithAI } from "../controllers/contest.controller"
import { TokenVerification } from "../middlewares/user.middleware"

const ContestRouter = Router()


ContestRouter.post("/contests/public", GetAllContest)
ContestRouter.post("/contest/public", GetContest)

ContestRouter.post("/contests/new", TokenVerification, CreateContest)
ContestRouter.post("/question/new", TokenVerification, CreateMcqQuestion)
ContestRouter.post("/contests", TokenVerification, GetAllContest)
ContestRouter.post("/getContest", TokenVerification, GetContest)
ContestRouter.post("/CreateContestAI" , TokenVerification , CreateContestWithAI)
export default ContestRouter;