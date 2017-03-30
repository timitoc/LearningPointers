function strtok(string, separators){
    if(typeof string != 'string'){
        throw 'First parameter must be a string!';
    }
    let sep = {};
    let tokens = [];
    separators.forEach((item)=>{
        sep[item] = true;
    });
    let buffer = '';
    for(let i=0;i<string.length;i++){
        if(sep[string[i]]){
            if(buffer!=''){
                tokens.push(buffer);
                buffer='';
            }
        } else {
            buffer += string[i];
        }
    }
    return tokens;
};

module.exports=strtok;