export async function getContestState( contest : { 
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

    if (!contest.StartDate) {
        console.log("returning upcoming because of here")
        return "UPCOMING"
    }

  const start = contest.StartDate
  const end = new Date(start.getTime() + contest.ContestTotalTime * 60_000)
   
  if (currentDateTime < start) return "UPCOMING"
  if (currentDateTime >= start && currentDateTime <= end) return "LIVE"
  return "PRACTICE"
}