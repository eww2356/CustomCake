var mongoose = require('mongoose');

//===== 데이터베이스 연결 =====//

// 데이터베이스 객체를 위한 변수 선언
var database;

// 데이터베이스 스키마 객체를 위한 변수 선언
var OrderSchema;

// 데이터베이스 모델 객체를 위한 변수 선언
var OrderModel;

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
        OrderSchema = mongoose.Schema({
            // oh_id:{type:String, required:[true,'oh_id is required!'], unique:true},
            oh_date:{type:Date, default:Date.now},
            oh_option:{type:String, required:[true,'oh_option is required!']},
            oh_user:{type:String, required:[true,'oh_user is required!']}
        }, {collection: 'order_history'});
        
        // 필수 속성에 대한 유효성 확인 (길이값 체크)
        OrderSchema.path('oh_option').validate(function (oh_option) {
            return oh_option.length;
        }, 'oh_option 칼럼의 값이 없습니다.');
        
        OrderSchema.path('oh_user').validate(function (oh_user) {
            return oh_user.length;
        }, 'oh_user 칼럼의 값이 없습니다.');
    
        // 스키마에 static으로 findById 메소드 추가
        OrderSchema.static('findByUser', function(user, callback) {
            return this.find({oh_user:user}, callback);
        });
        
        // 스키마에 static으로 findAll 메소드 추가
        OrderSchema.static('findAll', function(callback) {
            return this.find({}, callback);
        });
        
        console.log('OrderSchema 정의함.');
        
        // OrderModel 모델 정의
        OrderModel = mongoose.model("order_history", OrderSchema);
        console.log('OrderModel 정의함.');
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

    //주문을 추가하는 함수
    addOrder = function(database, /*oh_id, oh_date,*/ oh_option, oh_user, callback) {
        console.log('addOrder 호출됨 : ' + /*oh_id + ', ' + oh_date + ', ' +*/ oh_option + ', ' + oh_user);
        
        // OrderModel 인스턴스 생성
        var order = new OrderModel({/*"oh_id":oh_id, "oh_date": oh_date,*/"oh_option":oh_option,"oh_user":oh_user});

        // save()로 저장 : 저장 성공 시 addedUser 객체가 파라미터로 전달됨
        order.save(function(err, addedOrder) {
            if (err) {
                callback(err, null);
                return;
            }
            
            console.log("주문 데이터 추가함.");
            callback(null, addedOrder);	     
        });
    };
}


