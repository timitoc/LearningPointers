const express = require('express');
const http = require('http');
const socketIo = require('socket.io');
const randomString = require('randomstring');
const fs = require('fs');
const childProcess = require('child_process');
const path = require('path');
const util = require('util');
var strtok = require('./strtok.js');

if (!fs.existsSync(path.join(__dirname,'programs'))) {
    fs.mkdirSync(path.join(__dirname,'programs'));
}

let app = express();
let httpServer = http.Server(app);
let io = socketIo(httpServer);

let procs = {};
let flags = {};

const REQUEST_EXPRESSIONS = "request_expressions";
const REQUEST_EXPRESSIONS_RESPONSE = "request_expressions_response";
let REQUESTED_EXPRESSIONS = [];

let bufferStdout = "";
let bufferStderr = "";

io.on('connection', (socket)=>{
    console.log('A user connected');

    socket.on(REQUEST_EXPRESSIONS,function(data){
		console.log("Requested expressions ",data);
		let command = "print {";
		REQUESTED_EXPRESSIONS = data;
		for(let i = 0; i < data.length - 1; i++){
			command += data[i] + ',';
		}
		command += data[data.length-1] + '}';
		flags.REQUEST_EXPRESSIONS = true;
		bufferStdout = '';
		console.log('COMMAND: ',command);
		if(procs[socket.id]){
			procs[socket.id].stdin.write(command+'\n');
		} else {
			console.log("err");
		}
	});

    socket.on('code',(data)=>{
        data = data.toString();

        let fileName = randomString.generate(7);
        let filePath = path.join(__dirname,"programs",fileName+".cpp");

        fs.writeFile(filePath,data,() => {

            let compileCommand = util.format("g++ -g %s -o %s",filePath,"./programs/"+fileName);

            childProcess.exec(compileCommand,(error,stdout,stderr)=>{	
				if(stderr){
					return socket.emit("compile_error",stderr.toString());
				}
                socket.emit("compile_success","Successfully compiled!");

                procs[socket.id] = childProcess.spawn("gdb",["./programs/"+fileName]);
                console.log('Started %s','gdb '+"./programs/"+fileName);

                procs[socket.id].stdout.on('data',function(data){
                    socket.emit("gdb_stdout",data.toString());
                    
                    bufferStdout += data.toString();

                    if(flags.REQUEST_EXPRESSIONS){
                        if(bufferStdout.endsWith('(gdb) ')){
                            flags.REQUEST_EXPRESSIONS = false;
                            let tokens = strtok(bufferStdout,['{','}',' ',',','=','\n']);
                            console.log('Sending ',bufferStdout);
                            let response = {};
                            for(let i=0;i<tokens.length;i++){
                                response[REQUESTED_EXPRESSIONS[i]] = tokens[i+1];
                            }
                            socket.emit(REQUEST_EXPRESSIONS_RESPONSE,JSON.stringify(response));
                            bufferStdout = '';
                            REQUESTED_EXPRESSIONS = [];
                        }
                    }
                });

                procs[socket.id].stderr.on('data',function(data){
                    socket.emit("gdb_stderr",data.toString());
                });

            });
        });

       
    });

    socket.on('gdb_cmd',function(data){
        data = data.toString();
        console.log('COMMAND: %s',data);
		if(procs[socket.id]){
			procs[socket.id].stdin.write(data+'\n');
		} else {
			console.log('err');
		}
	});

    socket.on('disconnect',() => {
		if(procs[socket.id]){
			procs[socket.id].stdin.pause();
			procs[socket.id].kill();
			delete procs[socket.id];
		}
	});
});

httpServer.listen(3001,()=>{
	console.log('Server started on port %s',3001);
});