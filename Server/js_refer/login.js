
var express = require('express');
var app = express();
var http = require('http');
var socketIo = require('socket.io');

const ser = http.Server(app);
const soc = socketIo(ser);
//var bodyParser = require('body-parser');

// 创建 application/x-www-form-urlencoded 编码解析
var urlencodedParser = bodyParser.urlencoded({ extended: false })

app.use('/public', express.static('public'));

app.get('/', function (req, res) {
    res.sendFile(__dirname + "/" + "index.html");
})

app.post('/poster', urlencodedParser, function (req, res) {
    console.log('Already got this.');

    // 输出 JSON 格式
    var response = {
        "u": req.body.inputer,
    };
    console.log(req);
    console.log(response);
    res.end(JSON.stringify(response));
})

var server = app.listen(8848, function () {

    var host = server.address().address
    var port = server.address().port

    console.log("应用实例，访问地址为 http://%s:%s", host, port)

})
