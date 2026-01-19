import { WebSocket ,  WebSocketServer } from 'ws';
import {prisma} from "@repo/database"
import { checkUser } from './middleware';
import { json } from 'zod';
import { redisClient } from './redisClient';
import { use } from 'react';
import type { JwtPayload } from 'jsonwebtoken';


const wss = new WebSocketServer({ port: 8080 });

interface User { 
  ws: WebSocket,
//   rooms : string[],
  contestId : string ,
  userId : string , 
  answers : { 
    questionId : string,
    userAnswer : "A" | "B" | "C" | "D"
  }[]
}
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

const leaderboard = [{
    userId : "123abcd", 
    totalPoints : 20
}]
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
    console.log("sucessfull")
}
export async function  addUserInDB(userId : string , contestId : string , role : "USER" | "ADMIN") {
    await redisClient.hSet(`user:${userId}` , { 
        role : role , 
        contestId : contestId
    })
    console.log("sucessfull")
}
export async function  fetchContestAnswer(contestId:string , contestSol : any) {
    await redisClient.hSet(`contest:${contestId}` , {
        solution : JSON.stringify(contestSol)
    })
    console.log("sucessfull")
}

const users :User[] = []  
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
    users.push({ 
        ws ,
        contestId : "",
        userId : user.userId, 
        answers : []
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
                await fetchContestAnswer(contestId , mcqDetails)
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
            const user = users.find(x => x.ws  === ws); 
            // currenrly throughing user , practically , we need to make a db call here or just saved that persisted state
            if(!user){ 
                return; 
            }
            user.contestId = ""
            console.log("sucessfully left the contest")
            ws.send("sucessfully left the contest")
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
                const user = users.find(x => x.ws  === ws); 
                if(!user){ 
                    return; 
                }
                else user.answers.push({
                    questionId : questionId, 
                    userAnswer : answer
                })
            // we need to somehow make a function which pulls out all the correct answers of that specific contest
            // leaderboard logic in future
                //very bad logic but lets try for now
                //once a question is submitted , if user try to submit the question again it should give the error
                //we should update the db first x
                const allMCQofThisContest = allContests.find(x => x.contestId === contestId)
                const solutionOfAllMCQs = allMCQofThisContest?.contestSol
                const thisMCQSolution = solutionOfAllMCQs?.find(x=> x.id === questionId)
                if(thisMCQSolution == null){ 
                    console.log("failed to find the mcq at db")
                    ws.send("failed to find the mcq at db")
                    return 
                }
                const correctAnswer = thisMCQSolution?.Solution
                if(correctAnswer == answer ){ 
                    ws.send("correct answr")
                    let  foundIndex = leaderboard.findIndex(leaderboard => leaderboard.userId == user.userId);
                    let prevPoints =  leaderboard[foundIndex].totalPoints
                    leaderboard[foundIndex] = { 
                        userId : user.userId , 
                        totalPoints : prevPoints + thisMCQSolution!.points
                    }
                    ws.send("updated leaderboard" + JSON.stringify(leaderboard))
                }
                else{
                    ws.send("Wrong answer")
                }
                
            } 
        catch(e){ 
            alert("error submiting user answer " + e)
            ws.send("error in submitting answer " + e)
        }


    }
    console.log('received: %s', data);
    });

    ws.send('ws handshake sucessfull');
});