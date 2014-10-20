$(function(){
	var socket = io.connect('http://localhost:3000');
	socket.on('added', function(data){
		$("#filechanges").append(data);
	});
	socket.on('changed', function(data){
		$("#filechanges").html(data);
	})
});