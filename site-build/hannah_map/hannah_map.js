//Icons made by <a href="https://www.flaticon.com/authors/pause08" title="Pause08">Pause08</a> from <a href="https://www.flaticon.com/" title="Flaticon"> www.flaticon.com</a>


// ------------------------------------------------ BASIC STYLE ITEMS 
//var accent = '#004F2d'; // Dark green
var accent = '#FF6F59' // Pink
var opacity = 0.35; 
var width = 8; 

// ------------------------------------------------ SET UP THE MAP   
mapboxgl.accessToken = 'pk.eyJ1IjoiaGFubmFoa2VyIiwiYSI6ImNpdHEzcndkajAwYmwyeW1zd2UxdTAwMnMifQ.hYglJOOC0Mhq7xNYOxc6qg'; 
var map = new mapboxgl.Map({
    container: 'map-container2',
    //style: 'mapbox://styles/hannahker/cka393ggw06m71ilam9a36pqn',
    style: 'mapbox://styles/mapbox/satellite-v9',
    center: [-73.839349,42.695589], 
    zoom: 10
});


// ------------------------------------------------ ZOOM TO THE COORDINATES 
function zoomTo(coords){
    // zoom to the bounds of the selected data
    // from https://docs.mapbox.com/mapbox-gl-js/example/zoomto-linestring/
    var bounds = coords.reduce(function(bounds, coord) {
        return bounds.extend(coord);
        }, new mapboxgl.LngLatBounds(coords[0], coords[0]));
    map.fitBounds(bounds, {
        padding: 100
    }); 
}

// ------------------------------------------------ SELECT THE APPROPRIATE DATA 
function getLink(div){
        
        var result = div.options[div.selectedIndex].text;
        var fill = document.getElementById('description')
        // Decide which data to display 
        if(result == ('Coyotes in Albany')){
            fill.innerHTML = 'Some info about coyotes in here';
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
    // Clear the popup boxes
    document.getElementById('animal-info').classList.remove('bg-light')
    document.getElementById('animal-info').classList.remove('shadow-box')
    // Empty the comments div
    document.getElementById('comments').innerHTML = '';
    document.getElementById('stats').innerHTML = '';
    // Put all the data back on the map 
    map.getSource('all').setData(allData);

}

// ------------------------------------------------ GET THE DIFFERENCE BETWEEN TWO TIMESTAMPS
function getTimeDiff(t1, t2){
    // get the first timestamp
    var date1 = new Date(t1)
    
    // get the last timestamp
    var date2 = new Date(t2)

    // To calculate the time difference of two dates
    // https://www.geeksforgeeks.org/how-to-calculate-the-number-of-days-between-two-dates-in-javascript/
    var diff = date2.getTime() - date1.getTime(); 

    // To calculate the no. of minutes between two dates 
    var mins = diff / (1000 * 3600); 
    
    // return the total number of minutes, rounded to nearest day
    // https://stackoverflow.com/questions/11832914/round-to-at-most-2-decimal-places-only-if-necessary
    return(Math.round((mins + Number.EPSILON) * 100)/100)
}

// ------------------------------------------------ GET THE TOTAL DISTANCE IN LIST OF COORDS
function getDist(coords){
    // variables for total and current distance
    var totDist = 0;
    var curDist = 0;
    
    // loop through all coordinates points  
    for(var i=0; i<(coords.length-1); i++){
        
        // calculate distance between current point and last point
        curDist = turf.distance(coords[i], coords[i+1])
        
        // add current distance to previous distances 
        totDist = (totDist + curDist);
    }
    // return total distance, rounded to the nearest km
    return(Math.round(totDist*100)/100);
    //return(Math.round(totDist*1000));
    //return(totDist)
}

// ------------------------------------------------ ANIMATE THE PATH
function animatePath(){
    var status = document.getElementById('animate').innerHTML;
    var aInfo = document.getElementById('animal-info') // Div for the timer 
    
    go = true;  // variable to stop the function - global scope 
    
    // Stop the animation
    if(status=='Stop'){
        document.getElementById('animate').innerHTML= ('Animate'); 
        go = false; // Stop the animation
        aInfo.classList.remove('bg-light')
        aInfo.classList.remove('shadow-box')
    }
    
    // Animate a path 
    if(status=='Animate'){
        
        // Get a random animal to animate and select the right data 
        var num = Math.floor(Math.random() * Math.floor(allData.features.length));
        document.getElementById('animate').innerHTML= ('Stop'); 
        coordinates = allData.features[num].geometry.coordinates;

        // Add the timer and animal info style
        aInfo.classList.add('bg-light')
        aInfo.classList.add('shadow-box')
        
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
            'properties': {
                'diff': 0
            },
            'geometry': {
                'type': 'Point',
                'coordinates': []
            }
        }
        // Set the data source 
        map.getSource('animated').setData(path)
        
        // Remove the all data layer 
        map.getSource('all').setData(path)
        
        // Add more coordinates to the list and update the map 
        // Help from: https://docs.mapbox.com/mapbox-gl-js/example/live-update-feature/ 
        var i = 0; 
        var timeDiff = []; 
        totTime = [];
        totDist = []; 
        var timer = window.setInterval(function(){
            if(go==true){ // Only run until someone pushes the button again
               if(i<coordinates.length){
                   
                    // Check if the current coordinate is also a true coordinate    
                    for(var j=0; j<trueCoords.length; j++){
                        if(coordinates[i]==trueCoords[j][2]){
                            
                            // Get a list of all the times 
                            timeDiff.push(trueCoords[j][1])
 
                            // Get the time difference 
                            tlength = timeDiff.length;
                            
                            diff = 0; 
                            if(i>0){ // So that it's not the first one 
                                diff = getTimeDiff(timeDiff[tlength-2], timeDiff[tlength-1]);
                                point.properties.diff = diff;
                                console.log(diff)
                            }
                            
                            total = getTimeDiff(timeDiff[0], timeDiff[tlength-1])
                            
                            // Set the new data source 
                            point.geometry.coordinates = trueCoords[j][2];
                            map.getSource('point').setData(point);
                            
                            // Update the time 
                            document.getElementById('time').innerHTML = trueCoords[j][1];
                            
                            // Add in the animal info
                            if(i<5){
                                document.getElementById('comments').innerHTML = trueCoords[j][3];
                            }
                            
                            // Calculate the total distance 
                            dist = getDist(path.geometry.coordinates)
                            // Add the total time and distance 
                            document.getElementById('stats').innerHTML = dist + ' km in ' + total + ' hours.'
                            
                            totTime.push(total)
                            totDist.push(dist)
  
                        }
                        
                    }

                    // Add the new coordinates
                    path.geometry.coordinates.push(coordinates[i]);
                    map.getSource('animated').setData(path);
                   
        
                   
                    // Control the zoom
                    //map.setPitch(60);
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
    // Add the zoom controls
    
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
                //'line-color': '#FF6F59',
                'line-width': 10,
                'line-blur': 0.75,
                //'line-opacity': 0.3,
                'line-gradient': [
                    'interpolate',
                    ['linear'],
                    ['line-progress'],
                    0,'rgba(255, 111, 89, 0)',
                    0.1,'rgba(255, 111, 89, 0.1)',
                    0.3,'rgba(255, 111, 89, 0.2)',
                    0.5,'rgba(255, 111, 89, 0.85)',
                    1,'rgba(255, 111, 89, 1)']
                    
                /*'interpolate',
                ['linear'],
                ['line-progress'],
                0,'rgba(0, 79, 45, 0)',
                0.1,'rgba(0, 79, 45, 0.1)',
                0.3,'rgba(0, 79, 45, 0.2)',
                0.5,'rgba(0, 79, 45, 0.4)',
                1,'rgba(0, 79, 45, 0.85)']  */               
                
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
            'circle-color': {
                property: 'diff',
                stops: [[0.5, accent], [2, '#004F2d']]
            },
            'circle-radius': 15,
            'circle-opacity': 1,
            'circle-blur':0.3
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
                                data.features[i].geometry.coordinates,
                                data.features[i].properties.comments) // **** ONLY WORKS WITH THE FISHER DATA
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