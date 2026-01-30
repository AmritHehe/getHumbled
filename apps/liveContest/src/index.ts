import { WebSocket ,  WebSocketServer } from 'ws';
import {prisma} from "@repo/database"
import { checkUser } from './middleware';
import { redisClient } from './redisClient';
import type { JwtPayload } from 'jsonwebtoken';
import { StartsubmissionCron } from './submissionCron';


const wss = new WebSocketServer({ port: 8080 });

const users = new Map<WebSocket, {
  userId: string;
  contestId?: string;
  role: "USER" | "ADMIN";
}>();
interface contestSol { 
    contestId : string , 
    contestSol :  {
        id: string;
        srNo: number;
        question: string;
        Solution: "A" | "B" | "C" | "D";
        contestId: string;
        createdAt: Date | null;
        points: number;
        avgTTinMins: number;
    }[]
}
setTimeout(StartsubmissionCron , 3000)
//leaderbaord should stay peristant , even if server crashes we should be able to recover it 
// redis ? db call every 10-20 secs ? 

// todo -> state management in redis , update db every 10 sec ! 
//well you do not need to do this :) -> redis automatically initialize when you call your first user
// export async function makeLeaderbaordState(  contestId : string) {    
//     await redisClient.zAdd(`leaderboard:${contestId}` , []) 
//     console.log("sucessfull")
// }
export async function  addUserInLeaderBoard( contestId : string , userName:string) {
    await redisClient.zAdd(`leaderboard:${contestId}` , { 
        score : 0 , 
        value : userName
    })
    console.log("adding user in leaderboard sucessfull")
}
export async function  addUserInDB(userId : string , contestId : string , role : "USER" | "ADMIN") {
    await redisClient.hSet(`user:${userId}` , { 
        role : role , 
    })
    console.log("adding user in redis sucessfull")
}
export async function  addContestAnswer(contestId:string , contestSol : any) {
    await redisClient.hSet(`contest:${contestId}` , {
        solution : JSON.stringify(contestSol)
    })
    console.log("adding ContestSolution Sucessfull")
}
export async function addUserAnswerSubmission(questionId : string , answer: string , userId : string , contestId : string , points = 0) {
    await redisClient.hSet(`submissions:${contestId}:${userId}` ,
        questionId , 
        JSON.stringify({
            answer,
            points
        })
    )
    await redisClient.sAdd(
        "submission:keys",
        `submissions:${contestId}:${userId}`
    )
    await redisClient.incr("submission:version");
    console.log("adding user answer was sucessfull")
}


// const allContests : contestSol[] = []

wss.on('connection', async function connection(ws , request) {
    console.log("WS connected:", request.url);
    ws.on("error", (err) => {
        console.error("WS Error:", err);
    });
    const fullUrl = new URL(request.url || "", `http://${request.headers.host}`);
    const token = fullUrl.searchParams.get("token") || "";
    const user :JwtPayload | null = checkUser(token); 
    if(!user){ 
        ws.close(1008 , JSON.stringify({
            success : false , 
            error : "UNAUTHORIZED"
        }))
        return ;
    } 
    users.set(ws , { 
        userId : user.userId,
        role : user.role
    })
        

    await addUserInDB(user.userId , "" , user.role )
    ws.on('message', async function message(data) {
         console.log("data incoming" + data)
        let parseData ; 
        try { 
            parseData = JSON.parse(data as unknown as string);
        }
        catch(e){ 
           return ws.send(JSON.stringify({
                success : false , 
                error : "unable to parse the data" ,
                data : null
           }))
        }
      
        if(parseData.type === "init_contest"){ 
            // message request schema
            // { "type" : "init_contest" ,
            //   "contestId" : "cmkbrqsfq0001rrp3nr3t7qmd"
            // }
            console.log("inside init contest")
            const contestId = parseData.contestId;
            const mcqDetails = await prisma.mCQ.findMany({
                where : { 
                    contestId : contestId
                },
                select : { 
                    id : true , 
                    srNo : true , 
                    question : true , 
                    createdAt : true , 
                    points : true , 
                    avgTTinMins : true
                }
            })
            if(mcqDetails.length === 0){
                console.log("no mcqs found in the upcming contest")
                return ws.send(JSON.stringify({
                    success : false , 
                    error : "no mcqs found in the upcming contest" ,
                    data : null
                }))
            }
            try { 
                const isSolutionAlreadyExist = await redisClient.exists(`contest:${contestId}`)
                if(isSolutionAlreadyExist){ 
                    console.log("solution already exisit " + isSolutionAlreadyExist)
                    return ws.send(JSON.stringify({
                        success : false , 
                        error : "solution already exist" ,
                        data : isSolutionAlreadyExist
                    })) 
                }
            }
            catch(e){ 
                console.log("solution didnt exist at all ") 
            }
            try { 
                await addContestAnswer(contestId , mcqDetails)
                console.log("sucessfully added contest in redis")
                const Solution =  await redisClient.hGet(`contest:${contestId}` , "solution")
                console.log("sucess")
                return ws.send(JSON.stringify({
                    success : true , 
                    message : "redis init was sucessfull" ,
                    data : Solution
                }))
            }
            catch(e){ 
                console.log("failed")
                console.log("failed to cache answers in resis")
                return ws.send(JSON.stringify({
                    success : false , 
                    error : "failed to cache answers in resis" ,
                    data : null
                }))
            }
            // ws.send("pushed the data to table " + JSON.stringify(mcqDetails))
        }
        if (parseData.type === "join_contest"){ 
            console.log("inside join contest")
            //message schema
            // { 
            //    "type" : "join_contest" ,
            //    "contestId" : "cmkbrqsfq0001rrp3nr3t7qmd"
            //  }
            const user =users.get(ws)
            const contestId = parseData.contestId
            if(!contestId){ 
                return ws.send(JSON.stringify({
                    success : false , 
                    error : "Invalid Schema" ,
                    data : null
                }))
            }
            if(!user){ 
                console.log("returning as didnt able to find user")
                return ws.send(JSON.stringify({
                    success : false , 
                    error : "user not found" ,
                    data : null
                }))
            }
            const existingUser  =  await redisClient.zScore(`leaderboard:${contestId}` , user.userId )
            if(existingUser!= null){ 
                return ws.send(JSON.stringify({
                    success : false , 
                    error : "User already joined the contest" ,
                    data : null
                }))
            }
            user.contestId = parseData.contestId
            try{ 
                await addUserInLeaderBoard(contestId , user.userId)
                console.log("sucess")
            }
            catch(e){ 
                console.log("failed")
                return ws.send(JSON.stringify({
                    success : false , 
                    error : "user failed to join contest"  + e,
                    data : null
                }))
            }
            const limit = 10
            const leaderbaord = await redisClient.zRangeWithScores(
                `leaderboard:${user.contestId}` ,
                0 , 
                limit -1 , 
                { REV : true}
            )
            console.log("user joined sucessfully")
            console.log("leaderboard" + JSON.stringify(leaderbaord))
            console.log("sucessfully joined the contest")
            const randomQuestion = await GetRandomQuestion(contestId , user.userId)
            console.log("randomQuestion which is not submitted by user " +  JSON.stringify(randomQuestion) )
            return ws.send(JSON.stringify({
                success : true , 
                message : "sucessfully joined the contest" ,
                data : { 
                    leaderbaord : leaderbaord ,
                    randomQuestion : randomQuestion
                }
            }))
 
        }

        if(parseData.type === "leave_contest"){ 
            console.log("inside leave contest")
            const user = users.get(ws)
            // currenrly throughing user , practically , we need to make a db call here or just saved that persisted state
            if(!user){ 
                return; 
            }
            users.delete(ws)
            console.log("sucessfully left the contest")
            ws.send(JSON.stringify({
                success : true , 
                message : "Sucessfully left the contest" ,
                data : null
            }))
            ws.close(1008 , "sucessfully left the contest")
            return 
        }

        if(parseData.type === "submit_answer"){ 
            console.log("inside submit answer")
            // { 
            //     "type" : "submit_answer" ,
            //     "contestId" : "cmkbrqsfq0001rrp3nr3t7qmd" ,
            //     "questionId" : "cmkbrsj5x0005rrp30w7u7s1o" ,
            //     "answer" : "A"
            // }
            const contestId : string = parseData.contestId; 
            const questionId = parseData.questionId
            const answer = parseData.answer; 
            try{
                const user = users.get(ws)
                if(!user){ 
                    return ws.send(JSON.stringify({
                        success : false , 
                        error : "user not found" ,
                        data : null
                    }))
                }
                const userId =user.userId
                const AlreadyScored = await redisClient.hGet(`submissions:${contestId}:${userId}` , questionId)
                console.log("already exisited soluton " + AlreadyScored)
                if(AlreadyScored){ 
                    return ws.send(JSON.stringify({
                        success : false , 
                        error : "submission already exist" ,
                        data : null
                    }))
   
                }
                // we need to somehow make a function which pulls out all the correct answers of that specific contest
                // leaderboard logic in future
                //very bad logic but lets try for now
                //once a question is submitted , if user try to submit the question again it should give the error
                //we should update the db first x
                let StringifiedMCQ  : string | null = await redisClient.hGet(`contest:${contestId}` , "solution")
                if(!StringifiedMCQ){ 
                    console.log("unable to find contest mcq in redis , fetching from db")
                    try { 
                        const MCQs = await prisma.mCQ.findMany({
                            where : {
                                contestId : contestId
                            }
                        })
                        await addContestAnswer(contestId , MCQs)
                        StringifiedMCQ = await redisClient.hGet(`contest:${contestId}` , "solution")

                    }
                    catch(e){ 
                        console.log("failed with error " + e)
                        return ws.send(JSON.stringify({
                            success : false , 
                            error : "failed with error" + e,
                            data : null
                        }))
                    }
                }
                const allMCQofThisContest = JSON.parse(StringifiedMCQ!)
                const thisMCQSolution = allMCQofThisContest?.find((x : any)=> x.id === questionId)
                if(thisMCQSolution == null){ 
                    console.log("failed to find the mcq at db")
                    return ws.send(JSON.stringify({
                        success : false , 
                        error : "failed to find the mcq at db",
                        data : null
                    }))
                }
                
                const correctAnswer = thisMCQSolution?.Solution
                if(correctAnswer == answer ){ 
                    console.log("correct answerr")   
                    await addUserAnswerSubmission(questionId , answer , userId , contestId , thisMCQSolution.points)
                    const addedSubmission = await redisClient.hGet(`submissions:${contestId}:${userId}`, questionId)
                    console.log("hget" +  addedSubmission)

                    // const  prismaSubmit = await prisma.submissions.upsert({
                    //     where : { 
                    //        contestId : contestId, 
                    //        userId : userId , 
                    //        questionId : questionId
                    //     } , 
                    //     update : { 
                    //         userId :  userId ,
                    //         questionId : questionId , 
                    //         selectedOption : answer , 
                    //         isCorrect : true
                    //     },
                    //     create : parsedAllSubmissions
                        
                    // })
                    //call submission here with submission data 
                    //leaderboard update krna hai yaha par redis mein
                    //send updated leaderboard

                    await redisClient.zIncrBy(`leaderboard:${contestId}` , 
                        10 , 
                        userId 
                    )
                    const UpdatedLeaderBoard =  await redisClient.zRangeWithScores(
                        `leaderboard:${contestId}`,
                        0,
                        10 ,
                        { REV: true }
                    );
                    // const questions = await redisClient.hGetAll(`contest:${contestId}`)
                    // console.log("questions " + JSON.stringify(questions))
                    const randomQuestion = await GetRandomQuestion(contestId , userId)
                    console.log("randomQuestion which is not submitted by user " +  JSON.stringify(randomQuestion) )
                    return ws.send(JSON.stringify({
                        success : true , 
                        error : "correct",
                        data :  { 
                            UpdatedLeaderBoard : UpdatedLeaderBoard ,
                            randomQuestion : randomQuestion
                        }}))
                }
                else{
                    console.log("Wrong answer")
                    const randomQuestion = await GetRandomQuestion(contestId , userId)
                    console.log("randomQuestion which is not submitted by user " +  JSON.stringify(randomQuestion) )
                    await addUserAnswerSubmission(questionId , answer , userId , contestId , 0 )
                    return ws.send(JSON.stringify({
                        success : true , 
                        error : "incorrect",
                        data :  { 
                            randomQuestion : randomQuestion
                        }
                    }))
                    
                }
                
            } 
            // we need a function here , which will serch -> which fires a random question , and also checking that if that question isnt already exisit in the array 

            catch(e){ 
                alert("error submiting user answer " + e)
                return ws.send(JSON.stringify({
                    success : false , 
                    error : "error in submitting answer " + e,
                    data : null
                }))
            }


    }
    console.log('received: %s', data);
    });
    ws.on("close" , ()=> { 
        users.delete(ws)
    })
    ws.send('ws handshake sucessfull');
});
// we need a function 
//which will do db call everyone miniute - 

//just learned that we need to idempotently update submissions , that is if submission cron is running it must not affect 
// the already update one , meaning if you call a function lets say turn light on , calling it multiple times will keep the l
//light on only(idempotent) but lets say u have a function known as balance , you cant call that function multiple times as calling it each time wull lead to increase balance everytime ( not idempotent


function GetRandomIndex( arrayLength : number) : number{
    const randomIndex = Math.floor(Math.random() * arrayLength) 
    return randomIndex

}
async function GetRandomQuestion(contestId : string , userId : string )  : Promise<object> { 
    const questions = await redisClient.hGet(`contest:${contestId}` , "solution")
    if(!questions){ 
        console.log("tell amrit to fix his code")
        
    }
    // console.log("questions " + questions)

    const ParsedQuestions = JSON.parse(questions!)
    const randomIndex = GetRandomIndex(ParsedQuestions.length)
    let randomQuestionId = ParsedQuestions[randomIndex].id 
    
    if((await redisClient.hGet(`submissions:${contestId}:${userId}` , randomQuestionId)) != null) { 
        console.log("recursion got called " )
       await GetRandomQuestion(contestId , userId)
    }
    console.log("random Question " + JSON.stringify(ParsedQuestions[randomIndex]))
    return ParsedQuestions[randomIndex]
}