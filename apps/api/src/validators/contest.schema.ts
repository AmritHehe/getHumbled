
import z from "zod"

export const ContestSchema = z.object({
    title : z.string().min(10).max(100),
    discription : z.string().min(10).max(2000),
    type : z.enum(["DSA" , "DEV"]),
    status : z.enum([  "UPCOMING" ,"LIVE" ,"CLOSED"]),
    mode : z.enum(["real" , "practice"]).default("real"),
    StartTime : z.coerce.date(), 
    ContestTotalTime : z.number().default(60)
})

export const MCQSchema = z.object({
    contestId : z.string(),
    question : z.string(),
    Soltion : z.enum(["A", "B", "C", "D"]),
    createdAt : z.coerce.date(),
    points : z.int(),
    avgTTinMins : z.int().optional()
    
})
export const GetContestSchema = z.object({
    contestId : z.string(),
})
export const GetAllContestSchema = z.object({
    status : z.enum([  "UPCOMING" ,"LIVE" ,"CLOSED" , "ALL"]),
})

export const CodeSchema = z.object({
    createdBy : z.object() ,
    question : z.string() , 
    Solution : z.string() , 
    avgTTinMins : z.int().optional()
}) 

export const createUsingAISchema = z.object({
    mode : z.enum(["real" , "practice"]).default("real"),
    prompt : z.string() ,
    contestId : z.string()
})

export const JoinPracticeContestSchema = z.object({
    contestId : z.string()
})
export const SubmitPracticeAnswerSchema = z.object({
    contestId : z.string(), 
    questionId : z.string() , 
    answer : z.enum(["A" , "B"  , "C" , "D"])
})