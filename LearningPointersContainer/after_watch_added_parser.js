function parse(raw){
    let result = {};
    result.expr = raw.split(' ')[1];
    result.value = raw.substring(raw.indexOf(raw.split(' ')[3])).replace('\n','').replace('(gdb) ','');
    return result;
}

module.exports = parse;
