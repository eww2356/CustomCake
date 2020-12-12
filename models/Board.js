const mongoose = require('mongoose');
var BoardSchema;
var BoardModel;

var database = mongoose.connect('mongodb://localhost:27017/local', {
    useNewUrlParser: true,
    useCreateIndex: true,
  })
  .then(() => {
    console.log("Connected to MongoDB --- Board connect");
    BoardSchema = mongoose.Schema({ // 1
        b_id : {type: String, required: true},
        b_date : {type: Date, default:Date.now},
        b_title : {type: String, required: true},
        b_content : {type: String, required: true},
        b_writer : {type: String, required: true},
        b_file : {},    // ?
        b_comment : {type: String},
        b_like : {type: String}
    }, {collection: 'board'});

    /* statics추가 */
    // 스키마에 static으로 findById 메소드 추가
    BoardSchema.static('findById', function(u_id, callback) {
      return this.find({b_writer:u_id}, callback);
    });
    // 스키마에 static으로 findByB_id 메소드 추가
    BoardSchema.static('findByBIds', function(b_ids, callback) {
      var b_id_list = b_ids.split(",");
      console.log(b_id_list);
      return this.find({b_id:{$in:b_id_list}}, callback);
    });

    BoardModel = mongoose.model("board", BoardSchema);
})
.catch((err) => {
  console.log(err);
  console.log("failed Connected to MongoDB --- Board connect");
});

module.exports = class Database{
    getDatabase() {
        return database;
    }
    /* 게시글 추가 / 삭제 */

    // 특정 유저가 게시한 게시글 목록 조회
    getBoardListByUId = function(database, u_id, callback) {
      BoardModel.findById(u_id, function(err, boardList){
          if (err) {
              callback(err, null);
              return;
          }
          
          console.log(u_id+"가 게시한 게시글 목록 조회함.");
          callback(null, boardList);	   
      });
    };

    // b_id들로  게시글 목록 조회
    getBoardListByBIds = function(database, b_ids, callback) {
      BoardModel.findByBIds(b_ids, function(err, boardList){
          if (err) {
              callback(err, null);
              return;
          }
          
          console.log(b_ids+" 게시글 목록 조회함.");
          callback(null, boardList);	   
      });
    };
}