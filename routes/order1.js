module.exports = function(app, db) {
    var database = db.getDatabase();    //OrderBasic.js
    
    // 케이크 주문하기 페이지 호출
    app.get('/order1', (req, res) => {
      res.render('order1.ejs');
    });

    // 주문 하기 버튼 후 프로세스
    app.post('/order1Data', (req, res) => {
        console.log('/order1Data CALL');
        console.log('/order1Data : ' + JSON.stringify(req.body));

        var optionBread = req.body.optionBread;
        var optionFloor = req.body.optionFloor;
        var optionCream = req.body.optionCream;
        var optionDeco = req.body.optionDeco;   // optionDeco["strawberry-5"]
        var price = 10000;

        if( optionFloor == "optionFloor-1" ){       // option값에 따라서 가격계산
            price += 0;
        } else if( optionFloor == "optionFloor-2" ){
            price += 10000;
        } 
        for( var i in optionDeco ){
            if( optionDeco[i] == "strawberry-5" ){
                price += 5000;
            } else if( optionDeco[i] == "strawberry-10" ){
                price += 10000;
            } else if( optionDeco[i] == "chocolate-5" ){
                price += 5000;
            } else if( optionDeco[i] == "chocolate-10" ){
                price += 10000;
            } else if( optionDeco[i] == "macaron-3" ){
                price += 5000;
            } else if( optionDeco[i] == "macaron-6" ){
                price += 10000;
            } else if( optionDeco[i] == "candy-10" ){
                price += 5000;
            } else if( optionDeco[i] == "candy-20" ){
                price += 10000;
            } else {
                price += 0;
            }
        }

        console.log("optionBread", optionBread);

        var resultOption = {
            bread_shape : optionBread,
            bread_floor : optionFloor,
            bread_crean : optionCream,
            bread_deco : optionDeco,
            price : price,
        };

        var oh_option = JSON.stringify(resultOption);
        var oh_user = req.session.user.u_id;

        if (database) {
            db.addOrder(database, oh_option, oh_user, errorCallback);
        } else {  // 데이터베이스 객체가 초기화되지 않은 경우 실패 응답 전송
            res.writeHead('200', {'Content-Type':'text/html;charset=utf8'});
            res.write('<h2>데이터베이스 연결 실패</h2>');
            res.write('<div><p>데이터베이스에 연결하지 못했습니다.</p></div>');
            res.end();
        }

        function errorCallback(err, docs) {
            if (err) {
                console.error('주문1 중 에러 발생 : ' + err.stack);
                res.writeHead('200', {'Content-Type':'text/html;charset=utf8'});
                res.write('<h2>주문1 중 에러 발생</h2>');
                res.write('<p>' + err.stack + '</p>');
                res.end();
                        
                return;
            }
    
            if (docs) {
                console.dir(docs);
                res.redirect("order1");
                res.end();
            
            } else {  // 조회된 레코드가 없는 경우 실패 응답 전송
                res.writeHead('200', {'Content-Type':'text/html;charset=utf8'});
                res.write('<h1>주문1  실패</h1>');
                res.write('<div><p>주문 내용을 다시 확인하십시오.</p></div>');
                res.end();
            }
        }
    });

}// end Module