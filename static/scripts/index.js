$(function(){

	$("#type1").typed({
		strings: ["The only platform you will ever need for"],
        typeSpeed: 30,
		callback: function(){
			f();
		}
	});

	function f(){
		var cursors = $(".typed-cursor").toArray();
		$(cursors[cursors.length-1]).hide();
		$("#type2").typed({
			strings: ["learning^200","mastering C++ pointers!"],
			typeSpeed: 30
		});
	}

    $('#fullpage').fullpage({});

	$(".login-goto").click(function(e){
		e.preventDefault();
		$.fn.fullpage.moveTo(2);
	});

	$(".register-goto").click(function(e){
		e.preventDefault();
		$.fn.fullpage.moveTo(3);
	});
});