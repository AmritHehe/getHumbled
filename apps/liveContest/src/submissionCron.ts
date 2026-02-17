import {prisma} from "@repo/database"
import { redisClient } from './redisClient';
//idempotent submission to do cron calling 

let  lastProcessedVersion  = await redisClient.get("submission:version")


export async function submissions( buffer : any) : Promise<any>{ 
    console.log('welll I am inside submissions and should post them finally ')
    //take submission from redis 
    // do upset 
    try { 
         const result = await prisma.submissions.createMany({
            data : buffer , 
            skipDuplicates : true
        })
        console.log("updated it in prisma result " + JSON.stringify(result))
        return result
    }
   catch(e){ 
        console.log("error" + e)
        return null
   }
}

export async function submissionCronLogic(){
    console.log("triggered ")
    const lock = await redisClient.set(
        "lock:submission_cron",
        "1",
        { NX: true, EX: 550 }
    );
    if (!lock) return;
    try { 

        let  currentVersion = await redisClient.get("submission:version")
        console.log("last processded version " + lastProcessedVersion)
        console.log("current version " + currentVersion)
        if(currentVersion === lastProcessedVersion){ 
            console.log("cron triggered but no new submission ")
            return
        }
        const submissionkeys = await redisClient.sMembers("submission:keys")
        if (submissionkeys.length === 0){
            console.log("owww i am Silently Returning from here dayum")
            return;
        } ;
        const BATCH_SIZE = 500;
        let buffer: any[] = [];
        const pipeline = redisClient.multi();
        submissionkeys.forEach(key => pipeline.hGetAll(key));
        const results = await pipeline.exec() 
        console.log("type of result " + typeof(results))
        console.log("result " + JSON.stringify(results))
        if(!results){ 
            console.log("results are null returning from here" + results)
        }
        for(let i = 0 ; i < submissionkeys.length ; i++){
                const data = results[i] 
                 if (!data || Object.keys(data).length === 0) {
                    console.log("Skipping empty submission hash");
                    continue;
                }
                const key = submissionkeys[i]
                const [, contestId, userId] = key.split(":");
                for(const questionId in data){
                //@ts-ignore
                const parsed = JSON.parse(data[questionId])
                buffer.push({
                    contestId :  contestId , 
                    userId : userId ,
                    questionId : questionId,
                    selectedOption : parsed.answer ,
                    isCorrect : parsed.points > 0
                })

                if(buffer.length >= BATCH_SIZE){ 
                    console.log("adding submissions now")
                    const result = await submissions(buffer) ;
                    console.log("buffer  result " + JSON.stringify(result) )
                    buffer = []
                }
                }
        }
        if(buffer.length > 0 ) { 
            console.log('adding submission in db jhahahahahhahahahah')
            const result = await submissions(buffer);
            console.log("buffer  result " + JSON.stringify(result) )
            buffer = []
        }
        lastProcessedVersion = currentVersion
    }
    finally{
        console.log("deleting log ")

        await redisClient.del("lock:submission_cron")
    }
}

export function StartsubmissionCron(){ 
    console.log("submission cron started working")
    setInterval(submissionCronLogic , 240000)
}

