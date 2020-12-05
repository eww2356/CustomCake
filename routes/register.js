module.exports = function(app, db) {
  var database = db.getDatabase();

  app.get('/register', (req, res) => {
    res.render('register.ejs');
  });
  
  // create
  app.post('/registerProc', function(req, res){
    console.log('/registerProc 호출됨.');

    var u_id = req.body.u_id || req.query.u_id;
    var u_pw = req.body.u_pw || req.query.u_pw;
    var u_name = req.body.u_name || req.query.u_name;
    var u_phone = req.body.u_phone || req.query.u_phone;
    var u_address = req.body.u_address || req.query.u_address;
    var u_like = req.body.u_like || req.query.u_like;
  
    if(u_like == undefined) u_like="";
    
    console.log('요청 파라미터 : ' + u_id + ', ' + u_pw + ', ' + u_name + ', ' + u_phone + ', ' + u_address + ', ' + u_like);
    
    // 데이터베이스 객체가 초기화된 경우, addUser 함수 호출하여 사용자 추가
    if (database) {
      db.addUser(database, u_id, u_pw, u_name, u_phone, u_address, u_like, function(err, addedUser) {
              // 동일한 id로 추가하려는 경우 에러 발생 - 클라이언트로 에러 전송
        if (err) {
          console.error('사용자 추가 중 에러 발생 : ' + err.stack);
                  
          res.writeHead('200', {'Content-Type':'text/html;charset=utf8'});
          res.write('<h2>사용자 추가 중 에러 발생</h2>');
          res.write('<p>' + err.stack + '</p>');
          res.end();
                  
          return;
        }
        
        // 결과 객체 있으면 성공 응답 전송
        if (addedUser) {
          console.dir(addedUser);
  
          // res.writeHead('200', {'Content-Type':'text/html;charset=utf8'});
          // res.write('<h2>사용자 추가 성공</h2>');
          res.redirect("login");
          res.end();
        } else {  // 결과 객체가 없으면 실패 응답 전송
          res.writeHead('200', {'Content-Type':'text/html;charset=utf8'});
          res.write('<h2>사용자 추가  실패</h2>');
          res.end();
        }
      });
    } else {  // 데이터베이스 객체가 초기화되지 않은 경우 실패 응답 전송
      res.writeHead('200', {'Content-Type':'text/html;charset=utf8'});
      res.write('<h2>데이터베이스 연결 실패</h2>');
      res.end();
    }
    
  });
}