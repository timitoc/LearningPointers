function dropdown(checkbox) {
	if(checkbox.checked) {
		document.getElementById("toggle-image").src = "img/up.svg";
	}
	else document.getElementById("toggle-image").src = "img/down.svg";
}
