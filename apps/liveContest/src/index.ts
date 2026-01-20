import { WebSocket ,  WebSocketServer } from 'ws';
import {prisma} from "@repo/database"
import { checkUser } from './middleware';
import { redisClient } from './redisClient';
import type { JwtPayload } from 'jsonwebtoken';


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
        ws.close(1008 , "Invalid Token")
        return ;
    } 
    users.set(ws , { 
        userId : user.userId,
        role : user.role
    })
        

    await addUserInDB(user.userId , "" , user.role )
    ws.on('message', async function message(data) {
        let parseData ; 
        try { 
            parseData = JSON.parse(data as unknown as string);
        }
        catch(e){ 
           return ws.send("failed to parse the data")
        }
        if(parseData.type === "init_contest"){ 
            // message request schema
            // { "type" : "init_contest" ,
            //   "contestId" : "cmkbrqsfq0001rrp3nr3t7qmd"
            // }
            const contestId = parseData.contestId;
            const mcqDetails = await prisma.mCQ.findMany({
                where : { 
                    contestId : contestId
                }
            })
            if(mcqDetails.length === 0){
                console.log("no mcqs found in the upcming contest")
                return ws.send("no mcqs found in the upcming contest")
            }
            try { 
                const isSolutionAlreadyExist = await redisClient.exists(`contest:${contestId}`)
                if(isSolutionAlreadyExist){ 
                    console.log("solution already exisit " + isSolutionAlreadyExist)
                    ws.send("solution already exisit" + isSolutionAlreadyExist)
                    return
                }
            }
            catch(e){ 
                console.log("solution didnt exist at all " + e) 
            }
            try { 
                await addContestAnswer(contestId , mcqDetails)
                console.log("sucessfully added contest in redis")
                const Solution =  await redisClient.hGet(`contest:${contestId}` , "solution")
                console.log("sucess")
                return ws.send("redis init was sucessfull" + Solution)
            }
            catch(e){ 
                console.log("failed")
                ws.send("failed to cache answers in resis")
            }
            ws.send("pushed the data to table " + JSON.stringify(mcqDetails))
        }
        if (parseData.type === "join_contest"){ 
            //message schema
            // { 
            //    "type" : "join_contest" ,
            //    "contestId" : "cmkbrqsfq0001rrp3nr3t7qmd"
            //  }
            const user = users.find( x => x.ws === ws);
            if(!user){ 
                console.log("returning as didnt able to find user")
                return 
            }
            const existingUser  =  await redisClient.exists(`user:${user.userId}`)
            if(existingUser){ 
                ws.send("user already joined the contest")
            }
            user.contestId = parseData.contestId
            try{ 
                await addUserInLeaderBoard(user.contestId , user.userId)
                console.log("sucess")
            }
            catch(e){ 
                ws.send("failed to join yser to contest")
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
            ws.send("sucessfully joined the contest")
 
        }

        if(parseData.type === "leave_contest"){ 
            const user = users.get(ws)
            // currenrly throughing user , practically , we need to make a db call here or just saved that persisted state
            if(!user){ 
                return; 
            }
            user.contestId = ""
            console.log("sucessfully left the contest")
            ws.send("sucessfully left the contest")
            ws.close(1008 , "sucessfully left the contest")
        }

        if(parseData.type === "submit_answer"){ 
            // { 
            //     "type" : "submit_answer" ,
            //     "contestId" : "cmkbrqsfq0001rrp3nr3t7qmd" ,
            //     "questionId" : "cmkbrsj5x0005rrp30w7u7s1o" ,
            //     "answer" : "A"
            // }
            const contestId = parseData.contestId; 
            const questionId = parseData.questionId
            const answer = parseData.answer; 
            try{
                const user = users.get(ws)
                if(!user){ 
                    return ws.send("unable to find user")
                }
                const userId =user.userId
                const AlreadyScored = await redisClient.hGet(`submissions:${contestId}:${userId}` , questionId)
                console.log("already exisited soluton " + AlreadyScored)
                if(AlreadyScored){ 
                    
                    return ws.send("submission already exist")
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
                        return ws.send("failed with error " + e)
                    }
                }
                const allMCQofThisContest = JSON.parse(StringifiedMCQ!)
                const thisMCQSolution = allMCQofThisContest?.find((x : any)=> x.id === questionId)
                if(thisMCQSolution == null){ 
                    console.log("failed to find the mcq at db")
                    ws.send("failed to find the mcq at db")
                    return 
                }
                
                const correctAnswer = thisMCQSolution?.Solution
                if(correctAnswer == answer ){ 
                    ws.send("correct answerr")
                    
                    await addUserAnswerSubmission(questionId , answer , userId , contestId , thisMCQSolution.points)
                    const addedSubmission = await redisClient.hGet(`submissions:${contestId}:${userId}`, questionId)
                    console.log("hget" +  addedSubmission)
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
                    ws.send("updated leaderboard" )
                }
                else{
                    ws.send("Wrong answer")
                    await addUserAnswerSubmission(questionId , answer , userId , contestId , 0 )
                }
                
            } 
            catch(e){ 
                alert("error submiting user answer " + e)
                ws.send("error in submitting answer " + e)
            }


    }
    console.log('received: %s', data);
    });
    ws.on("close" , ()=> { 
        users.delete(ws)
    })
    ws.send('ws handshake sucessfull');
});