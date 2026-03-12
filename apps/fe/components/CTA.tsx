export default function CTA(){
    return <div className="h-144 w-full flex flex-col items-start justify-center p-2 gap-8">
           <div className="leading-10  w-xl">
                <h1 className="text-textPrimary font-heading text-5xl mb-5">Compete with developers around the world</h1>
                <h2 className="text-textSecondary font-display text-sm mr-10">
                  Join in Live Contests, conquer the leaderboard or just Practice on any topic with the help of AI
                </h2>
           </div>
           <div className="flex gap-2">
             <button className="font-heading text-textPrimary italic  bg-tertiary text-xl  px-4 py-2 rounded-xl hover:bg-blue-00 hover:scale-105 transition-transform duration-300">Take me there</button>
             <button className="font-heading text-textPrimary border  px-4 py-2 rounded-xl tracking-wide">Practice with AI</button>
           </div>
        </div>
}