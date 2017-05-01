const child_process = require('child_process');
const util = require('util');

var parse_display = require('./display_parser');

function Debugger(socket){
	this.file_path = null;
	this.buffer_stdout = '';
	this.buffer_stderr = '';
	this.flags={
		add_watch : false,
		remove_watch: false,
		step: false,
		next: false,
		cont: false
	};
	this.add_watch_expr = '';
	this.socket = socket;
}

Debugger.prototype.init = function() {
	let self = this;

	this.process = child_process.spawn("gdb",[this.file_path]);

	this.process.stderr.on('data', function(data){
		data = data.toString();
		self.socket.emit('gdb_stderr', data);
	});

	this.process.stdout.on('data', function(data){
		data = data.toString();
		self.buffer_stdout += data;
		self.socket.emit('debug', "Data is " + data + " and buffer_stdout is " + self.buffer_stdout + " and buffer_stderr is " + self.buffer_stderr);
		self.socket.emit('gdb_stdout', data);

		if(self.flags.add_watch){
			self.socket.emit('debug', 'Add watch flag detected buffer = ' + self.buffer_stdout);
			if(self.buffer_stdout.endsWith('(gdb) ')){
				self.socket.emit('debug', 'Add watch ends with gdb');
				self.flags.add_watch = false;
				let result= {
					'expr' : self.add_watch_expr,
					'value' : self.buffer_stdout.split(' ')[3].split('\n')[0]
				};
				self.socket.emit('debug', 'Want to send back ' + result);
				self.socket.emit('post_watch_added', result);
				self.buffer_stdout = '';
			}
			return;
		}

		if(self.flags.cont){
			if(self.buffer_stdout.endsWith('(gdb) ')){
				self.flags.cont = false;
				let result = parse_display(self.buffer_stdout);
				self.socket.emit('continue', result);
				self.buffer_stdout = '';
			}
			return;
		}

		if(self.flags.next){
			if(self.buffer_stdout.endsWith('(gdb) ')){
				self.flags.next = false;
				let result = parse_display(self.buffer_stdout);
				self.socket.emit('next', result);
				self.buffer_stdout = '';
			}	 
			return;
		}

		if(self.flags.step){
			if(self.buffer_stdout.endsWith('(gdb) ')){
				self.flags.step = false;
				let result = parse_display(self.buffer_stdout);
				self.socket.emit('step', result);
				self.buffer_stdout = '';
			}
			return;
		}
	});
}

Debugger.prototype.start = function(){

	this.process.stdin.write('r\n');
};

Debugger.prototype.add_breakpoint = function(line){
	this.process.stdin.write(util.format("b %d \n", line));
};

Debugger.prototype.remove_breakpoint = function(line){
	this.process.stdin.write(util.format("clear %d\n", line));
};

Debugger.prototype.add_watch = function(expr){
	this.flags.add_watch = true;
	this.add_watch_expr = expr;
	this.socket.emit('debug', 'Add watch set flag to ' + expr);
	this.process.stdin.write(util.format("display %s\n", expr));
};
Debugger.prototype.remove_watch = function(id){
	this.flags.remove_watch = true;
	this.process.stdin.write(util.format("delete display %d\n", id));
};
Debugger.prototype.step = function(){
	this.socket.emit('debug', 'Step');
	this.flags.step = true;
	this.process.stdin.write("s\n");
};
Debugger.prototype.cont = function(){
	this.flags.cont = true;
	this.process.stdin.write("c\n");
};
Debugger.prototype.next = function(){
	this.socket.emit('debug', 'Next');
	this.flags.next = true;
	this.process.stdin.write("n\n");
};
Debugger.prototype.send_command = function(cmd){
	this.process.stdin.write(cmd+"\n");
};
Debugger.prototype.destroy = function(){
	this.process.stdin.pause();
	this.process.kill();
};

module.exports = Debugger;
