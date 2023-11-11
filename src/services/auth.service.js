'use strict';
const nodemailer = require('nodemailer');
const redisClient = require('../dbs/init-redis');
const { OAuth2Client } = require('google-auth-library');
const { BadRequestError } = require('../core/error-response');
const twilio = require('twilio');
const GOOGLE_MAILER_CLIENT_ID = '667971001401-r5dtcf3mga4m0h1r5mkhi817k1jqqpne.apps.googleusercontent.com'
const GOOGLE_MAILER_CLIENT_SECRET = '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'
const GOOGLE_MAILER_REFRESH_TOKEN = '1//04qma96qfSeZaCgYIARAAGAQSNwF-L9IrWChvCIDFoWG5ccE3Y165QvgnvFwnHJB56E3xVpP0shMWDB9GipFiiCEicT7tatlV3Jw'
const ADMIN_EMAIL_ADDRESS = 'materialmastery@gmail.com'

const myOAuth2Client = new OAuth2Client(
    GOOGLE_MAILER_CLIENT_ID,
    GOOGLE_MAILER_CLIENT_SECRET
)
myOAuth2Client.setCredentials({
    refresh_token: GOOGLE_MAILER_REFRESH_TOKEN
})

const twilioClient = twilio('', '')
function formatPhoneNumber(phoneNumber) {
    const cleaned = phoneNumber.replace(/\D/g, '');
    if (cleaned.startsWith('0')) {
      return `+84${cleaned.slice(1)}`;
    }
  
    return cleaned;
}
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
                    <h1>Email Verification Code</h1>
                    <p>Thank you for registering with us. Please use the following verification code:</p>
                    <h2>${code}</h2>
                    <p>This code will expire in 5 minutes.</p>
                    <p>If you didn't request this verification, please ignore this email.</p>
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

    static sendVerificationSMS = async (phone) => {
        try {
            const code = await AuthService.saveVerificationToken(phone);
            await twilioClient.messages.create({
                body: `Your verification code is: ${code}`,
                from: formatPhoneNumber('0387411702'),
                to: formatPhoneNumber(phone),
            });

            return phone;
        } catch (error) {
            console.log(`Error: ${error}`);
            throw new BadRequestError("Error sending verification SMS");
        }
    }
}

module.exports = AuthService;