import { prisma } from "@repo/database";


export async function allContestQuestions(contestId : string) : Promise<string | object[] | null>{ 
    try { 
        const allContestMCQs = await prisma.mCQ.findMany({
            where : { 
                contestId : contestId
            }
        })
        if(allContestMCQs == null){ 
            return null
        }
        return allContestMCQs
    }
    catch(e){ 
        return JSON.stringify(e)
    }
}