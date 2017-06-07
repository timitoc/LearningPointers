#!/usr/bin/env node
const express = require('express');
const http = require('http');
const socketio = require('socket.io');
const path = require('path');
const socketio_client = require('socket.io-client');
const child_process = require('child_process');
const body_parser = require('body-parser');
const async = require('async');
const Docker = require('dockerode');
const Chance = require('chance');

require('./sequelize');

const DatabaseApi = require('./db_api');
const DbApi = new DatabaseApi();

let app = express();
let http_server = http.Server(app);
let io = socketio(http_server);

let chance = new Chance();
let docker = new Docker();

app.use(require('express').static(path.join(__dirname,"static")));

app.use(body_parser.urlencoded({ extended: false }));
app.use(body_parser.json());

app.set('view engine', 'ejs');

let CONTAINERS = {};
let USED_PORTS = {};

let pathId = -1;

function get_available_port(){
	let port = chance.integer({min: 2000, max: 2500});
	while(USED_PORTS[port.toString()]){
		port = chance.integer({min: 2000, max: 2500});
	}
	return port;
}

io.on('connection', (socket) => {
	console.log('A user connected with id ',socket.id);
	let port = get_available_port();

	if(pathId != -1){

		DbApi.get_code(pathId).then(code => {
			code = code.code;
			if(code){
				socket.emit('editor_source', code);
			}
			else socket.emit('editor_source', 'There is no source code saved with this id');
		});
	}

	docker.createContainer({
		Image: 'learning-pointers',
		name: chance.string({pool: 'abcdef0123456789',length: 10}),
		ExposedPorts: {'3001/tcp': {} },
		PortBindings: {'3001/tcp': [{ 'HostPort': port.toString() }] },
		Privileged: true
	},
	(err, container) => {

		if(err) throw err;

		container.start((err, data) =>{
			USED_PORTS[port.toString()] = true;

			CONTAINERS[socket.id] = socketio_client('http://localhost:'+port.toString());

			CONTAINERS[socket.id].on('connect',()=>{
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

			CONTAINERS[socket.id].on('add_watch', (data)=>{
				socket.emit('add_watch', data);
			});

			CONTAINERS[socket.id].on('gdb_stdout', (data)=>{
				socket.emit('gdb_stdout',data);
			});

			CONTAINERS[socket.id].on('program_stdout', data=>{
				socket.emit('program_stdout', data);
			});

			CONTAINERS[socket.id].on('gdb_stderr', (data)=>{
				socket.emit('gdb_stderr',data);
			});

			CONTAINERS[socket.id].on('debug', (data)=>{
				socket.emit('debug', data);
			});

			CONTAINERS[socket.id].on('step', (data)=>{
				socket.emit('step', data);
			});

			CONTAINERS[socket.id].on('next', (data)=>{
				socket.emit('next', data);
			});

			CONTAINERS[socket.id].on('continue', (data)=>{
				socket.emit('continue', data);
			});

			CONTAINERS[socket.id].on('add_breakpoints', (data)=>{
				socket.emit('add_breakpoints_result', data);
			});

			socket.on('print_expressions', data => {
				CONTAINERS[socket.id].emit('print_expressions', data);
			});

			CONTAINERS[socket.id].on('print_expressions', (data)=>{
			});

			socket.on('run',(data)=>{
				CONTAINERS[socket.id].emit('run',data);
			});

			socket.on('gdb_command',(data)=>{
				CONTAINERS[socket.id].emit('gdb_command',data);
			});

			socket.on('step', (data)=>{
				CONTAINERS[socket.id].emit('step', data);
			});

			socket.on('next', (data)=>{
				CONTAINERS[socket.id].emit('next', data);
			});

			socket.on('continue', (data)=>{
				CONTAINERS[socket.id].emit('continue', data);
			});

			socket.on('add_watch', (data)=>{
				CONTAINERS[socket.id].emit('add_watch', data);
			});

			socket.on('remove_watch', (data)=>{
				CONTAINERS[socket.id].emit('remove_watch', data);
			});

			socket.on('add_breakpoints', (data)=>{
				CONTAINERS[socket.id].emit('add_breakpoints', data);
			});

			socket.on('request_expressions', (data)=>{
				CONTAINERS[socket.id].emit('print_expressions', data);
			});

			socket.on('save_code', (data) => {
				console.log("saving " + JSON.stringify(data));
				DbApi.add_code(data).then((id) => {
					socket.emit('code_saved', {id: id});
				});
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

app.get('/', (req, res) => {
	res.render("home");
});

app.get('/code',(req,res)=>{
	res.render("editor");
});

app.get('/code/:id', (req, res)=>{
	pathId = req.params.id;
	res.render("editor");
});

app.get('/lessons', (req, res) =>{
	DbApi.get_lessons().then(data => {
		res.render("lessons", {
			lessons: data
		});
	});
});

app.get('/lesson/add', (req, res) => {
	res.render("lesson_add", {});
});


app.get('/lesson/:id', (req, res) => {
	DbApi.get_lesson_by_id(req.params.id).then(lesson => {
		res.render("lesson", {
			lesson: lesson
		});
	});
});

http_server.listen(3000,()=>{
	console.log('Server started on port %s',3000);
	console.log("Type 'stop' to stop server");
});

function cleanup(){
	docker.listContainers((err, containers) => {
		async.eachSeries(containers, (container,callback)=>{
			docker.getContainer(container.Id).stop(callback);
		},()=>{
			async.eachSeries(containers, (container,callback)=>{
				docker.getContainer(container.Id).remove(callback);
			},()=>{
				console.log('Finished.');
				process.exit();
			});
		});
	});
}


process.stdin.on('data', data => {
	data = data.toString();
	if(data == "stop\n"){
		console.log('Cleaning up...');
		cleanup();
	}
});

process.on('SIGINT',() => {
	console.log('Cleaning up...');
	cleanup();
});
