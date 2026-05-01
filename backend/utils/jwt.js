import jwt from "jsonwebtoken";

const jwtToken = async (user) => {
    const securityKey = process.env.SecurityKey;
    try{
        const accesToken = await jwt.sign(user, securityKey, {expiresIn: "15m"});
        const refreshToken = await jwt.sign(user, securityKey, {expiresIn:"30d"});

        return {
            message:true,
            accessToken: accesToken,
            refreshToken: refreshToken
        }
    }catch(err){
        return {message: false}
    }
}

export default jwtToken;