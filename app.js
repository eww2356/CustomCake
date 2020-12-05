const express = require('express')
  , http = require('http')
  , path = require('path');
let app = express();
const ejs = require('ejs');

// var mongoose = require('mongoose');
const Database = require('./models/User');
var db = new Database();

// Express의 미들웨어 불러오기
var bodyParser = require('body-parser')
  , cookieParser = require('cookie-parser')
  , static = require('serve-static')
  , errorHandler = require('errorhandler');
  
// 에러 핸들러 모듈 사용
var expressErrorHandler = require('express-error-handler');

// Session 미들웨어 불러오기
var expressSession = require('express-session');

// 기본 속성 설정
app.set('port', process.env.PORT || 3000);

// body-parser를 이용해 application/x-www-form-urlencoded 파싱
app.use(bodyParser.urlencoded({ extended: false }))

// body-parser를 이용해 application/json 파싱
app.use(bodyParser.json())

// views 폴더를 static으로 오픈
app.use('/views', static(path.join(__dirname, 'views')));
 
// cookie-parser 설정
app.use(cookieParser());

// 세션 설정
app.use(expressSession({
	secret:'my key',
	resave:true,
	saveUninitialized:true
}));

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

app.use(express.static('img'));

/*//===== 데이터베이스 연결 =====//

// 데이터베이스 객체를 위한 변수 선언
var database;

// 데이터베이스 스키마 객체를 위한 변수 선언
var UserSchema;

// 데이터베이스 모델 객체를 위한 변수 선언
var UserModel;

//데이터베이스에 연결
function connectDB() {
	// 데이터베이스 연결 정보
	var databaseUrl = 'mongodb://localhost:27017/local';
	 
	// 데이터베이스 연결
  console.log('데이터베이스 연결을 시도합니다.');
  mongoose.Promise = global.Promise;  // mongoose의 Promise 객체는 global의 Promise 객체 사용하도록 함
	mongoose.connect(databaseUrl);
	database = mongoose.connection;
	
	database.on('error', console.error.bind(console, 'mongoose connection error.'));	
	database.on('open', function () {
		console.log('데이터베이스에 연결되었습니다. : ' + databaseUrl);	
        
		// 스키마 정의
		UserSchema = mongoose.Schema({
        u_id:{type:String, required:[true,'u_id is required!'], unique:true},
        u_pw:{type:String, required:[true,'u_pw is required!'], select:false},
        u_name:{type:String, required:[true,'u_name is required!'], index: 'hashed'},
        u_phone:{type:String, required:[true,'u_phone is required!']},
        u_address:{type:String, required:[true,'u_address is required!']},
        u_like:{type:String, 'default':""}
		});
		
		// 스키마에 static으로 findById 메소드 추가
		UserSchema.static('findById', function(id, callback) {
			return this.find({id:id}, callback);
		});
		
    // 스키마에 static으로 findAll 메소드 추가
		UserSchema.static('findAll', function(callback) {
			return this.find({}, callback);
		});
		
		console.log('UserSchema 정의함.');
		
		// UserModel 모델 정의
		UserModel = mongoose.model("users2", UserSchema);
		console.log('UserModel 정의함.');
	});
	
    // 연결 끊어졌을 때 5초 후 재연결
	database.on('disconnected', function() {
        console.log('연결이 끊어졌습니다. 5초 후 재연결합니다.');
        setInterval(connectDB, 5000);
    });
}*/

//===== 서버 시작 =====//

var loginRouter = require('./routes/login')(app, db);
var registerRouter = require('./routes/register')(app, db);
//var mainRouter = require('./routes/main')(app);
//var customOrderRouter = require('./routes/order1')(app);  // order1
var paintingOrderRouter = require('./routes/order2')(app);  // order2
// var userRouter = require('./routes/user')(app);  // mypage
// var boardRouter = require('./routes/board')(app);

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

  // 데이터베이스 연결을 위한 함수 호출
  // connectDB();
});