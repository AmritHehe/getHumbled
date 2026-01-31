import { prisma } from "@repo/database"
import type { MCQDetails } from "../cache/solutionCache"


async function getCurrentSubmissions(contestId:string , userId : string)  {

    const result = await prisma.submissions.findMany({ 
        where : { 
            contestId : contestId , 
            userId : userId
        } , 
        select : { 
            questionId : true
        }
    })
    const submittedSet = new Set(result.map(x => x.questionId))
    return submittedSet
    
}


function GetRandomIndex( arrayLength : number) : number{
    const randomIndex = Math.floor(Math.random() * arrayLength) 
    return randomIndex

}
export async function GetRandomQuestion(contestId : string , userId : string , remaining : MCQDetails[]  )  : Promise<any> { 

    
    const submitted = await getCurrentSubmissions(contestId , userId )
    const remaingQuestions  = remaining.filter(x => !submitted.has(x.id))

    if(remaingQuestions.length == 0) { 
        return undefined
    }
    const randomIndex = GetRandomIndex(remaingQuestions.length)
    const RandomQuestion = remaingQuestions[randomIndex]

    const { Solution , ...rest }= RandomQuestion
    console.log( "randomQuestion " + RandomQuestion )
    console.log( "rest " + rest )
    return rest
}