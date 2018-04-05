const io = require( "socket.io-client" );
const url = "http://localhost:5000";
const socket = io.connect( url );

socket.on( "connect", () => {
	console.log( "Connected to the server at ", url );
});
