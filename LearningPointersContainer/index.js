const express = require('express');
const http = require('http');
const socketio = require('socket.io');
const randomstring = require('randomstring');
const fs = require('fs');
const child_process = require('child_process');
const path = require('path');
const util = require('util');

var GDB = require('./gdb');
console.log(GDB);

if (!fs.existsSync(path.join(__dirname,'programs'))) {
    fs.mkdirSync(path.join(__dirname,'programs'));
}

let app = express();
let http_server = http.Server(app);
let io = socketio(http_server);

let procs = {};

io.on('connection', (socket)=>{
    console.log('A user connected');

    socket.on('code',(data)=>{
        data = data.toString();

        let file_name = randomstring.generate(7);
        let file_path = path.join(__dirname,"programs",file_name+".cpp");

        fs.writeFile(file_path,data,() => {

            let compile_command = util.format("g++ -g %s -o %s",file_path,"./programs/"+file_name);

            child_process.exec(compile_command,(error,stdout,stderr) => {	
				if(stderr){
					return socket.emit("compile_error",stderr.toString());
				}
                socket.emit("compile_success","Successfully compiled!");

				procs[socket.id] = new GDB('./programs/'+file_name);
            });
        });
    });

	socket.on('run', (data) => {
		procs[socket.id].run().then((data) => {
			socket.emit('run', data);
			socket.emit('debug', 'Started debugger');
		});
	});

    socket.on('gdb_command',(data) => {
        data = data.toString();
		if(procs[socket.id]){
			procs[socket.id].send_command(data).then((data) => {
				socket.emit('gdb_command', data);
				socket.emit('debug', data);
			});
		} else {
			console.log('Sending command to an inexistent container!');
		}
	});

	socket.on('step', (data) => {
		procs[socket.id].step().then((data) => {
			socket.emit('step', data);
			socket.emit('debug', data);
		});
	});

	socket.on('next', (data) => {
		procs[socket.id].next().then((data) => {
			socket.emit('next', data);
			socket.emit('debug', data);
		});
	});

	socket.on('continue', (data) => {
		procs[socket.id].cont().then((data) => {
			socket.emit('continue', data);
			socket.emit('debug', data);
		});
	});

	socket.on('stop', (data) => {
		procs[socket.id].kill().then((data) => {
			socket.emit('stop', data);
		});
	});

	socket.on('add_watch', (data) => {
		procs[socket.id].add_watch(data).then((data) => {
			socket.emit('add_watch', data);
		});
	});

	socket.on('remove_watch', (data) => {
		procs[socket.id].remove_watch(data).then((data) => {
			socket.emit('remove_watch', data);
		});
	});

    socket.on('disconnect',() => {
		if(procs[socket.id]){
			procs[socket.id].quit().then(()=>{
				delete procs[socket.id];
			});
		}
	});
});

http_server.listen(3001,()=>{
	console.log('Server started on port %s',3001);
});
