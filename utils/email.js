const nodemailer= require('nodemailer');

const sendEmail =  async options => {
    //create a transporter
     
    const transporter = nodemailer.createTransport({
        //service: 'Gmail',
        host: process.env.EMAIL_HOST,
        port: process.env.EMAIL_PORT,
        auth: {
            user: process.env.EMAIL_USERNAME,
            pass : process.env.EMAIL_PASWWORD
        }
    });

    //define the email options
    const mailOptions = {
        from: 'shobana@yahoo.com',
        to: options.email,
        subject : options.subject,
        text: options.message,
    }
    //send the eamil with nodemailer
    try {
      await transporter.sendMail(mailOptions);
    } catch (err) {
        console.log(err)
    }

};

module.exports = sendEmail;