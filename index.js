var express = require('express');
var http = require('http');
var path = require('path');

var mypoolsql = require('my_pool_sql');

global.pool = new mypoolsql(100,
    {   host : 'localhost',
        port : 3306,
        user : 'weclip',
        password : '1234!@#$',
        database : 'weclip',
});

var app = express();
app.use(express.static(path.join(__dirname, 'public')));

var httpServer = http.createServer(app);
httpServer.listen(8000, function(req,res){
    console.log('Socket IO server has been started');
});

var io = require('socket.io');
var socketServer = io.listen(httpServer);

app.get('/', function(req, res, next){
   res.send('hi');
});

socketServer.sockets.on('connection',function(socket){

    socket.on('connection', function(socket){
        console.log('[NEW] ' + socket.toString());
    });

    socket.on('CQ_LOGIN', function(data) {

        var response = {'result': 0}

        try
        {
            console.log('[CQ_LOGIN] ' + data.toString());
            var loginInfo = JSON.parse(data);

            var user_id = loginInfo.user_id;
            var user_device = loginInfo.device;
/*
            pool.query('select * from history where test1=:test1 ', {test1 : '1'}, function(err, results){
                console.log(results.rows);	// 조회 결과
                console.log(results.info);	// 결과정보
                console.log(results.info.numRows);	// 카운터 수
            });

            db.write(user_id, user_device);
*/
            response['id'] = 100;

            socket.emit('SA_LOGIN', JSON.stringify(response));
            socket.join(user_id);

            socketServer.socket.in(user_id).emit('SN_LOGIN');
            console.log('[CQ_LOGIN] success ' + response.toString());
        }
        catch(e)
        {
            response['result'] = -1;
            response['message'] = e.toString();
            socket.emit('SA_LOGIN', response);
            console.log('[CQ_LOGIN] failed ' + response.toString());
        }

    });

    socket.on('CQ_SYNC_HISTORY', function(data){
        console.log('[CQ_SYNC_HISTORY] ' + data.toString());

    });
});