var app = require('express')();
var http = require('http').Server(app);
var io = require('socket.io')(http);
var port = process.env.PORT || 3000;

var usernames = {};
//var rooms = ['Lobby'];
var roomsWithLog = {'Lobby':[]}

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
        io.emit('roomChange', newRoom, roomsWithLog[newRoom]);
    });

    socket.on('updateChat', function(msg){
        var username = socket.username;
        roomsWithLog[socket.room].push({username, msg});
        io.in(socket.room).emit('updateMessages', {username, msg});
    });


    /*socket.on('disconnect', function() {
        delete usernames[socket.username];
        io.sockets.emit('updateusers', usernames);
        socket.broadcast.emit('updatechat', 'SERVER', socket.username + ' has disconnected');
        socket.leave(socket.room);
    });*/
});
  
http.listen(port, function(){
    console.log('listening on *:' + port);
});
  