const passport = require("passport")

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
    token = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6IjY1OWI4ZjU5MjdiMmY1ZTE1M2YwMWQwMCIsInJvbGUiOiJhZG1pbiIsImlhdCI6MTcwNDcxNTUwNn0.6NN-4TP2i35BvWYaq5OCLh2zVC_WScUnOvDOP3ygeLs";
    return token
  }