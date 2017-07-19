/*
 * Navigo is buggy

var root = null;
var useHash = true; // Defaults to: false
var hash = '#!'; // Defaults to: '#'
var router = new Navigo(root, useHash, hash);

router
  .on({
	'': function() {
		console.log('No code id');
		if(Cookies.get('code')){
			editor.setValue(Cookies.get('code'), 1);
		}
	},
	'/saved/:id': function (params) {
		console.log(params);
		socket.emit('get_code', {id:params.id});
		waitingDialog.show('Getting saved code...');
	},
  })
  .resolve();
*/

// https://github.com/mtrpcic/pathjs

$(function() {

	Path.map("#/saved/:id").to(function(){
		var id = this.params['id'];
		console.log('**********');
		socket.emit('get_code', {id: id});
		waitingDialog.show('Getting saved code...');
	});

	if(window.location.href.indexOf('#') == -1) {
		if(Cookies.get('code')){
			editor.setValue(Cookies.get('code'), 1);
		}
	}

	Path.rescue(function(){
		if(Cookies.get('code')){
			editor.setValue(Cookies.get('code'), 1);
		}
	});

	Path.listen();

});
