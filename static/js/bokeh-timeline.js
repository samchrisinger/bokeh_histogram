require(['main'], function(Bokeh) {
    var schema;
    $.get('/schema', function(data) {
        schema = data;
    });
    var data;
    $.get(['/times?slice=', 0, ':', 1000].join(''), function(res) {
        data = res;
    });
    debugger;
    dot = {
        type: 'circle',
        x: 'x',
        y: 'y',
        radius: 6,
        radius_units: 'screen',
        fill_color: 'orange',
        line_color: 'green',
        line_width: 2
    };
    line = {
        type: 'segment',
        x0: 'x0',
        y0: 'y',
        x1: 'x',
        y1: 'y',
        line_color: 'green',
        line_width: 4
    };
    options = {
        title: "Dot Plot Demo",
        dims: [600, 600],
        xrange: [0, 100],
        yrange: factors,
        xaxes: "min",
        yaxes: "min",
        tools: "resize",
        legend: false
    };
    plot = Bokeh.Plotting.make_plot([line, dot], data, options);
    Bokeh.Plotting.show(plot);
    factors = ["foo", "bar", "baz"];
    data = {
        x: ["foo", "foo", "foo", "bar", "bar", "bar", "baz", "baz", "baz"],
        y: ["foo", "bar", "baz", "foo", "bar", "baz", "foo", "bar", "baz"],
        colors: ["#0B486B", "#79BD9A", "#CFF09E", "#79BD9A", "#0B486B", "#79BD9A", "#CFF09E", "#79BD9A", "#0B486B"]
    };
    square = {
        type: 'square',
        x: 'x',
        y: 'y',
        size: 165,
        fill_color: 'colors',
        line_color: 'colors'
    };
    options = {
        title: "Heatmap Demo",
        dims: [600, 600],
        xrange: factors,
        yrange: factors,
        xaxes: "min",
        yaxes: "min",
        xgrid: false,
        ygrid: false,
        tools: "resize",
        legend: false
    };
    plot = Bokeh.Plotting.make_plot(square, data, options);
    return Bokeh.Plotting.show(plot);
});
