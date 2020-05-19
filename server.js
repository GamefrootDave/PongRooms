var express = require('express');
var app = express();
var server = require('http').Server(app);
var io = require('socket.io').listen(server);

/*
This code allows anyone to grab this multiplayer server template, and simply upload their game files into the root directory.
Server.js takes care of adding multiplayer functionality by editing index.html and inserting references to the multiplayer javascript files.
Once that's done, the server serves the updated HTML with multiplayer to the client, and no one needs to edit any files!
*/

var replace = require('replace-in-file');

var options = {
  files: 'index.html',
  from: `<script src="game.js"></script>
    </body>`,
  to: `<script src="game.js"></script>
        <script src="/socket.io/socket.io.js"></script>
        <script src="multiplayer.js"></script>
    </body>`,
}; 

try {
  const results = replace.sync(options);
  console.log('Updated index.html to include multiplayer files:', results);
}
catch (error) {
  console.error('Error occurred:', error);
};


//Then serve index.html to the player
 
app.use(express.static(__dirname + ''));

app.get('/', function (req, res) {
  res.sendFile(__dirname + '/index.html');
});

//The server sets up its list of players here
var players = {};

//Then the server deals with sockets here
io.on('connection', function (socket) {
  console.log('A player connected');

  //Create a new player and add it to the server's list of players
  players[socket.id] = {playerId: socket.id};

  //Tell the new player what their id is
  var playerID = socket.id; 
  socket.emit('getPlayerID', playerID);
  //console.log('Given player ID to multiplayer.js');

  //Listen to the client's request to join a room (and if they are hosting, they will have requested to join 'RoomHosts')
  socket.on('joinRoom', roomName => {
    socket.join(roomName);
    console.log('Player joined room ', roomName);
  });

  //Listen to the client's request to get information about every room with 'getRooms', and relay this request to every client in room "RoomHosts" (since they are all hosts)
  socket.on('getRooms', playerID => {
    //console.log('Server has received request getRooms from ' + playerID);
    io.in('RoomHosts').emit('getRooms', playerID );
  });

  //Listen to the host client responding with their room information to send directly to the requesting client
  socket.on('giveRoom', value => {
    var requestingPlayerID = value[0];
    io.to(requestingPlayerID).emit('giveRoom', value);
  });

  //Listen to the client messages in a specific room, and relay them to that room
  socket.on('sendToRoom', ( roomName, messageName, messageValue ) => {
    room = roomName;
    io.in(room).emit('sendToRoom', messageName, messageValue);
  });

  //Listen to the client messages being sent directly to another client
  socket.on('sendToPlayer', ( targetPlayerID, messageName, messageValue ) => {
    io.to(targetPlayerID).emit('sendToPlayer', messageName, messageValue);
  });


  //Send the current list of players to the new player
  //socket.emit('currentPlayers', players);

  //Tell all the other players about the new player
  //socket.broadcast.emit('newPlayer', players[socket.id]);
 
  //When a player disconnects, remove them from our players object
  socket.on('disconnect', function () {
    console.log('Player disconnected');
    //Remove this player from our players object
    delete players[socket.id];
    //Emit a message to all players to remove this player
    io.emit('disconnect', socket.id);
  });

  /* This method was super spammy, so we've disabled it!
  //Listening for game-out messages from clients
  socket.on('game-out', (value) => {
    console.log('Game-out received with ', value);
    io.emit('game-in', value);
  });
  */
});
 
server.listen(8081, function () {
  console.log(`Listening on ${server.address().port}`);
});

