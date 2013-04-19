//at initialization
var directionsDisplay = null;
var DirectionsService = new google.maps.DirectionsService();
var map = null;

//set variables for elevation
var elevator = null;
var chart = null;
var infowindow = new google.maps.InfoWindow();
var polyline
var routes = null;


//https://maps.googleapis.com/maps/api/place/search/json?location=37.787930,-122.4074990&radius=1000&sensor=false&key=AIzaSyCOavQbPk8lvCNTUXzXXvvj02iej77Ldi0
$(function() {
// 	create event handler that will start the calcRoute function when
// 	the go button is clicked
	$("button#go").on("click", function() {
		calcRoute();
	});

	initialize_maps();
});




//load the visualization API with the columnchart package
google.load("visualization", "1", {packages: ["columnchart"]});


function initialize_maps() {
	//initialize directions renderer
	directionsDisplay = new google.maps.DirectionsRenderer();
	//reference to div map-canvas
	var mapCanvas = $('#map-canvas').get(0);
	var mapOptions = {
		center: new google.maps.LatLng(37.787930,-122.4074990),
		zoom: 16,
		//disables zoom and streetview bar but can stil zoom with mouse
		disableDefaultUI: true,
		mapTypeId: google.maps.MapTypeId.ROADMAP
	}
	//create a google maps object
	map = new google.maps.Map(mapCanvas, mapOptions);
	directionsDisplay.setMap(map);
	//populate panel with written directions
	directionsDisplay.setPanel($("#directionsPanel").get(0));

	//add elevation service
	elevator = new google.maps.ElevationService();

	//change path elevation information if the user clicks on another suggested route
	google.maps.event.addListener(
		directionsDisplay,
		'routeindex_changed',
		function (event) { 
			debugger
			var path = routes[this.routeIndex].overview_path;
			var distance = routes[this.routeIndex].legs[0].distance.value;
			drawPath(path, distance);
		}
	);
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
		routes = result.routes;
		//checks region for directions eligibility
		if (status == google.maps.DirectionsStatus.OK) {
			directionsDisplay.setDirections(result);
		};
	});

};


function drawPath(path, distanceMeters) {
	//create a new chart in the elevation chart div
	elevationDiv = $("#elevation_chart").get(0)
	chart = new google.visualization.ColumnChart(elevationDiv);
	console.log("draw path");
	//create a path elevation request object with path
	//need to figure out how to get the path length and divide the samples
	//up by unit such as 100m
	var pathRequest = {
		'path': path,
		'samples': Math.floor(distanceMeters / 10)
	}
	//initiate the path request
	elevator.getElevationAlongPath(pathRequest, plotElevation);
}

//take an array of elevation result objects, draws a path on the map
//and plots the elevation profile on the chart
function plotElevation(elevations, status) {
	if (status !== google.maps.ElevationStatus.OK) {
		alert("Error getting elevation data from Google");
		return;
	}

	//extract elevation samples from returned results
	var elevationPath = [];
	for (var i = 0; i < elevations.length; i++) {
		elevationPath.push(elevations[i].location);
	}

	//display the line of the elevation path
	var pathOptions = {
		path: elevationPath,
		strokeColor: '#0000CC',
		opacity: 0.4,
		map: map
	}
	// polyline = new google.maps.Polyline(pathOptions);

	//extract the data to populate the chart
	var data = new google.visualization.DataTable();
	data.addColumn('string', 'Sample');
	data.addColumn('number', 'Elevation');
	for (var i = 0; i < elevations.length; i++) {
		data.addRow(['', elevations[i].elevation]);
	}

	//draw the chart using the data within its div
	//not sure if this is required because it's in the html
	$("#elevation_chart").css('display', 'block');
	chart.draw(data, {
		width: 640,
		height: 200,
		legend: 'none',
		titleY: 'Elevation (m)'
	});
}
