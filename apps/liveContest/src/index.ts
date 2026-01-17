import { WebSocket ,  WebSocketServer } from 'ws';
import {prisma} from "@repo/database"
import { checkUser } from './middleware';
import { json } from 'zod';
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
const leaderboard = [{
    userId : "123abcd", 
    totalPoints : 20
}]
const users :User[] = []  
const allContests : contestSol[] = []

wss.on('connection', function connection(ws , request) {
    console.log("WS connected:", request.url);
    ws.on("error", (err) => {
        console.error("WS Error:", err);
    });
    const fullUrl = new URL(request.url || "", `http://${request.headers.host}`);
    const token = fullUrl.searchParams.get("token") || "";
    const userId = checkUser(token); 
    if(userId==null){ 
        ws.close(1008 , "Invalid Token")
        return ;
    } 
    users.push({ 
        ws ,
        contestId : "",
        userId, 
        answers : []
    })
    
    ws.on('message', async function message(data) {
        let parseData ; 
        try { 
            parseData = JSON.parse(data as unknown as string);
        }
        catch(e){ 
            ws.send("failed to parse the data")
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
            if(mcqDetails==null){
                console.log("no mcqs found in the upcming contest")
                ws.send("no mcqs found in the upcming contest")
            }
            const isSolutionAlreadyExist = allContests.find(x => x.contestId === contestId)
            if(isSolutionAlreadyExist != undefined){ 
                console.log("solution already exisit " + isSolutionAlreadyExist)
                ws.send("solution already exisit" + isSolutionAlreadyExist)
            }
            allContests.push({
                contestId : contestId , 
                contestSol : mcqDetails
            })
            console.log("pushed the data to table " + JSON.stringify(mcqDetails))
            console.log("all Contests" + JSON.stringify(allContests))
            ws.send("pushed the data to table " + JSON.stringify(mcqDetails))
            ws.send("all Contests" + JSON.stringify(allContests))
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
            user.contestId = parseData.contestId
            
            leaderboard.push({
                userId : user.userId , 
                totalPoints : 0
            })
            console.log("user joined sucessfully")
            console.log("leaderboard" + JSON.stringify(leaderboard))
            ws.send("sucessfully joined the contest")
            ws.send("leaderboard" + JSON.stringify(leaderboard))
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