const _RADIUS_ = 15;
let drivers = [];
let staoueli, benak, directionsService, directionsDisplay, map;

(function () {
  // initMap();
  // // initialize_map($("#map"), 32.5, 2.8, 13);
  load_drivers();
  setTimeout(() => {
    $('body').prepend(generate_driver_card(drivers[0]));
  }, 1500);

})();

function generate_driver_card(driver){
  return `<div class="driver_card">
            <div class="driver_infos">
                <div class="driver_image">
                  <div class="profile_image_container"><img src='/images/${driver.profile_pic}' alt='driver' /></div>
                  </div>
                <div class="driver_stats">${driver.username}</div>
                <div class="driver_stats">${driver.phone_number}</div>
                <div class="driver_stats">${driver.car_numberplate}</div>
                <div class="driver_stats"><img src='/images/${parseFloat(driver.rating)+'-stars.png'}' alt='driver_rating' /></div>
            </div>
            <div class="driver_action btn green">Call</div>
            <div class="driver_action btn pink">Cancel</div>
          </div>`;
}

function initMap() {
  staoueli = new google.maps.LatLng(36.7595944,2.8582993);
  benak = new google.maps.LatLng(36.7571768, 3.0033792);
  directionsDisplay = new google.maps.DirectionsRenderer();
  directionsService = new google.maps.DirectionsService();
  map = new google.maps.Map($('#map')[0], { zoom:10,center: staoueli});
  directionsDisplay.setMap(map);
  // setMarker(map,36.7595944,2.8582993)
  // directionsDisplay.setPanel(document.getElementById('directionsPanel'));

  setTimeout(() => {
    let drivers_in_range = get_drivers_in_range();
    console.log('getting drivers in range...', drivers);
    
    drivers_in_range.forEach(driver => {
      setMarker(map,driver);
    });
  }, 500);
}


function calc_distance(pointA,pointB,callback) {
  var service = new google.maps.DistanceMatrixService();
  service.getDistanceMatrix({
    origins: [pointA],
    destinations: [pointB],
    travelMode: 'DRIVING',
  },function (response, status) {
    if (status == 'OK') {
      var origin = response.originAddresses[0];
      var destination = response.destinationAddresses[0];
      var result = response.rows[0].elements[0];
      callback(origin, destination, result);
    }
  });
}



function get_drivers_in_range(){
  let drivers_in_range = [];
  if(drivers==undefined){throw new Error("drivers have not been loaded yet!")}
  drivers.forEach(driver => {
    const {lat, long} = JSON.parse(driver.current_location);
    let distance = calculate_distance(36.7595944, 2.8582993, lat, long, 'km');
    if(distance < _RADIUS_){
      drivers_in_range.push(driver);
    }
  });
  return drivers_in_range;
}


function calcRoute() {
  var request = {
    origin: $('#start').val(),
    destination: $('#end').val(),
    travelMode: 'DRIVING'
  };
  calc_distance(request.origin,request.destination);
  
  directionsService.route(request, function(result, status) {
    if (status == 'OK') {
      directionsDisplay.setDirections(result);
    }
  });
}
  
function setMarker(map, driver){
    let {lat, long} = JSON.parse(driver.current_location);
    var marker=new google.maps.Marker({  position:new google.maps.LatLng(lat, long),map: map});
    var infowindow = new google.maps.InfoWindow();
    marker.setMap(map);

    google.maps.event.addListener(marker, 'click', (function(marker, i) {
      return function() {
        infowindow.setContent(`hello`);
        infowindow.open(map, marker);
      }
    })(marker));
}


function load_drivers(){
  ajax('http://localhost:3000/ajax/load_drivers',{},function(data){
    drivers = (data.drivers);
  },
  function(err){
    console.log(err);
  });
}