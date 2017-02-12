document.addEventListener("deviceready", onDeviceReady, false);

var map;
var iconme;
var my_marker;
var directionsService = new google.maps.DirectionsService;
var directionsDisplay = new google.maps.DirectionsRenderer({
    suppressMarkers: true,
    suppressInfoWindows: false,
    polylineOptions: {
        strokeColor: "#000000",
        strokeOpacity: 0.4,
        strokeWeight: 2
    }
});

function loading(toggle) {
    if(toggle == 'on')
    {
        $('#loader').fadeOut('fast');
    } else {
        $('#loader').fadeOut('slow');
    }
}

function relocate(lat,lon)
{

    var latlng = new google.maps.LatLng(lat, lon);
    my_marker.setPosition(latlng);
    //map.setCenter(latlng);

}

function initialize(lat,lon,range)
{

    /**

    TODO: SET ME FREE PLEASE

     */

    lat = 40.985385;
    lon = 29.0256023;

    $("#map").css("height",$( document ).height() - ($(".bar-nav").height() + $(".bar-tab").height()));
    var locations;
    var icon;
    $.ajax({
        url: 'http://want2pee.com/application/3c973446de9546a15208c8b14e7ea4609cefd123.php?key=73d7d9c2a74f52a1aca8b4af0e03c872158b3fb0&lat='+lat+'&lon='+lon+'&range='+range,
        dataType:'jsonp'
    }).done(function( data ) {

        locations  = data['results'];

        iconme = {
            url: "assets/img/markers/marker-user.png",
            scaledSize: new google.maps.Size(32,32)
        };

        var map_style =
            [{
                "featureType": "all",
                "elementType": "all",
                "stylers": [{"saturation": -80}]
            }, {
                "featureType": "administrative.country",
                "elementType": "geometry.fill",
                "stylers": [{"visibility": "on"}, {"hue": "#ff0000"}]
            }, {
                "featureType": "administrative.locality",
                "elementType": "geometry.stroke",
                "stylers": [{"visibility": "on"}]
            }, {
                "featureType": "administrative.locality",
                "elementType": "labels.text.fill",
                "stylers": [{"hue": "#25ff00"}]
            }, {
                "featureType": "landscape",
                "elementType": "labels",
                "stylers": [{"visibility": "off"}]
            }, {
                "featureType": "road.arterial",
                "elementType": "geometry",
                "stylers": [{"hue": "#00ffee"}, {"saturation": 50}]
            }];



        map = new google.maps.Map(document.getElementById('map'), {
            zoom: 13,
            center: new google.maps.LatLng(lat,lon),
            mapTypeId: google.maps.MapTypeId.ROADMAP,
            disableDefaultUI: true,
            styles: map_style,
            minZoom: 13
        });
        google.maps.event.addListenerOnce(map, 'idle', function(){
            loading('off');
        });
        if(data['size'] > 0)
        {
            $("#discover_result").show().text(data['size']);
        } else {
            //myApp.popup('.popup-no-result');
            $("#discover_result").hide();
        }

        var markers = new Array();

        for (var i = 0; i < data['size']; i++) {

            icon = {
                url: "assets/img/markers/marker.png",
                scaledSize: new google.maps.Size(32,32)
            };

            var marker = new google.maps.Marker({
                position: new google.maps.LatLng(locations[i]['lat'], locations[i]['lon']),
                map: map,
                icon: icon
            });

            markers.push(marker);

            google.maps.event.addListener(marker, 'click', (function(marker, i) {
                return function() {

                    var distance = parseFloat(locations[i]['distance']);
                    distance = distance.toFixed(2);

                    direct_me(lat,lon,locations[i]['lat'],locations[i]['lon']);
                }
            })(marker, i));
        }

        my_marker = new google.maps.Marker({
            position: new google.maps.LatLng(lat,lon),
            map: map,
            icon: iconme
        });

        markers.push(my_marker);


        function auto_zoom()
        {
            //var bounds      = new google.maps.LatLngBounds(sw, ne);

            var GLOBE_WIDTH = 256; // a constant in Google's map projection
            var west        = data['southwest']['lon'];
            var east        = data['northeast']['lon'];
            var angle       = east - west;

            if (angle < 0)
            {
                angle      += 360;
            }
            var zoom = Math.round(Math.log($(window).width() * 360 / angle / GLOBE_WIDTH) / Math.LN2) - 2;

            map.setZoom(zoom);
            map.setOptions({minZoom: zoom});
        }

        auto_zoom();

    });

}

function direct_me(lat,lon,_lat,_lon)
{
    alert('here we go');
    map.setZoom(15);
    directionsDisplay.setMap(map);
    directionsDisplay.setDirections({routes: []});
    calculate_directions(directionsService, directionsDisplay,lat,lon,_lat,_lon);
}

function calculate_directions(directionsService, directionsDisplay,lat,lon,_lat,_lon)
{
    setInterval(function(){
        navigator.geolocation.getCurrentPosition(onRelocate, onError);
        return false;
    }, 2000);
    directionsService.route({
        origin: lat+","+lon,
        destination: _lat+","+_lon,
        travelMode: google.maps.TravelMode.WALKING
    }, function(response, status) {
        if (status === google.maps.DirectionsStatus.OK) {
            directionsDisplay.setDirections(response);
        } else {
            onError('no_direction');
            //myApp.popup('.popup-alert');
        }
    });
}

function onDeviceReady()
{
    StatusBar.overlaysWebView(false);
    LoadMapsApi();
    BuildTabMenu();
}

function BuildTabMenu() {
    $('.tab-item').click(function () {
        $('.tab-item').removeClass('active');
        $(this).addClass('active');
        $('.layered_content').stop(true).fadeOut('fast');
        $('#'+$(this).data('target')).stop(true).show();
    });
}

function LoadMapsApi()
{
    $.getScript('https://maps.googleapis.com/maps/api/js?key=AIzaSyAyrPMBJd5T3nOeMnllIrhbgEH-QLJu2Ks&sensor=true&callback=MapCallback');
}

function MapCallback()
{
    navigator.geolocation.getCurrentPosition(onSuccess, onError);
    $("#centerizemap").click(function(){
        navigator.geolocation.getCurrentPosition(onSuccess, onError)
    });
    $("#distance-range").on("input change",function(){
        navigator.geolocation.getCurrentPosition(onSuccess, onError);
        return false;
    });
}

function onRelocate(position)
{
    relocate(position.coords.latitude,position.coords.longitude);
}

function onSuccess(position)
{
    initialize(position.coords.latitude,position.coords.longitude,$("#distance-range").val());
}

function onError(error) {
    alert('Error!');
    //myApp.popup('.popup-alert');
}

$(function() {
    if($("#map").length)
    {
        LoadMapsApi();
    }
});
