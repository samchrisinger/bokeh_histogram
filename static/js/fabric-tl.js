$(document).ready(function(){
    var w = 799;
    var h = 399;
    var canvas = document.getElementById('canvas');
    var ctx = canvas.getContext('2D');
    var background = new fabric.Rect({
	top: 0,
	left: 0,
	width: w,
	height: h,
	stroke: 'black',
	fill: 'white',
	'stroke-width': 3 
    });
    canvas.add(background);
    $.get('/times', {page:0}, function(res){
	var keys = Object.keys(res.schema);
	var n = keys.length;
	var lineHeight = h/n;
	var lineWidth = w;
	keys.map(function(key, index){
	    var line = new fabric.Rect({
		top: lineHeight*index,
		left: 0,
		width: lineWidth,
		height: lineHeight,
		'stroke-width': 3,
		stroke: 'black',
		fill: 'white'
	    });
	    canvas.add(line);
	    res.times.map(function(line){

	    });
	});
    });
});
