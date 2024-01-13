const passport = require("passport")
const nodemailer = require('nodemailer');
const { saveEmail } = require("../controller/Auth");

exports.isAuth = (req,res,done)=>{
  return passport.authenticate('jwt');
  }
exports.sanitizeUser = (user) => {
    return {id:user.id, role:user.role}
}
exports.cookieExtractor = function(req){
    var token = null;
    if(req && req.cookies){
      token = req.cookies['jwt']
    }
    return token
  }

  //Emails

const transporter = nodemailer.createTransport({
  host: "smtp.gmail.com",
  port: 587,
  secure: false,
  auth: {
    // TODO: replace `user` and `pass` values from <https://forwardemail.net>
    user: "priyanshudubey131@gmail.com",
    pass: process.env.MAIL_PASSWORD,
  },
});



exports.sendMail = async function({to,subject,html}){
  const info = await transporter.sendMail({
    from: '"E-Commerce" <priyanshudubey131@gmail.com>', // sender address
    to: to, // list of receivers
    subject: subject, // Subject line
    text: "Hello world?", // plain text body
    html: html
  });
  return info
  };
  
  