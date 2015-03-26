'use strict';

angular.module('App', []);

angular.module('App')
.controller('MainCtrl', ['$scope', '$http', function($scope, $http) {

        $scope.gmapOptions = {
            zoom: 10,
            mapTypeId: google.maps.MapTypeId.ROADMAP
        };
        $scope.places = [];
        $scope.mapTypes = google.maps.MapTypeId;
        $scope.travelModes = google.maps.TravelMode;
        $scope.travelMode = google.maps.TravelMode.DRIVING;
        $scope.gmap = new google.maps.Map(document.getElementById('cnsGmap'), $scope.gmapOptions);
        $scope.markers = [];
        $scope.markerArray = [];

        var showPosition = function(pos) {
            $scope.gmap.setCenter(new google.maps.LatLng(pos.coords.latitude, pos.coords.longitude));
        };

        function getLocation()  {
            if (navigator.geolocation) {
                navigator.geolocation.getCurrentPosition(showPosition);
            }
            else {
                $scope.error = "Geolocation is not supported by this browser.";
            }
        }
        $scope.setMapType = function() {
            $scope.gmap.setMapTypeId($scope.gmapOptions.mapTypeId);
        }

        $scope.setTravelMode = function() {
            $scope.route();
        }

        $scope.route = function() {
            for (var i = 0; i < $scope.markerArray.length; i++) {
                $scope.markerArray[i].setMap(null);
            }
            $scope.markerArray = [];
            var start = $scope.places[0];
            var end = $scope.places[$scope.places.length - 1];
            var request = {
                origin: new google.maps.LatLng(start.geometry.location.k, start.geometry.location.D),
                destination: new google.maps.LatLng(end.geometry.location.k, end.geometry.location.D),
                travelMode: $scope.travelMode
            };

            $scope.directionsService.route(request, function(response, status) {
                if (status == google.maps.DirectionsStatus.OK) {
                    $scope.directionsDisplay.setDirections(response);
                    showSteps(response);
                }
            });

        };

        function showSteps(directionResult) {
            var myRoute = directionResult.routes[0].legs[0];
            for (var i = 0; i < myRoute.steps.length; i++) {
                var marker = new google.maps.Marker({
                    position: myRoute.steps[i].start_location,
                    map: $scope.gmap
                });
                attachInstructionText(marker, myRoute.steps[i].instructions);
                $scope.markerArray[i] = marker;
            }
        }

        function attachInstructionText(marker, text) {
            google.maps.event.addListener(marker, 'click', function() {
                stepDisplay.setContent(text);
                stepDisplay.open(map, marker);
            });
        }

        $scope.deletePlace = function(id) {
            for(var i in $scope.places) {
                if($scope.places[i].id == id) {
                    $scope.places.splice(i, 1);
                }
            }
        };

        $scope.addPlace = function() {
            if($scope.place) {
                var f = true;
                for(var place in $scope.places) {
                    if($scope.places[place].id == $scope.place[0].id) {
                        f = false;
                        break;
                    }
                }
                if(f) {
                    $scope.places.push($scope.place[0]);
                    $scope.search = '';
                }
            } else {
                console.log('Errors');
            }
        }

        $scope.initialize = function() {
            getLocation();
            $scope.directionsService = new google.maps.DirectionsService();
            var rendererOptions = {
                map: $scope.gmap
            };
            $scope.directionsDisplay = new google.maps.DirectionsRenderer(rendererOptions)
            $scope.stepDisplay = new google.maps.InfoWindow();
            var input = (document.getElementById('gmapSearch'));
            var searchBox = new google.maps.places.SearchBox((input));
            google.maps.event.addListener(searchBox, 'places_changed', function () {
                $scope.place = searchBox.getPlaces();
                if ($scope.place) {
                    $scope.gmap.setCenter(new google.maps.LatLng($scope.place[0].geometry.location.k, $scope.place[0].geometry.location.D));
                    var image = {
                        url: $scope.place[0].icon,
                        size: new google.maps.Size(71, 71),
                        origin: new google.maps.Point(0, 0),
                        anchor: new google.maps.Point(17, 34),
                        scaledSize: new google.maps.Size(25, 25)
                    };
                    var marker = new google.maps.Marker({
                        map: $scope.gmap,
                        icon: image,
                        title: $scope.place[0].name,
                        position: $scope.place[0].geometry.location
                    });
                    $scope.markers.push(marker);
                }
            });
        }
    }]);