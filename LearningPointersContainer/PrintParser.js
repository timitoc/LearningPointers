class PrintParser{
	constructor(raw){
		let lines = raw.split('\n');
		for(let i = 0; i < lines.length; i++)
			if(lines[i] != ''){
				this.raw = lines[i];
				break;
			}
	}
	get_value(){
		if(this.raw.includes('No Symbol'))
			return 'Invalid';
		return this.raw.substr(this.raw.indexOf('=') + 2);
	}
}

module.exports = PrintParser;
