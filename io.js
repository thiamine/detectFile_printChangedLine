var io = require('socket.io')();
var fs = require('fs');
var inspect = require('util').inspect;
var watchingFile = './out.log';

console.log('watching log.out!');
io.on('connection', function(socket){
	console.log('a user connected');
	//emit first file
	var oldLength=0;
	var nowLength=0;
	var oldData=[];
	fs.readFile(watchingFile,'UTF-8', function(err,nowData){
		var chunkedData=[];
		if(!err) {
			chunkedData=nowData.split('\n');
			chunkedData.pop(); //remove blank line (마지막줄은 항상 빈 라인이 생성되는 듯 함.)
			nowLength=chunkedData.length;
			emitEntireText(chunkedData, socket);
		} else {
			console.log(err);
		}
		oldData=chunkedData;
		oldLength=nowLength;
	});

	var watcher = fs.watch(watchingFile, function(event, filename){
		console.log('file changed!');
		var changedType=0; //added:0  changed:1
		fs.readFile(watchingFile,'UTF-8',function(err,nowData){
			if(!err) {
				var chunkedData=[];
				chunkedData=nowData.split('\n');
				chunkedData.pop();
				nowLength=chunkedData.length;
				console.log("nowLength : "+nowLength+" oldLength : "+oldLength);
				for(i=0;i<nowLength;i++) {
					console.log("now:"+chunkedData[i]+" old:"+oldData[i]);
					if (i>=oldLength) {
						changedType=0;
						break;
					} else if(i<oldLength && chunkedData[i]!=oldData[i]) {
						changedType=1;
						break;
					}
				}
				console.log('changedType:'+changedType);
				switch (changedType) {
					case 0:
						emitAddedText(chunkedData, socket, oldLength, nowLength); break;
					case 1:
						emitEntireText(chunkedData, socket); break;
				}
				oldLength=nowLength;
				oldData=chunkedData;
			} else {
				console.log(err);
			}
		});
	});
	socket.on('disconnect', function(){
		console.log('the user disconnected');
		watcher.close();
	});
	function emitEntireText(chunkedData, socket) {
		var tmpData="";
		chunkedData.forEach(function(line){
			tmpData=tmpData+line+"<br>";
		});
		console.log("entireText : "+tmpData);
		socket.emit('changed',tmpData);
	}
	function emitAddedText(chunkedData, socket, oldLength, nowLength) {
		var tmpData="";
		for(i=oldLength;i<nowLength;i++) {
			tmpData=tmpData+chunkedData[i]+"<br>";
		}
		console.log("addedText : "+tmpData);
		socket.emit('added',tmpData);
	}
});



module.exports=io;