//Icons made by <a href="https://www.flaticon.com/authors/pause08" title="Pause08">Pause08</a> from <a href="https://www.flaticon.com/" title="Flaticon"> www.flaticon.com</a>


// ------------------------------------------------ BASIC STYLE ITEMS 
var accent = '#1b4a1d'; // Dark green
//var accent = '#F45B69' // Pink
var opacity = 0.03; 
var width = 5; 

// ------------------------------------------------ TEXT TO POPULATE THE SITE
var coyoteInfo = 'Put some info about urban coyotes here. General notes: <p> Not much crossing the highway, largely moving in green spaces, but see that one that is in a fully urban area. </p>'

// ------------------------------------------------ SET UP THE MAP   
mapboxgl.accessToken = 'pk.eyJ1IjoiaGFubmFoa2VyIiwiYSI6ImNpdHEzcndkajAwYmwyeW1zd2UxdTAwMnMifQ.hYglJOOC0Mhq7xNYOxc6qg'; 
var map = new mapboxgl.Map({
    container: 'map-container2',
    style: 'mapbox://styles/hannahker/cka393ggw06m71ilam9a36pqn',
    //style: 'mapbox://styles/mapbox/satellite-v9',
    center: [-97.839425,38.510370],
    zoom: 3
});

// ------------------------------------------------ ZOOM TO THE COORDINATES 
function zoomTo(coords){
    // zoom to the bounds of the selected data
    // from https://docs.mapbox.com/mapbox-gl-js/example/zoomto-linestring/
    var bounds = coords.reduce(function(bounds, coord) {
        return bounds.extend(coord);
        }, new mapboxgl.LngLatBounds(coords[0], coords[0]));
    map.fitBounds(bounds, {
        padding: 20
    }); 
}

// ------------------------------------------------ SELECT THE APPROPRIATE DATA 
function getLink(div){
        
        var result = div.options[div.selectedIndex].text;
        var fill = document.getElementById('description')
        // Decide which data to display 
        if(result == ('Coyotes in Albany')){
            fill.innerHTML = coyoteInfo;
            return('hannah_map/coyotes_processed.geojson');
        }
        if(result == ('Snakes in Memphis')){
            fill.innerHTML = 'Put some info about urban copperhead snakes here.'
            return('hannah_map/snakes_processed.geojson');
        }
        if(result == ('Fishers in Albany')){
            return('hannah_map/fishers_processed.geojson');
        }
    }

// ------------------------------------------------ CLEAR THE ANIMATION LAYER 
function clearAnimate(){
    // Remove the data 
    path.geometry.coordinates = []
    map.getSource('animated').setData(path);
    point.geometry.coordinates = [];
    map.getSource('point').setData(point);
    
    // Empty the timer div 
    document.getElementById('time').innerHTML = '';
}

// ------------------------------------------------ ANIMATE THE PATH
function animatePath(){
    var status = document.getElementById('animate').innerHTML;
    go = true;  // variable to stop the function - global scope 
    
    // Stop the animation
    if(status=='Stop'){
        document.getElementById('animate').innerHTML= ('Animate'); 
        go = false; // Stop the animation
    }
    
    // Animate a path 
    if(status=='Animate'){
        // Get a random animal to animate and select the right data 
        var num = Math.floor(Math.random() * Math.floor(allData.features.length));
        document.getElementById('animate').innerHTML= ('Stop'); 
        coordinates = allData.features[num].geometry.coordinates;
        //zoomTo(coordinates);
        
        // Start with empty line data
        path = {
            'type': 'Feature',
            'properties': {},
            'geometry': {
                'type': 'LineString',
                'coordinates': []
            }
        }
        
        // Start with empty point data
        point = {
            'type': 'Feature',
            'properties': {},
            'geometry': {
                'type': 'Point',
                'coordinates': []
            }
        }
        // Set the data source 
        map.getSource('animated').setData(path)
        
        // Add more coordinates to the list and update the map 
        // Help from: https://docs.mapbox.com/mapbox-gl-js/example/live-update-feature/ 
        var i = 0; 
        var timer = window.setInterval(function(){
            if(go==true){ // Only run until someone pushes the button again
               if(i<coordinates.length){
                   
                    // Check if the current coordinate is also a true coordinate    
                    for(var j=0; j<trueCoords.length; j++){
                        if(coordinates[i]==trueCoords[j][2]){
                            point.geometry.coordinates = trueCoords[j][2];
                            map.getSource('point').setData(point);
                            document.getElementById('time').innerHTML = trueCoords[j][1];
                        }
                    }
                   
                    // Add the new coordinates
                    path.geometry.coordinates.push(coordinates[i]);
                    map.getSource('animated').setData(path);
                   
                    // Control the zoom
                    map.setPitch(60);
                    zoomTo(path.geometry.coordinates);
                    i++;
                } 
                else{
                    // Stop if someone clicks the button again
                    window.clearInterval(timer);
                    document.getElementById('animate').innerHTML= ('Animate'); 
                    // Remove the data 
                    clearAnimate();
                } 
            }
            else{
                // Timeout when the visualization finishes 
                window.clearInterval(timer);
                // Remove the data 
                clearAnimate();
            }
            
        }, 60);
    
    }
  
    
}
    
// ------------------------------------------------------------------------------------------------ 
// WHEN THE MAP LOADS
// ------------------------------------------------------------------------------------------------
map.on('load', function() {
    
    // Add scale bar to the map
    map.addControl(new mapboxgl.ScaleControl());
    
// ------------------------------------------------ ADD THE BASE DATA EMPTY LAYER/SOURCE  
    map.addSource('all', {
        'type': 'geojson',
        'lineMetrics': true,
        'data': {
                'type': 'Feature',
                'properties': {},
                'geometry': {
                    'type': 'LineString',
                    'coordinates': []
                }
            }
    });

    // Add data layer 
    map.addLayer({
        'id': 'all',
        'type': 'line',
        'source': 'all',
        'layout': {
            'line-join': 'round',
            'line-cap': 'round'
            },
            'paint': {
                'line-color': accent,
                'line-width': width,
                'line-opacity': opacity
            }

    });

// ------------------------------------------------ ADD THE ANIMATED LAYER 
    map.addSource('animated', {
    'type': 'geojson',
    'lineMetrics': true,
    'data': {
            'type': 'Feature',
            'properties': {},
            'geometry': {
                'type': 'LineString',
                'coordinates': []
            }
        }
    });

    // Add data layer 
    map.addLayer({
        'id': 'animated',
        'type': 'line',
        'source': 'animated',
        'layout': {
            'line-join': 'round',
            'line-cap': 'round'
            },
            'paint': {
                'line-color': accent,
                'line-width': width,
                //'line-opacity': 0.3,
                'line-gradient': [
                'interpolate',
                ['linear'],
                ['line-progress'],
                0,'rgba(24, 67, 17, 0)',
                0.1,'rgba(24, 67, 17, 0.1)',
                0.3,'rgba(24, 67, 17, 0.2)',
                0.5,'rgba(24, 67, 17, 0.4)',
                1,'rgba(24, 67, 17, 1)']
                    
                
                /*[
                'interpolate',
                ['linear'],
                ['line-progress'],
                0,'#c2edbb',
                0.1,'#86db78',
                0.3,'#4ac935',
                0.5,'#318623',
                1,'#184311']*/
            }

    });

// ------------------------------------------------ ADD THE POINT LAYER 
    map.addSource('point', {
    'type': 'geojson',
    'data': {
            'type': 'Feature',
            'properties': {},
            'geometry': {
                'type': 'Point',
                'coordinates': []
            }
        }
    });
    
    // Add data layer 
    map.addLayer({
        'id': 'point',
        'type': 'circle',
        'source': 'point',
        'paint': {
            'circle-color': accent,
            'circle-radius': 8,
            'circle-opacity': 1
           // 'circle-opacity-transition': {duration:20}
        }

    });
    
// ------------------------------------------------------------------------------------------------ 
// WHEN THE USER SELECTS AN OPTION
// ------------------------------------------------------------------------------------------------ 
    document.getElementById("animals").onchange = function() {
        
        // Cancel any ongoing animation
        go=false; 
        document.getElementById('animate').innerHTML= ('Animate');
        
    tomap = getLink(document.getElementById("animals"))
        
// ------------------------------------------------------------------------------------------------ 
// WHEN THE DATA LOADS 
// ------------------------------------------------------------------------------------------------    
    // ** help from class tutorial: example here https://docs.mapbox.com/mapbox-gl-js/example/live-update-feature/
    d3.json(tomap, function(err, data) {         
            
        if (err) throw err;

// ------------------------------------------------ GET UNIQUE IDS AND LIST OF ALL COORDINATES
        var unique = [] // All of the unique animal IDs
        var allCoords = [] // All of the coordinates in the data (with interpolated)
        trueCoords = [] // All of the true coordinates in the data - GLOBAL SCOPE
        for(var i=0; i<data.features.length; i++){
            triple = []; 
                if(!unique.includes(data.features[i].properties.ID)){
                    unique.push(data.features[i].properties.ID)
                }
                if(data.features[i].properties.TRUE=='TRUE'){
                    triple.push(data.features[i].properties.ID,
                                data.features[i].properties.time,
                                data.features[i].geometry.coordinates)
                    trueCoords.push(triple)
                }
                allCoords.push(data.features[i].geometry.coordinates)
            }

        zoomTo(allCoords)
        
// ------------------------------------------------ RESTRUCTURE ALL THE DATA 
        // Add all the data to the map
        allData = {
            'type': 'FeatureCollection',
            'features': []
        }

        // Loop through all the ids 
        for(var j=0; j<unique.length; j++){

            var coordinates = []  

            for(var i=0; i<data.features.length; i++){
                if(data.features[i].properties.ID == unique[j]){
                    coordinates.push(data.features[i].geometry.coordinates)
                }
            }
            // Define the data source 
            movement = {
                    'type': 'Feature',
                    'properties': {},
                    'geometry': {
                        'type': 'LineString',
                        'coordinates': coordinates
                    }
                }                
            // Add to the whole dataset 
            allData.features.push(movement)
        }

// ------------------------------------------------ SET THE NEW DATA SOURCE 
        map.getSource('all').setData(allData);


        

        // Add animated path of one animal in the dataset 
       function addData(ID){
            // Define the layer name 
            layerid = 'animals';

            // Get just the coordinates for a selected animalID       
            var coordinates = []  
            for(var i=0; i<data.features.length; i++){
                if(data.features[i].properties.ID == ID){
                    coordinates.push(data.features[i].geometry.coordinates)
                }
            }

            // Define the data source 
            movement = {
                    'type': 'Feature',
                    'properties': {},
                    'geometry': {
                        'type': 'LineString',
                        'coordinates': coordinates
                    }
                }

            // Add data source 
            map.addSource(layerid, {
                'type': 'geojson',
                'lineMetrics': true,
                'data': movement
            });


            // Add data layer 
            map.addLayer({
                'id': layerid,
                'type': 'line',
                'source': layerid,
                'layout': {
                    'line-join': 'round',
                    'line-cap': 'round'
                    },
                    'paint': {
                        'line-color': accent,
                        'line-width': 10,
                        'line-opacity': 0.6,
                        'line-gradient': [
                        'interpolate',
                        ['linear'],
                        ['line-progress'],
                        0,
                        '#c2edbb',
                        0.1,
                        '#86db78',
                        0.3,
                        '#4ac935',
                        0.5,
                        '#318623',
                        0.7,
                        '#184311',
                        1,
                        '#000000'
                        ]
                    }

            });

            // Add more coordinates to the list and update the map 
            // Help from: https://docs.mapbox.com/mapbox-gl-js/example/live-update-feature/ 
            var i = 0; 
            var timer = window.setInterval(function(){
                if(i<coordinates.length){
                    movement.geometry.coordinates.push(coordinates[i]);
                    map.getSource(layerid).setData(movement);
                    
                    // Check with the true coordinates
                    //for(var )
                    
                    i++;
                } else{
                    window.clearInterval(timer);
                }
            }, 500);

        } // End of the addData function - DON'T THINK WE NEED THIS FUNCTION ANYMORE    

        });  // End of data load 
            
        } // End of function on button change 
        
}); // End of on map load 