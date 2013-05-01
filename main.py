import urllib2
import json

#set api key
AUTH_KEY = 'AIzaSyCOavQbPk8lvCNTUXzXXvvj02iej77Ldi0'

LOCATION = '37.787930,-122.404990'

RADIUS = 5000

#query a predefined location with radius 5km
url = ('https://maps.googleapis.com/maps/api/place/search/json?location=%s'
		'&radius=%s&sensor=false&key=%s') % (LOCATION, RADIUS, AUTH_KEY)

#send get request to the place details service
response = urllib2.urlopen(url)

#get the response and use the json library to decode the json
json_raw = response.read()
json_data = json.loads(json_raw)

#iterate through results and print to console
if json_data['status'] == 'OK':
	for place in json_data['results']:
		print '%s: %s\n' % (place['name'], place['reference'])