// Mailserver
var nodemailer = require("nodemailer")
, fs = require('fs');
// create reusable transport method (opens pool of SMTP connections)
var smtpTransport = nodemailer.createTransport("SMTP",{
    service: "Gmail",
    auth: {
        user: fs.readFileSync('/home/node/keys/mail.id'),
        pass: fs.readFileSync('/home/node/keys/mail.key')
    }
});


function sendConfirmation(to) {

var mailOptions = {
    from: "vBit <mail@vbit.io>",
    to: to,
    subject: "Confirm your Account",
    text: "Please visit this address to confirm your account with us: http://vbit.io/confirm/"+confirm,
    html: "<b>Vbit"
}
smtpTransport.sendMail(mailOptions, function(error, response){
    if(error){
        console.log(error);
    }else{
        console.log("Message sent: " + response.message);
    }
});


}