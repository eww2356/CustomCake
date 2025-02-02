module.exports = function(app, db, userdb, upload) {
  var database = db.getDatabase();  // Board.js
  var userdatabase = userdb.getDatabase();  // User.js
  var boardData_info = "";

  // openPage : 게시판 메인 페이지
  app.get('/board', (req, res) => {
    if( database ){
      db.getfindAll(database, function(err, boardList){
        if( boardList ){
          res.render('board.ejs', {boardList : boardList});
        } else{
          res.render('board.ejs', {boardList : "null"});
        }

        console.log("----- " + boardList.length + " -----");
        console.log(JSON.stringify(boardList));
      });
    }
    // res.render('board.ejs');
  });

  // openBoard : 게시판 글 상세보기 페이지
  app.get('/board/open/:id', (req, res) => {

    var board_id = req.params.id;
    console.log( "----- openBoard ----- [_id] :" + board_id);

    if( database ){
      db.getfindOne(database, board_id, function(err, boardData){
        if( boardData ){
          res.render('boardOpen.ejs', {boardData : boardData});
          boardData_info = boardData;
        } else {
          res.render('boardOpen.ejs', {boardData : "null"});
          boardData_info = null;
        }

        console.log("----- getfineOne : boardData -----");
        console.log(JSON.stringify(boardData));
      });
    }
  });

  // openBoard - likeBoard : 게시판 글 상세보기 페이지에서 좋아요 버튼 클릭 프로세스
  app.get('/board/likeInsert/:id', (req, res) => {
    var board_id = req.params.id;
    var user_id = req.session.user.u_id;

    console.log( "----- likeInsert  [_id] :" + board_id + ", [user_id] : " + user_id);

    if( userdatabase ){
      userdb.updateUserUlike(userdatabase, user_id, board_id, function(err, updateUser){
        if( err ){
          console.log("##### FAILED UPDATE #####");
          res.end();
        }
        if( updateUser ){
          console.log("##### SUCCESS UPDATE #####");
          res.end();
        }
      });
    }
  });

  // createBoard : 게시판 메인 페이지에서 글쓰기 버튼 클릭 프로세스
  app.get('/board/new', (req, res) => {
    res.render('boardNewContent.ejs');
  });
  
  app.post('/board/new', upload.array('boardphoto', 1), (req, res)=>{
    
    var b_title = req.body.b_title;
    var b_content = req.body.b_content;
    var b_file = req.files;

    var b_writer = req.session.user.u_id;

    var originalname = "",
        filename = "", 
        mimetype = "", 
        size = 0;
        
    if( Array.isArray(b_file) ){
      for( var i=0; i<b_file.length; i++ ){
        originalname = b_file[i].originalname;
        filename = b_file[i].filename;
        mimetype = b_file[i].mimetype;
        size = b_file[i].size;
      }
      // console.log('currentFile : ' + originalname + ', ' + filename + ', ' + mimetype + ', ' + size);
    } else {
      console.log('----- currentFile undefined. -----');
    }
    
    if( database ){
      b_file = {
        boardphoto : {
          originalname : originalname,
          filename : filename,
          mimetype : mimetype,
          size : size
        }
      };
      b_file = JSON.stringify(b_file);

      db.addBoard(database, b_title, b_content, b_file, b_writer, errorCallback);
    } else {
      res.writeHead('200', {'Content-Type':'text/html;charset=utf8'});
      res.write('<h2>데이터베이스 연결 실패</h2>');
      res.write( '<div><p>데이터베이스에 연결하지 못했습니다.</p></div>');
      res.end();
    }
    function errorCallback(err, docs) {
      if (err) {
          console.error('게시판 글 등록 중 에러 발생 : ' + err.stack);
          res.writeHead('200', {'Content-Type':'text/html;charset=utf8'});
          res.write('<h2>게시판 글 등록 중 에러 발생</h2>');
          res.write('<p>' + err.stack + '</p>');
          res.end();
                  
          return;
      }

      if (docs) {
          console.dir(docs);
          res.redirect("/board");
          res.end();
      
      } else {  // 조회된 레코드가 없는 경우 실패 응답 전송
          res.writeHead('200', {'Content-Type':'text/html;charset=utf8'});
          res.write('<h1>주문1  실패</h1>');
          res.write('<div><p>주문 내용을 다시 확인하십시오.</p></div>');
          res.end();
      }
  }
  });

  // deleteBoard : 게시판 글 상세보기 페이지에서 글 삭제하기 프로세스
  app.get('/board/delete/:id', (req, res) => {

    var board_id = req.params.id;

    if( boardData_info ){
      var board_writer = boardData_info[0].b_writer;
      var b_writer = req.session.user.u_id;
    };

    if( board_writer == b_writer ){ // 로그인 한 사용자와 작성자 비교

      console.log("--- 일치 : deleteProcess START ---");
      if( database ){
        db.getDeleteOne(database, board_id, function(err){
          if (err) {
            console.error('게시판 글 샂게 중 에러 발생 : ' + err.stack);
            res.writeHead('200', {'Content-Type':'text/html;charset=utf8'});
            res.write('<h2>게시판 글 삭제 중 에러 발생</h2>');
            res.write('<p>' + err.stack + '</p>');
            res.end();
          }
    
          if (docs) {
              console.dir(docs);
              res.redirect("/board");
              res.end();
          
          } else {  // 조회된 레코드가 없는 경우 실패 응답 전송
            res.writeHead('200', {'Content-Type':'text/html;charset=utf8'});
            res.write('<h1>게시글 삭제  실패</h1>');
            res.write('<div><p>이미 삭제되었습니다.</p></div>');
            res.end();
          }
        });

        console.log("--- deleteProcess END - RE-LOAD.PAGE ---")
        res.redirect("/board");
        res.end();
      }

    } else {

      console.log("--- 불일치 : deleteProcess STOP ---");
      res.writeHead('200', {'Content-Type':'text/html;charset=utf8'});
      res.write('<h1>게시글 삭제  실패</h1>');
      res.write('<div><p>삭제를 위한 권한이 없습니다.</p></div>');
      res.end();
      
    }
  });
}
