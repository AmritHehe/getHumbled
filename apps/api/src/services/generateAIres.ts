import { createOpenRouter } from "@openrouter/ai-sdk-provider"
import { type ModelMessage, generateText } from "ai"


interface Questions { 
    question : string ,
    Solution :  "A" | "B" | "C" | "D"
    contestId : string
    points :  number 
    avgTTinMins : number
}

export async function GenerateQuestions(data  : any  , model = "stepfun/step-3.5-flash:free" ) : Promise<Questions[]|null>{ 
        const openRouter = createOpenRouter({
            apiKey : process.env.OPENROUTER_API_KEY
        })
        let Context : ModelMessage[] = [
            { 
                role : "system",
                content :  `You are an expert teacher who is creating test for his fellow students ,the user/student will provide you a topic and you have to create atleast 10 questions for it ! you can create more , I am using prisma create many thing so you have to only return an array of object , where each object will follow this exact schema model MCQ{
                    {
                    question String 
                    Solution MCQs
                    points Int 
                    avgTTinMins Int @default(2)
                    }
    
                    the above schema is caseSenstive so keep that in mind  dont write solution write Solution 
                    follow the exact schema and return an array of objects , also how will all options store in database  weill you have to generate a question string  like this 
    
                    "
                    how many keys are there in keyboard
    
                    Options:
                    A) 100
                    B) 200
                    C) 300
                    D) 400
                    "
                    make sure to generate question string like above example
                    
                    Return JSON ONLY.
                    Each object MUST have:
                    - question (string)
                    - Solution (one of "A" | "B" | "C" | "D")
                    - points (number)
                    - avgTTinMins (number)

                    DO NOT include markdown.
                    DO NOT include explanations.
                    DO NOT include text outside JSON.
                    and the Solution is enum of Captial A , B. , C , D , good luck 
                    
                    `
                
            } , 
            { 
                role : "user" , 
                content : data.prompt 
            }
        ]
        
        const result = await generateText({
            model  : openRouter("stepfun/step-3.5-flash:free"),
            messages : Context , 
            temperature : 0.2
        })
        console.log("result " + JSON.stringify(result))
        console.log("^^^^^^^^^^^^^^^^^^^^^^^^^")
        console.log("text" + result.text)
     
        console.log("type of data of result txt" + typeof(result.text))
        const rawText = result.text.trim();
    
        const jsonArrayString = rawText.match(/\[[\s\S]*\]/)?.[0];
        if (!jsonArrayString) {
            return null
        }
    
        const dataArray = JSON.parse(jsonArrayString);
        if (!Array.isArray(dataArray)) return null
        const finalData : Questions[]  | null= dataArray.map((x : any) => ({ 
            question : x.Question || x.question ,
            Solution : x.solution || x.Solution , 
            contestId : data.contestId , 
            points : x.points || x.Points, 
            avgTTinMins : x.avgTTinMins || x.AvgTTinMins

        }))
        return finalData

}
    
