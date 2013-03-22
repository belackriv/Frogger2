$(document).ready(function(){
  var map = new FroggerMap('map_viewport',1280,720);
  var actions = {
    'Scroll Left': map.scrollLeft,
    'Scroll Up': map.scrollUp,
    'Scroll Right': map.scrollRight,
    'Scroll Down' : map.scrollDown,
    'Zoom In' : map.zoomIn,
    'Zoom Out' : map.zoomOut
  };
  var bindings = {
    37: 'Scroll Left',
    38: 'Scroll Up',
    39: 'Scroll Right',
    40: 'Scroll Down',
    107: 'Zoom In',
    109: 'Zoom Out'
  };
  map.load($('#map_viewport').attr('name'), function(){
    $(window).on('mousewheel', function(event){
      if( event.originalEvent.wheelDeltaY > 0){
        map.zoomIn();
      } else {
        map.zoomOut();
      }
    });
    $(window).keydown(function(event){
      if(bindings[event.which]){
        actions[bindings[event.which]].call(map);
      }
    });
  });
});

function doLoop(map,stage) {
  
}
