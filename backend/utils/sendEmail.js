const nodemailer = require('nodemailer');

const sendEmail  = async(subject, message, send_to, send_from, reply_to) => {
    //create email transporter
  const transporter = nodemailer.createtransport({
     host : process.env.EMAIL_HOST,
     port : 587,
     auth:{
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASSWORD
    },
    tls:{ 
        rejectUnauthorized: false
    }
        
  })

  //options for sending email
  const options = {
     from: sent_from,
     to: send_to,
     subject: subject,
     html: message,
     replyTo: reply_to
    
  }

  //send email
  transporter.sendMail(options, (error, info) => {
     if(error){
        console.log(error);
     }else{
        console.log(info);
     }
  }
  )
}

module.exports = sendEmail;