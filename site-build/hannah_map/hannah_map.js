var accent = '#1b4a1d'
    
mapboxgl.accessToken = 'pk.eyJ1IjoiaGFubmFoa2VyIiwiYSI6ImNpdHEzcndkajAwYmwyeW1zd2UxdTAwMnMifQ.hYglJOOC0Mhq7xNYOxc6qg';
    
var map = new mapboxgl.Map({
    container: 'map-container2',
    style: 'mapbox://styles/hannahker/cka393ggw06m71ilam9a36pqn',
    center: [-123.116226, 49.246292],
    zoom: 4
});
    
// ------------------------------------------------ WHEN THE MAP LOADS
map.on('load', function() {
    
        // add scale bar to the map
        map.addControl(new mapboxgl.ScaleControl());
    
        document.getElementById("animals").onchange = function() {
            
        try {
            map.removeLayer(layerid)
            map.removeSource(layerid)
        }
        catch(error) {
            console.error;
        }
            
    
        // get the selected text from the dropdown menu
        var e = document.getElementById("animals");
		var result = e.options[e.selectedIndex].text;
        console.log(result)
        if(result == ('Coyotes in Albany')){
            tomap = 'hannah_map/coyotes.geojson'
        }
        if(result == ('Snakes in Memphis')){
            tomap = 'hannah_map/snakes.geojson'
        }
        if(result == ('Fishers in Albany')){
            tomap = 'hannah_map/fisher.geojson'
        }
            
        // ** help from class tutorial: example here https://docs.mapbox.com/mapbox-gl-js/example/live-update-feature/
        // access the data, stored in Github repo, published with Github Pages
        d3.json(tomap, function(err, data) {         
            
            if (err) throw err;
            
            
            // get all of the unique animals
            unique = []
            for(var i=0; i<data.features.length; i++){
                    if(!unique.includes(data.features[i].properties.animalID)){
                        unique.push(data.features[i].properties.animalID)
                    }
                }
            

                    
                    var selected = []              
                    for(var i=0; i<data.features.length; i++){
                        if(data.features[i].properties.animalID == unique[i]){
                            selected.push(data.features[i])
                        }
                    }

                    // loop through all elements to get coordinates list for that eagle
                    var coordinates = []
                    for(var i = 0; i<data.features.length; i++){
                       coordinates.push(data.features[i].geometry.coordinates)    
                    }
                
                    var ids = []
                    for(var i = 0; i<data.features.length; i++){
                       ids.push(data.features[i].properties.animalID)    
                    }
                    console.log(ids)
                    console.log(coordinates)
                
                    layerid = 'animals'

                    // add the selected data to the map
                    map.addSource(layerid, {
                        'type': 'geojson',
                        'lineMetrics': true,
                        'data': {
                            'type': 'Feature',
                            'properties': {},
                            'geometry': {
                            'type': 'LineString',
                            'coordinates': coordinates
                            }
                        }
                    });
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
                                'line-width': 4,
                                'line-opacity': 0.6
                            }

                    });
                
                // zoom to the bounds of the selected data
                // from https://docs.mapbox.com/mapbox-gl-js/example/zoomto-linestring/
                var bounds = coordinates.reduce(function(bounds, coord) {
                    return bounds.extend(coord);
                    }, new mapboxgl.LngLatBounds(coordinates[0], coordinates[0]));
                map.fitBounds(bounds, {
                    padding: 20
                });                

        });  
        }
});