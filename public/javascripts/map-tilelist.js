$(document).ready(function(){
  $('.button.maptilesheet-hide').click(function(event){
    if( $(this).prop('checked')){
      $(this).next('ul').hide(300);
      $(this).button('option','label','Show Tile Sheet');
    }else{
      $(this).next('ul').show(300);
      $(this).button('option','label','Hide Tile Sheet');
    }
  });
});


