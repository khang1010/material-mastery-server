'use strict';
const nodemailer = require('nodemailer');
const redisClient = require('../dbs/init-redis');
const { OAuth2Client } = require('google-auth-library');
const { BadRequestError } = require('../core/error-response');
const { user } = require('../models/user.model');
// const twilio = require('twilio');
const GOOGLE_MAILER_CLIENT_ID = '667971001401-r5dtcf3mga4m0h1r5mkhi817k1jqqpne.apps.googleusercontent.com'
const GOOGLE_MAILER_CLIENT_SECRET = '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'
const GOOGLE_MAILER_REFRESH_TOKEN = '1//04gwUVRuygeIyCgYIARAAGAQSNwF-L9IrS4XCIRqJE5XEEjsuX9CQNy8VJ2m71AtxaIysJEWPUG-gGNo5w4mtHfYFMNpNA_VZtZM'
const ADMIN_EMAIL_ADDRESS = 'materialmastery@gmail.com'

const myOAuth2Client = new OAuth2Client(
    GOOGLE_MAILER_CLIENT_ID,
    GOOGLE_MAILER_CLIENT_SECRET
)
myOAuth2Client.setCredentials({
    refresh_token: GOOGLE_MAILER_REFRESH_TOKEN
})

// function formatPhoneNumber(phoneNumber) {
//     const cleaned = phoneNumber.replace(/\D/g, '');
//     if (cleaned.startsWith('0')) {
//       return `+84${cleaned.slice(1)}`;
//     }
  
//     return cleaned;
// }
class AuthService {
    static generateVerificationCode = () => {
        const codeLength = 6;
        const min = Math.pow(10, codeLength - 1);
        const max = Math.pow(10, codeLength) - 1;
        const verificationCode = Math.floor(Math.random() * (max - min + 1)) + min;
        return verificationCode.toString();
    }
    static sendVerificationEmail = async (email) => {
        const foundUser = await user.findOne({ email }).lean();
        if (foundUser) throw new BadRequestError('Email already exists');
        try {
            const myAccessTokenObject = await myOAuth2Client.getAccessToken()
            const myAccessToken = myAccessTokenObject?.token
            const transport = nodemailer.createTransport({
                service: 'gmail',
                auth: {
                  type: 'OAuth2',
                  user: ADMIN_EMAIL_ADDRESS,
                  clientId: GOOGLE_MAILER_CLIENT_ID,
                  clientSecret: GOOGLE_MAILER_CLIENT_SECRET,
                  refresh_token: GOOGLE_MAILER_REFRESH_TOKEN,
                  accessToken: myAccessToken
                }
            })
            const code = await AuthService.saveVerificationToken(email);
            const mailOptions = {
                from: "Material Mastery",
                to: email,
                subject: 'Email Verification',
                html: `
                <html lang="en">
                <head>
                  <meta charset="UTF-8">
                  <meta name="viewport" content="width=device-width, initial-scale=1.0">
                </head>
                <body style="font-family: 'Inter', sans-serif;box-sizing: border-box;margin: 0;background-color: #fff;">
                  <div style='
                      position:relative;
                      margin: 1rem 1.2rem;
                      padding: 1rem 1.4rem;
                      border-bottom: 8px solid #02B1AB;
                      box-shadow: 0px 0px 10px 0px rgba(0,0,0,0.15);
                      '>
                    <div style="display: flex;
                      align-items: center;
                      justify-content: start;
                      padding: 1rem 0;
                      gap: 1.8rem;">
                      <span style="text-transform: uppercase;
                          color: #02B1AB;
                          font-weight: 700;
                          font-size: 1.4rem;"> Welcome to MM! </span>
                    </div>
                    <!--  content  -->
                    <p>
                      <span style='font-weight: 700; '>Hi ${email},</span>
                      <br>
                      <br>Thank you for registering with us. Please use the following verification code:
                    </p>
                    <div style='text-align: center;margin: 3rem auto;'>
                      <span style='
                      display: inline-block;
                      padding: 0.5rem 3rem;
                      font-size: 3rem; 
                      font-weight: 700; 
                      background: #ebebeb;
                      color: #02CAC4;
                      letter-spacing: 0.4rem;
                      '>${code}</span>
                      <p style="
                          font-style: italic;
                          color: #6b6b6b;
                          ">(This code will expire in <span style="color:#000; font-weight: 600;">5 minutes</span>.) </p>
                    </div>
                    <br>If you didn't request this verification, please ignore this email. <br>
                    <br> Thank you, <br>
                    <span style="color: #02CAC4; font-weight: 700; line-height: 1.4;">Material Mastery</span>
                  </div>
                  <span style='
                      position:absolute;
                      bottom:40px;
                      right:15px;
                      opacity:0.5;
                      z-index:-1;
                      color:white;
                      '>
                    <svg xmlns="http://www.w3.org/2000/svg" width="219" height="150" viewBox="0 0 219 150" fill="none">
                      <path d="M5 25C5 19.6957 7.44662 14.6086 11.8016 10.8579C16.1566 7.10714 22.0633 5 28.2222 5H190.778C196.937 5 202.843 7.10714 207.198 10.8579C211.553 14.6086 214 19.6957 214 25M5 25V125C5 130.304 7.44662 135.391 11.8016 139.142C16.1566 142.893 22.0633 145 28.2222 145H190.778C196.937 145 202.843 142.893 207.198 139.142C211.553 135.391 214 130.304 214 125V25M5 25L109.5 85L214 25" stroke="#E2E2E2" stroke-width="10" stroke-linecap="round" stroke-linejoin="round" />
                    </svg>
                  </span>
                  <hr>
                  </div>
                </body>
              </html>
                `
            };
    
            const info = await transport.sendMail(mailOptions);
            console.log(`Email sent: ${info.response}`);
            return email;
        } catch (error) {
            console.log(`Error: ${error}`);
            throw new BadRequestError("Error sending verification email");
        }
    }

    static saveVerificationToken = async (email) => {
        const token = AuthService.generateVerificationCode();
        await redisClient.set(`verification:${token}`, email);
        await redisClient.expire(`verification:${token}`, 300); // Hết hạn sau 5 phút
        return token;
    }

    static verifyEmailCode = async (code) => {
        const foundEmail = await redisClient.get(`verification:${code}`);
        if (!foundEmail) throw new BadRequestError("Invalid verification code");
        await redisClient.del(`verification:${code}`);
        return foundEmail;
    }

    // static sendVerificationSMS = async (phone) => {
    //     try {
    //         const code = await AuthService.saveVerificationToken(phone);
    //         await twilioClient.messages.create({
    //             body: `Your verification code is: ${code}`,
    //             from: formatPhoneNumber('0387411702'),
    //             to: formatPhoneNumber(phone),
    //         });

    //         return phone;
    //     } catch (error) {
    //         console.log(`Error: ${error}`);
    //         throw new BadRequestError("Error sending verification SMS");
    //     }
    // }
}

module.exports = AuthService;