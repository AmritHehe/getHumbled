import type { Request , Response } from "express";
import { ContestSchema, GetAllContestSchema, GetContestSchema, MCQSchema } from "../validators/contest.schema";
import { prisma } from "@repo/database";
import { success } from "zod";
import { memo } from "react";


export async function CreateContest(req : Request  , res : Response){ 
    // const safeData = UserController(req , res);
    const userId = req.userId ; 
    if(!userId){ 
        return res.status(410).json({
            success : false , 
            error : "say amrit that he needs to fix his code"
        })
    }
    const role = req.role; 
    if(role != "Admin"){ 
        return res.status(403).json({
            success : false , 
            error : "wrong role ,acess forbidden"
        })
    }
    const {data , success} = ContestSchema.safeParse(req.body)
    if(!success){ 
        return res.status(400).json({
            success : false , 
            error : "invalid schema"
        })
    }
    try { 
        const result = await prisma.contests.create({
            data : { 
                type : data.type,
                title : data.title , 
                discription : data.discription ,
                status : data.status,
                StartDate : new Date(),
                createdBy : userId!
            }
        })
        return res.status(200).json({
            success : true , 
            data : { 
                contestId : result.id
            }
        })
    }
    catch(e){ 
        return res.status(500).json({
            success : false , 
            error : "database is down"
        })
    }
}
export async function CreateMcqQuestion(req : Request  , res : Response){ 
    //ned contest id here 
    //either get contest id from params or get contest id in body

    const userId = req.userId ; 
    if(!userId){ 
        return res.status(410).json({
            success : false , 
            error : "say amrit that he needs to fix his code"
        })
    }
    const role = req.role; 
    if(role != "Admin"){ 
        return res.status(403).json({
            success : false , 
            error : "wrong role ,acess forbidden"
        })
    }
    const {data , success} = MCQSchema.safeParse(req.body)
    if(!success){ 
        return res.status(400).json({
            success : false , 
            error : "invalid schema"
        })
    }
    try { 
        const result = await  prisma.mCQ.create({
            data : { 
                contestId : data.contestId , 
                question : data.question , 
                Solution : data.Soltion,
                avgTTinMins : data.avgTTinMins,
                points : 10
            }
        })
    }
    catch(e){ 
        return res.status(500).json({
            success : false , 
            error : "database is down"
        })
    }
}  

export async function GetContest(req : Request  , res : Response){ 
    const {data , success} = GetContestSchema.safeParse(req.body)
    if(!success){ 
        return res.status(400).json({
            sucess : false , 
            message : "invalid schema"
        })
    }
    const contestId = data.contestId ; 
    try { 
        let contest = await prisma.contests.findUnique({
            where : { 
                id : contestId 
            }
        })
        if(contest == null){ 
            return res.status(404).json({
                success : false , 
                error : "contest not found"
            })
        }
        return res.status(200).json({
            success : true , 
            data : contest
        })
    }
    catch(e){ 
        return res.status(500).json({
            success : false ,
            error : "database is down , error " + e
        })
    }
}

export async function GetAllContest(req : Request  , res : Response){ 
    const {data , success } = GetAllContestSchema.safeParse(req.body)
    if(!success){ 
        return res.status(400).json({
            success : false , 
            error : "Invalid Schema"
        })
    }
    try { 
        let allContest ;
        if(data.status == "ALL"){
            allContest = await prisma.contests.findMany({})
        }
        else { 
            allContest = await prisma.contests.findMany({
                where : {
                    status : data.status
                }
            })
        }
         
        return res.status(200).json({
            success : true , 
            data : allContest
        })
    }
    catch(e){ 
        res.status(500).json({
            success : false , 
            message : "coudnt find the database"
        })
    }
}
