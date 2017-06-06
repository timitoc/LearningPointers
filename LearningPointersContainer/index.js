const express = require('express');
const http = require('http');
const socketio = require('socket.io');
const randomstring = require('randomstring');
const fs = require('fs');
const child_process = require('child_process');
const path = require('path');
const util = require('util');

var GDB = require('./gdb');

if (!fs.existsSync(path.join(__dirname,'programs'))) {
	fs.mkdirSync(path.join(__dirname,'programs'));
}

let app = express();
let http_server = http.Server(app);
let io = socketio(http_server);

let procs = {};

/**
	Events:
		code
			@param string
			Sends code to the debugger
		run
			Starts the program

		next
			@array watches (optional)
			Sends the next command and prints the watches
			@returns Map watch => value

		continue
			@array watches (optional)
			Send the continue command and prints the watches
			@returns Map watch => value

		step
			@array watches (optional)
			Send the step command and prints the watches
			@returns Map watch => value

		stop
			Stops the execution of the program

		add_breakpoints
			@array breakpoints
			Adds breakpoints
			Breakpoint format:
				{
					line: ..., (number)
					condition: ...., (boolean expression)
					temporary: true/false
				}
			@returns An array of lines where breakpoints where correctly added

		print_expressions
			@array expressions
			Prints the values of the expressions

			@return Map expression => value
			If an expression is invalid from various reasons, its value whill be 'Invalid'
*/

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

				procs[socket.id].stdout.on('data', data=>{
					socket.emit('gdb_stdout', data);
				});
				procs[socket.id].stderr.on('data', data=>{
					socket.emit('gdb_stderr', data);
				});

			});
		});
	});

	socket.on('run', (data) => {
		procs[socket.id].add_breakpoints(data.br).then(result => {
			socket.emit('add_breakpoints', result);
			procs[socket.id].run().then((data) => {
				socket.emit('run', data);
				socket.emit('debug', 'Started debugger');
			});
		});
	});

	socket.on('add_breakpoints', (data) => {
		procs[socket.id].add_breakpoints(data).then(result => {
			socket.emit('add_breakpoints', result);
		});
	});

	socket.on('print_expressions', (data) => {
		socket.emit('debug', "epa " + JSON.stringify(data));
		console.log('Got print_expr');
		procs[socket.id].print_expressions(data).then(result => {
			socket.emit('print_expressions', result);
			console.log('Send print_expr');
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
		procs[socket.id].step().then(() => {
			procs[socket.id].print_expressions(data).then(result => {
				socket.emit('step', result);
			});
		});
	});

	socket.on('next', (data) => {
		procs[socket.id].next().then(() => {
			procs[socket.id].print_expressions(data).then(result => {
				socket.emit('next', result);
			});
		});
	});

	socket.on('continue', (data) => {
		procs[socket.id].cont().then(() => {
			procs[socket.id].print_expressions(data).then(result => {
				socket.emit('continue', result);
			});
		});
	});

	socket.on('stop', (data) => {
		procs[socket.id].kill().then((data) => {
			socket.emit('stop', data);
		});
	});

	socket.on('add_watches', (data) => {
		procs[socket.id].print_expressions(data).then((data) => {
			socket.emit('add_watches', data);
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
