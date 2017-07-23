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
			typeSpeed: 30,
			callback: function() {
				$(".typed-cursor").hide();
			}
		});
	}

	var ratings = document.getElementsByClassName("rating");
	for(var i = 0; i < ratings.length; i++) {
		var ratingProperty = ratings[i].getAttribute("rating");
		var ratingValue = parseInt(ratingProperty.split('/')[0])
		var ratingTotal = parseInt(ratingProperty.split('/')[1])

		var j = 0;

		for(; j < ratingValue; j++ ) {
			var starImage = document.createElement("img");
			starImage.src = "star.svg";
			ratings[i].appendChild(starImage);
		}

		for(; j < ratingTotal; j++) {
			var starImage = document.createElement("img");
			starImage.src = "stargray.svg";
			ratings[i].appendChild(starImage);
		}
	}
});
