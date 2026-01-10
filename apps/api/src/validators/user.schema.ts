import { password } from "bun"
import z from "zod" 

export const UserSignUpSchema = z.object({
    username : z.string(),
    email : z.email(), 
    password : z.string()
})
export const UserSignInSchema = z.object({
    email : z.email(), 
    password : z.string()
})