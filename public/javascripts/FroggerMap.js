
function FroggerMap(containerId,viewportWidth,viewportHeight) {
  this.containerId = containerId;
  this.data = {};
  this.offset = {
    x: 0,
    y: 0
  };
  this.scale = {
    x: 1,
    y: 1
  }
  this.viewport = {
    width: viewportWidth,
    height: viewportHeight
  };
  this.defaultFloatingTileIndex = 0;
  this.bgLayer = $('<canvas>').attr('width',this.viewport.width).attr('height',this.viewport.height).css('position','absolute').get(0);
	return this;
};

FroggerMap.prototype.getScale = function(){
  return this.scale;
};

FroggerMap.prototype.setScale = function(scale){
  this.scale = scale;
};

FroggerMap.prototype.getOffset = function(){
  return this.offset;
};

FroggerMap.prototype.setOffset = function(offset){
  this.offset = offset;
};

FroggerMap.prototype.scrollLeft = function() {
  var self = this;
  var curOffset = self.getOffset();
  var newOffset = {}; 
  newOffset.x = curOffset.x + self.data.tileWidth;
  newOffset.y = curOffset.y;
  self.setOffset(newOffset);
  self.render();
};

FroggerMap.prototype.scrollUp = function() {
  var self = this;
  var curOffset = self.getOffset();
  var newOffset = {}; 
  newOffset.x = curOffset.x;
  newOffset.y = curOffset.y + self.data.tileHeight;
  self.setOffset(newOffset);
  self.render();
};

FroggerMap.prototype.scrollRight = function() {
  var self = this;
  var curOffset = self.getOffset();
  var newOffset = {}; 
  newOffset.x = curOffset.x - self.data.tileWidth;
  newOffset.y = curOffset.y;
  self.setOffset(newOffset);
  self.render();
};

FroggerMap.prototype.scrollDown = function() {
  var self = this;
  var curOffset = self.getOffset();
  var newOffset = {}; 
  newOffset.x = curOffset.x;
  newOffset.y = curOffset.y - self.data.tileHeight;
  self.setOffset(newOffset);
  self.render();
};

FroggerMap.prototype.zoomIn = function() {
  var self = this;
  var curScale = self.getScale();
  var newScale = {}; 
  newScale.x = curScale.x + .2;
  newScale.y = curScale.y + .2;
  self.setScale(newScale);
  self.render();
};

FroggerMap.prototype.zoomOut = function() {
  var self = this;
  var curScale = self.getScale();
  var newScale = {}; 
  newScale.x = curScale.x - .2;
  newScale.y = curScale.y - .2;
  self.setScale(newScale);
  self.render();
};

FroggerMap.prototype.load = function(mapName, callback) {
  var self = this;
  self.name = mapName;
  $.getJSON('/map/'+mapName, function(mapObj){
    self.data = mapObj;
    $('#'+self.containerId).append(self.bgLayer);
    self.loadTiles(function(){
      self.loadEntities(mapName,function(){
        self.render();
        if(typeof callback === 'function'){
          callback();
        }
      })
    });
  });
};

FroggerMap.prototype.loadEntities = function(mapName,callback) {
  $.getJSON('/map/'+mapName+'/entities', function(entities){
    self.enitites = entities;
    if(typeof callback === 'function'){
      callback();
    }
  });
};

FroggerMap.prototype.loadTiles = function(callback) {
  var self = this;
  var tileSheetsArray = self.data.tileSheets;
  var loadedImagesCount = 0;
  for(var i = 0; i < tileSheetsArray.length; i++){
    tileSheetsArray[i].img = new Image();
    tileSheetsArray[i].img.onload = function(){
      loadedImagesCount++;
      if(loadedImagesCount >= tileSheetsArray.length){
        if(typeof callback === 'function'){
          callback();
        }
      }
    };
    tileSheetsArray[i].img.src = '/images/'+tileSheetsArray[i].meta.image;
  }
};

FroggerMap.prototype.render = function(callback){
  var gridViewport = this.getGridAreaFromViewport();
  this.renderLayers(gridViewport, callback);
};

FroggerMap.prototype.getGridAreaFromViewport = function(){
  var self = this;
  var offset = self.getOffset();
  var scale = self.getScale();
  var gridXStart = -self.offset.x  / self.data.tileWidth;
  var gridYStart = -self.offset.y / self.data.tileHeight;
  var gridXEnd = ( self.viewport.width - self.offset.x * self.scale.x ) / (self.scale.x * self.data.tileWidth);
  var gridYEnd = ( self.viewport.height - self.offset.y * self.scale.y ) / (self.scale.y * self.data.tileHeight);
  gridXStart = gridXStart > 0?gridXStart:0;
  gridXEnd = gridXEnd < self.data.tilesX?gridXEnd:self.data.tilesX;
  gridYStart = gridYStart > 0?gridYStart:0;
  gridYEnd = gridYEnd < self.data.tilesY?gridYEnd:self.data.tilesY;
  return {
    gridXStart: Math.floor(gridXStart),
    gridYStart: Math.floor(gridYStart),
    gridXEnd: Math.ceil(gridXEnd),
    gridYEnd: Math.ceil(gridYEnd)
  }
};

FroggerMap.prototype.getTileFromTileIndex = function(tileIndex){
  var self = this;
  var indexOffset = 0;
  var frames = null;
  for(var i = 0; i < self.data.tileSheets.length; i++){
    frames = self.data.tileSheets[i].frames;
    if( typeof frames[tileIndex - indexOffset] !== 'undefined'){
      var tile = frames[tileIndex - indexOffset];
      tile.img =  self.data.tileSheets[i].img;
      return tile;
    } 
    indexOffset += frames.length;
  }
  
  var tile = frames[localTileIndex]
  self.data.tileSheets[self.tileSheetIndex].img;
};

FroggerMap.prototype.renderLayers = function(gridViewport,callback){
  var self = this;
  var layersRendered = 0;
  self.clearLayer();
  for(var i =0; i < self.data.layers.length;i++){
    self.renderLayerBorder(gridViewport);
    self.renderLayer(self.data.layers[i], gridViewport, function(){
      layersRendered++;
      if(layersRendered >= self.data.layers.length){
        self.bindViewportEvents(callback);
      }
    });
  }
};

FroggerMap.prototype.clearLayer = function(){
  var self = this;
  var ctx = self.bgLayer.getContext('2d');
  // Store the current transformation matrix
  ctx.save();
  // Use the identity matrix while clearing the canvas
  ctx.setTransform(1, 0, 0, 1, 0, 0);
  ctx.clearRect(0, 0, self.bgLayer.width, self.bgLayer.height);
  // Restore the transform
  ctx.restore();
};

FroggerMap.prototype.renderLayerBorder = function(gridViewport){
  var self = this;
  var ctx = self.bgLayer.getContext('2d');
  ctx.fillStyle = 'gray';
  var x = null;
  var y = null;
  var w = null;
  var h = null;
  if(gridViewport.gridXStart <= 0){
    x = 0;
    y = 0;
    w = self.offset.x * self.scale.x;
    h = self.viewport.height;
    ctx.fillRect(x,y,w,h);
  }
  if(gridViewport.gridXEnd >= self.data.tilesX){
    x = self.data.tilesX * self.data.tileWidth * self.scale.x + self.offset.x * self.scale.x;
    y = 0;
    w = self.viewport.width - x;
    h = self.viewport.height;
    ctx.fillRect(x,y,w,h);
  }
  if(gridViewport.gridYStart <= 0){
    x = 0;
    y = 0;
    w = self.viewport.width;
    h = self.offset.y * self.scale.y;
    ctx.fillRect(x,y,w,h);
  }
  if(gridViewport.gridYEnd >= self.data.tilesY){
    x = 0;
    y = self.data.tilesY * self.data.tileHeight * self.scale.y + self.offset.y * self.scale.y;
    w = self.viewport.width;
    h = self.viewport.height - y;
    ctx.fillRect(x,y,w,h);
  }
};

FroggerMap.prototype.renderLayer = function(layer,gridViewport,callback) {
  var self = this;
  var tiles = layer.tiles;
  var ctx = self.bgLayer.getContext('2d');
  var tile = null;
  for( var iy = gridViewport.gridYStart; iy < gridViewport.gridYEnd; iy++){
    for( var ix = gridViewport.gridXStart; ix < gridViewport.gridXEnd; ix++){
      if(tiles[iy]){
        if(typeof tiles[iy][ix] !== 'undefined' && tiles[iy][ix] !== null ){
          tile = self.getTileFromTileIndex(tiles[iy][ix]);
          sx = tile.frame.x;
          sy = tile.frame.y;
          sw = tile.sourceSize.w;
          sh = tile.sourceSize.h;
          dx = ix * self.data.tileWidth * self.scale.x + self.offset.x * self.scale.x;
          dy = iy * self.data.tileHeight * self.scale.y + self.offset.y * self.scale.y;
          dw = self.data.tileWidth * self.scale.x;
          dh = self.data.tileHeight * self.scale.y;
          img = tile.img;
          ctx.drawImage(img,sx,sy,sh,sw,dx,dy,dw,dh);
        }
      }
    }
  }
  if(typeof callback === 'function'){
    callback();
  }
};

FroggerMap.prototype.renderGridLayer = function(callback){
  var self = this;
  var gridViewport = this.getGridAreaFromViewport();
  var ctx = self.bgLayer.getContext('2d');
  ctx.strokeStyle = '4px solid rgba(0,0,0,.33)';
  var x,y,w,h;
  for( var iy = 0; iy < self.data.tilesY; iy++){
    for( var ix = 0; ix < self.data.tilesX; ix++){
      if( self.isGridPositionInSpace({x:ix,y:iy}) ){
        ctx.fillStyle = 'rgba(0,200,0,.33)';
      } else {
        ctx.fillStyle = 'rgba(200,0,0,.33)';
      }
      x = ix * self.data.tileWidth * self.scale.x + self.offset.x * self.scale.x;
      y = iy * self.data.tileHeight * self.scale.y + self.offset.y * self.scale.y;
      w = self.data.tileWidth * self.scale.x;
      h = self.data.tileHeight * self.scale.y;
      ctx.strokeRect(x,y,w,h);
      ctx.fillRect(x,y,w,h);
    }
  }
  if(typeof callback === 'function'){
    callback();
  }
};

FroggerMap.prototype.bindViewportEvents = function(callback){
  var self = this;
  $('#'+self.containerId).on('dblclick', function(event){
    event.preventDefault();
    self.addEntity(event,self.defaultFloatingTileIndex);
  });
  $('#'+self.containerId).on('mousedown', function(event){
    event.preventDefault();
    console.log('mousedown');
  });
  if(typeof callback === 'function'){
    callback();
  }
};

FroggerMap.prototype.addEntity = function(event,tileIndex,callback) {
  var self = this;
  var pos = self.getViewportMousePos(event,tileIndex);
  var floatTile = new Kinetic.Image({
    x: pos.x,
    y: pos.y,
    image: self.defaultFloatingTile,
    draggable: true,
    shadowColor: 'black',
    shadowBlur: 10,
    shadowOffset: {x: 10, y: 10},
    shadowOpacity: 0.5,
    shadowEnabled: false
  });
  floatTile.mapTileIndex = tileIndex;
  self.bindFloatingTileEvents(floatTile,function(){
    floatTile.setPosition( self.getTileStagePos(floatTile) );
    self.floatLayer.add(floatTile);
    self.checkTileInSpace(floatTile);
    self.floatLayer.draw();
    if(typeof callback === 'function'){
      callback();
    }
  })
};

FroggerMap.prototype.bindEntityEvents = function(floatTile,callback){
  var self = this;
  floatTile.on('dragstart',function(){
    this.startDragPos = self.getTileGridPos(this);
    this.enableShadow();
    self.renderGridLayer();
  });
  floatTile.on('dragmove',function(){
    self.checkTileInSpace(this);
  });
  floatTile.on('dragend',function(){
    self.render();
    this.disableShadow();
    self.snapTileToGrid(this);
    self.floatLayer.draw();
  });
  if(typeof callback === 'function'){
    callback();
  }
};

FroggerMap.prototype.getViewportMousePos = function(event,tileIndex){
  var self = this;
  var tile = null;
  if(typeof tileIndex ==='number'){
    tile = self.getTileFromTileIndex(tileIndex);
  }
  var pos = {};
  pos.x = event.pageX - $('#'+self.containerId).offset().left;
  pos.y = event.pageY - $('#'+self.containerId).offset().top;
  var scale = self.getScale();
  var offset = self.getOffset();
  var canvasPos = {};
  if(tile){
    canvasPos.x = ( pos.x-( ( tile.sourceSize.w / 2 ) * scale.x ) + ( offset.x * scale.x ) ) * ( 1 / scale.x );
    canvasPos.y = ( pos.y-( ( tile.sourceSize.h / 2 ) * scale.y ) + ( offset.y * scale.y ) ) * ( 1 / scale.y );
  } else {
    canvasPos.x = ( pos.x + offset.x ) / scale.x;
    canvasPos.y = ( pos.y + offset.y ) / scale.y;
  }
  return canvasPos;
}

FroggerMap.prototype.getTileGridPos = function(tile){
  var self = this;
  var pos = {};
  pos.x = Math.round(tile.getX() / self.data.tileWidth);
  pos.y = Math.round(tile.getY() / self.data.tileHeight);
  return pos;
};

FroggerMap.prototype.getTileStagePos = function(tile){
  var self = this;
  var pos = {};
  pos.x = Math.round(tile.getX() / self.data.tileWidth) * self.data.tileWidth;
  pos.y = Math.round(tile.getY() / self.data.tileHeight) * self.data.tileHeight;
  return pos;
};

FroggerMap.prototype.forceTileMapBounds = function(tile) {
  var self = this;
  var curTilePos = self.getTileGridPos(tile);
  curTilePos.x = (curTilePos.x < self.data.tilesX )? curTilePos.x : self.data.tilesX - 1;
  curTilePos.x = (curTilePos.x >= 0 )? curTilePos.x : 0;
  curTilePos.y = (curTilePos.y < self.data.tilesY )? curTilePos.y : self.data.tilesY - 1;
  curTilePos.y = (curTilePos.y >= 0 )? curTilePos.y : 0;
  self.slideTile(tile,curTilePos,5);
};

FroggerMap.prototype.snapTileToGrid = function(tile) {
  var self = this;
  if(!tile.inSpace){
    self.slideTile(tile,tile.startDragPos,5,function(){
      self.checkTileInSpace(tile);
      self.floatLayer.draw();
    });
  } else{
    var curTilePos = self.getTileGridPos(tile);
    curTilePos.x = (curTilePos.x < self.data.tilesX )? curTilePos.x : self.data.tilesX - 1;
    curTilePos.x = (curTilePos.x >= 0 )? curTilePos.x : 0;
    curTilePos.y = (curTilePos.y < self.data.tilesY )? curTilePos.y : self.data.tilesY - 1;
    curTilePos.y = (curTilePos.y >= 0 )? curTilePos.y : 0;
    self.slideTile(tile,curTilePos,5,function(){
      self.checkTileInSpace(tile);
      self.floatLayer.draw();
    });
  }
};

FroggerMap.prototype.checkTileInSpace = function(tile) {
  var self = this;
  var curTilePos = self.getTileGridPos(tile);
  var inSpace = self.isGridPositionInSpace(curTilePos);
  if(inSpace){
    tile.setImage(self.defaultFloatingTile);
  } else {
    tile.applyFilter(Kinetic.Filters.Grayscale);
  }
  tile.inSpace = inSpace;
};

FroggerMap.prototype.isGridPositionInSpace = function(pos) {
  var self = this;
  var inSpace = false;
  for(var i = 0; i < self.data.spaces.length; i++) {
    if( pos.x >= self.data.spaces[i].tileX &&
        pos.x <= (self.data.spaces[i].tileX + self.data.spaces[i].tilesWidth) &&
        pos.y >= self.data.spaces[i].tileY &&
        pos.y <= (self.data.spaces[i].tileY + self.data.spaces[i].tilesHeight) ) {
        inSpace = true;
    }
  }
  return inSpace;
};

FroggerMap.prototype.slideTile = function(tile,endPos,frames,callback){
  var self = this;
  var fps = 30;
  var frameCounter = 0;
  var startPos = self.getTileGridPos(tile);
  var xInc = ( (endPos.x * self.data.tileWidth) - (startPos.x * self.data.tileWidth) ) / (frames + 1);
  var yInc = ( (endPos.y * self.data.tileHeight) - (startPos.y * self.data.tileHeight) ) / (frames + 1);
  var anim = setInterval(function(){
    if(frameCounter >= frames){
      clearInterval(anim);
      var xEndPos = endPos.x * self.data.tileWidth;
      var yEndPos = endPos.y * self.data.tileHeight;
      tile.setPosition(xEndPos,yEndPos);
      if(typeof callback === 'function'){
        callback();
      }
    } else {
      frameCounter++;
      var xPos = tile.getX() + xInc 
      var yPos = tile.getY() + yInc;
      tile.setPosition(xPos,yPos);
      self.floatLayer.draw();
    }
  },1000 / fps);

};