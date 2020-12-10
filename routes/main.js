module.exports = function(app) {
  app.get('/main', (req, res) => {
    res.render('main.ejs');
  });

  app.get('/main/logout', (req, res) =>{
    if( req.session.user ){
      console.log("------------mainpage : Logout------------");
      req.session.destroy();
      res.redirect("../login");
    } else {
      console.log("mainPage : LoginStatus FAILED");
      res.redirect("../login");
    }
  });
}