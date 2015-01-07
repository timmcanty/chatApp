(function() {
  if (typeof ChatApp === "undefined") {
    window.ChatApp = {};
  }

  var Chat = ChatApp.Chat = function (socket) {
    this.socket = socket;
    this.room = 'lobby';
  };

  Chat.newLi = function (html) {
    return $('<li></li>').text(html);
  };

  Chat.newPane = function () {
    var pane = $('<section class="main after"></section>');
    var messages = $('<ul class="messages"></ul>');
    var users = $('<ul class="users"></ul>');
    pane.append(messages);
    pane.append(users);
    return pane;
  }

  Chat.prototype.sendMessage = function (data) {
    var message = data.message;
    var command = this.parseCommand(message);
    var commandArg = message.split(' ').pop();
    if (command) {
      this.socket.emit(command, {arg: commandArg, room: this.room} );
      return;
    }
    this.socket.emit('sendMessage', {message: message, room: this.room});
  };

  Chat.prototype.parseCommand = function (message) {
    if (message.match(/^\/nick\s\w{4}/)) {
      return 'nicknameChangeRequest';
    } else if (message.match(/^\/join\s\w{4}/)) {
      return 'roomJoinRequest';
    } else if (message.match(/^\/leave/)) {
      return 'roomLeaveRequest';
    }
    return false;
  };

}());
