//Function to the foursquare api
function FoursquareAPI() {

  this.clientId = "4ZKYMPQ4P0S3NA2JW1ACCJV1IFWEOCEWMRPNQILFFX5VLBS2";
  this.clientSecret = "05EAWPEOHRYCHGUF53J3KW5EJ545R3U1D1GFRHJFEWAD4VUC";

  var baseUrl  = "https://api.foursquare.com/v2/venues/explore?";
  var location = "ll={{lat}},{{lng}}";
  var keys     = "&client_id={{clientId}}&client_secret={{client_secret}}";
  var params   = "&limit=20&section=topPicks&day=any&time=any&locale=en&v=20150404";
  
  baseUrl = baseUrl + location + keys + params;

  this.getPlaces = function(location,successCallbackFunc,errorCallbackFunc) {
  
  var endpoint = baseUrl
                   .replace(/{{lat}}/g,location.coords.lat)
                   .replace(/{{lng}}/g,location.coords.lng)
                   .replace(/{{clientId}}/g,this.clientId)
                   .replace(/{{client_secret}}/g,this.clientSecret);

  $.get(endpoint)
    .done(function(data) {
      var meta = data.meta;
      if(meta.code == 200) {
        successCallbackFunc(data.response);
      }else {
        errorCallbackFunc({errorType: meta.errorType, errorDetail: meta.errorDetail});
      }

    })
    .fail(function() {
      errorCallbackFunc('Unable to load places. Please refresh the page');
    });
  };
  
} //end of FourSquareAPI


// Neighbourhood ViewModel
function Neighbourhood()  {
  var self = this;
  var map;
  var mapOptions;
  var defaultLocation;
  var currentLocation;
  var autocompleteInputBox;
  var infoWindow;
  var categoryIconArray = [];
      

  //instantiate foursquareAPI
  self.foursquareAPI = new FoursquareAPI();

  //to indicate "Loading..." in the UI
  self.isLoading = ko.observable(true);

  //to indicate if an error has occured
  self.isErrored = ko.observable(false);

  //holds the errorMessage
  self.errorMessage = ko.observable(false);

  //search pattern provided by user
  //to filter the list of places
  self.searchPattern = ko.observable("");

  //list of places for a given location
  self.places = ko.observableArray();


  self.hasPlaces = ko.observable(false);

  // defaults to Bangalore
  self.currentLocation = {
    name : ko.observable('Bangalore'),
    coords : {
      lat : 12.9738,
      lng : 77.6119
    }
  };

  //pans google map to given location
  //coordinates
  self.pantoLocation = function() {
    map.panTo(self.currentLocation.coords);
    map.setZoom(18);
  };

  //function clears the input filed for 
  //searching places at a Location
  self.clearSearch = function() {
    self.searchPattern("");
  };

  //displays infowindow, when a place is clicked 
  //from place-list or the marker
  self.showInfoWindow = function(place) {
    map.panTo(place.marker.position);
    infoWindow.setContent(self.getInfoWindowContent(place));
    infoWindow.open(map,place.marker);
  };

  //creates the content that needs to 
  //be shown in the infoWindow for a place
  self.getInfoWindowContent = function(place) {
    var venueAddress = "";
    if (place.location.formattedAddress.length > 0) {
      place.location.formattedAddress.forEach(function (addressItem) {
        venueAddress += " " + addressItem ;
      });
    }

    var venueRating  = place.rating;
    var venueRatingColor = place.ratingColor;
    var venueCategoryName = place.categoryName();
    var venueCategoryIcon = categoryIconArray[place.categoryIcon()];
    
    var infoTemplate =""; 
  
    infoTemplate = '<div class="infowindow-block"><div class="infowindow-icon"></div>';
    infoTemplate += '<div class="infowindow-details"><div class="infowindow-venue-name"><span>' + place.name + '</span></div><div class="infowindow-venue-score" style="background: #'+ venueRatingColor +';">' +  venueRating + '</div>';
    infoTemplate += '<div class="infowindow-venue-AddressData"><div class ="infowindow-venue-address">' + venueAddress +'</div>';
    infoTemplate += '<div class="infowindow-venue-data"><span class="venueDataItem"><span class="categoryName">' + venueCategoryName + '</span></span>';
    infoTemplate += '</div></div></div></div>';

    //append category icon
    var $infoTemplate = $(infoTemplate);
    $infoTemplate.find("div.infowindow-icon").append(venueCategoryIcon);
    return $infoTemplate.html();
  };

  //fetch places info using the foursquare api
  self.fetchPlaces = function()  {

    //call foursquare API to get Places for the location
    self.foursquareAPI.getPlaces(self.currentLocation,function(data) {
    var items = data.groups[0].items;

    if(items.length <= 0) {
      self.isLoading(false);
      return;
    }

    var suggestedBounds = data.suggestedBounds;
    if(suggestedBounds !== undefined ) {
      var mapBounds = new google.maps.LatLngBounds(
          new google.maps.LatLng(suggestedBounds.sw.lat, suggestedBounds.sw.lng),
          new google.maps.LatLng(suggestedBounds.ne.lat, suggestedBounds.ne.lng));
        map.fitBounds(mapBounds);
    }

    items.forEach(function(item) {
        var place = item.venue;
        place.isMatched = ko.computed(function() {
          infoWindow.close();
          var searchPattern = self.searchPattern().toLowerCase();
          var numberOfCategories = place.categories.length;
          for (var i = 0; i < numberOfCategories; ++i) {
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

        place.categoryIcon = ko.computed(function(){
          if(place.categories.length <= 0) {
            return '';
          }
          if(!place.categories[0].icon){
            return '';
          }
          var prefix = place.categories[0].icon.prefix;
          var imageSize = 32;
          var suffix = place.categories[0].icon.suffix;
          var imageSrc =  prefix + "bg_" + imageSize + suffix;
          categoryIconArray.push(imageSrc);
          return imageSrc;
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
        self.places.push(place);
      });
    
    self.hasPlaces(true);

    //load all category icon images
    categoryIconArray.forEach(function(url){
      var img = new Image();
      img.onload = function() {
        categoryIconArray[url]= img;
      };
      img.src = url;
    });

    //remove the loading message
    self.isLoading(false);

    },self.errorHandler);
  };

//generic errorhandler
self.errorHandler = function (error) {
  
  self.isLoading(false);
  
  if (error) {
    console.log('Error occured...',error);

    if (typeof error === 'object') {
      self.errorMessage('Can not retrieve all the places. Please reload the page.');
    } 
    else if (typeof error === 'string') {
      self.errorMessage(error);
    }
  }

  self.isErrored(true);

};


// initializes on load.
function init()  {

  infowindowDataTemplate = $('script[data-template="infowindowTemplate"]').html();

  //initial map options
  mapOptions = {
    center : {
      lat : self.currentLocation.coords.lat,
      lng : self.currentLocation.coords.lng
    },
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
  };

  //setup map 
  map = new google.maps.Map(document.getElementById("map"),mapOptions);

 //http://stackoverflow.com/questions/18444161/google-maps-responsive-resize
  google.maps.event.addDomListener(window,"resize",function(){
    var center = map.getCenter();
    google.maps.event.trigger(map,"resize");
    map.setCenter(center);
  });

      
  //instantiate one infoWindow for the entire map
  infoWindow = new google.maps.InfoWindow();

  //get places for the current(default) location
  self.fetchPlaces();

  //setup atucomplete , for searching new location/neighbourhood
  autocompleteInputBox = new google.maps.places.Autocomplete(document.getElementById("autocomplete"));
      
  google.maps.event.addDomListener(autocompleteInputBox,'place_changed',function() {
      
    self.isLoading(true);
    
    self.hasPlaces(false);

    //clear existing places array
    self.places([]);
    var place = autocompleteInputBox.getPlace();

    if(place.geometry) {
      var location = place.geometry.location;
        
      //set the currentLocation
      self.currentLocation.name(place.name);
      self.currentLocation.coords.lat = location.lat();
      self.currentLocation.coords.lng = location.lng();
        
      //reset search pattern for list of places
      self.searchPattern('');

      //now fetch the places 
      self.fetchPlaces();
      }
    }); //end autocompleteInputBox DomListner
} // End of init

  try  {
    //call init
    init();
  }
  catch(e) {
    self.errorHandler(e);
  }
  
} // End of Neighbourhood


$(document).ready(function()  {

  //instantiate the viewmodel
  ko.applyBindings(new Neighbourhood());

  //fetch google Roboto fonts
  WebFontConfig = {
    google: { families: [ 'Roboto:100,300,400:latin' ] }
  };
  (function() {
    var wf = document.createElement('script');
    wf.src = ('https:' == document.location.protocol ? 'https' : 'http') +
      '://ajax.googleapis.com/ajax/libs/webfont/1/webfont.js';
    wf.type = 'text/javascript';
    wf.async = 'true';
    var s = document.getElementsByTagName('script')[0];
    s.parentNode.insertBefore(wf, s);
  })();

});