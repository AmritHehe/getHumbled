import { createClient  } from "redis";

export const redisClient = createClient();

redisClient.on("error" , (e)=> { 
    console.log("error at connecting redis client" + e)
})
await redisClient.connect()
console.log("client connected ")