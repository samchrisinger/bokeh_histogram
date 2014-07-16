var app = {
    init: true
};

app.TimeFilter = function(field, min, max) {
    this.field = field;
    this.min = min;
    this.max = max;
    this.start = m.prop();
    this.stop = m.prop();    
};

app.CatFilter = function(field, cats) {    
    this.field = field;
    this.cats = cats;
    this.selected = [];
};

app.Query = function() {
    this.filters = {
	cat: {},
	time: {}
    };
    this.init = function(data, schema) {
        for (var key in schema) {
	    switch (schema[key].type) {
	    case 'string':
		this.filters.cat[key] = new app.CatFilter(key, schema[key].categories);
                    break;
	    case 'date':
		var item = schema[key];
		this.filters.time[key] = new app.TimeFilter(key, item.min, item.max);		
		break;
	    }
	}
	return true;
    };
};

app.Data = function(data) {
    this.fetch = function(qs){
	var opts = {
            method: 'GET' ,
            url: '/search'
	};
	if (typeof qs !== 'undefined')
	    opts.data = {'query': JSON.stringify(qs)};

	return m.request(opts);
    };
};

app.Times = function(times){
    this.stream = function(cb){
	var done = false;
	var page = 0;
	var get = function(){
	    var opts = {
		method: 'GET',
		url: '/times',
		data: {page: page}
	    };	    
	    m.request(opts).then(function(res){
		if(res.times.length === 0 || page==5){
		    return;
		}
		else{
		    cb(res.times, res.schema);
		    page++;		    
		}
	    }.bind({page:page}));	    
	};
	get();
    };   
}
