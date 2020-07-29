
var express = require('express');
var app = express();
var http = require('http');
var socketIo = require('socket.io');

var gamer = require('./playerlib');

var ser = http.Server(app);
var soc = socketIo(ser);

function create_pool() {
    // 创建Gamer池。
    p = new Object();
    p.length = 0;
    p.pool = [];
    p.add = function (obj) {
        this.pool.push(obj);
        this.length += 1;
    }
    p.find = function (key, func) {
        // 寻找pool中满足 func(obj)==key 的第一个obj，并返回其下标。如果不存在，返回-1。
        for (let i = 0; i < this.length; i++)
            if (func(this.pool[i]) == key)
                return i
        return -1
    }
    p.remove = function (key, func) {
        let pos = this.find(key, func);
        if (pos < 0)
            console.log('key "', key, '" do not exist in this pool.')
        else {
            p.pool.splice(pos, 1);
            p.length -= 1;
        }
    }
}

function init_gamer() {
    // 创建并返回一个Gamer对象。
    // 一个Gamer在登录用户使用正确的账户名和密码登录之后被创建，能够有包含：
    // 座位选择，准备动作的等属性，同时也具有一些全局属性，比如累计的战绩统计。
    // （至少目前是这样设计的）
    f = new Object();
    f.get_socket = function (socket) {
        this.socket = socket;
    }
    f.game_action = gamer.init_gamer();
    return f
}

gamer_pool = create_pool();
soc.on('connection', (socket) => {
    // 基础事件的响应和削除
    socket.on('disconnect', () => {
        //监听用户断开事件
        console.log("用户" + socket.id + "断开连接");
    });
    console.log("用户" + socket.id + "连接");

    // 绑定事件到socket上，主要包含了监听到的内容。

    // 绑定socket到gamer身上。

    gamer = init_gamer();
    gamer.get_socket(socket);
})
/*
soc.on('connection', (socket) => {
    //监听connection（用户连接）事件，socket为用户连接的实例
    socket.on('disconnect', () => {
        //监听用户断开事件
        console.log("用户" + socket.id + "断开连接");
    });
    console.log("用户" + socket.id + "连接");
    socket.on('msg', (data) => {
        //监听msg事件（这个是自定义的事件）
        console.log(data);//你好服务器
        socket.emit('msg', 'Helllo');
        //向socket用户发送信息
    })
})
*/

ser.listen(8080, function () {
    console.log('start listening..')
})