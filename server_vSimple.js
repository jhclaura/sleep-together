
// SET_UP
var express = require('express');
var app = express();
//
var http = require('http');
var server = http.createServer(app);

var port = process.env.PORT || 7000;

var players = [];

//
server.listen(port);

app.get('*', function(req, res){
	res.sendFile(__dirname + req.url);
});
console.log('Server started on port ' + port);

///////////////////////////////////////////////////////////
///////////////////////////////////////////////////////////
///////////////////////////////////////////////////////////

// Use WebSocket to send the data to html
var WebSocketServer = require('ws').Server;
var wss = new WebSocketServer({'server': server});

var allSockets = [], allSocketIDs = [];
var thisId = -1;	// first one will be 0

var lifeIndex = {};
lifeIndex.type = "index";

var mySocket = undefined;

// Should I cap a world's total pp number??
wss.on('connection', function(ws){

	mySocket = ws;

	thisId++;
	ws.id = thisId;

	// remember the id & socket match
	allSockets.push(ws);
	// allSocketIDs.push(thisId);

	console.log("new player #%d connected!", thisId);

	// SEND BACK Index
	if(mySocket){
		lifeIndex.index = thisId;
		mySocket.send( JSON.stringify(lifeIndex) );
	}

	ws.on('message', function(data){
		var msg = JSON.parse(data);
		socketHandlers(ws,msg);
	});

	ws.on('close', function(){
		for(var i=0; i<allSockets.length; i++){

			// Found the CLOSE socket in allSockets
			// if this is the one closed
			if(allSockets[i]==ws){
				var msg = {
					'type': 'removePlayer',
					'removeID': ws.id
				};
				console.log("player #%d disconnected.", ws.id);		// allSocketIDs[i]

				allSockets.splice(i,1);
				// allSocketIDs.splice(i,1);
				players.splice(i,1);

				socketHandlers(ws, msg);
				break;
			}
		}
		mySocket = undefined;
	});	
});


///////////////////////////////////////////////////////////
///////////////////////////////////////////////////////////
///////////////////////////////////////////////////////////


//
var socketHandlers = function(socket,msg){

	//GENERAL_SENDING_DATA
	for(var i=0; i<allSockets.length; i++){
		try{

			if(msg.type=='addNewPlayer'){

				// FOR_GENERATING_HISTORY_PLAYERS
				// ONLY_HAPPENS_ONCE
				if(msg.camID==0){
					msg.id = socket.id;
					// console.log('newPlayer Peer ID -->' + msg.peerid);
					msg.camID++;
					// console.log('camID -->' + msg.camID);

					players.push(msg);	// restoring all the players
				}
			}

			// SERVER_SEND_GENERAL_THING
			allSockets[i].send(JSON.stringify(msg));

			// SERVER_SEND_ARRAY_THING
			if(msg.type=='addNewPlayer'){
				allSockets[i].send(JSON.stringify(players));
				// console.log('Server sent a BROADCAST thing.');				
				// console.log(players.length);
			}
		}
		catch(error){
			console.log('that socket was closed');
		}
	}


	//BROADCAST_HISTORY_OF_PLAYERS
	// for(var i=0; i<allSockets.length; i++){
	// 	try{

	// 		// MEG_FROM_PointerLockControls
	// 		if(msg.type=='addNewPlayer'){

	// 			//console.log('addNewPlayer: #' + );

	// 			// msg.newPlayerID = allSocketIDs[i];
	// 			//msg.newPlayerID = msg.myID;

	// 			//GENERATE_RED_STORK_ONLY_ONCE
	// 			if(msg.camID==0){
	// 				msg.npID = socket.id;
	// 				console.log('newPlayerID -->' + socket.id);


					
	// 				msg.camID++;
	// 				// console.log('camID -->' + msg.camID);


	// 				redPlayer.push(msg);
	// 			}

	// 			// console.log(redPlayer);

	// 			//allSockets[i].send(JSON.stringify(msg));

	// 			allSockets[i].send(JSON.stringify(redPlayer));

	// 			// console.log('Server sent a BROADCAST thing.');				
	// 			console.log(redPlayer.length);
	// 		}
	// 	}
	// 	catch(error){
	// 		console.log('that socket was closed');
	// 	}
	// }

	//RESTORE_AddStork
	// for(var i=0; i<allSockets.length; i++){

	// 	try{
	// 		if(msg.type=='addNewPlayer'){

	// 			if(msg.camID==0){
	// 				redPlayer.push(msg);
	// 				msg.camID++;
	// 			}

	// 			allSockets[i].send(JSON.stringify(redPlayer));				
	// 			console.log(redPlayer.length);
	// 		}
	// 	}
	// 	catch(error){
	// 		console.log('that socket was closed');
	// 	}

	// }
};

///////////////////////////////////////////////////////////
///////////////////////////////////////////////////////////
///////////////////////////////////////////////////////////