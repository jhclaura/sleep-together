// Server setup
var express = require('express');
var app = express();
var http = require('http');
var server = http.createServer(app);
var port = process.env.PORT || 8000;
var compression = require('compression');
//
server.listen(port);

app.use(compression());

app.get('*', function(req, res){
	res.sendFile(__dirname + req.url);
});
console.log('Server started on port ' + port);

///////////////////////////////////////////////////////////
///////////////////////////////////////////////////////////
///////////////////////////////////////////////////////////

// WebSocket setup
var WebSocketServer = require('ws').Server;
var wss = new WebSocketServer({'server': server});

var allPlayers = [];
var allSockets = [], allSocketIDs = [];

var totalCount = 0;	// first one will be 1
var totalVisit = 0;

var lifeIndex = {};
lifeIndex.type = "index";

var mySocket = undefined;

// object list - index: whether it's occupied or not
var occuList = {};

// THE_SEAT_INDEX, default is 1
var occuIndex = 1;

///////////////////////////////////////////////////////////
///////////////////////////////////////////////////////////

// WS functions
wss.on('connection', function(ws){

	mySocket = ws;

	// TRACK TOTAL # OF PPL
	totalCount++;
	totalVisit++;

	// GET_THE_SEAT_INDEX

		// loop through all the elements in occuList
		// if there's a vacancy, get the index of the seat
		// and change the status to be occupied
		var haveEmptySeat = false;
		for( prop in occuList ){
			// if it's an empty seat
			if( occuList[prop] != "occupied" ){
				// get the index of the seat 
				occuIndex = prop;
				haveEmptySeat = true;

				// change it to be unoccupied
				occuList[prop] = "occupied";
				break;
			}
		}

		// if all the seat are already occupied
		// create a new seat and get the index
		if(!haveEmptySeat){
			occuIndex = Object.keys(occuList).length + 1;
			occuList[occuIndex] = "occupied";
		}

	ws.id = occuIndex;
	ws.worldId = Math.floor(occuIndex/18);	// which world you belong to

	allSockets.push(ws);
	console.log("new player connected! index: %d, total #: %d", occuIndex, totalCount);

	// SEND BACK INDEX INFO!
	if(mySocket){
		lifeIndex.index = occuIndex;
		lifeIndex.worldId = Math.floor(occuIndex/18);
		lifeIndex.totalVisit = totalVisit;
		mySocket.send( JSON.stringify(lifeIndex) );
	}

	// GET MESSAGE!
	ws.on('message', function(data){
		var msg = JSON.parse(data);
		socketHandlers(ws,msg);
	});

	// SOCKET IS CLOSED!
	ws.on('close', function(){

		// loop through all the sockets
		// to update the tracking data & send out the msg
		for(var i=0; i<allSockets.length; i++){

			// Found the CLOSED socket in allSockets
			// if this is the one, remove it
			if(allSockets[i]==ws){

				// change the status of seat to be vacancy
				occuList[ws.id] = "empty";

				// update the total # of ppl
				totalCount--;

				// prepare msg to send out to all the sockets
				var msg = {
					'type': 'removePlayer',
					'removeID': ws.id,
					'worldId': ws.worldId,
					'totalCount': totalCount,
					'totalVisit': totalVisit
				};

				console.log("a player #%d disconnected. total #: %d", ws.id, totalCount);

				// update & splice the sockets array
				allSockets.splice(i,1);

				// update the players array
					// because the order of the allPlayers is not the same as allSockets, can't use splice() O_O
					for(var j=0; j<allPlayers.length; j++){
						if(allPlayers[j].id == ws.id){
							// delete the allPlayers[j]
							allPlayers.splice(j,1);
							break;
						}
					}

				//
				socketHandlers(ws, msg);
				break;
			}
		}

		mySocket = undefined;
	});
});


///////////////////////////////////////////////////////////
///////////////////////////////////////////////////////////

var socketHandlers = function(socket,msg){

	//GENERAL_SENDING_DATA
	for(var i=0; i<allSockets.length; i++){
		try{
			// FOR_GENERATING_HISTORY_PLAYERS
			// ONLY_HAPPENS_ONCE
			if(msg.type=='addNewPlayer'){
				if(msg.camID==0){
					msg.id = socket.id;
					// console.log('newPlayer Peer ID -->' + msg.peerid);
					msg.camID++;
					// console.log('camID -->' + msg.camID);

					msg.worldId = socket.worldId;
					msg.totalCount = totalCount;
					msg.totalVisit = totalVisit;

					allPlayers.push(msg);	// restoring all the players
				}
			}

			// SERVER_SEND_GENERAL_THING
			allSockets[i].send(JSON.stringify(msg));

			// SERVER_SEND_ARRAY_THING
			if(msg.type=='addNewPlayer'){
				allSockets[i].send(JSON.stringify(allPlayers));
				// console.log('Server sent an array thing.');				
			}
		}
		catch(error){
			console.log('error of socketHandlers: ' + error);
		}
	}
};

///////////////////////////////////////////////////////////
///////////////////////////////////////////////////////////
///////////////////////////////////////////////////////////