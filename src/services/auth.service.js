'use strict';
const nodemailer = require('nodemailer');
const redisClient = require('../dbs/init-redis');
const { OAuth2Client } = require('google-auth-library');
const { BadRequestError } = require('../core/error-response');
// const twilio = require('twilio');
const GOOGLE_MAILER_CLIENT_ID = '667971001401-r5dtcf3mga4m0h1r5mkhi817k1jqqpne.apps.googleusercontent.com'
const GOOGLE_MAILER_CLIENT_SECRET = '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'
const GOOGLE_MAILER_REFRESH_TOKEN = '1//04wrAa4AEe-vnCgYIARAAGAQSNwF-L9IrMItZKcZQYcVEgDWA7lOWdaK58ucRR7XBLjadAvxKUA9M5vhVAWvPyeZX-pletMeHyeI'
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
                            <span style="background: #02B1AB;
                            padding: 0.625rem;
                            border-radius: 0.5rem;"><svg xmlns="http://www.w3.org/2000/svg" width="43" height="40"
                                    viewBox="0 0 271 251" fill="none">
                                    <path
                                        d="M109.643 13.4463C115.171 8.7091 123.309 8.7091 128.837 13.4463L219.984 91.5555C225.467 96.2547 228.625 103.129 228.625 110.368V128H238.48V110.368C238.48 100.234 234.059 90.6095 226.382 84.0307L135.235 5.92147C126.022 -1.97383 112.458 -1.97382 103.245 5.92148L12.0982 84.0307C4.42128 90.6096 0 100.234 0 110.368V236.16C0 244.356 6.61805 251 14.7818 251H223.698C231.862 251 238.48 244.356 238.48 236.16V228.255H228.625V236.16C228.625 238.892 226.419 241.107 223.698 241.107H14.7818C12.0606 241.107 9.85455 238.892 9.85455 236.16V110.368C9.85455 103.13 13.0126 96.2547 18.4961 91.5555L109.643 13.4463Z"
                                        fill="#fff" />
                                    <path
                                        d="M148.804 216.373H122.248V175.55C122.248 171.048 121.283 168.959 118.929 167.811C116.302 166.53 113.213 166.551 110.63 167.811C108.276 168.959 107.311 170.011 107.311 175.626V216.373H84.0748V175.55C84.0748 172.414 83.5434 169.17 80.7554 167.811C78.1339 166.532 74.6757 166.663 72.4568 167.811C70.3388 168.907 69.1374 170.011 69.1374 175.626V216.373H42.3745V169.784C42.3745 161.285 45.305 154.077 51.1658 148.158C57.0267 142.189 64.1323 139.205 72.4828 139.205C81.0925 139.205 88.8206 142.746 95.6669 149.828C103.291 142.746 110.916 139.205 118.54 139.205C128.239 139.205 136.019 142.644 141.88 149.524C146.496 154.886 148.804 162.702 148.804 172.971V216.373Z"
                                        fill="#fff" />
                                    <path
                                        d="M271 216.373H244.445V175.55C244.445 171.048 243.48 168.959 241.125 167.811C238.498 166.53 235.409 166.551 232.827 167.811C230.472 168.959 229.507 170.011 229.507 175.626V216.373H206.271V175.55C206.271 172.414 205.74 169.17 202.952 167.811C200.33 166.532 196.872 166.663 194.653 167.811C192.535 168.907 191.334 170.011 191.334 175.626V216.373H164.571V169.784C164.571 161.285 167.501 154.077 173.362 148.158C179.223 142.189 186.329 139.205 194.679 139.205C203.289 139.205 211.017 142.746 217.863 149.828C225.488 142.746 233.112 139.205 240.736 139.205C250.435 139.205 258.215 142.644 264.076 149.524C268.692 154.886 271 162.702 271 172.971V216.373Z"
                                        fill="#fff" /></span>
                            </svg>
                
                            <span style="text-transform: uppercase;
                            color: #02B1AB;
                            font-weight: 700;
                            font-size: 1.4rem;">Welcome to MM!</span>
                        </div>
                
                        <!--  content  -->
                        <p><span style='font-weight: 700; '>Hi ${email},</span>
                            </br></br>Thank you for registering with us. Please use the following verification code:</p>
                        <div style='text-align: center;margin: 3rem auto;'><span style='
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
                            ">(This code will expire in <span style="color:#000; font-weight: 600;">5 minutes</span>.)</p>
                        </div>
                        <br>If you didn't request this verification, please ignore this email.
                        </br></br> Thankyou, </br> <span style="color: #02CAC4; font-weight: 700; line-height: 1.4;">Material
                            Mastery</span>
                        </p>
                        <span style='
                        position:absolute;
                        bottom:40px;
                        right:15px;
                        opacity:0.5;
                        z-index:-1;
                        color:white;
                        '><svg xmlns="http://www.w3.org/2000/svg" width="219" height="150" viewBox="0 0 219 150" fill="none">
                                <path
                                    d="M5 25C5 19.6957 7.44662 14.6086 11.8016 10.8579C16.1566 7.10714 22.0633 5 28.2222 5H190.778C196.937 5 202.843 7.10714 207.198 10.8579C211.553 14.6086 214 19.6957 214 25M5 25V125C5 130.304 7.44662 135.391 11.8016 139.142C16.1566 142.893 22.0633 145 28.2222 145H190.778C196.937 145 202.843 142.893 207.198 139.142C211.553 135.391 214 130.304 214 125V25M5 25L109.5 85L214 25"
                                    stroke="#E2E2E2" stroke-width="10" stroke-linecap="round" stroke-linejoin="round" />
                            </svg></span>
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