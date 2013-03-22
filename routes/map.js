
/*
 * GET home page.
 */

var fs = require('fs');
var util = require('util');

exports.getMap = function(req,res){
  if(req.params.name){
    fs.exists('./public/data/maps/'+req.params.name+'.json', function(exists){
      if(exists){
        var map = require('../public/data/maps/'+req.params.name);
        res.format({
          html: function(){
            res.render('map', { title: req.params.name, map: map, stylesheets:['map']});
          },
          json: function(){
            res.json(map);
          }
        });
      } else {
        res.send(404,'No map named '+req.params.name+' found');
      }
    });
  } else {
    res.send(400,'No map name given');
  }
};

function fakeEntitiesGet(map){
  var entities = [];
  for(var y = 0; y < map.tilesY; y++ ){
    var eRow = [];
    for(var x = 0; x < map.tilesX; x++ ){
      var rand = Math.random();
      var entity = null;
      if(Math.round(rand) > 0){
        entity = {};
        var eNumber = Math.round(rand*10000);
        entity.name = 'Entity-'+eNumber;
      }
      eRow.push(entity);
    }
    entities.push(eRow);
  }
  return entities;
}

exports.getMapEntities = function(req,res){
  if(req.params.name){
    fs.exists('./public/data/maps/'+req.params.name+'.json', function(exists){
      if(exists){
        var map = require('../public/data/maps/'+req.params.name);
        var entities = fakeEntitiesGet(map);
        res.format({
          html: function(){
            res.send(JSON.stringify(entities));
          },
          json: function(){
            res.json(entities);
          }
        });
      } else {
        res.send(404,'No map named '+req.params.name+' found');
      }
    });
  } else {
    res.send(400,'No map name given');
  }
};

exports.listTiles = function(req,res){
   if(req.params.name){
    fs.exists('./public/data/maps/'+req.params.name+'.json', function(exists){
      if(exists){
        var tileList = [];
        var map = require('../public/data/maps/'+req.params.name);
        var tileSheets = map.tileSheets;
        var tileNum = 0;
        for(var i = 0; i < tileSheets.length; i++){
          var frames = tileSheets[i].frames;
          var tiles = [];
          for( var f = 0; f < frames.length; f++){
            var tile = {
              filename: frames[f].filename,
              tilenum: tileNum
            };
            tiles.push(tile);
            tileNum++;
          }
          var tileSheet = {
            image : tileSheets[i].meta.image,
            frames : tiles
          };
          tileList.push(tileSheet);
        }
        res.format({
          html: function(){
            res.render('map-tilelist', { title: req.params.name, tileList: tileList, stylesheets:['map-tilelist'] } );
          },
          json: function(){
            res.json(tileList);
          }
        });
      } else {
        res.send(404,'No map named '+req.params.name+' found');
      }
    });
  } else {
    res.send(400,'No map name given');
  }
};