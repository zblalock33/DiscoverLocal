require([
    "esri/config", 
    "esri/Map", 
    "esri/views/MapView", 
    "esri/widgets/Search",
    "esri/layers/FeatureLayer",
    "esri/Graphic"
  ], function(esriConfig, Map, MapView, Search, FeatureLayer,Graphic) {

      esriConfig.apiKey = "AAPK612e73527e6c46738fb31fd7d030b6b1WYykMd_XA3IY3DfR4HA2lXy14UdWbOijIJYcfPMb9CqP7B_gvsbt_yy67N61TfuU";

      const map = new Map({
            basemap: "satellite"
      });

      const view = new MapView({
            container: "viewDiv",
            map: map,
            center: [-98.5795, 39.8283],
            zoom: 3,
            ui: {
              components: ["attribution"]
            }
      });

        // Define and initialize the Search widget
        var locationSearchWidget = new Search({
        view: view
      });

      // Define the popup template with a link to the survey
const popupTemplate = {
        title: "{venue_name}",
        content: [
          {
            type: "fields",
            fieldInfos: [
              {
                fieldName: "venue_name",
                label: "Venue Name"
              },
              {
                fieldName: "venue_type",
                label: "Venue Type"
              },
              {
                fieldName: "add_venue_location",
                label: "Venue Location"
              }
              // ... [add other fields as needed] ...
            ]
          },
          {
            type: "text",
            text: "<a href='https://arcg.is/1XnO550' target='_blank'>Take the Survey</a>"
          }
        ]
      };

      // Apply the popup template to the feature layer
      const layer = new FeatureLayer({
        url: "https://services.arcgis.com/LBbVDC0hKPAnLRpO/arcgis/rest/services/survey123_16f8e266ef6b421fb8c2537c5941b2f9_results/FeatureServer",
        outFields: ["*"],
        popupTemplate: popupTemplate
      });



      let currentWidget = ''; // Track the current widget

      document.getElementById('actionSelect').addEventListener('change', function(event) {
        toggleWidgets(event.target.value);
      });

      function toggleWidgets(action) {
        // Hide all widgets and iframe
        document.getElementById('searchWidgetDiv').style.display = 'none';
        document.getElementById('venueSearchDiv').style.display = 'none';
        document.getElementById('surveyContainer').style.display = 'none';
        if (currentWidget) {
          view.ui.remove(locationSearchWidget);
        }

        if (currentWidget === action) {
          currentWidget = '';
          return;
        }

        currentWidget = action;

        // Show the selected widget or iframe
        switch(action) {
          case 'searchLocation':
            view.ui.add(locationSearchWidget, "top-right");
            document.getElementById('searchWidgetDiv').style.display = 'block';
            break;
          case 'searchVenues':
            document.getElementById('venueSearchDiv').style.display = 'block';
            break;
          case 'addVenue':
            document.getElementById('surveyContainer').style.display = 'block';
            break;
        }
      }


      // Venue Search Functionality
      document.getElementById('searchButton').addEventListener('click', function() {
        var venueName = document.getElementById('venueNameInput').value.trim();
        var venueType = document.getElementById('venueTypeInput').value.trim();
        performVenueSearch(venueName, venueType);
      });

      function performVenueSearch(venueName, venueType) {
var query = layer.createQuery();
var whereClause = [];

if (venueName) {
  whereClause.push("venue_name LIKE '%" + venueName.replace(/'/g, "''") + "%'");
}
if (venueType) {
  whereClause.push("venue_type = '" + venueType.replace(/'/g, "''") + "'");
}

query.where = whereClause.join(' AND ');
query.returnGeometry = true;
query.outFields = ["*"]; // You can specify fields if you don't need all of them

layer.queryFeatures(query).then(function(results) {
  if (results.features.length > 0) {
    // Define a symbol for displaying the found features as markers
    var markerSymbol = {
      type: "simple-marker", // autocasts as new SimpleMarkerSymbol()
      color: [226, 119, 40], // Orange
      outline: {
        color: [255, 255, 255], // White
        width: 2
      }
    };

    // Remove any existing graphics (if necessary)
    view.graphics.removeAll();

    // Loop through each feature returned from the query
    results.features.forEach(function(feature) {
      // Create a graphic for each feature using the symbol defined above
      var graphic = new esri.Graphic({
        geometry: feature.geometry,
        symbol: markerSymbol
      });

      // Add the graphic to the map view
      view.graphics.add(graphic);
    });

    // Zoom the map to the bounds of the returned features
    view.goTo(results.features.map(function(feature) {
      return feature.geometry;
    }));
  } else {
    console.log("No results found.");
    // Inform the user that no results were found
  }
}).catch(function(error) {
  console.error("Search failed: ", error);
});
}

  });