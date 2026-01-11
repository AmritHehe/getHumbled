import type { Request , Response } from "express";
import { ContestSchema, MCQSchema } from "../validators/contest.schema";
import { prisma } from "@repo/database";


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
        // const result = await  prisma.mCQ.create({
        //     data : { 
        //         c
        //     }
        // })
    }
    catch(e){ 
        return res.status(500).json({
            success : false , 
            error : "database is down"
        })
    }
}  

export async function GetContest(req : Request  , res : Response){ 
    
}

export async function GetAllContest(req : Request  , res : Response){ 
    
}
