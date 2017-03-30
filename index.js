const express = require('express');
const http = require('http');
const socketIo = require('socket.io');
const path = require('path');
const socketIoClient = require('socket.io-client');
const childProcess = require('child_process');

let Docker = require('dockerode');
let Chance = require('chance');

let app = express();
let httpServer = http.Server(app);
let io = socketIo(httpServer);

let chance = new Chance();

let docker = new Docker();

app.use(require('express').static(path.join(__dirname,"html")));

let CONTAINERS = {};
let USED_PORTS = {};

function getAvailablePort(){
    let port = chance.integer({min: 2000, max: 2500});
    while(USED_PORTS[port.toString()]){
        port = chance.integer({min: 2000, max: 2500});
    }
    return port;
}

io.on('connection', (socket)=>{
    console.log('A user connected with id ',socket.id);

    let port = getAvailablePort();

    docker.createContainer({
        Image: 'learning-pointers', 
        name: socket.id.toString()+'-container',
        ExposedPorts: {'3001/tcp': {} },
        PortBindings: {'3001/tcp': [{ 'HostPort': port.toString() }] },
        Privileged: true
    }, 
        (err, container) => {

            if(err) throw err;

            container.start((err, data) =>{
                
                USED_PORTS[port.toString()] = true;

                CONTAINERS[socket.id] = socketIoClient('http://localhost:'+port.toString());
                
                CONTAINERS[socket.id].on('connect',()=>{
                    console.log('Connected to container!');
                });

                socket.on('code',(data)=>{
                    CONTAINERS[socket.id].emit('code',data);
                });

                CONTAINERS[socket.id].on('compile_error',(data)=>{
                    socket.emit('compile_error',data);
                });

                CONTAINERS[socket.id].on('compile_success',(data)=>{
                    socket.emit('compile_error',data);
                });

                CONTAINERS[socket.id].on('gdb_stdout', (data)=>{
                    socket.emit('gdb_stdout',data);
                });

                CONTAINERS[socket.id].on('gdb_stderr', (data)=>{
                    socket.emit('gdb_stderr',data);
                });

                socket.on('request_expressions',(data)=>{
                    CONTAINERS[socket.id].emit('request_expressions',data);
                });

                CONTAINERS[socket.id].on('request_expressions_response',(data)=>{
                    socket.emit('request_expressions_response',data);
                });

                socket.on('gdb_cmd',(data)=>{
                    CONTAINERS[socket.id].emit('gdb_cmd',data);
                });

                socket.on('disconnect',(data)=>{
                    USED_PORTS[port.toString()] = false;
                    container.stop().then(function(container) {
                        return container.remove();
                    }).then(function(data) {
                        console.log('Container removed');
                    }).catch(function(err) {
                        console.log(err);
                    });
                });
            });
    });
});

app.get('/',(req,res)=>{
	res.sendFile(path.join(__dirname,"html","index.html"));
});

httpServer.listen(3000,()=>{
	console.log('Server started on port %s',3000);
});
