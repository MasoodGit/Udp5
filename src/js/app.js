function FoursquareAPI() {


  this.clientId = "4ZKYMPQ4P0S3NA2JW1ACCJV1IFWEOCEWMRPNQILFFX5VLBS2";
  this.clientSecret = "05EAWPEOHRYCHGUF53J3KW5EJ545R3U1D1GFRHJFEWAD4VUC";

  this.baseUrl = "https://api.foursquare.com/v2/venues/search?ll={{lat}},{{lng}}&client_id=" 
                 + this.clientId + "&client_secret=" + this.clientSecret + "&v=20150404";
  
  this.getPlaces = function(location,successCallbackFunc,errorCallbackFunc) {
  
  var endpoint = this.baseUrl
                   .replace(/{{lat}}/g,location.coords.lat)
                   .replace(/{{lng}}/g,location.coords.lng);

  $.get(endpoint)
    .done(function(data) {
      var meta = data.meta;
      if(meta.code == 200) {
        successCallbackFunc(data.response['venues']);
      }else {
        errorCallbackFunc({errorType: meta.errorType, errorDetail: meta.errorDetail});
      }

    })
    .fail(function() {
      errorCallbackFunc('Unable to load places. Please refresh the page');
    });
  }
  
}


// ViewModel
function Neighbourhood()  {
  var self = this,
      map,
      mapOptions,
      defaultLocation,
      currentLocation,
      autocompleteInputBox;

  self.foursquareAPI = new FoursquareAPI();

  self.loading = ko.observable(true);

  self.error = ko.observable(false);

  //search pattern provided by user
  //to filter the list of places
  self.searchPattern = ko.observable("");

  //all places received from fourSquare API
  self.places = ko.observableArray([]);

  //all places after applying the filtering
  self.filteredPlacesList = ko.observableArray([]);

  // defaults to Bangalore
  self.currentLocation = {
    name : ko.observable('Bangalore'),
    coords : {
      lat : 12.9738,
      lng : 77.6119
    }
  }

  //list of places for a given location
  self.places = ko.observableArray([]);

  //pans google map to given location
  //coordinates
  self.pantoLocation = function() {
    map.panTo(self.currentLocation.coords);
    map.setZoom(15);
  }

  self.fetchPlaces = function() {
    
    //clear existing places array
    self.places([]);

    //call foursquare API to get Places for the location
    self.foursquareAPI.getPlaces(self.currentLocation,function(data) {
      if(data.length <= 0) {
        self.loading(false);
        return;
      }
      //we have found places, lets display them on the ui
      console.log(data);
      self.places(data);
    },self.errorHandler);
  }

self.errorHandler = function (error) {
        self.loading(false);
        
        if (error) {
            console.log(error);

            if (typeof error === 'object') {
                self.errorText('Can not retrieve all the places. Please reload the page.');

            } else if (typeof error === 'string') {
                self.errorText(error);
            }
        }

        self.error(true);
};


// initializes on load.
function init()  {

      //initial map options
      mapOptions = {
        center : {
          lat : self.currentLocation.coords.lat,
          lng : self.currentLocation.coords.lng
        },
        zoom : 15,
        disableDefaultUI : true // hides the streetview, zoom and map and satellite options.
      }
      
      //setup map 
      map = new google.maps.Map(document.getElementById("map"),mapOptions);
      
      //get places for the current(default) location
      self.fetchPlaces();

      //setup atucomplete , for searching new location/neighbourhood
      autocompleteInputBox = new google.maps.places.Autocomplete(document.getElementById("autocomplete"));
      
      google.maps.event.addDomListener(autocompleteInputBox,'place_changed',function() {
      
      var place = autocompleteInputBox.getPlace();

     

      if(place.geometry) {
        var location = place.geometry.location;
        
        //set the currentLocation
        self.currentLocation.name(place.name);
        self.currentLocation.coords.lat = location.lat();
        self.currentLocation.coords.lng = location.lng();
        
        //pan to the new currentLocation
        self.pantoLocation();

        //reset search pattern for list of places
        self.searchPattern("");

        //now fetch the places 
        self.fetchPlaces();
      }
    }); //end autocompleteInputBox DomListner


}

  //call init
  init();
}


$(document).ready(function()  {
  ko.applyBindings(new Neighbourhood());
});