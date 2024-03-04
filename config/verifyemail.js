const nodemailer = require('nodemailer');


const verifyemail = async (name, email, otp) => {
    try {

        const transport = nodemailer.createTransport({
            service: "gmail",

            auth: {
                user: process.env.NODEMAIL_EMAIL,
                pass: process.env.NODEMAIL_PASS,
            }
        });
        const mailoption = {
            from: process.env.NODEMAIL_EMAIL,
            to: email,
            subject: 'for verification mail',
            html: `<h1>hi ${name} this is for ka e-comares store verification otp <br><br> <a  style='color='blue'; href=''>${otp}</a></h1>`
        }
        transport.sendMail(mailoption, (err, info) => {
            if (err) {
                console.log(err.message);
            }
            else {
                console.log(`Email has been sent: ${info.messageId}`);
                console.log(`Preview URL: ${nodemailer.getTestMessageUrl(info)}`);
            }
        })
    } catch (error) {
        console.log(error.message);
    }
}

module.exports=verifyemail
