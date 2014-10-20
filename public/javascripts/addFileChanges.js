$(function(){
	var socket = io.connect('http://localhost:3000');
	socket.on('textAdded', function(data){
		$("#filechanges").append(data);
	});
	socket.on('fileChanged', function(data){
		$("#filechanges").html(data);
	})
});