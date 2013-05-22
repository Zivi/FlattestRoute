# Flattest Route

Made while attending Hackbright Academy in Spring 2013.

Created with JavasScript, HTML, CSS, Google Maps API.

See it in action: http://www.flattestroute.com/

For some insight into how this was developed, see [this blog post](http://zivi.github.io/posts/iterating-to-success/).

The project plots slope data along a given route. The null navigation is for San Francisco but will work anywhere
directions on Google Maps works.

The [JavaScript code](https://github.com/Zivi/FlattestRoute/blob/master/public/js/main.js#L17) 
starts with some event listeners that check if a route has already been plotted. The to, from, and travel mode fields
are then populated with the information in the URL. Autocomplete is activated for the duration of the web page and
will work whenever a user types into the to and from fields.

On [initialize maps](https://github.com/Zivi/FlattestRoute/blob/master/public/js/main.js#L51), the map service,
directions renderer, and elevations service are all called from the Google Maps API. Under the [renderer options]
(https://github.com/Zivi/FlattestRoute/blob/master/public/js/main.js#L52) object, the routes were set to draggable but 
are not visible. That's because the route is being drawn with a polyline instead of a traditional route line. 
The polyline
was used to allow multiple colors along the route. I'll talk more about the polyline later.
This [event listenter](https://github.com/Zivi/FlattestRoute/blob/master/public/js/main.js#L78) checks for a route
change from dragging the route line which will update the route path and elevation.

[Calculate route](https://github.com/Zivi/FlattestRoute/blob/master/public/js/main.js#L97) will process the user's 
origin, destination, and travel mode request. The resulting route will be plotted onthe map using the directions service.
If no directions can be rendered, an error will return. The [sharable link]
(https://github.com/Zivi/FlattestRoute/blob/master/public/js/main.js#L119) updates the URL with the trip information
so other users can see the same trip.

[Update routes](https://github.com/Zivi/FlattestRoute/blob/master/public/js/main.js#L126) will set the routes and path
(elevation data along the route) based on the direction request made. [New path]
(https://github.com/Zivi/FlattestRoute/blob/master/public/js/main.js#L140)
