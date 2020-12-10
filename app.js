const express = require('express')
  , http = require('http')
  , path = require('path');
let app = express();
const ejs = require('ejs');

// var mongoose = require('mongoose');
const userDatabase = require('./models/User');
var userDb = new userDatabase();
const oderDatabase = require('./models/Order');
var orderDb = new oderDatabase();
// const boardDatabase = require('./models/Board');
// var borderDb = new boardDatabase();

// Express의 미들웨어 불러오기
var bodyParser = require('body-parser')
  , cookieParser = require('cookie-parser')
  , static = require('serve-static')      //특정 폴더의 파일들을 특정 패스로 접근할 수 있도록 열어주는 역할
  , errorHandler = require('errorhandler');
  
// 에러 핸들러 모듈 사용
var expressErrorHandler = require('express-error-handler');

// Session 미들웨어 불러오기
var expressSession = require('express-session');

// 파일 처리
var fs = require('fs');

// 파일 업로드용 미들웨어
var multer = require('multer');

//multer 미들웨어 사용 : 미들웨어 사용 순서 중요  body-parser -> multer -> router
// 파일 제한 : 10개, 1G
var storage = multer.diskStorage({
  destination: function (req, file, callback) {
      callback(null, 'upload')
  },
  filename: function (req, file, callback) {
      var extension = path.extname(file.originalname);
      var basename = path.basename(file.originalname, extension);
      callback(null, basename + Date.now() + extension);
  }
});

var upload = multer({ 
    storage: storage,
    limits: {
		files: 100,
		fileSize: 1024 * 1024 * 1024
	}
});

// 기본 속성 설정
app.set('port', process.env.PORT || 3000);

// body-parser를 이용해 application/x-www-form-urlencoded 파싱
app.use(bodyParser.urlencoded({ extended: false }))

// body-parser를 이용해 application/json 파싱
app.use(bodyParser.json())

// views 폴더를 static으로 오픈
app.use('/views', static(path.join(__dirname, 'views')));
app.engine("ejs", ejs.renderFile);
 
// cookie-parser 설정
app.use(cookieParser());

// 세션 설정
app.use(expressSession({
	secret:'my key',
	resave:true,
	saveUninitialized:true
}));

app.use(express.static('img'));
app.use(express.static('upload'));

// 404 에러 페이지 처리
// var errorHandler = expressErrorHandler({
//   static: {
//     '404': './views/404.ejs'
//   }
//  });
 
//  app.use( expressErrorHandler.httpError(404) );
//  app.use( errorHandler );

//app.set("views", __dirname + "/views");
//app.set("view engine", "ejs");
//app.engine("ejs", ejs.renderFile);

//const hostname = '127.0.0.1';
//const port = 3000;

var loginRouter = require('./routes/login')(app, userDb);
var registerRouter = require('./routes/register')(app, userDb);
var mainRouter = require('./routes/main')(app);
var customOrderRouter = require('./routes/order1')(app, orderDb/*orderbasicDb*/);  // order1
var paintingOrderRouter = require('./routes/order2')(app, orderDb, upload);  // order2
var userRouter = require('./routes/user')(app, userDb, orderDb);  // mypage
// var boardRouter = require('./routes/board')(app);


//===== 서버 시작 =====//

// 프로세스 종료 시에 데이터베이스 연결 해제
process.on('SIGTERM', function () {
  console.log("프로세스가 종료됩니다.");
  app.close();
});

app.on('close', function () {
console.log("Express 서버 객체가 종료됩니다.");
if (database) {
  database.close();
}
});

// Express 서버 시작
http.createServer(app).listen(app.get('port'), function(){
  console.log('서버가 시작되었습니다. 포트 : ' + app.get('port'));
});