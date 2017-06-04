const Async = require('async');
const child_process = require('child_process');
const util = require('util');
const Promise = require('bluebird');
const fs = require('fs');
const Subject = require('rxjs/Subject').Subject;
const EventEmitter = require('events');

const PrintParser = require('./PrintParser.js');

class GDB{
	constructor(exec_file){
		this.process = child_process.spawn('gdb',['-silent', exec_file]);

		this.buffer_stdout = '';
		this.buffer_stderr = '';
		this.done$ = new Subject();

		this.stdout = new EventEmitter();
		this.stderr = new EventEmitter();

		this.process.stdout.on('data', (data) => {

			data = data.toString();

			this.stdout.emit('data', data);


			if(!/^\s+$/.test(data.toString())){
				this.buffer_stdout += data.toString();
			}

			if(/^\(gdb\)\ \$\d+\ =\ .*/.test(this.buffer_stdout)){
				this.done$.next(this.buffer_stdout);
			}

			if (this.buffer_stdout.endsWith('(gdb) ') && !this.buffer_stdout.startsWith('(gdb)')){
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
	 */
	add_breakpoint(line){
		return this.send_command(util.format('b %d', line));
	}

	/**
	 * Adds a temporary breakpoint to the specified line
	 * @param {number} line
	 */
	add_temporary_breakpoint(line){
		return this.send_command(util.format('tbreak %d', line));
	}

	/**
	 * Adds a conditional breakpoint to the specified line
	 * @param {number} line
	 * @param {string} condition
	 */
	add_breakpoint_conditional(line, condition){
		return this.send_command(util.format('b %d if %s', line, condition));
	}

	/**
	* Adds multiple breakpoints
	* @param {breaks} Breakpoints to be added
	* Breakpoint format:
	* {
	*		line: ..., (number)
	*		condition: ...., (boolean expression)
	*		temporary: true/false
	* }
	*/

	add_breakpoints(breaks){
		return new Promise((resolve, reject) => {
			let added = [];
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

	}

	/**
	 * Removes a breakpoint from a specified line
	 * @param {number} line
	 */
	remove_breakpoint(where){
		return this.send_command(util.format('clear %d', line));
	}

	/**
	 * Starts the program
	 */
	run(){
		return this.send_command('r');
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
	 * Sends the next command to the debugger
	 */
	next(){
		return this.send_command('n');
	}

    /**
	 * Sends the step command to the debugger
	 */
	step(){
		return this.send_command('s');
	}

    /**
	 * Sends the continue command to the debugger
	 */
	cont(){
		return this.send_command('c');
	}
}

module.exports = GDB;
