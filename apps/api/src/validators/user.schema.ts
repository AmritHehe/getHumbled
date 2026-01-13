import { password } from "bun"
import z from "zod" 
import { Role } from "../../../../packages/database/generated/client"

export const UserSignUpSchema = z.object({
    username : z.string(),
    email : z.email(), 
    password : z.string(),
    role : z.enum([  "USER" ,"ADMIN"])
})
export const UserSignInSchema = z.object({
    email : z.email(), 
    password : z.string(),
    role : z.enum([  "USER" ,"ADMIN"])
})