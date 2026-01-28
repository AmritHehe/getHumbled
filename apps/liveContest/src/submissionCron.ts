import {prisma} from "@repo/database"
import { redisClient } from './redisClient';
//idempotent submission to do cron calling 

export async function submissions( buffer : any) : Promise<any>{ 
    //take submission from redis 
    // do upset 
    const result = await prisma.submissions.createMany({
        data : buffer , 
        skipDuplicates : true
    })
    console.log("updated it in prisma result " + JSON.stringify(result))
    return result
}
let lastProcessedVersion : any;
export async function submissionCronLogic(){
    const lock = await redisClient.set(
        "lock:submission_cron",
        "1",
        { NX: true, EX: 550 }
    );
    if (!lock) return;
    try { 

        let  currentVersion = await redisClient.get("submission:version")
        if(currentVersion === lastProcessedVersion){ 
            console.log("cron triggered but no new submission ")
            return
        }
        const submissionkeys = await redisClient.sMembers("submission:keys")
        if (submissionkeys.length === 0) return;
        const BATCH_SIZE = 500;
        let buffer: any[] = [];
        const pipeline = redisClient.multi();
        submissionkeys.forEach(key => pipeline.hGetAll(key));
        const results = await pipeline.exec() as unknown as Array<[Error | null, Record<string, string>]>;
        for(let i = 0 ; i < submissionkeys.length ; i++){

                const key = submissionkeys[i]
                const data = results?.[i]?.[1] as Record<string, string> | null;
                if (!data || Object.keys(data).length === 0) continue;

                const [, contestId, userId] = key.split(":");
                for(const questionId in data){
                const parsed = JSON.parse(data[questionId])
                buffer.push({
                    contestId :  contestId , 
                    userId : userId ,
                    questionId : questionId,
                    selectedOption : parsed.answer ,
                    isCorrect : parsed.points > 0
                })

                if(buffer.length >= BATCH_SIZE){ 
                    const result = await submissions(buffer) ;
                    console.log("buffer  result " + result )
                    buffer = []
                }
                }
        }
        if(buffer.length > 0 ) { 
            const result = await submissions(buffer);
            console.log("buffer  result " + result )
            buffer = []
        }
        lastProcessedVersion = currentVersion
    }
    finally{
        console.log("deleting log ")

        await redisClient.del("lock:submission_cron")
    }
}

setInterval(submissionCronLogic , 600000 , ()=> { 
    console.log("cron triggered 1 ")
})