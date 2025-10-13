
import jwt, { JwtPayload, Secret, SignOptions } from "jsonwebtoken";

const generateToken = (payload: any, secret: Secret, expiresIn: string) => {
    const token = jwt.sign(payload, secret, {
        algorithm: "HS256",
        expiresIn
    } as SignOptions
    );

    return token;
}


const verifiedToken = (token: string, secret: Secret)=>{

    return jwt.verify(token,secret) as JwtPayload
}
export const jwtHelper = {
    generateToken,
    verifiedToken
}