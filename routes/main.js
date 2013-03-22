
/*
 * GET home page.
 */

var fs = require('fs');
var util = require('util');

exports.start = function(req, res){
	fs.readdir('./public/data/maps/',function(err,files){
		var patt=/\.json$/i;
		var maps = [];
		for(var i =0; i < files.length; i++){
			if(patt.test(files[i])){
				var map = {
					name: files[i].replace('.json','')
				};
				maps.push(map);
			}
		}
		res.render('main', { title: 'Site Map Listings', maps:maps });
	});
};
