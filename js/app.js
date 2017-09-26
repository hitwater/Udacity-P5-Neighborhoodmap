/**
* Manual input Model for generating the data on map
*/
var favorite_places = [{
    name: "Round Rock",
    lat: 30.509828,
    lng: -97.688827,
    text: "Where I live"
}, {
    name: "Waco",
    lat: 31.549157,
    lng: -97.151885,
    text: "Where I studied"
}, {
    name: "College Station",
    lat: 30.628359,
    lng: -96.332520,
    text: "Where I worked"
}, {
    name: "San Marcos",
    lat: 29.882488,
    lng: -97.945553,
    text: "Best place for shopping"
}, {
    name: "Houston",
    lat: 29.756098,
    lng: -95.365636,
    text: "NASA and Rocket"
}, {
    name: "Dallas",
    lat: 32.774177,
    lng: -96.802800,
    text: "lot of farms"
}, {
    name: "San Antonio",
    lat: 29.430915,
    lng: -98.481496,
    text: "Mexico style"
}];

/**
* Define the ViewModel
*/
var ViewModel = function() {
    var self = this;
    var markers = [];
/**
* Implement the Google Map API
*/
    var austin = new google.maps.LatLng(30.266995, -97.746413);
    var map = new google.maps.Map(document.getElementById('map'), {
        center: austin,
        zoom: 7,
        mapTypeControl: false
    });
    var infowindow = new google.maps.InfoWindow({
        content: ''
    });
    var bounds = new google.maps.LatLngBounds();
/**
* Define the Place object to access the Model
*/
    var Place = function(name, lat, lng, text) {
        this.name = name;
        this.lat = lat;
        this.lng = lng;
        this.text = text;
        self.wikiList = ko.observableArray([]);
/**
* Define the marker on Google Map
*/
        var marker = new google.maps.Marker({
            position: new google.maps.LatLng(lat, lng),
            title: name,
            map: map,
            animation: google.maps.Animation.DROP,
        });
/**
* Make the Map Fit the Screen
*/
        bounds.extend(new google.maps.LatLng(lat, lng));
        map.fitBounds(bounds);

            function wiki(content, url) {
                var self = this;
                self.content = content;
                self.url = url;
            }
/**
* Implement the Wikipedia API
*/
        function wikiAPI() {
            var wikiURL = 'https://en.wikipedia.org/w/api.php?action=opensearch&search=' + name + '&format=json&callback=wikiCallback';
            var wikiRequestTimeout = setTimeout(function() {
                infowindow.setContent('Error loading Wikipedia links! Please try again later.');
            }, 5000);

            $.ajax({
                url: wikiURL,
                dataType: "jsonp",
                success: function(response) {
                    self.wikiList.removeAll();
                    var articles = response[1];
                    if (articles.length == 0) {
                        infowindow.setContent('No Wikipedia article found.');
                        }
                    for (var i = 0; i < articles.length; i++) {
                        articlename = articles[i];
                        var url = 'https://en.wikipedia.org/wiki/' + articlename;
                        self.wikiList.push(new wiki(articlename, url));
                    }
                    clearTimeout(wikiRequestTimeout);
                }
            });
        }
/**
* Define the function to generate all the wiki contents
*/
        function get_content(articles) {
            var info= '';
            info += '<div>' +'<h3>Wikipedia Articles</h3>'+ 'related to'+' '+ '<em>'+name+'</em>' +'--'+text+'</div>';
            for (var i = 0; i < articles.length; i++) {
                var url = articles[i].url;
                var content = articles[i].content;
                info += '<h4><a href="' + url + '">' + content + '</a></h4>';
            }
            return info
        };
/**
* Add event handler for pop up the marker and info window on Map
*/
        google.maps.event.addListener(marker, 'click', function() {
            wikiAPI();
            map.panTo(marker.position);
            marker.setAnimation(google.maps.Animation.BOUNCE);
            setTimeout(function(){ marker.setAnimation(null); }, 1000);
            window.setTimeout(function() {
                infowindow.setContent(get_content(self.wikiList()));
                infowindow.open(map, marker);
            }, 400);

        });


/**
* Add event handler for closing the info window on Map
*/
        infowindow.addListener('closeclick', (function(wikiMarker) {
            return function() {
                wikiMarker.setAnimation(null);
            };
        })(marker));

        markers.push(marker);
    };
/**
* Put all the data in Model into the VM object
*/
    self.allPlaces = ko.observableArray([]);
    favorite_places.forEach(function(placedata) {
        self.allPlaces.push(new Place(placedata.name, placedata.lat, placedata.lng, placedata.text));
    });
/**
* Implement the search function for filtering the data in Model
*/
    self.expandSearch = ko.observable('');
    self.currentMarkers = ko.computed(function() {
        self.allPlaces.removeAll();
        infowindow.close();
        var expandSearch = self.expandSearch().toLowerCase();
        var currentMarkers = [];
        for (var j = 0; j < markers.length; j++) {
            markers[j].setAnimation(null);
            if (markers[j].title.toLowerCase().indexOf(expandSearch) >= 0) {
                currentMarkers.push(markers[j]);
                markers[j].setVisible(true);
            } else {
                markers[j].setVisible(false);

            }
        }
        return currentMarkers;
    });
/**
* Binding for the click of the list of places
*/
    self.clickMarker = function(place) {
        var placeTitle = place.title;
        for (var i = 0; i < markers.length; i++) {
            if (markers[i].title === placeTitle) {
                google.maps.event.trigger(markers[i], 'click');
            }
        }
    };
};
function initMap() {
  // this function will be called when the google maps api is loaded
  ko.applyBindings(new ViewModel());
}
function googleError() {
  // and this will be called when there was an error
  document.body.innerHTML = "<h3>Google Maps is not loaded. Please check your internet connection.</h3>";
}

