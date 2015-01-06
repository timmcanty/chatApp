(function() {
  if (typeof ChatApp === "undefined") {
    window.ChatApp = {};
  }

  var socket = io();
  var chat = new ChatApp.Chat(socket);

  $(document).ready( function () {
    chat.$chatEl = $('.active .messages');
    chat.$usersEl = $('.active .users');

    $('form').on( 'submit', function () {
      event.preventDefault();
      var message = $('.message-text').val();
      chat.sendMessage({message: message});
      $('.message-text').val('');
      });

    chat.socket.on("connected", function (data) {
      var message = data.user + ' has connected to chat';
      chat.$chatEl.prepend(ChatApp.Chat.newLi(message).addClass('sys-msg'));
    });


    chat.socket.on("message", function (data) {
      if (data.sys) {
        chat.$chatEl.prepend(ChatApp.Chat.newLi(data.message).addClass('sys-msg'));
        return;
      }
      chat.$chatEl.prepend(ChatApp.Chat.newLi(data.message));
    });

    chat.socket.on("nicknameChangeResult", function (data) {
      if (data.success) {
        $('.user-name').text('Your current handle: ' + data.nickname);
        chat.$chatEl.prepend(ChatApp.Chat.newLi('Nickname changed!').addClass('sys-msg'));
      } else {
        chat.$chatEl.prepend(ChatApp.Chat.newLi(data.message).addClass('error-msg'));
      }
    });

    chat.socket.on("roomJoinResponse", function (data) {
      chat.$chatEl.prepend(ChatApp.Chat.newLi(data.message).addClass('sys-msg'));
      $('.room-name').text('Current room: ' + data.room);
      chat.room = data.room;
    });

    chat.socket.on("roomList", function (data) {
      var nicknames = data.nicknames;
      chat.$usersEl.empty();
      nicknames.forEach(function (name) {
        chat.$usersEl.append(ChatApp.Chat.newLi(name));
      });
    });

  });







}());
