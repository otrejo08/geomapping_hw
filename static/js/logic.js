// Get data from USGS
var earthquakeURL =
  "https://earthquake.usgs.gov/earthquakes/feed/v1.0/summary/all_week.geojson";

var tectonicPlatesURL =
  "https://raw.githubusercontent.com/fraxen/tectonicplates/master/GeoJSON/PB2002_boundaries.json";

// Get json object from earthquake URL
https: d3.json(earthquakeURL, function(response) {
  // Call function to create bindpopup & circle for each latitude & longitude obtained from response.features
  createFeatures(response.features);
});

// Define the createFeature function that creates a geoJSON layer of marker with popup containing additional info
function createFeatures(earthquakeData) {
  var earthquakes = L.geoJSON(earthquakeData, {
    onEachFeature: function(feature, layer) {
      layer.bindPopup(
        "<h3>Location: " +
          feature.properties.place +
          "</h3><h6>Magnitude: " +
          feature.properties.mag +
          "</h6><hr><p>" +
          new Date(feature.properties.time) +
          "</p>"
      );
    },

    pointToLayer: function(feature, latlng) {
      return new L.circle(latlng, {
        radius: getRadius(feature.properties.mag),
        fillColor: getColor(feature.properties.mag),
        fillOpacity: 0.7,
        color: "#000",
        stroke: true,
        weight: 0.8
      });
    }
  });

  // Send layer to createMap function
  createMap(earthquakes);
}

// CreateMap function that creates baseMaps & overLay Maps
function createMap(earthquakes) {
 
  var outdoors = L.tileLayer(
    "https://api.mapbox.com/styles/v1/mapbox/outdoors-v10/tiles/256/{z}/{x}/{y}?" +
      "access_token=pk.eyJ1Ijoib3RyZWpvMDgiLCJhIjoiY2p0a3o2N253MDYwcDQ1bzZhcGpubTVpYSJ9.r9Q8qHGpcDKknb20ofgeLg"
  );

  var satellite = L.tileLayer(
    "https://api.mapbox.com/styles/v1/mapbox/satellite-v9/tiles/256/{z}/{x}/{y}?" +
      "access_token=pk.eyJ1Ijoib3RyZWpvMDgiLCJhIjoiY2p0a3o2N253MDYwcDQ1bzZhcGpubTVpYSJ9.r9Q8qHGpcDKknb20ofgeLg"
  );

  var grayscale = L.tileLayer(
    "https://api.mapbox.com/styles/v1/mapbox/light-v10/tiles/256/{z}/{x}/{y}?" +
      "access_token=pk.eyJ1Ijoib3RyZWpvMDgiLCJhIjoiY2p0a3o2N253MDYwcDQ1bzZhcGpubTVpYSJ9.r9Q8qHGpcDKknb20ofgeLg"
  );
  
  var baseMaps = {
    Satellite: satellite,
    Grayscale: grayscale,
    Outdoors: outdoors
  };

  var tectonicPlates = new L.LayerGroup();

  var overlayMaps = {
    Earthquakes: earthquakes,
    "Tectonic Plates": tectonicPlates
  };

  var myMap = L.map("map-id", {
    center: [37.09, -95.71],
    zoom: 2,
    layers: [satellite, earthquakes]
  });

  d3.json(tectonicPlatesURL, function(plateData) {
    L.geoJson(plateData, {
      color: "yellow",
      weight: 2
    }).addTo(tectonicPlates);
  });

  L.control
    .layers(baseMaps, overlayMaps, {
      collapsed: false
    })
    .addTo(myMap);

  var legend = L.control({
    position: "bottomright"
  });

  legend.onAdd = function(map) {
    var div = L.DomUtil.create("div", "info legend"),
      grades = [0, 1, 2, 3, 4, 5],
      labels = [];

    // loop through intervals
    for (var i = 0; i < grades.length; i++) {
      div.innerHTML +=
        '<i style="background:' +
        getColor(grades[i] + 1) +
        '"></i> ' +
        grades[i] +
        (grades[i + 1] ? "&ndash;" + grades[i + 1] + "<br>" : "+");
    }

    return div;
  };

  legend.addTo(myMap);
}

// Create color and radius
function getColor(d) {
  return d > 5
    ? "#800026"
    : d > 4
    ? "#BD0026"
    : d > 3
    ? "#E31A1C"
    : d > 2
    ? "#FD8D3C"
    : d > 1
    ? "#FED976"
    : "#FFEDA0";
}

// Change the magnitude of the earthquake by a factor of 25,000 for the radius of the circle.
function getRadius(value) {
  return value * 55000;
}