import type { Request , Response } from "express";
import { ContestSchema, createUsingAISchema, GetAllContestSchema, GetContestSchema, JoinPracticeContestSchema, MCQSchema, ReAttemptPracticeSchema, SubmitPracticeAnswerSchema } from "../validators/contest.schema";
import { prisma } from "@repo/database";
import { generateText, type ModelMessage } from "ai";
import { createOpenRouter } from "@openrouter/ai-sdk-provider";
import { fetchSolution, MCQSolutionMap } from "../cache/solutionCache";
import { GetRandomQuestion } from "../services/getRandomQuestion";
import { use } from "react";
import { getContestState } from "../services/getContestState";

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
    
   
    const {data , success , error} = ContestSchema.safeParse(req.body)
     if(role != "ADMIN" &&  data?.mode != "practice" ){ 
        return res.status(403).json({
            success : false , 
            error : "wrong role ,acess forbidden"
        })
    }
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
                createdBy : userId! ,
                ContestTotalTime : data.ContestTotalTime , 
                mode : data.mode
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
            select : { 
                id : true,
                srNo : true ,
                title : true , 
                discription : true ,
                type : true , 
                status : true , 
                createdBy : true , 
                mode : true , 
                ContestTotalTime : true , 
                StartDate : true , 
                StartTime : true , 
                MCQ : { 
                    select : { 
                        id : true ,
                        contestId : true , 
   
                    }
                }
            }
        })      
       
        if(contest == null){ 
            return res.status(404).json({
                success : false , 
                error : "contest not found"
            })
        }

       const contestState = await getContestState({
            StartDate: contest.StartDate,
            ContestTotalTime: contest.ContestTotalTime,
            mode: contest.mode,
         })
        return res.status(200).json({
            success : true , 
            data : contest , 
            mode : contestState
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
        if(data.mode) { 
            allContest = await prisma.contests.findMany({
                where : {
                    mode : data.mode
                }
            })
        }
        else if(data.status) { 
            allContest = await prisma.contests.findMany({
                where : {
                    status : data.status
                }
            })
        }
        else{ 
            allContest = await prisma.contests.findMany({})
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
    
    const { data  , success} = createUsingAISchema.safeParse(req.body) 
    if(role != 'ADMIN' && data?.mode != "practice"){ 
        return res.status(403).json({
            success : false , 
            message : "invalid role . please be a admin to access this endpoint" , 
            error : "FORBIDDEN"
        })
    }
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

export async function JoinpracticeContest(req: Request , res: Response) {

    console.log("inside join contest")
    const userId = req.userId
    const role = req.role


    const { data , success }  = JoinPracticeContestSchema.safeParse(req.body)
    if(!data || !success || !userId){ 
        return res.status(400).json({ 
            success : false , 
            error : "INVALID REQUEST", 
            data : null
        })
    }
    const contest = await prisma.contests.findUnique({
        where : { 
            id : data.contestId
        } , 
        select  : { 
            mode : true
        }
    })
    if(contest?.mode == "real"){ 
        return res.status(403).json({
            success : false , 
            error : "FORBIDDEN" , 
            message : "contest is still live ! cant practice "
        })
    }
    const contestId = data.contestId
    //first find that the solution is in memory or not , if not fetch it 
    let Solution =  MCQSolutionMap.get(contestId)
    if(Solution?.length == 0 || !Solution){ 
        await fetchSolution(contestId)
        Solution = MCQSolutionMap.get(contestId)
        if(Solution?.length == 0 || !Solution) {
            return res.status(400).json({
                success : false , 
                error : "EMPTY CONTEST" ,
                data : null
            })
         }
    }
    const randomQuestion = await GetRandomQuestion(contestId ,userId  , Solution)
    console.log("randomQuestion which is not submitted by user " +  JSON.stringify(randomQuestion) )

    
    
    
    const existingUser  =  await prisma.submissions.findFirst({ 
        where : { 
            contestId, 
            userId
        }
    })

    if(existingUser!= null){ 
        return res.status(200).json({
            success : true , 
            message : "User Rejoined the contest" ,
            data : { 
                randomQuestion : randomQuestion
            }
        })
    }

    
    // console.log("leaderboard" + JSON.stringify(leaderbaord))
    console.log("sucessfully joined the contest")
    
    return res.status(200).json({
        success : true , 
        message : "sucessfully joined the contest" ,
        data : { 
            randomQuestion : randomQuestion
        }
    })


}
export async function SubmitAnswerOfPracticeContest(req:Request , res : Response) {

    console.log("inside submit answer")
    const userId = req.userId
    const { data , success } = SubmitPracticeAnswerSchema.safeParse(req.body)

     if(!data || !success || !userId){ 
        return res.status(400).json({ 
            success : false , 
            error : "INVALID REQUEST", 
            data : null
        })
    }
    try{
        const allMCQofThisContest = MCQSolutionMap.get(data.contestId)
        if(!allMCQofThisContest){ 
            return res.status(404).json({
                success : false , 
                data : null , 
                error : "CONTEST_NOT_FOUND"
            })
        }
        // console.log("randomQuestion which is not submitted by user " +  JSON.stringify(randomQuestion) )
        const thisMCQSolution = allMCQofThisContest?.find((x : any)=> x.id === data.questionId)
        if(thisMCQSolution == null){ 
            console.log("failed to find the mcq at db")
            return res.status(404).json({
                success : false , 
                error : "failed to find the mcq at db",
                data : null
            })
        }
        const correctAnswer = thisMCQSolution?.Solution
        if(correctAnswer == data.answer ){ 
            console.log("correct answerr")   
            const submit = await prisma.submissions.upsert({
                where : { 
                    userId_contestId_questionId : { 
                        userId , 
                        contestId : data.contestId , 
                        questionId : data.questionId
                    }
                },
                update : { 
                    selectedOption : data.answer , 
                    isCorrect : true , 
                    mode  : "practice"
                } , 
                create : { 
                    contestId : data.contestId , 
                    questionId : data.questionId , 
                    selectedOption : data.answer , 
                    isCorrect : false , 
                    mode : "practice" , 
                    userId : userId
                }
            })

            const randomQuestion = await GetRandomQuestion(data.contestId , userId ,allMCQofThisContest )
            return res.status(200).send({
                success : true , 
                error : "correct",
                data :  { 
                    randomQuestion : randomQuestion
                }
            })

        }
        else{
            console.log("Wrong answer")
            console.log("right answer " + correctAnswer )
            const submit = await prisma.submissions.upsert({
                where : { 
                    userId_contestId_questionId : { 
                        userId , 
                        contestId : data.contestId , 
                        questionId : data.questionId
                    }
                },
                update : { 
                    selectedOption : data.answer , 
                    isCorrect : false , 
                    mode  : "practice"
                } , 
                create : { 
                    contestId : data.contestId , 
                    questionId : data.questionId , 
                    selectedOption : data.answer , 
                    isCorrect : false , 
                    mode : "practice" , 
                    userId : userId
                }
            })
            const randomQuestion = await GetRandomQuestion(data.contestId , userId ,[...allMCQofThisContest] )
            return res.status(200).json({
                success : true , 
                error : "incorrect",
                data :  { 
                    randomQuestion : randomQuestion
                }
            })
            
        }
        
    } 
    // we need a function here , which will serch -> which fires a random question , and also checking that if that question isnt already exisit in the array 

    catch(e){ 
        alert("error submiting user answer " + e)
        return res.status(200).json({
            success : false , 
            error : "error in submitting answer " + e,
            data : null
        })
    }



}
export async function ReAttemptPracticeContest(req:Request , res : Response) {
    
    const userId = req.userId;

    const {data , success} = ReAttemptPracticeSchema.safeParse(req.body)

    if(!data || !success) { 
        return res.status(400).json({
            success : false,
            error : "BAD REQUEST",
            message : "bad schema"
        })
    }
    try { 

        const contestDetails = await prisma.contests.findUnique({
            where : { 
                id : data.contestId
            }
        })
        if (contestDetails?.mode != "practice" || !contestDetails){ 
            return res.status(403).json({
                success : false , 
                error : "FORBIDDEN" , 
                message : "not a practice quiz ! cant retttempt" 

            })
        }
        const wipeContest = await prisma.submissions.deleteMany({
            where : { 
                contestId : data?.contestId,
                userId : userId
            }
        })
        return res.status(200).json({
            success : true , 
            data : wipeContest , 
            error : null 
        })
    }
    catch(e){ 
        return res.status(500).json({
            success : false ,
            message : "failed with the error" + JSON.stringify(e) , 
            error : "SERVER_ERROR"
        })
    }   
}