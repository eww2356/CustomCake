module.exports = function(app, db) {
  var database = db.getDatabase();

  app.get('/login', (req, res) => {
    res.render('login.ejs');
  });
  
  // login 처리(계정 확인 및 세션 등록)
  app.post('/loginProc', function(req, res){
    console.log('/loginProc 호출됨.');

    var u_id = req.body.u_id || req.query.u_id;
    var u_pw = req.body.u_pw || req.query.u_pw;
  
    console.log('요청 파라미터 : ' + u_id + ', ' + u_pw);
    
    // 데이터베이스 객체가 초기화된 경우, addUser 함수 호출하여 사용자 추가
    if (database) {
      db.authUser(database, u_id, u_pw, function(err, docs) {
        // 에러 발생 시, 클라이언트로 에러 전송
        if (err) {
                  console.error('로그인 중 에러 발생 : ' + err.stack);
                  
                  res.writeHead('200', {'Content-Type':'text/html;charset=utf8'});
          res.write('<h2>로그인 중 에러 발생</h2>');
                  res.write('<p>' + err.stack + '</p>');
          res.end();
                  
                  return;
              }
        
              // 조회된 레코드가 있으면 성공 응답 전송
        if (docs) {
          console.dir(docs);
  
          // 조회 결과에서 사용자 이름 확인
          // var username = docs[0].name;
          
          // res.writeHead('200', {'Content-Type':'text/html;charset=utf8'});
          // res.write('<h1>로그인 성공</h1>');
          // res.write('<div><p>사용자 아이디 : ' + paramId + '</p></div>');
          // res.write('<div><p>사용자 이름 : ' + username + '</p></div>');
          // res.write("<br><br><a href='/public/login.html'>다시 로그인하기</a>");
          // 세션에 유저 정보 등록
          req.session.user =
          {
              u_id: u_id
          };
          res.redirect("order2");
          res.end();
        
        } else {  // 조회된 레코드가 없는 경우 실패 응답 전송
          res.writeHead('200', {'Content-Type':'text/html;charset=utf8'});
          res.write('<h1>로그인  실패</h1>');
          res.write('<div><p>아이디와 패스워드를 다시 확인하십시오.</p></div>');
          res.write("<br><br><a href='/views/login.ejs'>다시 로그인하기</a>");
          res.end();
        }
      });
    } else {  // 데이터베이스 객체가 초기화되지 않은 경우 실패 응답 전송
      res.writeHead('200', {'Content-Type':'text/html;charset=utf8'});
      res.write('<h2>데이터베이스 연결 실패</h2>');
      res.write('<div><p>데이터베이스에 연결하지 못했습니다.</p></div>');
      res.end();
    }
    
  });

  // 로그아웃 세션 처리
  app.get('/logout', function(req, res){
    if (req.session.user) {
      console.log('로그아웃 처리');
      req.session.destroy(
          function (err) {
              if (err) {
                  console.log('세션 삭제시 에러');
                  return;
              }
              console.log('세션 삭제 성공');
              res.redirect("login");
          }
      );          //세션정보 삭제
    } else {
        console.log('로긴 안되어 있음');
        res.redirect("login");
    }

  });
}