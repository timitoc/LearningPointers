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
}

function compileCppFile() {
	child_process.execSync('g++ test.cpp -o test_exec -g -std=c++11');
}

describe('GDB interface', () => {
	describe('Starting debugger', () => {
		it('Check line sent 1', function() {
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

					gdb.add_breakpoint(5).then((data) => {
						gdb.run().then(data => {
							resolve(data);
						});

					});
				});
			}).then(data => {
				chai.expect(data.line).to.equal(5);
			});
		});

		//it('Should return',() => {
		//	assert.equal(-1, [1,2,3].indexOf(4));
		//});
	});
});

process.on('exit', () => {
	removeCppFile();
	process.exit();
});
