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
		/*it('Check line sent 1', function() {
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

					gdb.add_breakpoint(3).then((data) => {
						gdb.run().then(data => {
							resolve(data);
						});

					});
				});
			}).then(data => {
				chai.expect(data.line).to.equal(3);
			});
		});*/

		/*it('Check line sent 2', function() {
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

					gdb.add_breakpoint(5).then((data) => {
						gdb.run().then(data => {
							resolve(data);
						});

					});
				});
			}).then(data => {
				chai.expect(data.line).to.equal(5);
			});
		});*/
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
							console.log("3: " + JSON.stringify(data));
							gdb.locals().then(data1 => {
								console.log("4: " + JSON.stringify(data1));
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
});

process.on('exit', () => {
	removeCppFile();
	process.exit();
});
