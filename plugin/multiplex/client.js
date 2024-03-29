(function() {
	var multiplex = Reveal.getConfig().multiplex;
	var socketId = multiplex.userid;
	var socket = io.connect(multiplex.url);

	socket.on(multiplex.userid, function(data) {
		// ignore data from sockets that aren't ours
		if (data.socketId !== socketId) { return; }
		if( window.location.host === 'localhost:1947' ) return;

		Reveal.slide(data.indexh, data.indexv, data.indexf, 'remote');
	});
}());
