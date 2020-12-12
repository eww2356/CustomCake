module.exports = function(app, userDatabase, orderDatabase, boardDatabase) {
  var userDb = userDatabase.getDatabase();
  var orderDb = orderDatabase.getDatabase();
  var boardDb = boardDatabase.getDatabase();

  app.get('/orderHistory', (req, res) => {
    var u_id = req.session.user.u_id;
    if (orderDb) {
      orderDatabase.getOrderList(orderDb, u_id, function(err, orderList) {
        // 조회된 레코드가 있으면 성공 응답 전송
        if (orderList) {
          console.log(orderList);
          res.render('myPageOrderHistory.ejs', {orderList:orderList});
        } else {
          res.render('myPageOrderHistory.ejs', {orderList:"null"});
        }
      });
    }
  });

  app.get('/writeByMe', (req, res) => {
    var u_id = req.session.user.u_id;
    if (boardDb) {
      boardDatabase.getBoardListByUId(boardDb, u_id, function(err, boardList) {
        // 조회된 레코드가 있으면 성공 응답 전송
        if (boardList) {
          console.log(boardList);
          res.render('myPageWriteByMe.ejs', {boardList:boardList});
        } else {
          res.render('myPageWriteByMe.ejs', {boardList:"null"});
        }
      });
    }
  });

  app.get('/likeBoard', (req, res) => {
    var u_id = req.session.user.u_id;
    if (userDb) {
      userDatabase.getUserInfo(userDb, u_id, function(err, u_info) {
        // 조회된 레코드가 있으면 성공 응답 전송
        if (u_info) {
          console.log(u_info);
          var u_info_json = JSON.parse(u_info)
          // console.log(u_info_json[0].u_like);
          // var u_like = u_info_json[0].u_like;
          var u_like = u_info_json[0].u_like.substring(0, u_info_json[0].u_like.length -1);
          // console.log(u_like);
          if (boardDb) {
            boardDatabase.getBoardListByBIds(boardDb, u_like, function(err, boardList) {
              // 조회된 레코드가 있으면 성공 응답 전송
              if (boardList) {
                console.log(boardList);
                res.render('myPageLikeBoard.ejs', {boardList:boardList});
              } else {
                res.render('myPageLikeBoard.ejs', {boardList:"null"});
              }
            });
          }
        } else {
          res.render('myPageLikeBoard.ejs', {boardList:"null"});
        }
      });
    }
  });

  app.get('/editMyInfo', (req, res) => {
    var u_id = req.session.user.u_id;
    if (userDb) {
      userDatabase.getUserInfo(userDb, u_id, function(err, userInfo) {
        // 조회된 레코드가 있으면 성공 응답 전송
        if (userInfo) {
          console.log(userInfo);
          res.render('myPageEditMyinfo.ejs', {userInfo:userInfo});
        } else {
          res.render('myPageEditMyinfo.ejs', {userInfo:"null"});
        }
      });
    }
  });

  app.post('/editMyInfoProc', (req, res) => {
    var u_id = req.session.user.u_id;
    var u_pw = req.body.u_pw || req.query.u_pw;
    var u_name = req.body.u_name || req.query.u_name;
    var u_phone = req.body.u_phone || req.query.u_phone;
    var u_address = req.body.u_address || req.query.u_address;

    if (userDb) {
      userDatabase.updateUserInfo(userDb, u_id, u_pw, u_name, u_phone, u_address, function(err, docs) {
        // 조회된 레코드가 있으면 성공 응답 전송
        // 에러 발생 시, 클라이언트로 에러 전송
        if (err) {
          console.error('사용자 정보 업데이트 중 에러 발생 : ' + err.stack);
          
          res.writeHead('200', {'Content-Type':'text/html;charset=utf8'});
          res.write('<h2>사용자 정보 업데이트 중 에러 발생</h2>');
                  res.write('<p>' + err.stack + '</p>');
          res.end();
                  
          return;
         }
        
          // 조회된 레코드가 있으면 성공 응답 전송
          if (docs) {
            console.dir(docs);
            
            res.redirect("editMyinfo");
            res.end();
          
          } else {  // 조회된 레코드가 없는 경우 실패 응답 전송
            res.writeHead('200', {'Content-Type':'text/html;charset=utf8'});
            res.write('<h1>사용자 정보 업데이트  실패</h1>');
            res.write('<div><p>사용자 정보를 다시 확인하십시오.</p></div>');
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

  
}