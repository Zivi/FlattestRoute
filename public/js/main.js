var directionsDisplay;
var map = null;
var elevator = null;
var polyline;
var routes = null;
var slopes = null;
var distance = null;
var markersArray = [];
var elevations = [];
var mapPaths = [];


//Load the visualization API with the columnchart package.
google.load("visualization", "1", {packages: ["columnchart"]});

// Runs after page is loaded.
$(function () {
		var startParm = getURLParameter('from');
	        var endParm = getURLParameter('to');
		
// 	Create event handler that will start the calcRoute function when
// 	the go button is clicked.
	$("form#routes").on("submit", function (e) {
		e.preventDefault();
		calcRoute();
	});
	
//      If this link is being shared set to and from
	if(startParm!="null"){$('#start').val(decodeURLParameter(startParm));}
	if(endParm!="null"){$('#end').val(decodeURLParameter(endParm));}
	
	initialize_maps();
});

function initialize_maps() {
	//Set ability to make route draggable.
	var rendererOptions = {
		draggable: true,
		hideRouteList: true,
		polylineOptions: {
			strokeOpacity: 0
		}
	};
	//Initialize the directions renderer.
	directionsDisplay = new google.maps.DirectionsRenderer(rendererOptions);
	var mapCanvas = $('#map-canvas').get(0);
	var mapOptions = {
		center: new google.maps.LatLng(37.787930,-122.4074990),
		zoom: 20,
		//Disables zoom and streetview bar but can stil zoom with mouse.
		disableDefaultUI: true,
		mapTypeId: google.maps.MapTypeId.TERRAIN
	};
	//Create a google maps object.
	map = new google.maps.Map(mapCanvas, mapOptions);
	directionsDisplay.setMap(map);
	//Populate panel with written directions.
	// directionsDisplay.setPanel($("#directionsPanel").get(0));

	//Add elevation service.
	elevator = new google.maps.ElevationService();

	//Set up listener to change path elevation information if the user
	//clicks on another suggested route.
	google.maps.event.addListener(
		directionsDisplay,
		'routeindex_changed',
		updateRoutes
	);
}

function calcRoute() {
	var start = $("#start").val();
	var end = $("#end").val();
	var request = {
		origin: start,
		destination: end,
		travelMode: google.maps.TravelMode.BICYCLING
	};
	var DirectionsService = new google.maps.DirectionsService();
	DirectionsService.route(request, function(result, status) {
		//Checks region for directions eligibility.
		if (status == google.maps.DirectionsStatus.OK) {
			directionsDisplay.setDirections(result);
		};
	});
	//update url to include sharable link
	history.pushState('null', 'Flat Route Finder', '?from=' + encodeURLParameter(start) + '&to=' + encodeURLParameter(end) );
};

var updating = false;
function updateRoutes() {
	if (updating) return;
	updating = true;
	setTimeout(function () { updating = false; }, 100);
	console.log("Updating routes");
	//Check if the path has been populated, if it has been already
	//populated, clear it.

	var routes = this.directions.routes;
	var path = routes[this.routeIndex].overview_path;
	distance = routes[this.routeIndex].legs[0].distance.value;
	newPath(path, distance);
}

function newPath(path) {
		var pathRequest = {
		'path': path,
		'samples': 300
	}
	//Initiate the path request.
	elevator.getElevationAlongPath(pathRequest, plotElevation);
}
//Take an array of elevation result objects, draws a path on the map
//and plots the elevation profile on the chart.
function plotElevation(elevations, status) {
	var slope, data, i, slopeChart, elevationChart, slopeChartDiv;
	if (status !== google.maps.ElevationStatus.OK) {
		alert("Error getting elevation data from Google");
		return;
	}
	//Create a new chart in the elevation chart div.
	elevationChartDiv = $("#elevation_chart").css('display', 'block');
	//Extract the data to populate the chart.
	map.elevationData = new google.visualization.DataTable();
	map.elevationData.addColumn('string', 'Sample');
	map.elevationData.addColumn('number', 'Elevation');
	map.elevationData.locations = [];
	map.elevationData.elevation = [];
	for (i = 0; i < elevations.length; i++) {
		//Change elevation from meters to feet.
		map.elevationData.addRow([
			'',
			elevations[i].elevation * 3.28084
		]);
		map.elevationData.locations.push( elevations[i].location );
		map.elevationData.elevation.push( elevations[i].elevation * 3.28084 );
	}
	//Draw the chart using the data within its div.
	elevationChart = new google.visualization.ColumnChart(elevationChartDiv.get(0));
	elevationChart.draw(map.elevationData, {
		width: 500,
		height: 245,
		legend: 'none',
		titleY: 'Elevation (ft)'
	});

	//Create event listenter on slope to show location and elevation.
	google.visualization.events.addListener(elevationChart, 'onmouseover', elevationHover);
	google.visualization.events.addListener(elevationChart, 'onmouseout',
		elevationClear);
	slopeChartDiv = $("#slope_chart").css('display', 'block');
	//Extract the data to populate the chart.
	map.slopeData = new google.visualization.DataTable();
	map.slopeData.addColumn('string', 'Sample');
	map.slopeData.addColumn('number', 'Slope');

	//Loop through each element of the elevation data,
	//call the calc slope function using elevations.legth[i]
	//and elevations.length[i+1]
	//Create a slopes array so we can search through it later
	slopes = [];
	for (i = 0; i < elevations.length - 1; i++) {
		slope = (calcSlope(elevations[i+1].elevation, elevations[i].elevation, distance/300)) * 100;
		map.slopeData.addRow(['', slope]);
		slopes.push({
			slope: slope,
			location: midpoint(elevations[i], elevations[i+1])
		});
	}

	// Draw the chart using the slope data within its div.
	slopeChart = new google.visualization.ColumnChart(slopeChartDiv.get(0));
	slopeChart.draw(map.slopeData, {
		width: 500,
		height: 245,
		legend: 'none',
		titleY: 'slope %'
	});

	//Create event listenter on slope to show location and slope.
	google.visualization.events.addListener(slopeChart, 'onmouseover', elevationHover);
	google.visualization.events.addListener(slopeChart, 'onmouseout',
		elevationClear);
	drawPolyline(elevations, slopes);
}

function removePolylines() {
	for (var i = 0; i < mapPaths.length; i++) {
		var path = mapPaths[i];
		path.setMap(null);
	}

	mapPaths = [];
};

function drawPolyline (elevations, slopes) {
	//Create a polyline between each elevation, color code by slope.
	//Remove any existing polylines before drawing a new polyline.
	removePolylines();

	for (var i = 0; i < slopes.length; i++) {
		var routePath = [
			elevations[i].location,
			elevations[i+1].location
		];
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
		mapPath = new google.maps.Polyline({
			path: routePath,
			strokeColor: pathColor,
			strokeOpacity: 0.5,
			strokeWeight: 5,
			draggable: true
		});
		mapPath.setMap(map);
		mapPaths.push(mapPath);
	};
};

function deg(slope) {
	return Math.floor(slope * 45) / 100;
};

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
	//Add info window to the map.
	map.infowindow = new google.maps.InfoWindow({
		content: contentString
	});
	map.infowindow.open(map, map.locationMarker);
};
function elevationClear (x) {
	map.locationMarker.setMap(null);
};

function midpoint(point1, point2) {
	// To get the midpoint, find the average between each respective point
	var lat = (point1.location.lat() + point2.location.lat()) / 2
	var lng = (point1.location.lng() + point2.location.lng()) / 2
	return new google.maps.LatLng(lat, lng);
};

//Calculate slope using elevation change between two points
//over a given distance in m, the distance between each measurement.
function calcSlope(elev1M, elev2M, distanceM) {
	slope = (elev1M - elev2M) / distanceM;
	return slope;
};

//gets the 'to' and 'from' url Parameter for sharing links
//source: http://stackoverflow.com/questions/1403888/get-url-parameter-with-jquery
function getURLParameter(name) {
    return decodeURIComponent((RegExp(name + '=' + '(.+?)(&|$)').exec(location.search)||[,null])[1]); 
};

//change spaces to plus(+) sign
function encodeURLParameter(str) {
  return encodeURIComponent(str).replace(/%20/g, "+");
};

//change plus(+) sign to spaces
function decodeURLParameter(str) {
  return decodeURIComponent(str).replace(/[!'()]/g, escape).replace(/\+/g, " ");
};
