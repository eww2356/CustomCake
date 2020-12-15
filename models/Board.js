const mongoose = require('mongoose');
var BoardSchema;
var BoardModel;

var database = mongoose.connect('mongodb://localhost:27017/local', {
    useNewUrlParser: true
  })
  .then(() => {
    console.log("Connected to MongoDB --- Board connect");
    BoardSchema = mongoose.Schema({
      /*b_id : {type: String, required: true},*/
      b_date : {type: Date, default: Date.now},
      b_title : {type: String, required: true},
      b_content : {type: String, required: true},
      b_writer : {type: String, required:[true, 'b_writer is required!']},
      b_file : {type: String, required:[true, 'b_file is required!']},
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

    BoardSchema.statics.findAll = function (callback) {
      return this.find({}, callback);
    };

    BoardSchema.statics.findBoardId = function (_id, callback){
      return this.find({_id: _id}, callback);
    };

    BoardSchema.statics.findBoardIdLike = function(_id_array, callback){
      return this.find({_id: {$in: _id_array}}, callback);
    };

    BoardSchema.statics.deleteOne = function(_id, callback){
      return this.findOneAndDelete({_id: _id}, callback);
    }

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

    addBoard = function(database, b_title, b_content, b_file, b_writer, callback){
      console.log("### addBoard : " + b_title + ', ' + b_writer);
      var boardModel = new BoardModel({"b_title":b_title, "b_content":b_content, "b_file": b_file, "b_writer":b_writer});

      boardModel.save( function(err, addedBoard) {
        if(err) {
          if( callback ) callback(err, null);
          return;
        }

        if( callback ) callback(null, addedBoard);
      });
    };

    getfindAll = function(database, callback){
      console.log("### getfindAll-board ###");

      BoardModel.findAll(function( err, boardList ){
        if( err ){
          callback(err, null);
          return;
        }

        callback(null, boardList);
      });
    };

    getfindOne = function(database, _id, callback){
      console.log("### getfindOne-board ###");

      BoardModel.findBoardId(_id, function(err, boardData){
        if( err ){
          if( callback ) callback(err, null);
          return;
        }

        callback(null, boardData);
      });
    };
  
    // 배열_id find하기
    getfindAllLike = function(database, _id_array, callback){
      console.log("### getfindAllLike-board ###");
      console.log(JSON.stringify(_id_array));

      BoardModel.findBoardIdLike(_id_array, function(err, boardData){
        if( err ){
          if( callback ) callback(err, null);
          return;
        }

        callback(null, boardData);
      });
    };

    getDeleteOne = function(database, _id, callback){
      console.log("### getDeleteOne-board ###");

      BoardModel.deleteOne(_id, function(err){
        if( err ){
          if( callback ) callback(err);
          return;
        }
      });
    };

}