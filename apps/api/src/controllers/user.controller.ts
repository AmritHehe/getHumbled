import type { Request , Response } from "express";
import { UserSignUpSchema , UserSignInSchema } from "../validators/user.schema";
import { prisma } from "@repo/database";
import bcrypt from "bcrypt"
import jwt from "jsonwebtoken"

export async function SignUp(req : Request  , res : Response ){ 
    
    const {data , success} = UserSignUpSchema.safeParse(req.body)
    if(!success){
        return res.status(400).json({
            sucess : false , 
            error : "Invalid Schema"
        })
    }
    const hashedPassword = await bcrypt.hash(data.password , 10)
    try { 
        const result = await prisma.user.create({
            data : { 
                name : data.username , 
                email : data.email,
                password : hashedPassword,
                role : data.role
            }
        })
        return res.status(201).json({
            success : true ,
            data :  { 
                name : result.name,
                email : result.email , 
                password : result.password,
                role : result.role
            }
        })
    }
    catch(e){
        return res.status(500).json({
            success : false , 
            error : "Database Down"
        })
    }

    
}
export async function SignIn(req : Request  , res : Response ){ 

  
    const {data , success} = UserSignInSchema.safeParse(req.body)
    if(!success){
        return res.status(400).json({
            sucess : false , 
            error : "Invalid Schema"
        })
    }
    try { 
        const result = await prisma.user.findUnique({
            where : { 
                email : data.email,
            }
        })
        if(result == null){
            return res.status(404).json({
                success : false , 
                error : "User Not Found"
            })
        }
        const passCheck = await bcrypt.compare(data.password , result.password)
        if(!passCheck){ 
            res.status(403).json({
                success : false , 
                error : "invalid credentials"
            })
        }
        const jwtSecret = process.env.JWT_SECRET!

        const token = jwt.sign({
            userId : result.id, 
            role : result.role
        } , jwtSecret)

        return res.status(201).json({
            success : true ,
            data :  { 
                token : token
            }
        })
    }
    catch(e){
        return res.status(500).json({
            success : false , 
            error : "Database Down"
        })
    }
    
}
export async function User(req : Request  , res : Response){ 
    const userId = req.userId

    try { 
        const userDetails = await prisma.user.findUnique({
            where : { 
                id : userId
            }
        })
        if(userDetails == null){ 
            return res.status(404).json({
                success : false , 
                error : "user not found"
            })
        }9
        return res.status(200).json({
            success : true , 
            data : userDetails
        })
    }
    catch(e){ 
        return res.status(500).json({
            success : false ,
            error : "database down"
        })
    }
}
