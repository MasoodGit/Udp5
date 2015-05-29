# Front End Nanodegree Neighbourhood Project
This is a single plage application featuring map of a neighbourhood and
lets us explore places in this location.
we can find out the address and rating of the place.


Sounds interesting give it run, use the url below to access the application from your web browser
on Mobile/Tablet/Laptop or Desktop machine.

Link to the application [Neighbourhood Project](http://masoodgit.github.io/Udp5/build/index.html)

## How to use
 1. Use the location bar to search for a neighbourhood you are interested in.
 2. The Autocomplete box provides you suggestions to choose from.
 3. Once you have selected the location, we bring in the interesting places in the neighbourhood
   using the FourSquare API.
 4. Click on a place to get its rating.
 5. You could as well filter the places from the list of places presented.


#### Would you like to take a explore the code, here are few ways to do it.

 1. Fork the repo and then clone it your machine
 2. Download the repo to your machine

#### To run locally
 1. Launch your terminal ( git bash on windows )
 2. Go to the build folder or the src folder (directory)
 3. Launch the server 
    * $ python -m SimpleHTTPServer 8000  (for Mac OS X)
    * $ python -m http.server  8000      (for Windows )
 4. In your browser type localhost:8000  to run the app.

## Structure of the code base
 + html : src/index.html
 + css : src/css
 + js  : src/js
 + app.js in src/js contains the js code.

## Tools used:

##### Package Manager:
    npm

##### Build Management:
    gulp

#####Libraries used:
    KnockoutJS
    JQuery
    Offline.js
    normalize.css

#####Web API:
    Google Maps Autocomplete , InfoWindow
    FourSquare  API (explore)

## References:

####Documentation:
  * https://developer.foursquare.com/docs/
  * https://developers.google.com/maps/documentation/javascript/tutorial
  * https://developers.google.com/maps/documentation/javascript/examples/control-options
  * https://www.google.co.in/maps/

####Other repos:
  * https://github.com/ftchirou/frontend-nanodegree-neighborhood-map

####JSON Viewer:
  * http://jsonviewer.stack.hu/

####Others:
  * https://www.youtube.com/watch?v=ZprnKb0vz3k
  * www.foursquare.com
  * https://www.google.co.in/maps/
