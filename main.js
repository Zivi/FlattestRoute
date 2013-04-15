https://maps.googleapis.com/maps/api/place/search/json?location=37.787930,-122.4074990&radius=1000&sensor=false&key=AIzaSyCOavQbPk8lvCNTUXzXXvvj02iej77Ldi0




//API key: AIzaSyAQu2QTu2fe1zuir1GUEW8pai7sTnxmbsg

//at initialization
var map = null;

function initialize() {
	//reference to div map-canvas
	var mapCanvas = document.getElementById('map-canvas');
	var mapOptions = {
		center: new google.maps.LatLng(37.787930,-122.4074990),
		zoom: 16,
		mapTypeId: google.maps.MapTypeId.ROADMAP,
		zoomControlStyle: google.maps.ZoomControlStyle.LARGE
	}
	//create a google maps object
	map = new google.maps.Map(mapCanvas, mapOptions);




	
}



// function styleMap(map) {

// 	map.set('styles', [
// 		{	
// 			//color road lines black
// 			featureType: 'road',
// 			elementType: 'geometry',
// 			stylers: [
// 				{color: '#00000' },
// 				{weight: 1.6}
// 			]
// 		}, {
// 			//color road labels white
// 			featureType: 'road',
// 			elementType: 'labels',
// 			stylers: [
// 				{ saturation: -100 },
// 				{ invert_lightness: true }
// 			]
// 		}, {
// 			//color the landscape yellow 
// 			featureType: 'landscape',
// 			elementType: 'geometry',
// 			stylers: [
// 				{ hue: '#ffff00' },
// 				{ gamma: 1.4 },
// 				{ saturation: 82 },
// 				{ lightness: 96 }
// 			]
// 		}, 
		// {
		// 	//turns visibility off
		// 	featureType: 'poi',
		// 	elementType: 'geometry',
		// 	stylers: [
		// 		{ visibility: 'off' }
		// 	]
		// },
// 		{
// 			featureType: 'poi.school',
// 			elementType: 'geometry',
// 			stylers: [
// 			//	{ visibility: 'on'}
// 				{ hue: '#fff700' },
// 				{ lightness: -15 },
// 				{ saturation: 99 }
// 			]
// 		}, 
// ]);
// };

// 	var iconBase = 'https://maps.google.com/mapfiles/kml/shapes/';
// 	var marker = new google.maps.Marker({
// 		position: myLatLng,
// 		map: map,
// 		icon: iconBase + 'schools_maps.png',
// 		shadow: iconBase + 'schools_maps.shadow.png'
// 	});


google.maps.event.addDomListener(window, 'load', initialize);
