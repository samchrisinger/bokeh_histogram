app.view = function(ctrl){
    return m('div', {class: 'rekeshif'}, [
	new m__tl.view(ctrl.timelineCtrl),
	new app.dataView(ctrl),
	new app.queryView(ctrl.queryCtrl)
    ]);
};

app.dataView = function(ctrl){
    return m('div', {class: 'rekeshifData'},[
	m('span', ctrl.size+" out of "+ctrl.max),
	ctrl.results.map(function(d){
	    return m('div', {class: 'rekeshifDataPoint'}, [
		Object.keys(ctrl.schema).map(function(attr){
		    return m('span', [
			m('span', attr+': '),
			m('span', d[attr]),
			m('br')
		    ]);		
		})
	    ]);
	})
    ]);
};

app.queryView = function(ctrl){
    return m('div', {class: 'rekeshifQuery'}, [
	Object.keys(ctrl.q.filters.cat).map(function(key){
	    var cats = ctrl.q.filters.cat[key].cats;
	    return m('div', {class: 'rekeshifQueryFilter'},[
		m('label', key+': '),
		m('select', {value: key, multiple: true, onchange: ctrl.updateCat, config: ctrl.setSelected}, cats.map(function(cat){
		    return m('option', cat);
		}))
	    ]);
		   
	}),
    ]);
};

