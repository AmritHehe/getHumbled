export async function getContestState( contest : { 
        StartTime:Date  | null ,
        StartDate : Date | null, 
        ContestTotalTime : number ,
        mode : "real" | "practice"
        
    }
    ) : Promise<"LIVE" | "UPCOMING" | "PRACTICE" | undefined>
    
    {
    
    if(contest.mode == "practice") { 
        return "PRACTICE"
    }
    const currentDateTime = new Date() 

    if (!contest.StartDate || !contest.StartTime) {
        return "UPCOMING"
    }


    if(currentDateTime< contest.StartTime){ 
        return "UPCOMING"
    }
    const start = new Date(
        `${contest.StartDate.toISOString().split("T")[0]}T${contest.StartTime}`
    )
    
  const end = new Date(start.getTime() + contest.ContestTotalTime * 60_000)
   
  if (currentDateTime < start) return "UPCOMING"
  if (currentDateTime >= start && currentDateTime <= end) return "LIVE"
  return "PRACTICE"
}