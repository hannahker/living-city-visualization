// ------------------------------------------------------------------------------------------------ 
// SETUP
// ------------------------------------------------------------------------------------------------

// ------------------------------------------------ BASIC STYLE ITEMS 
var accent = '#FF6F59' // Pink
var opacity = 0.35; 
var width = 10; 

// ------------------------------------------------ SET UP THE MAP   
mapboxgl.accessToken = 'pk.eyJ1IjoiaGFubmFoa2VyIiwiYSI6ImNpdHEzcndkajAwYmwyeW1zd2UxdTAwMnMifQ.hYglJOOC0Mhq7xNYOxc6qg'; 
var map = new mapboxgl.Map({
    container: 'map-container2',
    //style: 'mapbox://styles/hannahker/cka393ggw06m71ilam9a36pqn',
    //style: 'mapbox://styles/mapbox/satellite-v9',
    style: 'mapbox://styles/hannahker/ckaom3qmp07x71iqpo9ec07ey',
    center: [-73.839349,42.695589], 
    zoom: 10
});

// ------------------------------------------------------------------------------------------------ 
// FUNCTIONS
// ------------------------------------------------------------------------------------------------

// ------------------------------------------------ ZOOM TO THE COORDINATES 
function zoomTo(coords){
    // zoom to the bounds of the selected data
    // from https://docs.mapbox.com/mapbox-gl-js/example/zoomto-linestring/
    var bounds = coords.reduce(function(bounds, coord) {
        return bounds.extend(coord);
        }, new mapboxgl.LngLatBounds(coords[0], coords[0]));
    map.fitBounds(bounds, {
        padding: {top: 100, bottom:100, left: 50, right: 230}
    }); 
}

// ------------------------------------------------ CLEAR THE ANIMATION LAYER 
function clearAnimate(){
    // Remove the data 
    path.geometry.coordinates = []
    map.getSource('animated').setData(path);
    point.geometry.coordinates = [];
    map.getSource('point').setData(point); 
    // Empty the timer div 
    document.getElementById('time').classList.remove('info-h')
    document.getElementById('time').classList.remove('shadow-box')
    document.getElementById('time').innerHTML = '';
    // Put all the data back on the map 
    map.getSource('all').setData(allData);
    map.getSource('highlight').setData(selected);
    zoomTo(selected.geometry.coordinates)
    // Clear the legend
    document.getElementById('legend').classList.remove('image')
    document.getElementById('legend').classList.add('image-s')
}

// ------------------------------------------------ CLEAR THE HIGHLIGHTED LAYER 
function clearHighlight(){ 
    // Empty data
    empty = {
                    'type': 'Feature',
                    'properties': {
                        'comment': '',
                        'id': ''
                    },
                    'geometry': {
                        'type': 'LineString',
                        'coordinates': []
                    }
                }
    // Set the empty highlight layer 
    map.getSource('highlight').setData(empty);
    // Clear the content of the comments div and remove from view 
    document.getElementById('comments').innerHTML = '';
    document.getElementById('comments').classList.remove('info-h');
    document.getElementById('comments').classList.remove('shadow-box');  
}

// ------------------------------------------------ CLEAR THE LINE-GRAPH
function clearGraph(){
    // Clear the div previously 
    document.getElementById('graph').innerHTML = '';
    // Clear the styling 
    document.getElementById('graph').classList.remove('full'); 
    // Change status for the next click
    document.getElementById('line-graph').innerHTML = 'Show graph';
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
    
    // If there is only one coordinate set
    if(coords.length<2){
        return(0)
    }
    
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
}

// ------------------------------------------------ ANIMATE THE PATH
function animatePath(){
    
    // Check if a fisher has been selected yet
    if(ID_Fish == 0){
        alert("Please select a fisher before viewing the animation.");
        return;
    }
    
    // Clear the graph 
    clearGraph();
    
    var status = document.getElementById('animate').innerHTML;
    var aInfo = document.getElementById('animal-info') // Div for the timer 
    
    go = true;  // variable to stop the function - global scope 
    
    // Stop the animation
    if(status=='Stop'){
        document.getElementById('animate').innerHTML= ('Animate'); 
        go = false; // Stop the animation
    }
    
    // Animate a path 
    if(status=='Animate'){
        
        // Change the button text
        document.getElementById('animate').innerHTML= ('Stop');
        
        // Get the selected coordinates 
        coordinates = selected.geometry.coordinates
        
        // Start with empty line data
        path = {'type': 'Feature', 'properties': {}, 'geometry': {'type': 'LineString', 'coordinates': []}}
        // Start with empty point data
        point = {'type': 'Feature', 'properties': {'diff': 0}, 'geometry': {'type': 'Point', 'coordinates': []}}
        
        // Set the data source 
        map.getSource('animated').setData(path)
        // Remove the all data layer 
        map.getSource('all').setData(path)
        // Remove the highlight layer 
        map.getSource('highlight').setData(path)
        
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
                            }
                            
                            total = getTimeDiff(timeDiff[0], timeDiff[tlength-1])
                            
                            // Set the new data source 
                            point.geometry.coordinates = trueCoords[j][2];
                            map.getSource('point').setData(point);
                            
                            var curTime = trueCoords[j][1]; // Current time 
                            var dist = getDist(path.geometry.coordinates) //Get the distance 
                            document.getElementById('legend').classList.remove('image-s')
                            document.getElementById('legend').classList.add('image')
                            document.getElementById('time').classList.add('info-h')
                            document.getElementById('time').classList.add('shadow-box')                            
                            document.getElementById('time').innerHTML = curTime + '<br><br>'+ dist + ' km in ' + total + ' hours.';
                            
                            // Calculate the total distance 
                            // Add the total time and distance 
                            //document.getElementById('stats').innerHTML = dist + ' km in ' + total + ' hours.'
                            
                            totTime.push(total)
                            totDist.push(dist)
                        }  
                    }

                    // Add the new coordinates
                    path.geometry.coordinates.push(coordinates[i]);
                    map.getSource('animated').setData(path);
                   
                    // Control the zoom
                    zoomTo(path.geometry.coordinates);
                    i++;
                } 
                else{ // Stop if someone clicks the button again
                    window.clearInterval(timer);
                    document.getElementById('animate').innerHTML= ('Animate'); 
                    clearAnimate(); // Remove the data               
                } 
            }
            else{ // Timeout when the visualization finishes 
                window.clearInterval(timer);
                clearAnimate(); // Remove the data 
            }    
        }, 60);
    }    
}

// ------------------------------------------------ GET DETAILS FOR THE SELECTED DATA
function getSelected(selected_data){
    
    // Get the selected ID
    var sel_id = selected_data.properties.id;
    
    // Get the appropriate subset of the trueCoords list 
    var filtered = trueCoords.filter(function(obj){return obj[0] == sel_id;});
    
    // Get the total duration of the tracking 
    //var totTime = getTimeDiff(filtered[0][1], filtered[filtered.length-1][1])
    var start = filtered[0][1].split(" ")[0]
    var end = filtered[filtered.length-1][1].split(" ")[0]
    
    // Get the info for the animal
    var descr = filtered[0][3].split('kg')[0].concat('kg')    
    
    // Get the total distance travelled
    var allFiltCoords = []
    for(var i=0; i<filtered.length; i++){
        allFiltCoords.push(filtered[i][2])
    }
    var totDist = getDist(allFiltCoords)
    
    // Add the styling to the popup 
    document.getElementById('comments').classList.add('info-h')
    document.getElementById('comments').classList.add('shadow-box')
    
    // Write out the details to the div 
    document.getElementById('comments').innerHTML = 'You have selected <br><br><b>' + descr + '</b>,<br><br>' + 
        'who has travelled <b>' + Math.round(totDist) + ' km</b> between <br><b>' + start + '</b> and<br><b>' +
        end + '</b>';

    // Return the filtered true coords subset 
    return(filtered)
    
}

// ------------------------------------------------ MAKE THE BAR CHART
function makeGraph(){
    
    // Clear any ongoing animation
    go=false; 
    document.getElementById('animate').innerHTML= ('Animate');
    
    // File path for the data to load 
    load_data = '';
    
    // Access the appropriate data
    if(ID_Fish == 1){load_data = 'hannah_map/Fisher1.csv'}
    if(ID_Fish == 2){load_data = 'hannah_map/Fisher2.csv'}
    if(ID_Fish == 3){load_data = 'hannah_map/Fisher3.csv'}
    if(ID_Fish == 0){
        alert("Please select a fisher before viewing the chart.");
        return;
    }
    
    // Load in the data to plot on the chart
    d3.csv(load_data, function(data){
    
        // Either make or clear the graph
        var status = document.getElementById('line-graph').innerHTML;
        //console.log(status)

        // Make the graph 
        if(status=='Show graph'){

            document.getElementById('graph').classList.add("full"); // Add div styling 
            var svg = dimple.newSvg("#graph", '100%', '100%'); // Create the svg canvas 

            // With help from: https://stackoverflow.com/questions/17601105/how-do-i-convert-strings-from-csv-in-d3-js-and-be-able-to-use-them-as-a-dataset
            data.forEach(function(d){ d['Distance (km)'] = +d['Distance (km)']; }); 
            
            // Add a title 
            svg.append("text")
               .attr("x", 200)
               .attr("y", 20)
               .style("text-anchor", "middle")
               .style("font-family", "sans-serif")
               .style("font-weight", "bold")
               .text("Total Distance Travelled by Day");
            
            // Create the chart
            var chart = new dimple.chart(svg, data);
            var x = chart.addCategoryAxis("x", "Day");
            x.addOrderRule("Date");
            chart.addMeasureAxis("y", "Distance (km)");
            var s = chart.addSeries(null, dimple.plot.bar);
            chart.draw();
            
            // Change status for the next click
            document.getElementById('line-graph').innerHTML = 'Clear graph';
            return;
        
        }
    
        // Clear the graph 
        else if(status=='Clear graph'){
            clearGraph();
            return;
        }
        
    }); // End of load data
    
}
    
// ------------------------------------------------------------------------------------------------ 
// WHEN THE MAP LOADS
// ------------------------------------------------------------------------------------------------
map.on('load', function() {
    
    // Add scale bar to the map
    map.addControl(new mapboxgl.ScaleControl());
    // Add the zoom controls
    
// ------------------------------------------------ ADD THE BASE DATA LAYER 
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
    
    // ------------------------------------------------ ADD THE HIGHLIGHTED LAYER
    map.addSource('highlight', {
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
    
    // Outside
    map.addLayer({
        'id': 'hi',
        'type': 'line',
        'source': 'highlight',
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
    
    // Lightest
    map.addLayer({
        'id': 'hi_4',
        'type': 'line',
        'source': 'highlight',
        'layout': {
            'line-join': 'round',
            'line-cap': 'round'
            },
            'paint': {
                'line-color': '#ffd2cf',
                'line-width': 1,
                'line-opacity': 1
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

    // outside
   map.addLayer({
        'id': 'animated',
        'type': 'line',
        'source': 'animated',
        'layout': {
            'line-join': 'round',
            'line-cap': 'round'
            },
            'paint': {
                'line-width': 10,
                'line-blur': 0.5,
                'line-gradient': [
                    'interpolate',
                    ['linear'],
                    ['line-progress'],
                    0,'rgba(255, 111, 89, 0)',
                    0.1,'rgba(255, 111, 89, 0.1)',
                    0.3,'rgba(255, 111, 89, 0.2)',
                    0.5,'rgba(255, 111, 89, 0.7)',
                    1,'rgba(255, 111, 89, 0.9)']

            }
        
    });
        
    // Lightest
     map.addLayer({
        'id': 'animated_4',
        'type': 'line',
        'source': 'animated',
        'layout': {
            'line-join': 'round',
            'line-cap': 'round'
            },
            'paint': {
                'line-gradient': [
                    'interpolate',
                    ['linear'],
                    ['line-progress'],
                    0,'rgba(255, 210, 207, 0)',
                    0.1,'rgba(255, 210, 207, 0.1)',
                    0.3,'rgba(255, 210, 207, 0.2)',
                    0.5,'rgba(255, 210, 207, 0.85)',
                    1,'rgba(255, 210, 207, 1)']
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
            'circle-radius': 20,
            'circle-opacity': 1,
            'circle-blur':0.2
        }

    });   
        
// ------------------------------------------------------------------------------------------------ 
// WHEN THE DATA LOADS 
// ------------------------------------------------------------------------------------------------    
    // ** help from class tutorial: example here https://docs.mapbox.com/mapbox-gl-js/example/live-update-feature/
    d3.json('hannah_map/fishers_processed.geojson', function(err, data) { 
        
        // Variables to check if the user has selected a fisher yet
        ID_Fish = 0;
            
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
                                data.features[i].properties.comments)
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
            var com = ""
            var id = ""

            for(var i=0; i<data.features.length; i++){
                if(data.features[i].properties.ID == unique[j]){
                    com = data.features[i].properties.comments
                    id = data.features[i].properties.ID
                    coordinates.push(data.features[i].geometry.coordinates)
                }
            }
            // Define the data source 
            movement = {
                    'type': 'Feature',
                    'properties': {
                        'comment': com,
                        'id': id
                    },
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
        
// ------------------------------------------------------------------------------------------------ 
// WHEN THE USER SELECTS AN OPTION
// ------------------------------------------------------------------------------------------------ 
        document.getElementById("animals").onchange = function() {
            
            // Clear the graph 
            clearGraph();
        
            // Cancel any ongoing animation
            go=false; 
            document.getElementById('animate').innerHTML= ('Animate');

            // Get the text from the select an animal button
            var div = document.getElementById("animals")
            var result = div.options[div.selectedIndex].text;
            
            // Reset the selection if...
            if(result=='Select an animal'){
                ID_Fish = 0;
                clearHighlight();
                zoomTo(allCoords);
                return;
            }
                
            // Get the number to select 
            result = result.split(" ")[1]

            // Select the appropriate fisher from the feature collection
            selected = allData.features[result-1]

            // Zoom to the selected fisher 
            zoomTo(selected.geometry.coordinates)   

            // Set the source for the highlighted data
            map.getSource('highlight').setData(selected);

            // Show the selected info 
            getSelected(selected)

            //ID_test = selected.properties.id;
            ID_Fish = result;            
            
        } // End of function on button change 
        
    });  // End of data load 
        
}); // End of on map load 