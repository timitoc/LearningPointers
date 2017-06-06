#!/usr/bin/env node

//if(process.getuid || process.getuid() !== 0){
//	console.log('Run this script as root!');
//	process.exit(0);
//}

const express = require('express');
const http = require('http');
const socketio = require('socket.io');
const path = require('path');
const socketio_client = require('socket.io-client');
const child_process = require('child_process');

let Async = require('async');
let Docker = require('dockerode');
let Chance = require('chance');

let app = express();
let http_server = http.Server(app);
let io = socketio(http_server);

let chance = new Chance();
let docker = new Docker();

app.use(require('express').static(path.join(__dirname,"html")));

let CONTAINERS = {};
let USED_PORTS = {};

function get_available_port(){
	let port = chance.integer({min: 2000, max: 2500});
	while(USED_PORTS[port.toString()]){
		port = chance.integer({min: 2000, max: 2500});
	}
	return port;
}

io.on('connection', (socket) => {
	//console.log('A user connected with id ',socket.id);

	let port = get_available_port();

	docker.createContainer({
		Image: 'learning-pointers',
		name: chance.string({pool: 'abcdef0123456789',length: 10}),
		ExposedPorts: {'3001/tcp': {} },
		PortBindings: {'3001/tcp': [{ 'HostPort': port.toString() }] },
		Privileged: true
	},(err, container) => {
			if(err) throw err;

			container.start((err, data) =>{
				USED_PORTS[port.toString()] = true;

				CONTAINERS[socket.id] = socketio_client('http://localhost:'+port.toString());

				CONTAINERS[socket.id].on('connect',()=>{
					console.log('Connected to container!');
				});

				socket.on('code',(data)=>{
					CONTAINERS[socket.id].emit('code',data);
				});

				socket.on('stop', (data) => {
					CONTAINERS[socket.id].emit('stop');
				})

				CONTAINERS[socket.id].on('compile_error',(data)=>{
					socket.emit('compile_error',data);
				});

				CONTAINERS[socket.id].on('compile_success',(data)=>{
					socket.emit('compile_error',data);
				});

				socket.on('add_breakpoints', data => {
					CONTAINERS[socket.id].emit('add_breakpoints', data);
				});

				CONTAINERS[socket.id].on('add_breakpoints', data => {
					socket.emit('add_breakpoints', data);
				});

				socket.on('print_expressions', data => {
					CONTAINERS[socket.id].emit('print_expressions', data);
				});

				CONTAINERS[socket.id].on('print_expressions', data=>{
					socket.emit('print_expressions', data);
				});

				CONTAINERS[socket.id].on('gdb_stdout', (data)=>{
					socket.emit('gdb_stdout',data);
				});

				CONTAINERS[socket.id].on('gdb_stderr', (data)=>{
					socket.emit('gdb_stderr',data);
				});

				CONTAINERS[socket.id].on('step', (data)=>{
					socket.emit('step', data);
				});

				CONTAINERS[socket.id].on('next', (data)=>{
					console.log('Recieved next');
					socket.emit('next', data);
				});

				CONTAINERS[socket.id].on('continue', (data)=>{
					socket.emit('continue', data);
				});

				socket.on('run',(data)=>{
					CONTAINERS[socket.id].emit('run',data);
					console.log('Got run'+JSON.stringify(data));
				});

				CONTAINERS[socket.id].on('run', (data) => {
					console.log('Recieved '+JSON.stringify(data));
				});

				socket.on('gdb_command',(data)=>{
					CONTAINERS[socket.id].emit('gdb_command',data);
				});

				socket.on('step', (data)=>{
					CONTAINERS[socket.id].emit('step');
				});

				socket.on('next', (data)=>{
					CONTAINERS[socket.id].emit('next');
				});

				socket.on('continue', (data)=>{
					CONTAINERS[socket.id].emit('continue');
				});

				socket.on('disconnect',(data)=>{
					USED_PORTS[port.toString()] = false;

					container.stop().then(()=>{
						return container.remove();
					}).then((data) => {
						console.log('Container removed');
					}).catch((err) => {
						console.log(err);
					});
				});
			});
		});
});

app.get('/react', (req, res) =>{
	res.sendFile(path.join(__dirname, "react", "public", "index.html"));
});

app.get('/',(req,res)=>{
	res.sendFile(path.join(__dirname,"html","index.html"));
});

http_server.listen(3000,()=>{
	console.log('Server started on port %s',3000);
});

process.on('SIGINT',() => {
	console.log('Cleaning up...');
	docker.listContainers((err, containers) => {
		Async.eachSeries(containers, (container,callback)=>{
			docker.getContainer(container.Id).stop(callback);
		},()=>{
			Async.eachSeries(containers, (container,callback)=>{
				docker.getContainer(container.Id).remove(callback);
			},()=>{
				console.log('Finished.');
				process.exit();
			});
		});
	});
});
