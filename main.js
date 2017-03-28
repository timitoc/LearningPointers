var child_process = require('child_process');
var app = require('express')();
var http = require('http').Server(app);
var path = require('path');
var colors = require('colors');
var util = require('util');
var randomstring = require('randomstring');
var fs = require('fs');
var io = require('socket.io')(http);

var strtok = require('./strtok.js');

var procs={};

var flags = {};
const REQUEST_EXPRESSIONS = "request_expressions";
const REQUEST_EXPRESSIONS_RESPONSE = "request_expressions_response";
let REQUESTED = [];

var buffer_stdout = "";
var buffer_stderr = "";

app.use(require('express').static(path.join(__dirname,"html")));

io.on('connection', function(socket){
	console.log('a user connected');

	socket.on("code",function(data){
		var filename = randomstring.generate(7);
		fs.writeFile(path.join(__dirname,"./programs/"+filename+".cpp"),data.toString(),function(){
			child_process.exec(util.format("g++ -g %s -o %s","./programs/"+filename+".cpp","./programs/"+filename),function(error,stdout,stderr){
				if(stderr){
					return socket.emit("compile_error",stderr.toString());
				}
				socket.emit("compile_success","Successfully compiled!");

				procs[socket.id] = child_process.spawn("gdb",["./programs/"+filename]);

				procs[socket.id].stdout.on('data',function(data){

					console.log(data.toString());

					buffer_stdout += data.toString();

					if(flags.REQUEST_EXPRESSION){

						if(buffer_stdout.endsWith('(gdb) ')){
							//console.log('STDOUT: ',buffer_stdout);
							flags.REQUEST_EXPRESSION = false;
							//buffer_stdout  = buffer_stdout.replace('(gdb) ','');
							var tokens = strtok(buffer_stdout,['{','}',' ',',','=','\n']);//.splice(0,1);
							console.log('Sending ',buffer_stdout);

							var response = {};
							console.log(tokens);

							for(let i=0;i<tokens.length;i++){
								response[REQUESTED[i]] = tokens[i+1];
							}

							socket.emit(REQUEST_EXPRESSIONS_RESPONSE,JSON.stringify(response));
							buffer_stdout = '';
							REQUESTED = [];
						}
					} 
						
					socket.emit("gdb_stdout",data.toString());
				});
				procs[socket.id].stderr.on('data',function(data){
					console.log(data.toString());
					socket.emit("gdb_stderr",data.toString());
				});
			});
		});
	});

	socket.on(REQUEST_EXPRESSIONS,function(data){
		console.log("Requested expressions ",data);
		let command = "print {";
		REQUESTED = data;
		for(let i = 0; i < data.length - 1; i++){
			command += data[i] + ',';
		}
		command += data[data.length-1] + '}';
		flags.REQUEST_EXPRESSION = true;
		buffer_stdout = '';
		console.log('COMMAND: ',command);
		if(procs[socket.id]){
			procs[socket.id].stdin.write(command+'\n');
		} else {
			console.log("err");
		}
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
