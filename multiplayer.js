/*
This is the multiplayer code that runs on the client (it is added to the game's index.html). 
It receives messages from the socket.io server, and ingests them into the game in a way the game can understand.
It also receives messages coming out of the game, and sends them to the socket.io server.
*/

//Connecting to socket io
var self = this;
this.socket = io();

//Setup a global var for our playerID (which we don't yet know)
var assignedPlayerID = null;

//The server has assigned this player an id as soon as we connected, BUT we need to wait for the level to load in order to ingest it into the game.
//Once the game level has loaded, the game should send an external message to request their playerID. Until then, we are storing assignedPlayerID here.
this.socket.on('getPlayerID', playerID => {
    assignedPlayerID = playerID;
    //console.log('Player ID is ' + value );
});

//The game has loaded and has sent a request for the playerID using message "'requestPlayerID". Now we can successfully assign them their playerID.
game.broadcast.emitter.on(game.broadcast.MESSAGE, message => { 
    if ( message === 'getPlayerID' ) {
        game.broadcast.ingest('getPlayerID', assignedPlayerID );
        //console.log('The player ID being sent to the game is ' + assignedPlayerID);
    }
});

//The game has requested to HOST a room with message "hostRoom" and parameter 'myRoomName', so we'll tell the server to connect this client to a room with that name.
//This is exactly the same as 'joinRoom' below, but it also adds this player to the room 'RoomHosts' so that hosts can be asked about their rooms.
game.broadcast.emitter.on(game.broadcast.MESSAGE, ( message, value ) => { 
    if ( message === 'hostRoom' ) {
        var roomName = value;
        //console.log('Client has requested to host room ' + roomName );
        socket.emit('joinRoom', roomName);
        socket.emit('joinRoom', 'RoomHosts');
    }
});

//This game is asking the server to tell each host player to send us the name of their room
game.broadcast.emitter.on(game.broadcast.MESSAGE, message => { 
    if ( message === 'getRooms' ) {
        socket.emit('getRooms', socket.id);
        //console.log('This player is asking to getRoom with their id of ' + socket.id);
    }
});

//The server is asking each room host to send their room information to the requesting client
this.socket.on('getRooms', playerID => {
    value = playerID;
    game.broadcast.ingest('getRooms', value );
});

//This host game is telling their room information to the server to relay to that specific client with that socketID
game.broadcast.emitter.on(game.broadcast.MESSAGE, ( message, value ) => { 
    if ( message === 'giveRoom' ) {
        var requestingPlayerID = value[0];
        var hostPlayerID = value[1];
        var roomName = value[2];
        var numberOfPlayers = value[3];
        //seeing if I can just send through the list 'value' instead of the vars
        socket.emit('giveRoom', value );
    }
});

//This game is receiving individual room information from each room host that has responded to 'getRooms' with 'giveRoom'
this.socket.on('giveRoom', value => {
    game.broadcast.ingest('giveRoom', value );
});

//The game has requested to join a room with message "joinRoom" and parameter 'myRoomName', so we'll tell the server to connect this client to a room with that name.
game.broadcast.emitter.on(game.broadcast.MESSAGE, ( message, value ) => { 
    if ( message === 'joinRoom' ) {
        var roomName = value;
        //console.log('Client has requested to join room ' + roomName );
        socket.emit('joinRoom', roomName);
    }
});

//The game is sending a message to all players in their specific room with a list containing roomName and other information
game.broadcast.emitter.on(game.broadcast.MESSAGE, ( message, value ) => { 
    if ( message === 'sendToRoom' ) {
        list = value;
        var roomName = list[0];
        var messageName = list[1];
        list.splice(0, 2);//this removes roomName and messageName from the list, since the players in the room don't need to know this
        var messageValue = list;
        socket.emit('sendToRoom', roomName, messageName, messageValue);
    }
});

//The server is telling this client that a message has been received in this specific room, so we need to ingest that into the game
this.socket.on('sendToRoom', ( messageName, messageValue )=> {
    value = messageValue;
    game.broadcast.ingest( messageName, value );
});

//The game is sending a message to a specific player (and the server will relay it to them)
game.broadcast.emitter.on(game.broadcast.MESSAGE, ( message, value ) => { 
    if ( message === 'sendToPlayer' ) {
        list = value;
        var targetPlayerID = list[0];
        var messageName = list[1];
        //console.log('before ' + list);
        list.splice(0, 2);//this removes the targetPlayerID and messageName from the list, since the target player doesn't need those
        //console.log('after' + list);
        var messageValue = list;
        socket.emit('sendToPlayer', targetPlayerID, messageName, messageValue);
    }
});

//The server is sending a message sent specifically to this client
this.socket.on('sendToPlayer', ( messageName, messageValue ) => {
    value = messageValue;
    game.broadcast.ingest( messageName, value );
    //console.log('Game is ingesting ' + messageName + ' with ' + value);
});



//

/*
The section below relayed messages from any client, through the server, and then back to every other client. 
Pretty wasteful and spammy! So we've implemented rooms for sending messages to specific channels for specific clients to receive.

//receiving game-in messages from the server, and then ingesting them into the game
this.socket.on('game-in', (value) => {
    //console.log('game-in' + value );
    game.broadcast.ingest('game-in', value );
});

//sending game-out messages to the server!
game.broadcast.emitter.on(game.broadcast.MESSAGE, ( message, value ) => { 
    if ( message === 'game-out' ) {
        //console.log('game-out' + value);
        this.socket.emit('game-out', value );
    }
});

*/