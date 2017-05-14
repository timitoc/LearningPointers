const express = require('express');
const http = require('http');
const socketIo = require('socket.io');
const randomString = require('randomstring');
const fs = require('fs');
const childProcess = require('child_process');
const path = require('path');
const util = require('util');

var Debugger = require('./GDB-interface/debugger.js');

if (!fs.existsSync(path.join(__dirname,'programs'))) {
    fs.mkdirSync(path.join(__dirname,'programs'));
}

let app = express();
let httpServer = http.Server(app);
let io = socketIo(httpServer);

let procs = {};

io.on('connection', (socket)=>{
    console.log('A user connected');

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

                procs[socket.id] = new Debugger();
				procs[socket.id].socket = socket;
				procs[socket.id].file_path = "./programs/"+fileName;
				procs[socket.id].init();
				socket.emit('debug', 'Compiled '+fileName);
            });
        });
    });

	socket.on('run', function(data){
		procs[socket.id].start();
		socket.emit('debug', 'Ran ');
	});

    socket.on('gdb_cmd',function(data){
        data = data.toString();
        console.log('COMMAND: %s',data);
		socket.emit('debug', 'Sending ' + data);
		if(procs[socket.id]){
			procs[socket.id].send_command(data);
		} else {
			console.log('err');
		}
	});

	socket.on('step', function(data){
		procs[socket.id].step();
	});

	socket.on('next', function(data){
		procs[socket.id].next();
	});

	socket.on('continue', function(data){
		procs[socket.id].cont();
	});

	socket.on('stop', function(data){
		procs[socket.id].kill();
	});

	socket.on('add_watch', function(data){
		socket.emit('debug', 'Adding watch ' + data);
		procs[socket.id].add_watch(data);
	});

	socket.on('remove_watch', function(data){
		socket.emit('debug', 'Removing watch ' + data);
		procs[socket.id].remove_watch(data);
	});

    socket.on('disconnect',() => {
		if(procs[socket.id]){
			procs[socket.id].destroy();
			delete procs[socket.id];
		}
	});
});

httpServer.listen(3001,()=>{
	console.log('Server started on port %s',3001);
});
