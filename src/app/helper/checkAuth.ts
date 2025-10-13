import { NextFunction, Request, Response } from "express"
import { jwtHelper } from "./generateToken"
import config from "../../config"


const checkAuth = (...role: string[])=>{
   return async (req: Request & {user?: any}, res: Response, next: NextFunction)=> {

        try {
            const token = req.cookies.accessToken

            if(!token){
                throw new Error("token undefined")
            }

            const verifyUsers = jwtHelper.verifiedToken(token, config.jwt.JWT_SECRET as string)

            req.user = verifyUsers

            if(role.length> 0 && !role.includes(verifyUsers.role)){
                throw new Error("you are not authorized")
            }

            next()
            
        } catch (error) {
            next(error)
        }

    }
}

export default checkAuth