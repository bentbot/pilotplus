// Mailer
function sendConfirmation(to, key, cb) {
  console.log(to);
  var confirm = key;
  var transporter = nodemailer.createTransport({
    service: 'Gmail',
    auth: {
        user: keys.mailer.user,
        pass: keys.mailer.password
    }
  });
  var contents = "<b style='color:hsl(28, 99%, 46%)'>Confirm your Account</b>" +
      "<p>"+
      "To confirm your account with us, please click on the following link: <br />"+
      "<a href='https://"+keys.site.domain+"/confirm/"+confirm+"/'>https://"+keys.site.domain+"/confirm/"+confirm+"</a>"+
      "</p>";
  var mailOptions = {
      from: keys.site.title+" <mail@"+keys.site.title+">",
      to: to,
      subject: "Confirm your Account",
      text: "Please visit this address to confirm your account with us: http://"+keys.site.title+"/confirm/"+confirm,
      html: contents
  }
  transporter.sendMail(mailOptions, function(err, responce){
      if (err) {
          cb(err);
      } else {
          cb(err, responce);
      }
  });
}
