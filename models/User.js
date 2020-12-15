var mongoose = require('mongoose');

// crypto 모듈 불러들이기
var crypto = require('crypto');

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
            salt: {type:String, required:true},
            u_name:{type:String, required:[true,'u_name is required!'], index: 'hashed'},
            u_phone:{type:String, required:[true,'u_phone is required!']},
            u_address:{type:String, required:[true,'u_address is required!']},
            u_like:{
                u_like_of_b_id : {type: String}
            }
        }, {collection: 'user'});
        

        // password를 virtual 메소드로 정의 : MongoDB에 저장되지 않는 가상 속성임. 
        // 특정 속성을 지정하고 set, get 메소드를 정의함
        UserSchema
        .virtual('password')
        .set(function(password) {
        this._u_pw = password;
        this.salt = this.makeSalt();
        this.u_pw = this.encryptPassword(password);
        console.log('virtual password의 set 호출됨 : ' + this.u_pw);
        })
        .get(function() {
            console.log('virtual password의 get 호출됨.');
            return this._u_pw;
        });
        
        // 스키마에 모델 인스턴스에서 사용할 수 있는 메소드 추가
        // 비밀번호 암호화 메소드
        UserSchema.method('encryptPassword', function(plainText, inSalt) {
            if (inSalt) {
                return crypto.createHmac('sha1', inSalt).update(plainText).digest('hex');
            } else {
                return crypto.createHmac('sha1', this.salt).update(plainText).digest('hex');
            }
        });
        
        // salt 값 만들기 메소드
        UserSchema.method('makeSalt', function() {
            return Math.round((new Date().valueOf() * Math.random())) + '';
        });
        
        // 인증 메소드 - 입력된 비밀번호와 비교 (true/false 리턴)
        UserSchema.method('authenticate', function(plainText, inSalt, u_pw) {
            if (inSalt) {
                console.log('authenticate 호출됨 : %s -> %s : %s', plainText, this.encryptPassword(plainText, inSalt), u_pw);
                return this.encryptPassword(plainText, inSalt) === u_pw;
            } else {
                console.log('authenticate 호출됨 : %s -> %s : %s', plainText, this.encryptPassword(plainText), this.u_pw);
                return this.encryptPassword(plainText) === this.u_pw;
            }
        });

        // 값이 유효한지 확인하는 함수 정의
        var validatePresenceOf = function(value) {
            return value && value.length;
        };
            
        // 저장 시의 트리거 함수 정의 (u_pw 필드가 유효하지 않으면 에러 발생)
        UserSchema.pre('save', function(next) {
            if (!this.isNew) return next();
            if (!validatePresenceOf(this.u_pw)) {
                next(new Error('유효하지 않은 u_pw 필드입니다.'));
            } else {
                next();
            }
        })
        
        // 필수 속성에 대한 유효성 확인 (길이값 체크)
        UserSchema.path('u_id').validate(function (u_id) {
            return u_id.length;
        }, 'u_id 칼럼의 값이 없습니다.');
        
        UserSchema.path('u_pw').validate(function (u_pw) {
            return u_pw.length;
        }, 'u_pw 칼럼의 값이 없습니다.');
        
        UserSchema.path('u_name').validate(function (u_name) {
            return u_name.length;
        }, 'u_name 칼럼의 값이 없습니다.');
        
        UserSchema.path('u_phone').validate(function (u_phone) {
            return u_phone.length;
        }, 'u_phone 칼럼의 값이 없습니다.');
        
        UserSchema.path('u_address').validate(function (u_address) {
            return u_address.length;
        }, 'u_address 칼럼의 값이 없습니다.');

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
        var user = new UserModel({"u_id":u_id, /*"u_pw":u_pw,*/ "password": u_pw,"u_name":u_name,"u_phone":u_phone, "u_address":u_address, "u_like":u_like});

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
                
                // 2. 패스워드 확인 : 모델 인스턴스를 객체를 만들고 authenticate() 메소드 호출
                var user = new UserModel({u_id:u_id});
                var authenticated = user.authenticate(u_pw, results[0]._doc.salt, results[0]._doc.u_pw);
                if (authenticated) {
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

    // 유저 정보 get
    getUserInfo = function(database, u_id, callback) {
        UserModel.findById(u_id, function(err, userInfo){
            if (err) {
                callback(err, null);
                return;
            }

            console.log("유저 정보 조회함.");
            callback(null, JSON.stringify(userInfo));	   
        });
    };

    updateUserInfo = function(database, u_id, u_pw, u_name, u_phone, u_address, callback) {
        var user = new UserModel({ "password": u_pw,"u_name":u_name,"u_phone":u_phone, "u_address":u_address});
        UserModel.findOneAndUpdate({u_id:u_id}, {u_pw:user.u_pw, salt:user.salt, u_name:u_name, u_phone:u_phone, u_address:u_address}, { multi: true, new: true }, function(err, updatedUser) {
            if(err){
                callback(err, null);
            }else{
                callback(null, updatedUser);
            }
        })
    };

    // 사용자 정보에 u_like -> 좋아요 등록
    updateUserUlike = function(database, u_id, b_id, callback){
        
        // var update_u_like = {u_like_of_b_id: b_id};  //TEST-CODE
        // console.log(JSON.stringify(update_u_like));  //TEST-CODE

        UserModel.findOneAndUpdate( {u_id: u_id}, { $addToSet: { u_like: {u_like_of_b_id : b_id} } }, { upsert: true }, function(err, updatedUser){
            if( err ){
                callback(err, null);
            } else {
                callback(null, updatedUser);
            }
        }).exec();

    };
}


