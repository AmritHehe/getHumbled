
import z from "zod"

export const ContestSchema = z.object({
    title : z.string().min(10).max(100),
    discription : z.string().min(10).max(2000),
    type : z.enum(["DSA" , "DEV"]),
    status : z.enum([  "UPCOMING" ,"LIVE" ,"CLOSED"]),
    StartTime : z.date(), 
})

export const MCQSchema = z.object({
    contestId : z.string(),
    question : z.string(),
    Soltion : z.enum(["A", "B", "C", "D"]),
    createdAt : z.date(),
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