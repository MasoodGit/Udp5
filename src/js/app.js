
// ViewModel
function Neighbourhood()  {
  var self = this,
      map,
      mapOptions,
      defaultLocation,
      currentLocation,
      autocompleteInputBox,
      places;

  // defaults to Bangalore
  self.currentLocation = {
    name : ko.observable('Bangalore'),
    coords : {
      lat : 12.9738,
      lng : 77.6119
    }
  }

  //updates the map based on the current location
  // clears the list of markers
  self.setUpMapForCurrentLocation = function () {
    
    if(self.currentLocation.name != ' ') {
      mapOptions = {
        center : {
          lat : self.currentLocation.coords.lat,
          lng : self.currentLocation.coords.lng
        },
        zoom : 17,
        disableDefaultUI : true // hides the streetview, zoom and map and satellite options.
      }
      
      map = new google.maps.Map(document.getElementById("map"),mapOptions);
      self.setUpNewLocationSearch();
      
    }//end of if 
  }

  self.setUpNewLocationSearch = function() {
    autocompleteInputBox = new google.maps.places.Autocomplete(document.getElementById("autocomplete"));
    google.maps.event.addDomListener(autocompleteInputBox,'place_changed',function(){
      var place = autocompleteInputBox.getPlace();
      if(place.geometry) {
        var location = place.geometry.location;
        self.currentLocation.name(place.name);
        self.currentLocation.location.lat = location.lat();
        self.currentLocation.location.lng = location.lng();
        self.pantoLocation();
      }
    });
  } 

  self.pantoLocation = function() {
    map.panTo(self.currentLocation.coords);
    map.setZoom(15);
  }

  // initializes on load.
  function init()  {

      mapOptions = {
        center : {
          lat : self.currentLocation.coords.lat,
          lng : self.currentLocation.coords.lng
        },
        zoom : 15,
        disableDefaultUI : true // hides the streetview, zoom and map and satellite options.
      }
      
      map = new google.maps.Map(document.getElementById("map"),mapOptions);
      autocompleteInputBox = new google.maps.places.Autocomplete(document.getElementById("autocomplete"));
      
      google.maps.event.addDomListener(autocompleteInputBox,'place_changed',function(){
      
      var place = autocompleteInputBox.getPlace();
      
      if(place.geometry) {
        var location = place.geometry.location;
        self.currentLocation.name(place.name);
        self.currentLocation.coords.lat = location.lat();
        self.currentLocation.coords.lng = location.lng();
        self.pantoLocation();
      }
    });

  }

  //call init
  init();
}


$(document).ready(function()  {
  ko.applyBindings(new Neighbourhood());
});