const Async = require('async');
const child_process = require('child_process');
const util = require('util');
const Promise = require('bluebird');
const fs = require('fs');
const Subject = require('rxjs/Subject').Subject;
const EventEmitter = require('events');
const chokidar = require('chokidar');

const PrintParser = require('./PrintParser.js');

class GDB{

	init_output_file(){
		fs.writeFileSync('output.txt','');
	}

	constructor(exec_file){
		this.process = child_process.spawn('gdb',['-silent', exec_file]);

		this.buffer_stdout = '';
		this.buffer_stderr = '';
		this.done$ = new Subject();

		this.stdout = new EventEmitter();
		this.stderr = new EventEmitter();

		this.program_stdout = new EventEmitter();

		var watcher = chokidar.watch('output.txt');
		watcher
		.on('add', data => {
			this.program_stdout.emit('data', fs.readFileSync('output.txt').toString());
		})
		.on('change', data => {
			this.program_stdout.emit('data', fs.readFileSync('output.txt').toString());
		});

		this.breakpoints = [];

		this.process.stdout.on('data', (data) => {

			data = data.toString();

			this.stdout.emit('data', data);

			if(!/^\s+$/.test(data.toString())){
				this.buffer_stdout += data.toString();
			}
			if(/^\(gdb\)\ \$\d+\ =\ .*/.test(this.buffer_stdout)){
				this.done$.next(this.buffer_stdout);
			}
			else if (this.buffer_stdout.endsWith('(gdb) ') && !this.buffer_stdout.startsWith('(gdb)')){
				this.done$.next(this.buffer_stdout);
			}
		});

		this.process.stderr.on('data', (data) => {
			data = data.toString();

			this.stderr.emit('data', data);

			this.buffer_stderr += data;
			if(data.startsWith('No symbol')){
				this.done$.next(this.buffer_stdout);
			}

			if(data.includes('syntax error')){
				this.done$.next(this.buffer_stdout);
			}
		});
	}

	write_input(input){
		return new Promise((resolve, reject) => {
			this.send_command("").then(data => {
				fs.writeFile('input.txt', input + '\n', err =>{
					if(err) throw err;
					resolve(data);
				});
			});
		});
	}

	/**
	 * Clears the stdout and stderr buffers
	 */
	clear(){
		this.buffer_stdout = '';
		this.buffer_stderr = '';
	}

	/**
	 * Sends a command to the debugger.
	 *
	 * @param {string} cmd The command to send
	 */
	send_command(cmd){
		this.clear();
		return new Promise((resolve, reject) => {
			this.process.stdin.write(util.format('%s\n', cmd));
			this.done$.subscribe(value => {
				resolve({
					stdout: this.buffer_stdout,
					stderr: this.buffer_stderr
				});
			});
		});
	}
	/**
	 * Quits the debugger session
	 */
	quit(){
		// Improvement: Kill process instead of sending `quit` command (works on infinite loops)
		return new Promise((resolve, reject) => {
			this.process.kill();
		});
	}

	/**
	 * Adds a regular breakpoint to the specified line
	 * @param {number} line
	 * @deprecated
	 */
	add_breakpoint(line){
		this.breakpoints.push({
			line: line
		});
		return this.send_command(util.format('b %d', line));
	}

	/**
	 * Adds a temporary breakpoint to the specified line
	 * @param {number} line
	 * @deprecated
	 */
	add_temporary_breakpoint(line){
		return this.send_command(util.format('tbreak %d', line));
	}

	/**
	 * Adds a conditional breakpoint to the specified line
	 * @param {number} line
	 * @param {string} condition
	 * @deprecated
	 */
	add_breakpoint_conditional(line, condition){
		return this.send_command(util.format('b %d if %s', line, condition));
	}

	/**
	 * Adds full fledged breakpoint
	 * @param {number} line
	 * @param {boolean} temporary // considered flase if not existent
	 * @param {string} condition // considered true if not existent/null/empty
	 */
	add_full_breakpoint(line, temporary, condition) {
		var pureCommand;
		if (temporary)
			pureCommand = "tbreak";
		else
			pureCommand = "b";
		if (!condition)
			condition = "true";
		var command = util.format("%s %d if %s", pureCommand, line, condition);
		this.breakpoints.push({
			line,
			temporary,
			condition
		});
		return this.send_command(command);
	}

	/**
	 * Adds multiple breakpoints
	 * @param {breaks} Breakpoints to be added
	 * Breakpoint format:
	 * {
	 *		line: ..., (number)
	 *		temporary: true/false
	 *		condition: ...., (boolean expression)
	 * }
	 */
	add_breakpoints(breaks) {
		console.log("-9 " + JSON.stringify(breaks));
		this.breakpoints = this.breakpoints.concat(breaks);
		let added = [];
		return Promise.each(breaks, (item, index, length) => {
			return new Promise((resolve, reject) => {
				this.clear();
				let breakpoint = item;
				this.add_full_breakpoint(breakpoint.line, breakpoint.temporary, breakpoint.condition).then(data =>{
					added.push(breakpoint.line); /// maybe check if everything is ok in the future
					resolve();
				});
			});
		});
	}


	/* add_breakpoints(breaks) {
		console.log("186 " + JSON.stringify(breaks));
		return new Promise((resolve, reject) => {
			let added = [];
			this.breakpoints = this.breakpoints.concat(breaks);
			Async.eachOfSeries(breaks, (key, value, callback) => {
				this.clear();
				let breakpoint = key;
				this.add_full_breakpoint(breakpoint.line, breakpoint.temporary, breakpoint.condition).then(data =>{
					added.push(breakpoint.line); /// maybe check if everything is ok in the future
					callback();
				});
			}, () => {
				resolve(added);
			});
		});
	}*/

	// old version, to be removed
	/*add_breakpoints(breaks){
		return new Promise((resolve, reject) => {
			let added = [];
			this.breakpoints = breaks;
			Async.eachOfSeries(breaks, (key, value, callback) => {
				this.clear();
				let breakpoint = key;
				if(breakpoint.temporary){
					this.add_temporary_breakpoint(breakpoint.line).then(data => {
						added.push(breakpoint.line);
						callback();
					});
				} else if(breakpoint.condition){
					this.check_expression(breakpoint.condition).then(status => {
						if(status){
							this.add_breakpoint_conditional(breakpoint.line, breakpoint.condition).then(data => {
								if(!data.stderr.includes('No symbol') && !data.stderr.includes('syntax error')){
									added.push(breakpoint.line);
								}
								callback();
							});
						}
						else {
							callback();
						}
					});
				} else {
					this.add_breakpoint(breakpoint.line).then(data =>{
						added.push(breakpoint.line);
						callback();
					});
				}
			}, () => {
				resolve(added);
			});
		});
	}*/

	/**
	 * Clears line and sets new breakpoint
	 * @param {break} // the new breakpoint
	 * Breakpoint format:
	 * {
	 *		line: ..., (number)
	 *		temporary: true/false
	 *		condition: ...., (boolean expression)
	 * }
	 */
	edit_breakpoint(breakpoint) {
		return new Promise((resolve, reject) => {
			this.remove_breakpoint(breakpoint.line).then(output => {
				this.add_full_breakpoint(breakpoint.line, breakpoint.temporary, breakpoint.condition).then(data => {
					resolve("success");
				});
			});
		});
	}

	/**
	 * Removes a breakpoint from a specified line
	 * @param {number} line
	 */
	remove_breakpoint(line){
		return this.send_command(util.format('clear %d', line));
	}

	/**
	 * Gets program output from a buffer
	 * @param {string} buffer The stdout buffer
	 */
	get_stdout(buffer){

	}

	/**
	 * Starts the program
	 */
	run(){
		return new Promise((resolve, reject) => {
			this.clear();
			this.send_command('run < input.txt > output.txt').then(output => {
				if(this.breakpoints.length != 0){
					resolve({
						line: this.get_line(output),
						output: output
					});
				} else {
					resolve({
						output: output
					});
				}
			});
		});
	}

	/**
	 * Kills the program
	 */
	kill(){
		return this.send_command('kill');
	}

	/**
	 * Prints the value of an expression
	 * @param {string} expr The expression to be printed
	 */
	print_expression(expr, callback){
		return new Promise((resolve, reject) => {
			this.send_command(util.format('print %s', expr)).then(data => {
				if(data.stderr.indexOf('No symbol') != -1){
					resolve({
						expression: expr,
						value: 'Invalid'
					});
				} else {
					let printed = new PrintParser(data.stdout).get_value();
					resolve({
						expression: expr,
						value: printed
					});
				}
			});
		});
	}

	/**
	 * Prints the value of multiple expressions
	 * @param {array} expressions An array of expression to be printed
	 */

	print_expressions(expressions){
		return new Promise((resolve, reject) => {
			let result = {};
			Async.eachOfSeries(expressions, (key, value, callback) => {
				this.print_expression(key).then(data => {
					result[key] = data.value;
					callback();
				});
			}, () => {
				resolve(result);
			});
		});
	}

	/**
	 * Checks if an expression is valid
	 * @param {string} expr
	 */

	check_expression(expr){
		return new Promise((resolve, reject) => {
			this.send_command(util.format('print %s', expr)).then(data=>{
				if(data.stderr.includes('No symbol') || data.stderr.includes('syntax error')){
					resolve(false);
				}
				else resolve(true);
			});
		});
	}


	/**
	 * Sets variable value at runtime
	 * @param {string} expression Variable to be changed
	 * @param {string} value New value for the variable
	 */

	set_var(expression, value){
		return this.send_command(util.format('set var %s=%s', expression, value));
	}

	is_int(str){
		return /^\d+$/.test(str);
	}

	get_line(output){
		let stdout = output.stdout;
		let lines = stdout.split('\n');

		let result;
		if(lines.length == 1){
			result = lines[0].split('\t')[0];
		}
		else{
			for(let i = lines.length - 1; i >= 0; i--){
				let first_token = lines[i].split('\t')[0];
				if(this.is_int(first_token)){
					result = first_token;
					break;
				}
			}
		}
		return parseInt(result);
	}

	/**
	 * Sends the next command to the debugger and prints watches
	 * @param {array} watches The array of expression to be printed
	 */
	next(watches){
		return new Promise((resolve, reject) => {
			this.send_command('n').then(output => {
				if(watches){
					this.print_expressions(watches).then(data=>{
						resolve({
							watches: data,
							line: this.get_line(output)
						});
					});
				} else {
					resolve({
						line: this.get_line(output)
					});
				}
			});
		});
	}

	/**
	 * Sends multipe next commands to the debugger and prints watches after
	 * @param {array} watches
	 * @param {number} n
	 */

	nextn(watches, n) {
		return new Promise((resolve, reject) => {
			this.send_command('n '+n).then(output => {
				if(watches){
					this.print_expressions(watches).then(data=>{
						resolve({
							watches: data,
							line: this.get_line(output)
						});
					});
				} else {
					resolve({
						line: this.get_line(output)
					});
				}
			});
		});
	}


	/**
	 * Sends the step command to the debugger and prints watches
	 * @param {array} watches The array of expression to be printed
	 */
	step(watches){
		return new Promise((resolve, reject) => {
			this.send_command('s').then(output => {
				if(watches){
					this.print_expressions(watches).then(data=>{
						resolve({
							watches: data,
							line: this.get_line(output)
						});
					});
				} else {
					resolve({
						line: this.get_line(output)
					});
				}
			});
		});
	}

	/**
	 * Sends multiple step commands to the debugger and prints watches after
	 * @param {array} watches
	 * @param {number} n The number of 'step' instructions to be executes
	 */

	stepn(watches, n) {
		return new Promise((resolve, reject) => {
			this.send_command('s '+n).then(output => {
				if(watches){
					this.print_expressions(watches).then(data=>{
						resolve({
							watches: data,
							line: this.get_line(output)
						});
					});
				} else {
					resolve({
						line: this.get_line(output)
					});
				}
			});
		});
	}

	/**
	 * Sends the continue command to the debugger and prints watches
	 * @param {array} watches The array of expression to be printed
	 */
	cont(watches){
		return new Promise((resolve, reject) => {
			this.send_command('c').then(output =>{
				if(watches){
					this.print_expressions(watches).then(data=>{
						resolve({
							watches: data,
							line: this.get_line(output)
						});
					});
				} else {
					resolve({
						line: this.get_line(output)
					});
				}
			});
		});
	}

	/** Sends the continue command to the debugger multiple times and prints watches
	 * @param {array} watches
	 * @param {number} n
	 */

	contn(watches, n) {
		return new Promise((resolve, reject) => {
			this.send_command('c '+n).then(output =>{
				if(watches){
					this.print_expressions(watches).then(data=>{
						resolve({
							watches: data,
							line: this.get_line(output)
						});
					});
				} else {
					resolve({
						line: this.get_line(output)
					});
				}
			});
		});
	}

	parse_locals(stdout) {
		return stdout
			.split('\n')
			.map((item) => {
				return item.split('=').map((item) => {
					return item.trim();
				});
			})
			.reduce((obj, item) => {
				obj[item[0]] = item[1];
				return obj;
			},{});
	}

	// Get local variables
	locals() {
		return new Promise((resolve, reject) => {
			this.clear();
			this.send_command('info locals').then(data => {
				resolve(this.parse_locals(data.stdout));
			});
		});
	}

	// Get function arguments
	args() {
		return new Promise((resolve, reject) => {
			this.clear();
			this.send_command('info args').then(data => {
				resolve(this.parse_locals(data.stdout));
			});
		});
	}

	parse_arguments(arg) {
		let first = arg.indexOf('(')+1;
		let last = arg.lastIndexOf(')')-1;
		let sub = arg.substr(first, last-first+1).replace(/,\s/g, '\n');
		return this.parse_locals(sub);
	}


	parse_backtrace(stdout) {
		let arr = stdout.split('\n').map(item => {
			let tokens = item.split(' ');
			if(tokens[0] == '#0') {
				return {
					'function' : tokens[2],
					'arguments' : this.parse_arguments(item)
				};
			}
			if(tokens[4]) {
				if(tokens[4] != 'main')
					return {
						'function': tokens[4],
						'arguments' : this.parse_arguments(item)
					};
				else
					return {
						'function': 'main'
					};
			}
			return undefined;
		});
		arr.pop();
		return arr;
	}

	// Get call stack
	backtrace() {
		return new Promise((resolve, reject) => {
			this.clear();
			this.send_command('backtrace').then(data => {
				resolve(this.parse_backtrace(data.stdout));
			});
		});
	}
}

module.exports = GDB;
