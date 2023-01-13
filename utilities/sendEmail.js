const nodemailer = require('nodemailer');

const sendEmail = async(options)=>{
    const transporter = nodemailer.createTransport({
        service:'gmail',
        port:465,
        auth:{
            user:process.env.SMPT_EMAIL,
            pass:process.env.SMPT_PASSWORD
        }
    })
    const mailOpts = {
        from: process.env.SMPT_EMAIL,
        to: options.email,
        subject: options.subject,
        text: options.message
    }
    await transporter.sendMail(mailOpts);
}

module.exports = sendEmail