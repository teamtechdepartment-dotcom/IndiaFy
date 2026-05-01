import sibApi from "sib-api-v3-sdk";
import EmailHtmlContent from "../utils/authEmail.js";

export const bervo = async (email, subject, otp, type) => {
    try{
        const client = sibApi.ApiClient.instance;

        const apiKey = client.authentications["api-key"];
        apiKey.apiKey = process.env.BREVO_API_KEY;

        const transEmailApi = new sibApi.TransactionalEmailsApi();

        await transEmailApi.sendTransacEmail({
            sender:{
                email: process.env.companyEmail,
                name: ""
            },
            to:[{email}],
            subject: subject,
            htmlContent: EmailHtmlContent(otp, type)
        })

        return {message: true};
    }
    catch(err){
        return {
            error: err.message,
            message: false
        }
    }
}
