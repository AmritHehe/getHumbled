import { WebSocket ,  WebSocketServer } from 'ws';
import {prisma} from "@repo/database"
import { checkUser } from './middleware';
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
const leaderboard = [{
    userId : "123abcd", 
    totalPoints : 20
}]
const users :User[] = []  

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

        parseData = JSON.parse(data as unknown as string);

        if (parseData.type === "join_contest"){ 
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
        }

        if(parseData.type === "leave_contest"){ 
            const user = users.find(x => x.ws  === ws); 
            if(!user){ 
                return; 
            }
            user.contestId = ""
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
                const mcqDetails = await prisma.mCQ.findFirst({
                    where : { 
                        id : questionId
                    }
                })
                if(mcqDetails == null){ 
                    console.log("failed to find the mcq at db")
                    return 
                }
                const correctAnswer = mcqDetails?.Solution
                if(correctAnswer == answer ){ 
                    
                    let  foundIndex = leaderboard.findIndex(leaderboard => leaderboard.userId == user.userId);
                    let prevPoints =  leaderboard[foundIndex].totalPoints
                    leaderboard[foundIndex] = { 
                        userId : user.userId , 
                        totalPoints : prevPoints + mcqDetails!.points
                    }
                }
                
            } 
        catch(e){ 
            alert("error submiting user answer " + e)
        }


    }
    console.log('received: %s', data);
    });

    ws.send('something');
});