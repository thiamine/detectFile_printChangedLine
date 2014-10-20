var io = require('socket.io')();
var fs = require('fs');
var oldLength = 0;
var nowLength = 0;

console.log('watching log.out!');
io.on('connection', function(socket){
	console.log('a user connected');
	//emit first file
	var chunkedData="";
	fs.readFile('./out.log','UTF-8', function(err,data){
		if(!err) {
			chunkedData=data.split('\n');
			chunkedData.forEach(function(){
				nowLength++;
			});
			nowLength--;
			emitEntireText(chunkedData, socket, nowLength);
		} else {
			console.log(err);
		}
		oldLength=nowLength;
	});


	var watcher = fs.watch('./out.log', function(event, filename){
		console.log('file changed!');
		fs.readFile('./out.log','UTF-8',function(err,data){
			nowLength=0;
			var chunkedData=[];
			if(!err) {
				chunkedData=data.split('\n');
				chunkedData.forEach(function(){
					nowLength++;
				});
				nowLength--;
				if(nowLength<oldLength) {
					emitEntireText(chunkedData,socket,nowLength);
				} else if(nowLength==oldLength) {
					//do nothing
				} else {
					emitAddedText(chunkedData,socket,nowLength,oldLength);
				}
				oldLength=nowLength;
			} else {
				console.log(err);
			}
		});
	});
	socket.on('disconnect', function(){
		console.log('the user disconnected');
		watcher.close();
	});
	function emitEntireText(chunkedData, socket, nowLength) {
		var tmpLength=0;
		var tmpData="";
		chunkedData.forEach(function(line){
			tmpLength++;
			if(nowLength>=tmpLength) tmpData=tmpData+line+"<br>";
		})
		socket.emit('fileChanged',tmpData);
	}
	function emitAddedText(chunkedData, socket, nowLength, oldLength) {
		var tmpLength=0;
		var tmpData="";
		chunkedData.forEach(function(line){
			tmpLength++;
			if(tmpLength>oldLength && nowLength>=tmpLength) {
				tmpData=tmpData+line+"<br>";
			}
		});
		socket.emit('textAdded',tmpData);
	}
});



module.exports=io;