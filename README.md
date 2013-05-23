# Flattest Route

Made while attending Hackbright Academy in Spring 2013.

Created with JavasScript, HTML, CSS, Google Maps API.

See it in action: http://www.flattestroute.com/

For some insight into how this was developed, see [this blog post](http://zivi.github.io/posts/iterating-to-success/).

The project plots slope data along a given route. The default navigation is for San Francisco but will work anywhere
directions on Google Maps works. The [JavaScript code]
(https://github.com/Zivi/FlattestRoute/blob/master/public/js/main.js#L17) 
starts with some event listeners that check if a route has been passed in via the URL.

On startup, [initialize_maps](https://github.com/Zivi/FlattestRoute/blob/master/public/js/main.js#L51) calls the map service,
directions renderer, and elevations service using the Google Maps API. 

Under the [rendererOptions](https://github.com/Zivi/FlattestRoute/blob/master/public/js/main.js#L52) object, the routes were set to draggable but 
are not visible. That's because the route is being drawn with many polylines instead of a traditional route line. 
A polyline is used to connect every point since only one color is allowed per polyline.

This [event listenter](https://github.com/Zivi/FlattestRoute/blob/master/public/js/main.js#L78) is invoked whenever Google Maps finds a new route.
This can occur when a user enters a new start and end or when they drag an existing route.

[calculateRoute](https://github.com/Zivi/FlattestRoute/blob/master/public/js/main.js#L97) will process the user's 
origin, destination, and travel mode request. The resulting route will be plotted on the map using the directions service.
If no directions can be rendered, an error will return.
[updateRoutes](https://github.com/Zivi/FlattestRoute/blob/master/public/js/main.js#L126) will set the routes and path
(elevation points along the route) based on the direction request made.
 

[Plot Elevation](https://github.com/Zivi/FlattestRoute/blob/master/public/js/main.js#L150) has some interesting elements.
The elevation data with its corresponding locations were returns the elevations object. The elevation data iterates
through and plots the elevation chart. The raw data returns the elevation in meters and converts it to feet.
From the elevation information, [slopeData](https://github.com/Zivi/FlattestRoute/blob/master/public/js/main.js#L204)
is calculated then plotted onto the slope chart. To show the location of the slope along the path, an event listener shows
where the slope was located along the path using an [information window]
(https://github.com/Zivi/FlattestRoute/blob/master/public/js/main.js#L278).
