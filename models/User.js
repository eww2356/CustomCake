var mongoose = require('mongoose');
//===== 데이터베이스 연결 =====//

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
            u_pw:{type:String, required:[true,'u_pw is required!']/*, select:false*/},
            u_name:{type:String, required:[true,'u_name is required!'], index: 'hashed'},
            u_phone:{type:String, required:[true,'u_phone is required!']},
            u_address:{type:String, required:[true,'u_address is required!']},
            u_like:{type:String, 'default':""}
        }, {collection: 'user'});
        
        // 스키마에 static으로 findById 메소드 추가
        UserSchema.static('findById', function(id, callback) {
            return this.find({u_id:id}, callback);
        });
        
        // 스키마에 static으로 findAll 메소드 추가
        UserSchema.static('findAll', function(callback) {
            return this.find({}, callback);
        });
        
        console.log('UserSchema 정의함.');
        
        // UserModel 모델 정의
        UserModel = mongoose.model("user", UserSchema);
        console.log('UserModel 정의함.');
    });
    
    // 연결 끊어졌을 때 5초 후 재연결
    database.on('disconnected', function() {
        console.log('연결이 끊어졌습니다. 5초 후 재연결합니다.');
        setInterval(connectDB, 5000);
    });
}

connectDB();

module.exports = class Database {

    getDatabase() {
        return database;
    }

    //사용자를 추가하는 함수
    addUser = function(database, u_id, u_pw, u_name, u_phone, u_address, u_like, callback) {
        console.log('addUser 호출됨 : ' + u_id + ', ' + u_pw + ', ' + u_name + ', ' + u_phone + ', ' + u_address + ', ' + u_like);
        
        // UserModel 인스턴스 생성
        var user = new UserModel({"u_id":u_id, "u_pw":u_pw, "u_name":u_name,"u_phone":u_phone, "u_address":u_address, "u_like":u_like});

        // save()로 저장 : 저장 성공 시 addedUser 객체가 파라미터로 전달됨
        user.save(function(err, addedUser) {
            if (err) {
                callback(err, null);
                return;
            }
            
            console.log("사용자 데이터 추가함.");
            callback(null, addedUser);	     
        });
    };

    // 사용자를 인증하는 함수 : 아이디로 먼저 찾고 비밀번호를 그 다음에 비교하도록 함
    authUser = function(database, u_id, u_pw, callback) {
        console.log('authUser 호출됨 : ' + u_id + ', ' + u_pw);
        
        // 1. 아이디를 이용해 검색
        UserModel.findById(u_id, function(err, results) {
            if (err) {
                callback(err, null);
                return;
            }
            
            console.log('아이디 [%s]로 사용자 검색결과', u_id);
            console.dir(results);
            
            if (results.length > 0) {
                console.log('아이디와 일치하는 사용자 찾음.');
                
                // 2. 패스워드 확인
                console.log(results[0]._doc.u_pw);
                console.log(u_pw);
                if (results[0]._doc.u_pw === u_pw) {
                    console.log('비밀번호 일치함');
                    callback(null, results);
                } else {
                    console.log('비밀번호 일치하지 않음');
                    callback(null, null);
                }
                
            } else {
                console.log("아이디와 일치하는 사용자를 찾지 못함.");
                callback(null, null);
            }
            
        });
        
    };
}


