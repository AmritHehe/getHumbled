import express from "express"
import UserRouter from "./routes/user.routes";
import ContestRouter from "./routes/contest.routes";
import AdminRouter from "./routes/admin.routes";
import cors from  "cors"

const app = express();

app.use(cors())
app.use(express.json());

app.use(UserRouter);
app.use(ContestRouter);
app.use(AdminRouter)

app.listen(3000 , () => {
    console.log("server runming on port 3000")
})