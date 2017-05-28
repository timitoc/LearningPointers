const async = require('async');
const child_process = require('child_process');
const util = require('util');
const Promise = require('bluebird');

const after_parser = require('./after_watch_added_parser.js');
const parser = require('./display_parser.js');
const Subject = require('rxjs/Subject').Subject;

class GDB{
	constructor(exec_file){
		this.process = child_process.spawn('gdb',['-silent', exec_file]);

		this.buffer_stdout = '';
		this.buffer_stderr = '';
		this.done$ = new Subject();

		this.process.stdout.on('data', (data) => {
			this.buffer_stdout += data.toString();

			if (this.buffer_stdout.endsWith('(gdb) '))
				this.done$.next(this.buffer_stdout);
		});

		this.process.stderr.on('data', (data) => {
			this.buffer_stderr += data.toString();
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
		return new Promise((resolve, reject) => {
			this.clear();
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
		return new Promise((resolve, reject) => {
			this.process.stdin.write('q');
			setTimeout(()=>{
				this.process.stdin.write('y');
				resolve();
			}, 10);
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
     * Adds an expression as watch
	 * @param {string} expr The expression to be added in watch
	 */
	add_watch(expr){
		return new Promise((resolve, reject) => {
			this.clear();
			this.process.stdin.write(util.format('display %s\n', expr));
			this.done$.subscribe(value => {
				let result;
				if(this.buffer_stderr.includes('No symbol')){
					result = {
						expr: expr,
						value: 'Invalid'
					};
				} else {
					result = after_parser(this.buffer_stdout);
				}

				resolve({
					stdout: this.buffer_stdout,
					stderr: this.buffer_stderr,
					result: result
				});
			});
		});
	}

	/**
	 * Sends the next command to the debugger
	 */
	next(){
		return new Promise((resolve, reject) => {
			this.clear();
			this.process.stdin.write('n\n');
			this.done$.subscribe(value => {
				resolve({
					stdout: this.buffer_stdout,
					stderr: this.buffer_stderr,
					result: parser(this.buffer_stdout)
				});
			});
		});
	}

    /**
	 * Sends the step command to the debugger
	 */
	step(){
		return new Promise((resolve, reject) => {
			this.clear();
			this.process.stdin.write('s\n');
			this.done$.subscribe(value => {
				resolve({
					stdout: this.buffer_stdout,
					stderr: this.buffer_stderr,
					result: parser(this.buffer_stdout)
				});
			});
		});
	}

    /**
	 * Sends the continue command to the debugger
	 */
	cont(){
		return new Promise((resolve, reject) => {
			this.clear();
			this.process.stdin.write('c\n');
			this.done$.subscribe(value => {
				resolve({
					stdout: this.buffer_stdout,
					stderr: this.buffer_stderr,
					result: parser(this.buffer_stdout)
				});
			});
		});
	}
}
