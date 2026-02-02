import express from "express"
import UserRouter from "./routes/user.routes";
import ContestRouter from "./routes/contest.routes";
import AdminRouter from "./routes/admin.routes";
import cors from  "cors"

const app = express();

app.use(cors({
  origin: ["http://localhost:3001" , "https://get-humbled-web.vercel.app" , "https://skillup.amrithehe.com"], // allowed frontend origins
  credentials: true,
  methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
  allowedHeaders: ["Content-Type", "Authorization"],
  exposedHeaders: ["Content-Type", "Cache-Control", "Expires"]
}))
app.use(express.json());

app.use(UserRouter);
app.use(ContestRouter);
app.use(AdminRouter)

app.listen(3004 , () => {
    console.log("server runming on port 3004")
})