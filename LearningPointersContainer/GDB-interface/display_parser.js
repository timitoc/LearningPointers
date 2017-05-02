function remove_spaces_from_beginning(s){
    let result = '';
    for(let i = 0; i < s.length; i++){
        if((s[i] == ' ' || s[i] == '\t') && result == '')
            continue;
        result += s[i];
    }
    return result;
}

function after_first_equal(s){
    console.log('s='+s);
    let result = '', i;
    for(i = 0; s[i] != '=' && i < s.length; i++);
    i++;
    for(i++; i < s.length; i++){
        result += s[i];
    }
    return result;
}

function parse(raw){
    let lines = raw.split('\n');
    
    let result = {
        display_variables: {}
    };

    let index = lines.length - 1;
    for(; lines[index].length == 0; --index);

    let lastord = null;
	for(; lines[index].startsWith('(gdb)'); --index);
    for(; index >= 0  && /^\d+:\s.+/.test(lines[index]); index--){
        let tokens = lines[index].split('=');
        let ord = parseInt(tokens[0].split(' ')[0]);
        if(lastord == null){
            let expr = tokens[0].split(' ')[1];
            let value = after_first_equal(lines[index]);
            result.display_variables[expr] = value;
            lastord = ord;
        }else{
            if(ord != 0 && ord == lastord - 1){
                let expr = tokens[0].split(' ')[1];
                let value = after_first_equal(lines[index]);
                console.log('*' + value);
                result.display_variables[expr] = value;
                lastord = ord;
            }
        }
    }
    result.line = parseInt(lines[index].split('\t')[0]);
    index--;

    result.stdout = '';
    
    while(index >= 0){
        result.stdout = lines[index--] + '\n' + result.stdout;
    }
    result.stdout = result.stdout.substr(0,result.stdout.length-1);

    console.log(result);
};


module.exports = parse;
