var express = require('express');
var app = require('express')();
var http = require('http').Server(app);
var io = require('socket.io')(http);
var port = process.env.PORT || 3000;
var path = require('path')

var usernames = {};
//var rooms = ['Lobby'];
var roomsWithLog = {'Lobby':[]}
app.use(express.static(path.join(__dirname, 'public')));

app.get('/', function(req, res){
    console.log('redirecting');
    res.sendFile(__dirname + '/index.html');
});
  
io.on("connection", function(socket){
    console.log('connected');
    socket.on('adduser', function(username) {
        console.log('Adding User - ' + username);
        socket.username = username;
        socket.room = 'Lobby';
        usernames[username] = username;
        socket.join('Lobby');
    });

    socket.on('createJoinRoom', function(newRoom){
        console.log('Room managment - ' + newRoom);
        if(!(newRoom in roomsWithLog)){
            console.log('Creating Room - ' + newRoom);
            roomsWithLog[newRoom] = [];
        }
        console.log('Leaving Room - ' + socket.room);
        socket.leave(socket.room);
        socket.join(newRoom);
        socket.room = newRoom;
        io.in(socket.room).emit('roomChange', newRoom, roomsWithLog[newRoom]);
    });

    socket.on('updateChat', function(msg){
        var username = socket.username;
        roomsWithLog[socket.room].push({username, msg});
        io.in(socket.room).emit('updateMessages', {username, msg});
    });
});
  
http.listen(port, function(){
    console.log('listening on *:' + port);
});
  