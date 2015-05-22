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
      autocompleteInputBox,
      infoWindow;

  self.foursquareAPI = new FoursquareAPI();

  self.isLoading = ko.observable(true);

  self.isErrored = ko.observable(false);

  self.errorMessage = ko.observable(false);

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
    map.setZoom(18);
  }

  self.clearSearch = function() {
    self.searchPattern("");
  }

  self.toggleInfoWindow = function(place) {
    map.panTo(place.marker.position);
    infoWindow.setContent(self.getInfoWindowContent(place));
    infoWindow.open(map,place.marker);
  }

  self.getInfoWindowContent = function(place) {

    var address = "";


    if (place.location.formattedAddress.length > 0) {
      address += '<br><address class="infowindow-address">';
      place.location.formattedAddress.forEach(function (addressItem) {
        address += addressItem + '<br>';
      });
      address += '</address>';
    }

    var content = '<p>' + place.name + '</p>' + address;
    return content;
  }

  self.fetchPlaces = function() {
    //call foursquare API to get Places for the location
    self.foursquareAPI.getPlaces(self.currentLocation,function(data) {
      
      if(data.length <= 0) {
        self.isLoading(false);
        return;
      }

      data.forEach(function(place) {
        
        place.isMatched = ko.computed(function() {
          infoWindow.close();
          var searchPattern = self.searchPattern().toLowerCase();
          for (var i = 0; i < place.categories.length; ++i) {
            if (place.categories[i].name.toLowerCase().search(searchPattern) != -1) {
              return true;
            }
          }
          return place.name.substring(0, searchPattern.length).toLowerCase() === searchPattern;
        });

        place.categoryName = ko.computed(function(){
          if(place.categories.length <= 0) {
            return '';
          }
          if(!place.categories[0].name) {
            return '';
          }
          return place.categories[0].name;
        });

        place.marker = new google.maps.Marker({
          map: map,
          title: place.name,
          position : {
            lat : place.location.lat,
            lng : place.location.lng
          }
        });

        place.isMarkerVisible = ko.computed(function(){
          place.marker.setVisible(place.isMatched());
        });
        

        google.maps.event.addListener(place.marker,'click',function() {
          
          infoWindow.setContent(self.getInfoWindowContent(place));
          infoWindow.open(map,place.marker);

          document.getElementById(place.id).scrollIntoView();
        });
      });

    //remove the loading message
    self.isLoading(false);
    //assign data received to 
    //self.places
    self.places(data);

    },self.errorHandler);
  }

self.errorHandler = function (error) {
        self.isLoading(false);
        
        if (error) {
            console.log('Error occured...',error);

            if (typeof error === 'object') {
                self.errorMessage('Can not retrieve all the places. Please reload the page.');

            } else if (typeof error === 'string') {
                self.errorMessage(error);
            }
        }

        self.isErrored(true);
};


// initializes on load.
function init()  {

      //initial map options
      mapOptions = {

        center : {
          lat : self.currentLocation.coords.lat,
          lng : self.currentLocation.coords.lng
        },
        zoom : 17,
        disableDefaultUI : true ,// hides the streetview, zoom and map and satellite options.
        zoom: 18,
        zoomControl: true,
        zoomControlOptions: {
            position: google.maps.ControlPosition.RIGHT_BOTTOM,
            style: google.maps.ZoomControlStyle.SMALL
            },
        mapTypeControl: true,
        mapTypeControlOptions: {
        style: google.maps.MapTypeControlStyle.HORIZONTAL_BAR,
        position: google.maps.ControlPosition.RIGHT_BOTTOM
    },
      }
      
      //setup map 
      map = new google.maps.Map(document.getElementById("map"),mapOptions);
      
      //instantiate one infoWindow for the entire map
      infoWindow = new google.maps.InfoWindow();

      //get places for the current(default) location
      self.fetchPlaces();

      //setup atucomplete , for searching new location/neighbourhood
      autocompleteInputBox = new google.maps.places.Autocomplete(document.getElementById("autocomplete"));
      
      google.maps.event.addDomListener(autocompleteInputBox,'place_changed',function() {
      
      //clear existing places array
      self.places([]);
      

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
  try {
      init();
  }
  catch(e) {

    self.errorHandler(e);
  }
  
}


$(document).ready(function()  {
  ko.applyBindings(new Neighbourhood());
});