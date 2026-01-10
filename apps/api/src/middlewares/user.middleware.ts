import type { Request , Response , NextFunction } from "express";
import jwt, { type JwtPayload } from "jsonwebtoken"
import { success } from "zod";

const jwtSecret = process.env.JWT_SECRET!
export async function TokenVerification(req : Request  , res :Response , next : NextFunction){
    const bearerToken :String | undefined = req.headers.authorization;
    if(!bearerToken || !bearerToken.startsWith('Bearer ')){
        return res.status(403).json({
            success : false , 
            error : "Token not present , Unauthorized"
        })
    }
    const tokenArray = bearerToken?.split(" ")
    const token = tokenArray[1];
    
    const decoded = jwt.verify(token , jwtSecret) as JwtPayload & {userId : string , role : "Admin" | "User"}
    if(!decoded){
        return res.status(403).json({
            success : false , 
            error : "coudnt verify the token"
        })
    }
    req.userId  =decoded.userId
    req.role = decoded.role
    next()
    
}