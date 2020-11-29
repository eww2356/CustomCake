const express = require('express');
let app = express();
const ejs = require('ejs');

app.set("views", __dirname + "/views");
app.set("view engine", "ejs");
app.engine("ejs", ejs.renderFile);

const hostname = '127.0.0.1';
const port = 3000;

//var loginRouter = require('./routes/login')(app);
//var registerRouter = require('./routes/register')(app);
//var mainRouter = require('./routes/main')(app);
//var customOrderRouter = require('./routes/order1')(app);  // order1
//var paintingOrderRouter = require('./routes/order2')(app);  // order2
var userRouter = require('./routes/user')(app);  // mypage
var boardRouter = require('./routes/board')(app);

app.listen(port, () => {
  console.log(`Express is running on http://${hostname}:${port}/`);
} );
