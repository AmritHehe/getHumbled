import { prisma } from "@repo/database";

export interface MCQDetails { 

    id: string,
    srNo: number,
    question: string,
    Solution: "A" | "B" | "C" | "D",
    contestId: string,
    createdAt: Date | null,
    points: number ,
    avgTTinMins: number

}

export const MCQSolutionMap = new Map< string, MCQDetails[]>();


export async function fetchSolution(contestId : string)  { 
    const result  : MCQDetails[]  = await prisma.mCQ.findMany({
        where : { 
            contestId : contestId
        },
        
    })
    if(result.length == 0){ 
        console.log("unable to fetch the solution from db ")
    }

    MCQSolutionMap.set(contestId , result)
} 