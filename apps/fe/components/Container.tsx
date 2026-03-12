import React  from "react";
import cn from "@/lib/utils";
export default function Container({children , className }
     : { children : React.ReactNode , className ?: string} ){
    return <>
    
        <div className={cn("max-w-5xl mx-auto px-4 md:py-8 bg-primary " , className)}>
            {children}
        </div>
    </>
}