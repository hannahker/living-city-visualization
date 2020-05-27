// This JS file is to control the play button

function addDate(){ // Control the add date button
    var date=document.getElementById('slider')['value'];
    if (Number(date)<document.getElementById('slider')['max']){
        document.getElementById('slider')['value']=Number(date)+1;
        var label=document.getElementById("filters");
        for (var i=0; i< label.children.length;i++) // Traversal the layer control input, and find the checked input
            if (label.children[i].checked==true){  // if the input is found, and set date
                setDate((Number(date)+1),label.children[i].id);
            }
    }
}
function minusDate(){ // Control the minus date button
    var date=document.getElementById('slider')['value'];
    if (Number(date)>document.getElementById('slider')['min']){
        document.getElementById('slider')['value']=Number(date)-1;
        var label=document.getElementById("filters");
        for (var i=0; i< label.children.length;i++) //similar to the above function
            if (label.children[i].checked==true){
                setDate((Number(date)-1),label.children[i].id);
            }
    }
}
function autoPlay(){  // Control the auto play button
    var currentButton=document.getElementById("autoPlay").className;
    if (currentButton=='play'){// if the button is clicked, the addDate function will be called per 1s
        addDate();
        document.getElementById("autoPlay").className='pause';// the button class become to pause
        interval=setInterval("addDate()",1000) //global variable
    }
    else if (currentButton='pause'){ // if the button is clicked in pause state, the autoplay will be clear (removed)
        document.getElementById("autoPlay").className='play';
        clearInterval(interval)
    }
}
