exports.createChat = function createChat (server) {
  var guestNumber = 1;
  var guestNames = {};
  var roomMembers = {};

  var io = require('socket.io')(server);
  io.on('connection', function (socket) {
    guestNames[socket.id] = 'guest' + guestNumber;
    joinRoom(socket, 'lobby');
    guestNumber++;
    io.emit('connected', {user: guestNames[socket.id]});
    io.to('lobby').emit('roomList', {nicknames: nicknamesInRoom('lobby')});

    socket.on('disconnect', function () {
      var lastRoom = currentRoom(socket);
      leaveRoom(socket,lastRoom);
      io.emit('message', {message: guestNames[socket.id] + ' has disconnected', sys: true});
      io.to(lastRoom).emit('roomList', {nicknames: nicknamesInRoom(lastRoom)});
    });

    socket.on('sendMessage', function (data) {
      io.to(data.room).emit('message', {message: guestNames[socket.id] + ': ' + data.message});
    });

    socket.on('nicknameChangeRequest', function (data) {
      var nickname = data.arg;
      if (isValidUserName(nickname)) {
        var oldNick = guestNames[socket.id];
        guestNames[socket.id] = nickname;
        socket.emit('nicknameChangeResult', {
          success: true,
          nickname: guestNames[socket.id]
        });
        io.to(data.room).emit('message', {
          message: 'From hence forth, please call ' + oldNick + ' ' + nickname,
          sys: true
        });
        io.to(data.room).emit('roomList', {nicknames: nicknamesInRoom(data.room)});
      } else {
        socket.emit('nicknameChangeResult', {
          success: false,
          message: 'Invalid nickname!'
        });
      }
    });

    socket.on('roomJoinRequest', function (data) {
      var newRoom = data.arg;
      var oldRoom = currentRoom(socket);

      switchRooms(socket, oldRoom,newRoom);
      socket.emit('roomJoinResponse', {room: newRoom, message: 'Welcome to ' + currentRoom(socket)});
      io.to(newRoom).emit('roomList', {nicknames: nicknamesInRoom(newRoom)});
      io.to(oldRoom).emit('roomList', {nicknames: nicknamesInRoom(oldRoom)});
      io.to(oldRoom).emit('message', {message: guestNames[socket.id] + ' has left the room.', sys: true});
      io.to(newRoom).emit('message', {message: guestNames[socket.id] + ' has joined the room.', sys: true});
    });




  });

  var isValidUserName = function (name) {
    if (name.match(/guest[0-9]*/)) {
      return false;
    } else if (currentGuests().indexOf(name) != -1) {
      return false;
    }
    return true;
  };

  var currentGuests = function () {
    var guests = [];
    Object.keys(guestNames).forEach( function (key) {
      guests.push(guestNames[key]);
    });
    return guests;
  };

  var joinRoom = function (socket,room) {
    if (roomMembers[room]) {
      roomMembers[room].push(socket.id)
    } else {
      roomMembers[room] = [socket.id];
    }
    socket.join(room);
  };

  var leaveRoom = function (socket, room) {
    if (roomMembers[room]) {
      var idx = roomMembers[room].lastIndexOf(socket.id);
      roomMembers[room].splice(idx,1);
    }
    socket.leave(room);
  };

  var switchRooms = function (socket, old, target) {
    leaveRoom(socket,old);
    joinRoom(socket,target);
  };

  var nicknamesInRoom = function (room) {
    var nicknames = [];
    console.log(roomMembers[room]);
    roomMembers[room].forEach( function (socketId) {
      nicknames.push(guestNames[socketId])
    });
    return nicknames;
  };

  var currentRoom = function (socket) {
    var foundRoom = -1;
    Object.keys(roomMembers).forEach( function (room) {
      roomMembers[room].forEach( function (member) {
        if (member === socket.id) {
          foundRoom = room;
          return;
        }
      });
    });
    return foundRoom;
  };



};
