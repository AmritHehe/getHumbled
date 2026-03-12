"use client"
import { div } from "motion/react-client"
import { useState } from "react"

export default function QuestionCard(){
    const [isSelected , setIsSelected] = useState<null | number> (null)
    const Question = { 
        title : "ARE WE GONNA MAKE IT SOON ENOUGH ?" , 
        Options : ["yes" , "deffff yesss" , "fuck it man yes" , "I love your platform man"],
        points : 3,
        averageTime : 1
    }
    function handleIsSelected(index : number){
        setIsSelected(index)
    }
    return (
        <>
        <div className="w-2xl h-full bg-white dark:bg-black text-textPrimary flex flex-col items-center justify-center rounded-xl "> 
            <div className="w-full p-4 flex items-center justify-between text-xs text-textMuted">
                <h5>Question</h5>
                <div className="flex gap-2 items-center justify-center">
                    <p className="bg-secondary p-1 rounded-md">{Question.points} pts</p>
                    <p>~{Question.averageTime} mins</p>
                </div>
            </div>
            <div className="w-full  my-4">
                <p className="py-2 px-5 rounded-xl">
                    {Question.title}
                </p>
            </div>
            <div className="w-full  flex flex-col p-4 gap-2 transition-all duration-3000">
                {Question.Options.map((items , index) => { 
                    return(
                     <div onClick={()=>handleIsSelected(index)}  className={(isSelected == index ? `bg-tertiary border-black`  : ``) +" px-2 py-3 hover:bg-secondary transition-all duration-200 rounded-xl border-tertiary border text-textPrimary flex items-center justfiy-center gap-3"}>
                        {(isSelected  == index)? <button className="px-3 py-1 bg-textPrimary text-primary text-sm rounded-md ">R </button>   : <button className="px-3 py-1 bg-secondary text-sm rounded-md ">{String.fromCharCode(index+65)} </button>    }
                        <p className="text-md">{items}</p>
                    </div>
                    )
                })}
            </div>
            <div className="w-full flex items-center justify-end px-4 py-2">
                <button className="bg-textPrimary text-primary px-4 py-2 rounded-xl" >Submit</button>
            </div>
        </div>
        </>
    )
}