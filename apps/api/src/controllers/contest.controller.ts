import type { Request , Response } from "express";
import { ContestSchema, createUsingAISchema, GetAllContestSchema, GetContestSchema, MCQSchema } from "../validators/contest.schema";
import { prisma } from "@repo/database";
import { success } from "zod";
import { memo } from "react";
import { generateText, type ModelMessage } from "ai";
import { createOpenRouter } from "@openrouter/ai-sdk-provider";

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
    if(role != "ADMIN"){ 
        return res.status(403).json({
            success : false , 
            error : "wrong role ,acess forbidden"
        })
    }
    const {data , success , error} = ContestSchema.safeParse(req.body)
    if(!success){ 
        return res.status(400).json({
            success : false , 
            error : "invalid schema" + error
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
    if(role != "ADMIN"){ 
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
        return res.status(200).json({
            success : true , 
            data  : result
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
            },
            include : {
                MCQ : true
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

export async function CreateContestWithAI(req: Request , res : Response){ 
    const userId = req.userId
    const role = req.role
    if(role != 'ADMIN'){ 
        return res.status(403).json({
            success : false , 
            message : "invalid role . please be a admin to access this endpoint" , 
            error : "FORBIDDEN"
        })
    }
    const { data  , success} = createUsingAISchema.safeParse(req.body) 
    if(!success || !data){ 
        return res.status(400).json({
            success : false , 
            message : "Invalid Schema",
            error : "BAD_REQUEST"
        })
    }
    const openRouter = createOpenRouter({
        apiKey : process.env.OPENROUTER_API_KEY
    })
    let Context : ModelMessage[] = [
        { 
            role : "system",
            content :  `You are an expert teacher who is creating test for his fellow students ,the user/student will provide you a topic and you have to create atleast 10 questions for it ! you can create more , I am using prisma create many thing so you have to only return an array of object , where each object will follow this exact schema model MCQ{
                {
                question String 
                Solution MCQs
                contestId String
                points Int 
                avgTTinMins Int @default(2)
                }

                the above schema is caseSenstive so keep that in mind 
                follow the exact schema and return an array of objects , also how will all options store in database  weill you have to generate a question string  like this 

                "
                how many keys are there in keyboard

                Options:
                A) 100
                B) 200
                C) 300
                D) 400
                "
                make sure to generate question string like above example as theres no seperate table to generate schema 
                and the solution is enum of Captial A , B. , C , D , good luck 
                `
            
        } , 
        { 
            role : "user" , 
            content : data.prompt + "this is the contest ID u need to add in every question " + data.contestId
        }
    ]
    const result = await generateText({
        model  : openRouter("xiaomi/mimo-v2-flash"),
        messages : Context , 
        temperature : 0.2
    })
    console.log("result " + JSON.stringify(result))
    console.log("^^^^^^^^^^^^^^^^^^^^^^^^^")
    console.log("text" + result.text)
    interface data { 
        question : string ,
        Solution :  "A" | "B" | "C" | "D"
        contestId : string
        points :  number 
        avgTTinMins : number
    }
    console.log("type of data of result txt" + typeof(result.text))
    const rawText = result.text.trim();

    const jsonArrayString = rawText.match(/\[[\s\S]*\]/)?.[0];
    if (!jsonArrayString) {
    return res.status(500).json({
        success: false,
        message: "Invalid AI response format",
    });
    }

    const dataArray = JSON.parse(jsonArrayString);

    
    try { 
        const createAiTest = await prisma.mCQ.createMany({

            data : dataArray
        })
        return res.status(200).json({
            success : true ,
            data : createAiTest,
            message : "sucessfull"
        })
    }
    catch(e) { 
        return res.status(409).json({
            success : false , 
            data : "failed to create many in prisma with error" + e ,
            error : "BAD_REQUEST"
        })
    }
    return res.status(200).json({
        data : result
    })
}