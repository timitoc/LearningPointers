const express = require('express');
const http = require('http');
const socketIo = require('socket.io');
const path = require('path');
const socketIoClient = require('socket.io-client');
const childProcess = require('child_process');

let Async = require('async');
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

io.on('connection', (socket) => {
    console.log('A user connected with id ',socket.id);

    let port = getAvailablePort();

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

                CONTAINERS[socket.id].on('post_watch_added', (data)=>{
                    socket.emit('post_watch_added', data);
                    console.log("wwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwww");
                });

                CONTAINERS[socket.id].on('gdb_stdout', (data)=>{
                    socket.emit('gdb_stdout',data);
                });

                CONTAINERS[socket.id].on('gdb_stderr', (data)=>{
                    socket.emit('gdb_stderr',data);
                });

                CONTAINERS[socket.id].on('step', (data)=>{
                    console.log("AM primiiiiit");
                    socket.emit('step', data);
                });

                CONTAINERS[socket.id].on('debug', (data)=>{
                    console.log("Debug data: " + JSON.stringify(data));
                    //console.log(data);
                });

                CONTAINERS[socket.id].on('next', (data)=>{
                    socket.emit('next', data);
                });
                
                CONTAINERS[socket.id].on('continue', (data)=>{
                    socket.emit('continue', data);
                });

                socket.on('run',(data)=>{
                    CONTAINERS[socket.id].emit('run',data);
                });

                socket.on('gdb_cmd',(data)=>{
                    CONTAINERS[socket.id].emit('gdb_cmd',data);
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

                socket.on('add_watch', (data)=>{
                    console.log("sending watch request " + data);
                    CONTAINERS[socket.id].emit('add_watch', data);
                });

                socket.on('remove_watch', (data)=>{
                    CONTAINERS[socket.id].emit('remove_watch', data);
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

app.get('/',(req,res)=>{
	res.sendFile(path.join(__dirname,"html","index.html"));
});

httpServer.listen(3000,()=>{
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
                console.log('Done');
                process.exit();
            });
        });
    });
});
