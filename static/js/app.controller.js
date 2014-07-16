var _utils = {
    filter_obj: function(obj, fn){
	var ret = {};
	for(var key in obj){
	    if(fn(obj[key]))
		ret[key] = obj[key];	    
	}
	return ret;
    },
    map_obj: function(obj, fn){
	var ret = {};
	for(var key in obj){
	    ret[key] = fn(obj[key]);
	}
	return ret;
    }
};
app.controller = function() {    
    this.queryCtrl = new app.queryController(this);
    this.results = m.prop([]);
    this.schema = {};
    this.size = 0;
    this.max = 0;
    var ctrl = this;
    var qctrl = this.queryCtrl;
    this.Data = new app.Data();
    this.Data.fetch().then(function(res) {
        ctrl.results = res.data;
        ctrl.size = res.size;
	ctrl.schema = res.schema;
	if (app.init) {
            ctrl.max = res.size;
            app.init = qctrl.q.init(res.data, res.schema);
        }
    });
    this.timelineCtrl = new m__tl.controller();
    this.Times = new app.Times();
    this.Times.stream(ctrl.timelineCtrl.update);
    ctrl.timelineCtrl.bind('changed', function(){
	var timelineFilters = ctrl.timelineCtrl.timeline.serialize();
	ctrl.queryCtrl.updateTime(timelineFilters);
    });
};

app.queryController = function(parent) {
    var qctrl = this;
    this.q = new app.Query();

    this.setSelected = function(elem, isInit, ctx){
	var key = elem.previousSibling.innerHTML.split(':')[0];
	var selected = qctrl.q.filters.cat[key].selected;
	for(var i=0; i<elem.childNodes.length; i++){
	    var op = elem.childNodes.item(i);
	    if(selected.indexOf(op.innerHTML) !== -1)
	       op.setAttribute('selected', true);	    
	}
    };
    this.updateCat = function(e) {
        var selected = Array.prototype.slice.call(this.selectedOptions).map(function(o) {
            return o.innerHTML;
        });
        var key = this.previousSibling.innerHTML.split(':')[0];
        qctrl.q.filters.cat[key].selected = selected;
        qctrl.compile();
    };
    this.updateTime = function(filters){
	var q = qctrl.q;
	q.filters.time = filters;
	qctrl.compile();
    };;
    this.compile = function() {
	var q = qctrl.q;
        var cat_filters = q.filters.cat;
        var time_filters = q.filters.time;
        cat_filters = _utils.filter_obj(cat_filters, function(cf) {
            return cf.selected.length > 0;
        });
	//TODO optimze
	/*time_filters = _utils.filter_obj(time_filters, function(tf){
	    return !(tf.max == tf.stop && tf.min == tf.start);
	});*/
        if (cat_filters.length == 0 && time_filters.length == 0) {
            return;
        }
        var ands = [];
        for (var key in cat_filters){
	    ors = [];
            var cf = cat_filters[key];
	    var selected = cf.selected;
            for (var j = 0; j < selected.length; j++) {
                var match = {};
                match[cf.field] = selected[j];
                ors.push({
                    'fquery': {
                        'query': {
                            'match': match
                        },
                        '_cache': true
                    }
                });
            }
            ands.push({
                'query': {
                    'filtered': {
                        'filter': {
                            'or': {
                                'filters': ors
                            }
                        }
                    }
                }
            });
        }
        for (var key in time_filters){
            var tf = time_filters[key];
            var clause = {};
            var start = tf.start;
            var stop = tf.stop;
            if ((typeof start === 'undefined' || typeof stop === 'undefined') || (start == tf.min && stop == tf.max))
                continue;
            clause[key] = {
                'gt': start,
                'lt': stop
            };
            ands.push({
                'range': clause
            });
        }
        var qs = {
            'query': {
                'filtered': {
                    'filter': {
                        'and': ands
                    }
                }
            }
        };
	console.log(JSON.stringify(qs, '\n', 2));
	parent.Data.fetch(qs).then(function(res){
	    parent.results = res.data;
            parent.size = res.size;
	});
    };
};
