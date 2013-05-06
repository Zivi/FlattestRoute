//at initialization
var directionsDisplay;
var map = null;

//set variables for elevation
var elevator = null;
var polyline;
var routes = null;
var slopes = null;
var distance = null;
var markersArray = [];
var elevations = [];

//load the visualization API with the columnchart package
google.load("visualization", "1", {packages: ["columnchart"]});

// Runs after page is loaded
$(function () {
// 	create event handler that will start the calcRoute function when
// 	the go button is clicked
	$("button#go").on("click", function () {
		calcRoute();
	});
	//Start the calcRoute function if the enter button is pressed
	$("#target").keypress(function (event) {
		if (event.which == 13) {
			calcRoute();
		}
	});



	initialize_maps();
});

function initialize_maps() {
	//set ability to make route draggable
	var rendererOptions = {
		draggable: true,
		hideRouteList: true,
		polylineOptions: {
			strokeOpacity: 0
		}
	};

	//initialize directions renderer
	directionsDisplay = new google.maps.DirectionsRenderer(rendererOptions);
	//reference to div map-canvas
	var mapCanvas = $('#map-canvas').get(0);
	var mapOptions = {
		center: new google.maps.LatLng(37.787930,-122.4074990),
		zoom: 16,
		//disables zoom and streetview bar but can stil zoom with mouse
		disableDefaultUI: true,
		mapTypeId: google.maps.MapTypeId.TERRAIN
	};
	//create a google maps object
	map = new google.maps.Map(mapCanvas, mapOptions);

	// var bikeLayer = new google.maps.BicyclingLayer();
	// bikeLayer.setMap(map);

	directionsDisplay.setMap(map);
	//populate panel with written directions
	// directionsDisplay.setPanel($("#directionsPanel").get(0));

	//add elevation service
	elevator = new google.maps.ElevationService();

	//change path elevation information if the user clicks on another suggested route
	google.maps.event.addListener(
		directionsDisplay,
		'routeindex_changed',
		updateRoutes
	);


}

function calcRoute() {
	//create object directions service
	var start = $("#start").val();
	var end = $("#end").val();
	var request = {
		origin: start,
		destination: end,
		travelMode: google.maps.TravelMode.BICYCLING
	};
	var DirectionsService = new google.maps.DirectionsService();
	DirectionsService.route(request, function(result, status) {
		//checks region for directions eligibility
		if (status == google.maps.DirectionsStatus.OK) {
			directionsDisplay.setDirections(result);
		};
	});
};

var updating = false;
function updateRoutes() {
	if (updating) return;
	updating = true;
	setTimeout(function () { updating = false; }, 100);
	console.log("Updating routes");
	var routes = this.directions.routes;
	var path = routes[this.routeIndex].overview_path;
	distance = routes[this.routeIndex].legs[0].distance.value;
	newPath(path, distance);
}

function newPath(path) {
	//create a path elevation request object with path, samples set to every 100m
		var pathRequest = {
		'path': path,
		'samples': 300
	}
	//initiate the path request
	elevator.getElevationAlongPath(pathRequest, plotElevation);
}

//take an array of elevation result objects, draws a path on the map
//and plots the elevation profile on the chart
function plotElevation(elevations, status) {
	var slope, data, i, slopeChart, elevationChart, slopeChartDiv;

	if (status !== google.maps.ElevationStatus.OK) {
		alert("Error getting elevation data from Google");
		return;
	}

	//create a new chart in the elevation chart div
	elevationChartDiv = $("#elevation_chart").css('display', 'block');

	//extract the data to populate the chart
	map.elevationData = new google.visualization.DataTable();
	map.elevationData.addColumn('string', 'Sample');
	map.elevationData.addColumn('number', 'Elevation');
	map.elevationData.locations = [];
	map.elevationData.elevation = [];
	for (i = 0; i < elevations.length; i++) {
		//Change elevation from meters to feet
		map.elevationData.addRow([
			'',
			elevations[i].elevation * 3.28084
		]);
		map.elevationData.locations.push( elevations[i].location );
		map.elevationData.elevation.push( elevations[i].elevation * 3.28084 );
	}

	//draw the chart using the data within its div
	elevationChart = new google.visualization.ColumnChart(elevationChartDiv.get(0));
	elevationChart.draw(map.elevationData, {
		width: 500,
		height: 245,
		legend: 'none',
		titleY: 'Elevation (ft)'
	});

	//Create event listenter on slope to show location and elevation
	google.visualization.events.addListener(elevationChart, 'onmouseover', elevationHover);
	google.visualization.events.addListener(elevationChart, 'onmouseout',
		elevationClear);
	slopeChartDiv = $("#slope_chart").css('display', 'block');
	//extract the data to populate the chart
	map.slopeData = new google.visualization.DataTable();
	map.slopeData.addColumn('string', 'Sample');
	map.slopeData.addColumn('number', 'Slope');

	// Loop through each element of the elevation data, call the calc slope function using elevations.legth[i] and elevations.length[i+1], distance will be 100m
	// Create a slopes array so we can search through it later
	slopes = [];
	for (i = 0; i < elevations.length - 1; i++) {
		slope = (calcSlope(elevations[i+1].elevation, elevations[i].elevation, distance/300)) * 100;
		map.slopeData.addRow(['', slope]);

		slopes.push({
			slope: slope,
			location: midpoint(elevations[i], elevations[i+1])
		});
	}

	// Draw the chart using the slope data within its div
	// Not sure if this is required because it's in the html
	slopeChart = new google.visualization.ColumnChart(slopeChartDiv.get(0));

	slopeChart.draw(map.slopeData, {
		width: 500,
		height: 245,
		legend: 'none',
		titleY: 'slope %'
	});

		//Create event listenter on slope to show location and slope
	google.visualization.events.addListener(slopeChart, 'onmouseover', elevationHover);
	google.visualization.events.addListener(slopeChart, 'onmouseout',
		elevationClear);

	drawPolyline(elevations, slopes);
}

function drawPolyline (elevations, slopes) {
	// Create a polyline between each elevation, colour code by slope
	//debugger
	mapPaths = [];
	//debugger
	for (var i = 0; i < slopes.length; i++) {
		var routePath = [
			elevations[i].location,
			elevations[i+1].location
		];

		//debugger
		var absSlope = Math.abs(slopes[i].slope);
		if (absSlope <= 5) {
			pathColor = "#3CB371"
		} else if (absSlope <= 10) {
			pathColor = "#FFFF00"
		} else if (absSlope <= 15) {
			pathColor = "#3366FF"
		} else if (absSlope <= 20) {
			pathColor = "#FF0000"
		}
		else {
			pathColor = "#000000"
		};

		var mapPath = new google.maps.Polyline({
			path: routePath,
			strokeColor: pathColor,
			strokeOpacity: 0.5,
			strokeWeight: 5,
			draggable: true
		})
		mapPath.setMap(map);
		mapPaths.push(mapPath);
	}

}

function deg(slope) {
	return Math.floor(slope * 45) / 100;
}

function elevationHover (x) {
	//Show location on the map.
	var location = map.elevationData.locations[x.row];
	var elevation = map.elevationData.elevation[x.row];
	var slope = slopes[x.row].slope;
	var contentString = "Elevation: " + Math.round(elevation) + "ft<br>" +
		"Slope: " + Math.round(slope) + "% (" + deg(slope) + "&#176;)";


	map.locationMarker = new google.maps.Marker({
		position: location,
		map: map,
		labelContent: "Lat: " + location.lat() + ". Lng: " + location.lng() +
			". Elevation: " + elevation
	});
	//Add info window to the map
	map.infowindow = new google.maps.InfoWindow({
		content: contentString
	});
	map.infowindow.open(map, map.locationMarker);
}
function elevationClear (x) {
	map.locationMarker.setMap(null);
}


function midpoint(point1, point2) {
	// To get the midpoint, find the average between each respective point
	var lat = (point1.location.lat() + point2.location.lat()) / 2
	var lng = (point1.location.lng() + point2.location.lng()) / 2
	return new google.maps.LatLng(lat, lng);
}

//Calculate slope using elevation change between two points over a given distance in m,  the distance between each measurement.
function calcSlope(elev1M, elev2M, distanceM) {
	slope = (elev1M - elev2M) / distanceM;
	return slope;
}

