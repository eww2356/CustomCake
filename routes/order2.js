module.exports = function(app, db, upload) {
  var database = db.getDatabase();

  app.get('/order2', (req, res) => {
    var recommendImg = [{name : 'printingCakeRecommend01.jpg'}, {name : 'printingCakeRecommend02.jpg'}, {name : 'printingCakeRecommend03.jpg'}];
    res.render('order2.ejs', {recommendImg:recommendImg});
  });
  
  // order2
  app.post('/order2Proc', upload.array('attachment', 1), function(req, res){
    console.log('/order2Proc 호출됨.');
    
    var bread_shape = req.body.bread_shape || req.query.bread_shape;
    var bread_size = req.body.bread_size || req.query.bread_size;
    // var attachment = req.body.attachment || req.query.attachment;

    var files = req.files;
	
    console.dir('#===== 업로드된 첫번째 파일 정보 =====#')
    console.dir(req.files[0]);
    console.dir('#=====#')
        
		// 현재의 파일 정보를 저장할 변수 선언
		var originalname = '',
			filename = '',
			mimetype = '',
      size = 0;
      
    if (Array.isArray(files)) {   // 배열에 들어가 있는 경우 (설정에서 1개의 파일도 배열에 넣게 했음)
      console.log("배열에 들어있는 파일 갯수 : %d", files.length);
      
      for (var index = 0; index < files.length; index++) {
        originalname = files[index].originalname;
        filename = files[index].filename;
        mimetype = files[index].mimetype;
        size = files[index].size;
      }
      console.log('현재 파일 정보 : ' + originalname + ', ' + filename + ', ' + mimetype + ', ' + size);
    } else {
          console.log('업로드된 파일이 배열에 들어가 있지 않습니다.');
    }

    var _oh_option = {
      bread_shape : bread_shape,
      bread_size : bread_size,
      attachment : {
        originalname : originalname,
        filename : filename,
        mimetype : mimetype,
        size : size
      }
    };
    var oh_option = JSON.stringify(_oh_option);
    var oh_user = req.session.user.u_id;
  
    console.log('요청 파라미터 : ' + oh_option + ', ' + oh_user);
    
    // 데이터베이스 객체가 초기화된 경우, addOrder 함수 호출하여 사용자 추가
    if (database) {
      db.addOrder(database, /*oh_id, oh_date,*/ oh_option, oh_user, function(err, docs) {
        // 에러 발생 시, 클라이언트로 에러 전송
        if (err) {
          console.error('주문2 중 에러 발생 : ' + err.stack);
          
          res.writeHead('200', {'Content-Type':'text/html;charset=utf8'});
          res.write('<h2>주문2 중 에러 발생</h2>');
                  res.write('<p>' + err.stack + '</p>');
          res.end();
                  
          return;
         }
        
              // 조회된 레코드가 있으면 성공 응답 전송
        if (docs) {
          console.dir(docs);
            
          // res.writeHead('200', {'Content-Type':'text/html;charset=utf8'});
          // res.write('<h1>로그인 성공</h1>');
          // res.write('<div><p>사용자 아이디 : ' + paramId + '</p></div>');
          // res.write('<div><p>사용자 이름 : ' + username + '</p></div>');
          // res.write("<br><br><a href='/public/login.html'>다시 로그인하기</a>");
          res.redirect("order2");
          res.end();
        
        } else {  // 조회된 레코드가 없는 경우 실패 응답 전송
          res.writeHead('200', {'Content-Type':'text/html;charset=utf8'});
          res.write('<h1>주문2  실패</h1>');
          res.write('<div><p>주문 내용을 다시 확인하십시오.</p></div>');
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