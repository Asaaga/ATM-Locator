var map;
    var directionsService;
    var directionsDisplay;

    function initMap() {
      var latitude = 7.7299;
      var longitude = 8.5360;
      var api_key = "YOUR_API_KEY";

      map = new google.maps.Map(document.getElementById('map'), {
        center: { lat: latitude, lng: longitude },
        zoom: 15
      });

      directionsService = new google.maps.DirectionsService();
      directionsDisplay = new google.maps.DirectionsRenderer();
      directionsDisplay.setMap(map);

      var searchButton = document.getElementById('search-button');
      searchButton.addEventListener('click', function() {
        var searchInput = document.getElementById('search-input').value;
        geocodeAddress(searchInput);
      });

      function geocodeAddress(location) {
        var geocoder = new google.maps.Geocoder();
        geocoder.geocode({ address: location }, function(results, status) {
          if (status === 'OK') {
            var searchLocation = results[0].geometry.location;
            map.setCenter(searchLocation);

            var request = {
              location: searchLocation,
              radius: 1000,
              keyword: 'ATM'
            };

            var service = new google.maps.places.PlacesService(map);
            service.nearbySearch(request, callback);
          } else {
            console.error('Geocode was not successful for the following reason: ' + status);
          }
        });
      }

      function callback(results, status) {
        if (status == google.maps.places.PlacesServiceStatus.OK) {
          var sortedResults = sortResultsByDistance(results);
          for (var i = 0; i < sortedResults.length; i++) {
            createMarker(sortedResults[i], i + 1);
          }
        } else {
          console.error("Error occurred while searching for ATMs.");
        }
      }

      function sortResultsByDistance(results) {
        var searchLocation = map.getCenter();
        results.sort(function(a, b) {
          var distanceA = google.maps.geometry.spherical.computeDistanceBetween(searchLocation, a.geometry.location);
          var distanceB = google.maps.geometry.spherical.computeDistanceBetween(searchLocation, b.geometry.location);
          return distanceA - distanceB;
        });
        return results;
      }

      function createMarker(place, index) {
        var marker = new google.maps.Marker({
          map: map,
          position: place.geometry.location
        });

        var infowindow = new google.maps.InfoWindow();
        google.maps.event.addListener(marker, 'click', function() {
          infowindow.setContent('<strong>Name: </strong>' + place.name + '<br>' +
                                '<strong>Address: </strong>' + place.vicinity + '<br>' +
                                '<strong>Distance: </strong>' + place.distance + ' meters');
          infowindow.open(map, this);

          calculateAndDisplayRoute(place.geometry.location);
        });

        place.distance = google.maps.geometry.spherical.computeDistanceBetween(
          map.getCenter(),
          place.geometry.location
        ).toFixed(0);

        var label = String(index);
        if (index <= 9) {
          label = '0' + label;
        }

        var markerLabel = new google.maps.Marker({
          map: map,
          position: place.geometry.location,
          label: {
            text: label,
            color: '#ffffff'
          },
          icon: {
            labelOrigin: new google.maps.Point(13, 10),
            url: 'https://maps.gstatic.com/mapfiles/api-3/images/spotlight-poi.png',
            size: new google.maps.Size(25, 40),
            origin: new google.maps.Point(0, 0),
            anchor: new google.maps.Point(13, 40)
          }
        });

        if (index === 1) {
          calculateAndDisplayRoute(place.geometry.location);
        }
      }

      function calculateAndDisplayRoute(destination) {
        var searchLocation = map.getCenter();

        var request = {
          origin: searchLocation,
          destination: destination,
          travelMode: 'DRIVING'
        };

        directionsService.route(request, function(result, status) {
          if (status == 'OK') {
            directionsDisplay.setDirections(result);
          } else {
            console.error('Directions request failed due to ' + status);
          }
        });
      }
    }