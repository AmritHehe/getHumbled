import { password } from "bun"
import z from "zod" 

export const UserSchema = z.object({
    username : z.string(),
    email : z.email(), 
    password : z.string()
})