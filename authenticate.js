function authenticate(req,res,next){
    if(req.session.user){
        next();
    }else{
        console.log(`Authentication Error..`)
        res.redirect('/login');
    }
}
module.exports={
    authenticate
}