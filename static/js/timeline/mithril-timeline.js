(function() {
    m__tl = this;
    // Utils
    var array_min = function(arr) {
        var min = Math.pow(2, 53);
        for (var i = 0; i < arr.length; i++)
            min = Math.min(min, arr[i].value);
        return min;
    };
    var array_max = function(arr) {
        var max = -1 * Math.pow(2, 53);
        for (var i = 0; i < arr.length; i++)
            max = Math.max(max, arr[i].value);
        return max;
    };
    //////
    var view_opts = {
        h: 200,
        w: 800
    };
    // Models
    this.Point = function(cid, value) {
        this.cid = cid;
        this.value = value;
    };
    this.Line = function(parent, key, min, max){	
	this.key = key;
	this.points = m.prop([]);
	this.min = min;
	this.max = max;
	this.start = min;
	this.stop = max;
	// Moving handles
	var minX = 0;
	var maxX = view_opts.w;
	this.moveListener;
	this.stopListener;
	var moveListenerFactory = function(stop, stopFn, offset){
	    var fn = function(e){
		var element = e.currentTarget;
		var l_offset = element.parentElement.getBoundingClientRect().left;
		this.moveListener = function(e){
		    var xDiff = (e.pageX-l_offset)-stop;
		    if(stop == 0)
			xDiff = Math.max(0, xDiff);
		    if(stop > 0)			
			xDiff = Math.min(xDiff, 0);
		    element.setAttribute('transform', "translate("+xDiff+" 0)");	    
		};
		this.stopListener = function(e){
		    document.removeEventListener('mousemove', this.moveListener, false);
		    document.removeEventListener('mouseup', this.stopListener, false);
		    var stop = parseInt(element.getAttribute('x'));
		    stopFn(stop/view_opts.w);		    
		}.bind(this);
		minX = e.pageX;
		document.addEventListener('mousemove', this.moveListener, false);
		document.addEventListener('mouseup', this.stopListener, false);
	    };
	    return fn.bind(this);
	}.bind(this);
	var l = this;
	var minStopFn = function(rat){
	    this.start = Math.floor(((parent.max-parent.min)*rat)+parent.min);
	    parent.updateLine(this);
	}.bind(l);	
	this.startMoveMin = moveListenerFactory(minX, minStopFn, -10);
	var maxStopFn = function(rat){
	    this.stop = Math.ceil(rat*parent.max);
	    parent.updateLine(this);
	}.bind(l);
	this.startMoveMax = moveListenerFactory(maxX, maxStopFn, -10);
    };
    this.Timeline = function(parent) {
        this.lines = {};
	this.schema = null;
	this.min = Math.pow(2, 53);
	this.max = -1*Math.pow(2, 53);
        this.update = function(newdata, schema) {
	    if (newdata.length === 0)
                return;
	    gtimes = schema['__global']
	    this.min = gtimes['min']
	    this.max = gtimes['max']
	    if(!this.schema){
		var lines = {};
		for (var key in schema) {
		    if (key !== '__global')
			lines[key] = new Line(this, key, gtimes['min'], gtimes['max']);
		}
		for (var i = 0; i < newdata.length; i++) {
                    cid = "0000" + (i).toString().slice(-5);
                    for (key in schema) {
			if(key !== '__global')			    
			    lines[key].points().push(new Point(cid, newdata[i][key]));
                    }
		}
		keys = Object.keys(lines);
		this.schema = schema;
		this.lines =  lines;		
	    }
	    else{
		for(var i=0; i<newdata.length; i++){
		    cid = "0000" + (i).toString().slice(-5);
		    for(var key in schema){
			if(key !== '__global')			    
			    this.lines[key].points().push(new Point(cid, newdata[i][key]));
                    }		    
		}
	    }
        };
	var keys;
	this.line = function(index){
	    return this.lines[keys[index]];
	}.bind(this);
	this.updateLine = function(line){
	    parent.emit('changed');
	}.bind(this);
	this.serialize = function(){
	    var ret = {};
	    for(var key in this.lines){
		var line = this.lines[key];
		ret[key] = {
		    start: line.start,
		    stop: line.stop,
		    min: line.min,
		    max: line.max
		};
	    }
	    return ret;
	}.bind(this);
    };
    //////
    // Controller
    this.controller = function() {
        this.timeline = new Timeline(this);
        this.update = function(data, schema) {
            this.timeline.update(data, schema);
        }.bind(this);
	var handlers = {};
	this.emit = function(evt){
	    for(var i=0; i<handlers[evt].length; i++){
		handlers[evt][i]();
	    }
	}.bind(this);
	this.bind = function(evt, handler){
	    if(typeof handlers[evt] === 'undefined')
		handlers[evt] = [];
	    handlers[evt].push(handler);
	};
    };
    //////
    // View
    var viewFactory = function(ctrl, opts) {
        var tlFactory = function(ctrl, opts) {
            var lines = Object.keys(ctrl.timeline.lines);
            var lineHeight = opts.h / lines.length;
            var lineWidth = opts.w - 50;
            var min = ctrl.timeline.min;
            var max = ctrl.timeline.max;
            var span = max - min;
            var i = -1;
            return lines.map(function(key) {
                i++;
                var offset = lineHeight * i;
                var line = ctrl.timeline.lines[key];
		var points = line.points();
                return m('g', [
                    m('rect', {
                        height: ((100 / lines.length)).toString() + '%',
                        width: '100%',
                        stroke: 'black',
                        'stroke-width': 3,
                        fill: 'white',
                        y: offset
                    }),
		    m('text', {
			x: 10,
			y: offset+20,
			size: 3
		    }, key),
                    points.map(function(p) {
                        var rat = ((p.value - min) + 1) / span;
                        return m('circle', {
                            cx: 25 + (lineWidth * rat),
                            cy: offset + (lineHeight * 0.5),
                            r: (lineHeight * 0.1),
                            fill: 'rgba(0,0,255,0.01)',
                            stroke: 'grey'
                        });
                    }),
                    m('rect', {
                        x: 0,
                        y: offset+4,
                        width: 7.5,
                        height: lineHeight-8,
                        fill: 'black',
			cursor: 'pointer',
			onmousedown: function(e){
			    ctrl.timeline.line(this.index).startMoveMin(e);
			}.bind({index: i})
                    }),
                    m('rect', {
                        y: offset+4,
                        x: lineWidth + 42.5,
                        width: 7.5,
                        height: lineHeight-8,
                        fill: 'black',
			cursor: 'pointer',
			onmousedown: function(e){
			    ctrl.timeline.line(this.index).startMoveMax(e);
			}.bind({index:i})
                    })
                ]);
            });
        };
        return m('svg', {
            height: opts.h,
            width: opts.w
        }, tlFactory(ctrl, opts));
    };
    this.view = function(ctrl) {
        return viewFactory(ctrl, view_opts);
    };
    //////
    // Initialization/config
    this.config = function(opts) {
        var viewChanged = false;
        if (typeof opts.height !== 'undefined') {
            view_opts.h = opts.height;
            viewChanged = true;
        }
        if (typeof opts.width !== 'undefined') {
            view_opts.w = opts.width;
            viewChanged = true;
        }
        // If this.view needs updating 
        if (viewChanged) {
            m__tl.view = function(ctrl) {
                return viewFactory(ctrl, tl_opts);
            };
        }
    };
    ////
})();
