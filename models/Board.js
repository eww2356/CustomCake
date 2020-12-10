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
    });

    /* statics추가 */

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
}