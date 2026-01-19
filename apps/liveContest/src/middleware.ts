import jwt, { type JwtPayload } from "jsonwebtoken"
export function checkUser(token : string) : JwtPayload | null {
   const JWT_SECRET = process.env.JWT_SECRET!
   if(JWT_SECRET == null){ 
    console.log("tell amrit to fix his code")
   }
   try{
        const decoded = jwt.verify(token , JWT_SECRET); 
        
        if (typeof decoded == "string"){ 
            return null; 
        }
        if(!decoded || !decoded.userId){ 
            return null; 
        }  
        return decoded ;
   }

   catch(e){
      return null
   }
}