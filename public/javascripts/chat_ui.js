(function() {
  if (typeof ChatApp === "undefined") {
    window.ChatApp = {};
  }

  var socket = io();
  var chat = new ChatApp.Chat(socket);

  $(document).ready( function () {
    chat.$chatEl = $('.active .messages');
    chat.$usersEl = $('.active .users');
    setInterval( function () {
      chat.$chatEl = $('.active .messages');
      chat.$usersEl = $('.active .users');
    },20);

      $('.switch-room').click(function () {
        chat.room = $(event.target).attr("href").slice(1);
      });

      $('form').on( 'submit', function () {
        event.preventDefault();
        var message = $('.message-text').val();
        chat.sendMessage({message: message});
        $('.message-text').val('');
      });

    chat.socket.on("connected", function (data) {
      var message = data.user + ' has connected to chat';
      $('.messages').prepend(ChatApp.Chat.newLi(message).addClass('sys-msg'));
    });

    chat.socket.on("message", function (data) {
      var $message = ChatApp.Chat.newLi(data.message);
      if (data.sys) {
        $message.addClass('sys-msg');
      }
      if (data.room) {
        $('#' + data.room + ' .messages').prepend($message);
      } else {
        $('.messages').prepend($message);
      }
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
      var room = data.room;
      var roomTab = $('<li><a class="switch-room" href="#' + data.room + '">' + data.room + '</a></li>');
      roomTab.find('a').click(function () {
        chat.room = $(event.target).attr("href").slice(1);
      });
      var roomDiv = $('<div class="chat-pane" id="' + data.room + '">');
      roomDiv.append(ChatApp.Chat.newPane());
      $('#content-tabs').append(roomDiv);
      $('.room-tabs').append(roomTab);
      roomTab.find('a').trigger('click');
      $('#' + room + ' .messages').prepend(ChatApp.Chat.newLi(data.message).addClass('sys-msg'));
      $('.room-name').text('Current room: ' + data.room);
      chat.room = data.room;
    });

    chat.socket.on("roomLeaveResponse", function (data) {
      var room = data.room;
      var roomLink = $('a[href="#' + data.room + '"]')
      roomLink.parent().remove();
      var roomPane = $('#' + room );
      roomPane.remove();
      if (room != 'lobby') {
        console.log($('a[href="#lobby"]'));
        $('a[href="#lobby"]').trigger('click');
      }
    });

    chat.socket.on("roomList", function (data) {
      var room = data.room;
      var nicknames = data.nicknames;
      $('#' + room + ' .users').empty();
      nicknames.forEach(function (name) {
        $('#' + room + ' .users').append(ChatApp.Chat.newLi(name));
      });
    });

  });







}());
