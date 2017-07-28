const chai = require('chai');
const fs = require('fs');
const assert = require('assert');
const child_process = require('child_process');
const GDB = require('../gdb.js');


function writeCppFile(content) {
	fs.writeFileSync("test.cpp", content);
}

function removeCppFile() {
	fs.unlink("test.cpp");
	fs.unlink("test_exec");
	fs.unlink("input.txt");
	fs.unlink("output.txt");
}

function compileCppFile() {
	child_process.execSync('g++ test.cpp -o test_exec -g -std=c++11');
}

describe('GDB interface', () => {
	describe('Starting debugger', () => {
		it('Check line sent 1', function() {
			return new Promise((resolve, reject) => {

				writeCppFile(` int main() {
				int k = 5;
				for(int i = 0; i < 10; i++) {
					int j = i * i;
					k = j;
				}
				return 0;}`);

				compileCppFile();

				let gdb = new GDB('./test_exec');

				gdb.write_input('').then(data => {
					//console.log("AT INPUT " + JSON.stringify(data));
					gdb.add_breakpoints([{line:3, temporary:false, condition: "true"}]).then((data) => {
						//console.log("AT BR " + JSON.stringify(data));
						gdb.run(["k"]).then(data => {
							//console.log("AT RUN" + JSON.stringify(data));
							resolve(data);
						});

					});
				});
			}).then(data => {
				chai.expect(data.line).to.equal(3);
				chai.expect(data.watches["k"]).to.equal('5');
			});
		});

		it('Check line sent 2', function() {
			return new Promise((resolve, reject) => {

				writeCppFile(` int main() {
				int k;
				for(int i = 0; i < 10; i++) {
					int j = i * i;
					k = j;
				}
				return 0;}`);

				compileCppFile();

				let gdb = new GDB('./test_exec');

				gdb.write_input('').then(data => {
					gdb.add_breakpoints([{line:5, temporary:false, condition: "true"}]).then((data) => {
						gdb.run().then(data => {
							resolve(data);
						});

					});
				});
			}).then(data => {
				chai.expect(data.line).to.equal(5);
			});
		});
	});

	describe ('Set Variable', () => {
		it('Check set variabile return', function() {
			return new Promise((resolve, reject) => {

				writeCppFile(` int main() {
				int k;
				for(int i = 0; i < 10; i++) {
					int j = i * i;
					k = j;
				}
				return 0;}`);

				compileCppFile();

				let gdb = new GDB('./test_exec');

				gdb.write_input('').then(data => {
					//console.log("AT INPUT " + JSON.stringify(data));
					gdb.add_breakpoints([{line:3, temporary:false, condition: "true"}]).then((data) => {
						//console.log("AT BR " + JSON.stringify(data));
						gdb.run().then(data => {
							//console.log("AT RUN" + JSON.stringify(data));
							gdb.set_var("k", "5").then(data => {
								resolve(data);
							});
						});

					});
				});
			}).then(data => {
				//console.log(data);
				chai.expect(data.stdout).to.equal('(gdb) ');
			});
		});
	});

	describe('Locals', () => {
		it('Verify local variable value', () => {
			return new Promise((resolve, reject) => {
				writeCppFile(`int f(int n) {
						if(!n) return 1;
						return n * f(n-1);
					}
					int main() {
						int x = 5;
						f(4);
					return 0;}`);

				compileCppFile();

				let gdb = new GDB('./test_exec');

				gdb.write_input('').then(data => {
					gdb.add_breakpoint(8).then(data => {
						gdb.run().then(data => {
							gdb.locals().then(data1 => {
								resolve(data1);
							});
						});
					});
				});
			}).then((data) => {
				chai.expect(data.x).to.equal('5');
			});
		});
	});
	describe('Args', () => {
		it('Verify function arguments' , () => {
			return new Promise((resolve, reject) => {
				writeCppFile(`int f(int n) {
						if(!n) return 1;
						return n * f(n-1);
					}
					int main() {
						int x = 5;
						f(4);
					return 0;}`);

				compileCppFile();

				let gdb = new GDB('./test_exec');

				gdb.write_input('').then(data => {
					gdb.add_breakpoint(2).then(data => {
						gdb.run().then(data => {
							gdb.args().then(data1 => {
								resolve(data1);
							});
						});
					});
				});

			}).then(data => {
				chai.expect(data.n).to.equal('4');
			});

		});
	});
	describe('Backtrace (call stack)', () => {
		it('Verify call stack', () => {
			return new Promise((resolve, reject) => {
				writeCppFile(`int f(int n) {
						if(!n) return 1;
						return n * f(n-1);
					}
					int main() {
						int x = 5;
						f(4);
					return 0;}`);

				compileCppFile();

				let gdb = new GDB('./test_exec');

				gdb.write_input('').then(data => {
					gdb.add_breakpoint(2).then(data => {
						gdb.run().then(data => {
							gdb.cont([]).then(data => {
								gdb.backtrace().then(data1 => {
									resolve(data1);
								});
							});
						});
					});
				});

			}).then(data => {
				chai.expect(data).to.have.lengthOf(3);
				chai.expect(data[0]).to.have.property('function');
				chai.expect(data[0]['function']).to.equal('f');
				chai.expect(data[0]).to.have.property('arguments');
				chai.expect(data[0]['arguments']).to.have.property('n');
				chai.expect(data[0]['arguments']['n']).to.equal('3');
			});
		});
	});
});

process.on('exit', () => {
	removeCppFile();
	process.exit();
});
