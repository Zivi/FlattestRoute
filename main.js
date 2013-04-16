//https://maps.googleapis.com/maps/api/place/search/json?location=37.787930,-122.4074990&radius=1000&sensor=false&key=AIzaSyCOavQbPk8lvCNTUXzXXvvj02iej77Ldi0
$(function() {
// 	create event handler that will start the calcRoute function when
// 	the go button is clicked
	$("button#go").on("click", function() {
		calcRoute();
	});

	initialize_maps();
});



//API key: AIzaSyAQu2QTu2fe1zuir1GUEW8pai7sTnxmbsg

//at initialization


var directionsDisplay = null;
var DirectionsService = new google.maps.DirectionsService();
var map = null;


function initialize_maps() {
	//initialize directions renderer
	directionsDisplay = new google.maps.DirectionsRenderer();
	//reference to div map-canvas
	debugger
	var mapCanvas = $('#map-canvas').get(0);
	var mapOptions = {
		center: new google.maps.LatLng(37.787930,-122.4074990),
		zoom: 16,
		//disables zoom and streetview bar but can stil zoom with mouse
		disableDefaultUI: true,
		mapTypeId: google.maps.MapTypeId.ROADMAP,

	}
	//create a google maps object
	map = new google.maps.Map(mapCanvas, mapOptions);
	directionsDisplay.setMap(map);
	//populate panel with written directions
	directionsDisplay.setPanel(document.getElementById("directionsPanel"));
}

function calcRoute() {
	//create object directions service
	var start = $("#start").val();
	var end = $("#end").val();
	var request = {
		origin: start,
		destination: end,
		travelMode: google.maps.TravelMode.DRIVING,
		provideRouteAlternatives: true
	};
	DirectionsService.route(request, function(result, status) {
		//checks region for directions eligibility
		if (status == google.maps.DirectionsStatus.OK) {
			directionsDisplay.setDirections(result);
		};
	});
};
