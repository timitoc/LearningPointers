var child_process = require('child_process');
var app = require('express')();
var http = require('http').Server(app);
var path = require('path');
var colors = require('colors');
var util = require('util');
var randomstring = require('randomstring');
var fs = require('fs');
var io = require('socket.io')(http);

var procs={

};

app.use(require('express').static(path.join(__dirname,"html")));

io.on('connection', function(socket){
	console.log('a user connected');

	socket.on("code",function(data){
		var filename = randomstring.generate(7);
		fs.writeFile(path.join(__dirname,"./programs/"+filename+".cpp"),data.toString(),function(){
			child_process.exec(util.format("g++ %s -o %s","./programs/"+filename+".cpp","./programs/"+filename),function(error,stdout,stderr){
				if(stderr){
					return socket.emit("compile_error",stderr.toString());
				}
				socket.emit("compile_success","Successfully compiled!");

				procs[socket.id] = child_process.spawn("gdb",["./programs/"+filename,"-g"]);

				procs[socket.id].stdout.on('data',function(data){
					console.log(data.toString());
					socket.emit("gdb_stdout",data.toString());
				});
				procs[socket.id].stderr.on('data',function(data){
					console.log(data.toString());
					socket.emit("gdb_stderr",data.toString());
				});
			});
		});
	});

	socket.on("gdb_cmd",function(data){
		if(procs[socket.id]){
			procs[socket.id].stdin.write(data+'\n');
		} else {
			console.log("err");
		}
	});

	socket.on("disconnect",function(){
		if(procs[socket.id]){
			procs[socket.id].stdin.pause();
			procs[socket.id].kill();
			delete procs[socket.id];
		}
	});
});

app.get('/',(req,res)=>{
	res.sendFile(path.join(__dirname,"html","index.html"));
});

http.listen(3000,()=>{
	console.log('Server started on port %s',3000);
});

process.on('SIGINT', function() {
    process.exit();
});
