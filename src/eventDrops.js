(function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);var f=new Error("Cannot find module '"+o+"'");throw f.code="MODULE_NOT_FOUND",f}var l=n[o]={exports:{}};t[o][0].call(l.exports,function(e){var n=t[o][1][e];return s(n?n:e)},l,l.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({"./lib/main.js":[function(require,module,exports){
"use strict";
/* global require, define, module */

var eventDrops = require('./eventDrops');

if (typeof define === "function" && define.amd) {
  define('d3.chart.eventDrops', ["d3"], function (d3) {
    d3.chart = d3.chart || {};
    d3.chart.eventDrops = eventDrops(d3, document);
  });
} else if (window) {
  window.d3.chart = window.d3.chart || {};
  window.d3.chart.eventDrops = eventDrops(window.d3, document);
} else {
  module.exports = eventDrops;
}

},{"./eventDrops":"/home/melodie/Bureau/EventDrops/lib/eventDrops.js"}],"/home/melodie/Bureau/EventDrops/lib/delimiter.js":[function(require,module,exports){
"use strict";
/* global require, module, d3 */

var configurable = require('./util/configurable');

var defaultConfig = {
  xScale: null,
  dateFormat: null
};

module.exports = function (d3) {

  return function (config) {

    config = config || {};
    for (var key in defaultConfig) {
      config[key] = config[key] || defaultConfig[key];
    }

    function delimiter(selection) {
      selection.each(function (data) {
        d3.select(this).selectAll('text').remove();

        var limits = config.xScale.domain();

        d3.select(this).append('text')
          .text(function () {

            return config.dateFormat(limits[0]);
          })
          .classed('start', true)
        ;

        d3.select(this).append('text')
          .text(function () {

            return config.dateFormat(limits[1]);
          })
          .attr('text-anchor', 'end')
          .attr('transform', 'translate(' + config.xScale.range()[1] + ')')
          .classed('end', true)
        ;
      });
    }

    configurable(delimiter, config);

    return delimiter;
  };
};

},{"./util/configurable":"/home/melodie/Bureau/EventDrops/lib/util/configurable.js"}],"/home/melodie/Bureau/EventDrops/lib/eventDrops.js":[function(require,module,exports){
"use strict";
/* global require, module */

var configurable = require('./util/configurable');
//var canvas = require('canvas');

module.exports = function (d3, document) {
  var eventLine = require('./eventLine')(d3);
  var delimiter = require('./delimiter')(d3);

  var defaultConfig = {
	start: new Date(0),
	end: new Date(),
	minScale: 0,
	maxScale: Infinity,
	width: 1000,
	margin: {
	  top: 60,
	  left: 200,
	  bottom: 40,
	  right: 50
	},
	locale: null,
	axisFormat: null,
	tickFormat: [
		[".%L", function(d) { return d.getMilliseconds(); }],
		[":%S", function(d) { return d.getSeconds(); }],
		["%I:%M", function(d) { return d.getMinutes(); }],
		["%I %p", function(d) { return d.getHours(); }],
		["%a %d", function(d) { return d.getDay() && d.getDate() != 1; }],
		["%b %d", function(d) { return d.getDate() != 1; }],
		["%B", function(d) { return d.getMonth(); }],
		["%Y", function() { return true; }]
	],
	eventHover: null,
	eventZoom: null,
	eventClick: null,
	hasDelimiter: true,
	hasTopAxis: true,
	hasBottomAxis: function (data) {
	  return data.length >= 10;
	},
	eventLineColor: 'black',
	eventColor: null
  };

  return function eventDrops(config) {
	var xScale = d3.time.scale();
	var yScale = d3.scale.ordinal();
	config = config || {};
	for (var key in defaultConfig) {
	  config[key] = config[key] || defaultConfig[key];
	}

	function eventDropGraph(selection) {
	  selection.each(function (data) {
		var zoom = d3.behavior.zoom().center(null).scaleExtent([config.minScale, config.maxScale]).on("zoom", updateZoom);

		zoom.on("zoomend", zoomEnd);

		var graphWidth = config.width - config.margin.right - config.margin.left;
		var graphHeight = data.length * 40;
		var height = graphHeight + config.margin.top + config.margin.bottom;

		var canvas_width =  graphWidth;
		var canvas_height = graphHeight;

		var lastX=canvas_width/2, lastY=canvas_height/2;
		var mouseDown = 0;

		d3.select(this).select('canvas').remove();
		var canvas = d3.select(this)
		  .append('canvas')
		  .attr('id', "mon_canvas")
		  .attr('width', canvas_width)
		  .attr('height', canvas_height);

		  // console.log(canvas);
		  console.log(canvas.node());
		// var canvas = document.getElementsByTagName('canvas')[0];
		// canvas.width = canvas_width; canvas.height = canvas_height;

		var ctx = (canvas.node()).getContext('2d');
		//trackTransforms(ctx);
		function drawAgain(){
		  // Clear the entire canvas
		  /*var p1 = ctx.transformedPoint(0,0);
		  var p2 = ctx.transformedPoint(canvas.width,canvas.height);
		  ctx.clearRect(p1.x,p1.y,p2.x-p1.x,p2.y-p1.y);*/

		  // should be configurable
		  var topX = 0;
		  var topY = 0;
		  ctx.clearRect(topX, topY, topX + canvas.node().width, topY + canvas.node().height);

		  ctx.font = "30px Arial";
			ctx.textAlign = "center";
			ctx.fillText("Toto",750/2,35);
			ctx.fillText("Toto",750/2,75);
			ctx.fillText("Toto",750/2,115);
			ctx.fillText("Toto",750/2,155);
		}
		// draw the canvas for the first time
		drawAgain();


		var lastX=canvas.node().width/2, lastY=canvas.node().height/2;
		var dragged;
		var dragStart = {
			x : lastX,
			y : lastY
		};

		// event "clicking"
		canvas.node().addEventListener('mousedown',function(evt){
			// permits compatibility with every browser
		  document.body.style.mozUserSelect = document.body.style.webkitUserSelect = document.body.style.userSelect = 'none';
		  lastX = evt.offsetX || (evt.pageX - canvas.node().offsetLeft);
		  dragStart = {
		  	x : lastX,
				y : lastY
		  };
		  dragged = false;
		  mouseDown++;
		},false);

		// event "mouse moving"
		canvas.node().addEventListener('mousemove',function(evt){
		  //lastX = evt.offsetX || (evt.pageX - canvas.node().offsetLeft);
			lastX = (evt.pageX - canvas.node().offsetLeft);
		  dragged = true;
		  if (dragStart && mouseDown){
			//var pt = ctx.transformedPoint(lastX,lastY);
			ctx.translate(lastX-dragStart.x, lastY-dragStart.y);
			drawAgain();
		  }
		},false);

		// event "stop clicking"
		canvas.node().addEventListener('mouseup',function(evt){
		  dragStart = null;
		  mouseDown--;
		  if (!dragged) zoom(evt.shiftKey ? -1 : 1 );
		},false);

		/*var scaleFactor = 1.1;
		var zoom = function(clicks){
		  var pt = ctx.transformedPoint(lastX,lastY);
		  ctx.translate(pt.x,pt.y);
		  var factor = Math.pow(scaleFactor,clicks);
		  ctx.scale(factor,1);
		  ctx.translate(-pt.x,-pt.y);
		  drawAgain();
		}

		var handleScroll = function(evt){
		  var delta = evt.wheelDelta ? evt.wheelDelta/40 : evt.detail ? -evt.detail : 0;
		  if (delta) zoom(delta);
		  return evt.preventDefault() && false;
		};
		canvas.addEventListener('DOMMouseScroll',handleScroll,false);
		canvas.addEventListener('mousewheel',handleScroll,false);

		*/


		d3.select(this).select('svg').remove();

		var svg = d3.select(this)
		  .append('svg')
		  .attr('width', config.width)
		  .attr('height', height)
		;

		var graph = svg.append('g')
		  .attr('transform', 'translate(0, 25)');

		var yDomain = [];
		var yRange = [];

		data.forEach(function (event, index) {
		  yDomain.push(event.name);
		  yRange.push(index * 40);
		});

		yScale.domain(yDomain).range(yRange);

		// this part in comments used to draw lines in svg on the graph

		// translation de 40 pour les lignes

		var yAxisEl = graph.append('g')
		  .classed('y-axis', true)
		  .attr('transform', 'translate(0, 60)');

		var yTick = yAxisEl.append('g').selectAll('g').data(yDomain);

		//var yTick = graph.append('g').selectAll('g').data(yDomain);

		yTick.enter()
		  .append('g')
		  .attr('transform', function(d) {
			return 'translate(0, ' + yScale(d) + ')';
		  })
		  .append('line')
		  .classed('y-tick', true)
		  .attr('x1', config.margin.left)
		  .attr('x2', config.margin.left + graphWidth);

		yTick.exit().remove();

		var curx, cury;
		var zoomRect = svg
		  .append('rect')
		  .call(zoom)
		  .classed('zoom', true)
		  .attr('width', graphWidth)
		  .attr('height', height )
		  .attr('transform', 'translate(' + config.margin.left + ', 35)')
		;

		if (typeof config.eventHover === 'function') {
		  zoomRect.on('mousemove', function(d, e) {
			var event = d3.event;
			if (curx == event.clientX && cury == event.clientY) return;
			curx = event.clientX;
			cury = event.clientY;
			zoomRect.attr('display', 'none');
			var el = document.elementFromPoint(d3.event.clientX, d3.event.clientY);
			zoomRect.attr('display', 'block');
			if (el.tagName !== 'circle') return;
			config.eventHover(el);
		  });
		}

		if (typeof config.eventClick === 'function') {
		  zoomRect.on('click', function () {
			zoomRect.attr('display', 'none');
			var el = document.elementFromPoint(d3.event.clientX, d3.event.clientY);
			zoomRect.attr('display', 'block');
			if (el.tagName !== 'circle') return;
			config.eventClick(el);
		  });
		}

		xScale.range([0, graphWidth]).domain([config.start, config.end]);

		zoom.x(xScale);

		function updateZoom() {
		  if (d3.event.sourceEvent.toString() === '[object MouseEvent]') {
			zoom.translate([d3.event.translate[0], 0]);
		  }

		  if (d3.event.sourceEvent.toString() === '[object WheelEvent]') {
			zoom.scale(d3.event.scale);
		  }

		  redraw();
		}

		function redrawDelimiter() {
		  svg.select('.delimiter').remove();
		  var delimiterEl = svg
			.append('g')
			.classed('delimiter', true)
			.attr('width', graphWidth)
			.attr('height', 10)
			.attr('transform', 'translate(' + config.margin.left + ', ' + (config.margin.top - 45) + ')')
			.call(delimiter({
			  xScale: xScale,
			  dateFormat: config.locale ? config.locale.timeFormat("%d %B %Y") : d3.time.format("%d %B %Y")
			}))
		  ;
		}

		function zoomEnd() {
		  if (config.eventZoom) {
			config.eventZoom(xScale);
		  }
		  if (config.hasDelimiter) {
			redrawDelimiter();
		  }
		}

		function drawXAxis(where) {

		  // copy config.tickFormat because d3 format.multi edit its given tickFormat data
		  var tickFormatData = [];

		  config.tickFormat.forEach(function (item) {
			var tick = item.slice(0);
			tickFormatData.push(tick);
		  });

		  var tickFormat = config.locale ? config.locale.timeFormat.multi(tickFormatData) : d3.time.format.multi(tickFormatData);
		  var xAxis = d3.svg.axis()
			.scale(xScale)
			.orient(where)
			.tickFormat(tickFormat)
		  ;

		  if (typeof config.axisFormat === 'function') {
			config.axisFormat(xAxis);
		  }

		  var y = (where == 'bottom' ? parseInt(graphHeight) : 0) + config.margin.top - 40;

		  graph.select('.x-axis.' + where).remove();
		  var xAxisEl = graph
			.append('g')
			.classed('x-axis', true)
			.classed(where, true)
			.attr('transform', 'translate(' + config.margin.left + ', ' + y + ')')
			.call(xAxis)
		  ;
		}

		function redraw() {

		  var hasTopAxis = typeof config.hasTopAxis === 'function' ? config.hasTopAxis(data) : config.hasTopAxis;
		  if (hasTopAxis) {
			drawXAxis('top');
		  }

		  var hasBottomAxis = typeof config.hasBottomAxis === 'function' ? config.hasBottomAxis(data) : config.hasBottomAxis;
		  if (hasBottomAxis) {
			drawXAxis('bottom');
		  }

		  zoom.size([config.width, height]);

		  graph.select('.graph-body').remove();
		  var graphBody = graph
			.append('g')
			.classed('graph-body', true)
			.attr('transform', 'translate(' + config.margin.left + ', ' + (config.margin.top - 15) + ')');

		  var lines = graphBody.selectAll('g').data(data);

		  lines.enter()
			.append('g')
			.classed('line', true)
			.attr('transform', function(d) {
			  return 'translate(0,' + yScale(d.name) + ')';
			})
			.style('fill', config.eventLineColor)
			.call(eventLine({ xScale: xScale, eventColor: config.eventColor }))
		  ;

		  lines.exit().remove();
		}

		redraw();
		if (config.hasDelimiter) {
		  redrawDelimiter();
		}
		if (config.eventZoom) {
		  config.eventZoom(xScale);
		}
	  });
	}

	configurable(eventDropGraph, config);

	return eventDropGraph;
  };
};

},{"./delimiter":"/home/melodie/Bureau/EventDrops/lib/delimiter.js","./eventLine":"/home/melodie/Bureau/EventDrops/lib/eventLine.js","./util/configurable":"/home/melodie/Bureau/EventDrops/lib/util/configurable.js"}],"/home/melodie/Bureau/EventDrops/lib/eventLine.js":[function(require,module,exports){
"use strict";
/* global require, module, d3 */

var configurable = require('./util/configurable');
var filterData = require('./filterData');

var defaultConfig = {
  xScale: null
};

module.exports = function (d3) {
  return function (config) {

    config = config || {
      xScale: null,
      eventColor: null
    };
    for (var key in defaultConfig) {
      config[key] = config[key] || defaultConfig[key];
    }

    var eventLine = function eventLine(selection) {
      selection.each(function (data) {
        d3.select(this).selectAll('text').remove();

        d3.select(this).append('text')
          .text(function(d) {
            var count = filterData(d.dates, config.xScale).length;
            return d.name + (count > 0 ? ' (' + count + ')' : '');
          })
          .attr('text-anchor', 'end')
          .attr('transform', 'translate(-20)')
          .style('fill', 'black')
        ;

        //d3.select(this).selectAll('circle').remove();

        /*var circle = d3.select(this).selectAll('circle')
          .data(function(d) {
            // filter value outside of range
            return filterData(d.dates, config.xScale);
          });

        circle.enter()
          .append('circle')
          .attr('cx', function(d) {
            return config.xScale(d);
          })
          .style('fill', config.eventColor)
          .attr('cy', -5)
          .attr('r', 10)
        ;

        circle.exit().remove();*/

      });
    };

    configurable(eventLine, config);

    return eventLine;
  };
};

},{"./filterData":"/home/melodie/Bureau/EventDrops/lib/filterData.js","./util/configurable":"/home/melodie/Bureau/EventDrops/lib/util/configurable.js"}],"/home/melodie/Bureau/EventDrops/lib/filterData.js":[function(require,module,exports){
"use strict";
/* global module */

module.exports = function filterDate(data, scale) {
  data = data || [];
  var filteredData = [];
  var boundary = scale.range();
  var min = boundary[0];
  var max = boundary[1];
  data.forEach(function (datum) {
    var value = scale(datum);
    if (value < min || value > max) {
      return;
    }
    filteredData.push(datum);
  });

  return filteredData;
};

},{}],"/home/melodie/Bureau/EventDrops/lib/util/configurable.js":[function(require,module,exports){
module.exports = function configurable(targetFunction, config, listeners) {
  listeners = listeners || {};
  for (var item in config) {
    (function(item) {
      targetFunction[item] = function(value) {
        if (!arguments.length) return config[item];
        config[item] = value;
        if (listeners.hasOwnProperty(item)) {
          listeners[item](value);
        }

        return targetFunction;
      };
    })(item); // for doesn't create a closure, forcing it
  }
};

},{}]},{},["./lib/main.js"])
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIm5vZGVfbW9kdWxlcy9icm93c2VyaWZ5L25vZGVfbW9kdWxlcy9icm93c2VyLXBhY2svX3ByZWx1ZGUuanMiLCIuL2xpYi9tYWluLmpzIiwiL2hvbWUvbWVsb2RpZS9CdXJlYXUvRXZlbnREcm9wcy9saWIvZGVsaW1pdGVyLmpzIiwiL2hvbWUvbWVsb2RpZS9CdXJlYXUvRXZlbnREcm9wcy9saWIvZXZlbnREcm9wcy5qcyIsIi9ob21lL21lbG9kaWUvQnVyZWF1L0V2ZW50RHJvcHMvbGliL2V2ZW50TGluZS5qcyIsIi9ob21lL21lbG9kaWUvQnVyZWF1L0V2ZW50RHJvcHMvbGliL2ZpbHRlckRhdGEuanMiLCIvaG9tZS9tZWxvZGllL0J1cmVhdS9FdmVudERyb3BzL2xpYi91dGlsL2NvbmZpZ3VyYWJsZS5qcyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQTtBQ0FBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDaEJBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNsREE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ2hYQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUMvREE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNuQkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSIsImZpbGUiOiJnZW5lcmF0ZWQuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlc0NvbnRlbnQiOlsiKGZ1bmN0aW9uIGUodCxuLHIpe2Z1bmN0aW9uIHMobyx1KXtpZighbltvXSl7aWYoIXRbb10pe3ZhciBhPXR5cGVvZiByZXF1aXJlPT1cImZ1bmN0aW9uXCImJnJlcXVpcmU7aWYoIXUmJmEpcmV0dXJuIGEobywhMCk7aWYoaSlyZXR1cm4gaShvLCEwKTt2YXIgZj1uZXcgRXJyb3IoXCJDYW5ub3QgZmluZCBtb2R1bGUgJ1wiK28rXCInXCIpO3Rocm93IGYuY29kZT1cIk1PRFVMRV9OT1RfRk9VTkRcIixmfXZhciBsPW5bb109e2V4cG9ydHM6e319O3Rbb11bMF0uY2FsbChsLmV4cG9ydHMsZnVuY3Rpb24oZSl7dmFyIG49dFtvXVsxXVtlXTtyZXR1cm4gcyhuP246ZSl9LGwsbC5leHBvcnRzLGUsdCxuLHIpfXJldHVybiBuW29dLmV4cG9ydHN9dmFyIGk9dHlwZW9mIHJlcXVpcmU9PVwiZnVuY3Rpb25cIiYmcmVxdWlyZTtmb3IodmFyIG89MDtvPHIubGVuZ3RoO28rKylzKHJbb10pO3JldHVybiBzfSkiLCJcInVzZSBzdHJpY3RcIjtcbi8qIGdsb2JhbCByZXF1aXJlLCBkZWZpbmUsIG1vZHVsZSAqL1xuXG52YXIgZXZlbnREcm9wcyA9IHJlcXVpcmUoJy4vZXZlbnREcm9wcycpO1xuXG5pZiAodHlwZW9mIGRlZmluZSA9PT0gXCJmdW5jdGlvblwiICYmIGRlZmluZS5hbWQpIHtcbiAgZGVmaW5lKCdkMy5jaGFydC5ldmVudERyb3BzJywgW1wiZDNcIl0sIGZ1bmN0aW9uIChkMykge1xuICAgIGQzLmNoYXJ0ID0gZDMuY2hhcnQgfHwge307XG4gICAgZDMuY2hhcnQuZXZlbnREcm9wcyA9IGV2ZW50RHJvcHMoZDMsIGRvY3VtZW50KTtcbiAgfSk7XG59IGVsc2UgaWYgKHdpbmRvdykge1xuICB3aW5kb3cuZDMuY2hhcnQgPSB3aW5kb3cuZDMuY2hhcnQgfHwge307XG4gIHdpbmRvdy5kMy5jaGFydC5ldmVudERyb3BzID0gZXZlbnREcm9wcyh3aW5kb3cuZDMsIGRvY3VtZW50KTtcbn0gZWxzZSB7XG4gIG1vZHVsZS5leHBvcnRzID0gZXZlbnREcm9wcztcbn1cbiIsIlwidXNlIHN0cmljdFwiO1xuLyogZ2xvYmFsIHJlcXVpcmUsIG1vZHVsZSwgZDMgKi9cblxudmFyIGNvbmZpZ3VyYWJsZSA9IHJlcXVpcmUoJy4vdXRpbC9jb25maWd1cmFibGUnKTtcblxudmFyIGRlZmF1bHRDb25maWcgPSB7XG4gIHhTY2FsZTogbnVsbCxcbiAgZGF0ZUZvcm1hdDogbnVsbFxufTtcblxubW9kdWxlLmV4cG9ydHMgPSBmdW5jdGlvbiAoZDMpIHtcblxuICByZXR1cm4gZnVuY3Rpb24gKGNvbmZpZykge1xuXG4gICAgY29uZmlnID0gY29uZmlnIHx8IHt9O1xuICAgIGZvciAodmFyIGtleSBpbiBkZWZhdWx0Q29uZmlnKSB7XG4gICAgICBjb25maWdba2V5XSA9IGNvbmZpZ1trZXldIHx8IGRlZmF1bHRDb25maWdba2V5XTtcbiAgICB9XG5cbiAgICBmdW5jdGlvbiBkZWxpbWl0ZXIoc2VsZWN0aW9uKSB7XG4gICAgICBzZWxlY3Rpb24uZWFjaChmdW5jdGlvbiAoZGF0YSkge1xuICAgICAgICBkMy5zZWxlY3QodGhpcykuc2VsZWN0QWxsKCd0ZXh0JykucmVtb3ZlKCk7XG5cbiAgICAgICAgdmFyIGxpbWl0cyA9IGNvbmZpZy54U2NhbGUuZG9tYWluKCk7XG5cbiAgICAgICAgZDMuc2VsZWN0KHRoaXMpLmFwcGVuZCgndGV4dCcpXG4gICAgICAgICAgLnRleHQoZnVuY3Rpb24gKCkge1xuXG4gICAgICAgICAgICByZXR1cm4gY29uZmlnLmRhdGVGb3JtYXQobGltaXRzWzBdKTtcbiAgICAgICAgICB9KVxuICAgICAgICAgIC5jbGFzc2VkKCdzdGFydCcsIHRydWUpXG4gICAgICAgIDtcblxuICAgICAgICBkMy5zZWxlY3QodGhpcykuYXBwZW5kKCd0ZXh0JylcbiAgICAgICAgICAudGV4dChmdW5jdGlvbiAoKSB7XG5cbiAgICAgICAgICAgIHJldHVybiBjb25maWcuZGF0ZUZvcm1hdChsaW1pdHNbMV0pO1xuICAgICAgICAgIH0pXG4gICAgICAgICAgLmF0dHIoJ3RleHQtYW5jaG9yJywgJ2VuZCcpXG4gICAgICAgICAgLmF0dHIoJ3RyYW5zZm9ybScsICd0cmFuc2xhdGUoJyArIGNvbmZpZy54U2NhbGUucmFuZ2UoKVsxXSArICcpJylcbiAgICAgICAgICAuY2xhc3NlZCgnZW5kJywgdHJ1ZSlcbiAgICAgICAgO1xuICAgICAgfSk7XG4gICAgfVxuXG4gICAgY29uZmlndXJhYmxlKGRlbGltaXRlciwgY29uZmlnKTtcblxuICAgIHJldHVybiBkZWxpbWl0ZXI7XG4gIH07XG59O1xuIiwiXCJ1c2Ugc3RyaWN0XCI7XG4vKiBnbG9iYWwgcmVxdWlyZSwgbW9kdWxlICovXG5cbnZhciBjb25maWd1cmFibGUgPSByZXF1aXJlKCcuL3V0aWwvY29uZmlndXJhYmxlJyk7XG4vL3ZhciBjYW52YXMgPSByZXF1aXJlKCdjYW52YXMnKTtcblxubW9kdWxlLmV4cG9ydHMgPSBmdW5jdGlvbiAoZDMsIGRvY3VtZW50KSB7XG4gIHZhciBldmVudExpbmUgPSByZXF1aXJlKCcuL2V2ZW50TGluZScpKGQzKTtcbiAgdmFyIGRlbGltaXRlciA9IHJlcXVpcmUoJy4vZGVsaW1pdGVyJykoZDMpO1xuXG4gIHZhciBkZWZhdWx0Q29uZmlnID0ge1xuXHRzdGFydDogbmV3IERhdGUoMCksXG5cdGVuZDogbmV3IERhdGUoKSxcblx0bWluU2NhbGU6IDAsXG5cdG1heFNjYWxlOiBJbmZpbml0eSxcblx0d2lkdGg6IDEwMDAsXG5cdG1hcmdpbjoge1xuXHQgIHRvcDogNjAsXG5cdCAgbGVmdDogMjAwLFxuXHQgIGJvdHRvbTogNDAsXG5cdCAgcmlnaHQ6IDUwXG5cdH0sXG5cdGxvY2FsZTogbnVsbCxcblx0YXhpc0Zvcm1hdDogbnVsbCxcblx0dGlja0Zvcm1hdDogW1xuXHRcdFtcIi4lTFwiLCBmdW5jdGlvbihkKSB7IHJldHVybiBkLmdldE1pbGxpc2Vjb25kcygpOyB9XSxcblx0XHRbXCI6JVNcIiwgZnVuY3Rpb24oZCkgeyByZXR1cm4gZC5nZXRTZWNvbmRzKCk7IH1dLFxuXHRcdFtcIiVJOiVNXCIsIGZ1bmN0aW9uKGQpIHsgcmV0dXJuIGQuZ2V0TWludXRlcygpOyB9XSxcblx0XHRbXCIlSSAlcFwiLCBmdW5jdGlvbihkKSB7IHJldHVybiBkLmdldEhvdXJzKCk7IH1dLFxuXHRcdFtcIiVhICVkXCIsIGZ1bmN0aW9uKGQpIHsgcmV0dXJuIGQuZ2V0RGF5KCkgJiYgZC5nZXREYXRlKCkgIT0gMTsgfV0sXG5cdFx0W1wiJWIgJWRcIiwgZnVuY3Rpb24oZCkgeyByZXR1cm4gZC5nZXREYXRlKCkgIT0gMTsgfV0sXG5cdFx0W1wiJUJcIiwgZnVuY3Rpb24oZCkgeyByZXR1cm4gZC5nZXRNb250aCgpOyB9XSxcblx0XHRbXCIlWVwiLCBmdW5jdGlvbigpIHsgcmV0dXJuIHRydWU7IH1dXG5cdF0sXG5cdGV2ZW50SG92ZXI6IG51bGwsXG5cdGV2ZW50Wm9vbTogbnVsbCxcblx0ZXZlbnRDbGljazogbnVsbCxcblx0aGFzRGVsaW1pdGVyOiB0cnVlLFxuXHRoYXNUb3BBeGlzOiB0cnVlLFxuXHRoYXNCb3R0b21BeGlzOiBmdW5jdGlvbiAoZGF0YSkge1xuXHQgIHJldHVybiBkYXRhLmxlbmd0aCA+PSAxMDtcblx0fSxcblx0ZXZlbnRMaW5lQ29sb3I6ICdibGFjaycsXG5cdGV2ZW50Q29sb3I6IG51bGxcbiAgfTtcblxuICByZXR1cm4gZnVuY3Rpb24gZXZlbnREcm9wcyhjb25maWcpIHtcblx0dmFyIHhTY2FsZSA9IGQzLnRpbWUuc2NhbGUoKTtcblx0dmFyIHlTY2FsZSA9IGQzLnNjYWxlLm9yZGluYWwoKTtcblx0Y29uZmlnID0gY29uZmlnIHx8IHt9O1xuXHRmb3IgKHZhciBrZXkgaW4gZGVmYXVsdENvbmZpZykge1xuXHQgIGNvbmZpZ1trZXldID0gY29uZmlnW2tleV0gfHwgZGVmYXVsdENvbmZpZ1trZXldO1xuXHR9XG5cblx0ZnVuY3Rpb24gZXZlbnREcm9wR3JhcGgoc2VsZWN0aW9uKSB7XG5cdCAgc2VsZWN0aW9uLmVhY2goZnVuY3Rpb24gKGRhdGEpIHtcblx0XHR2YXIgem9vbSA9IGQzLmJlaGF2aW9yLnpvb20oKS5jZW50ZXIobnVsbCkuc2NhbGVFeHRlbnQoW2NvbmZpZy5taW5TY2FsZSwgY29uZmlnLm1heFNjYWxlXSkub24oXCJ6b29tXCIsIHVwZGF0ZVpvb20pO1xuXG5cdFx0em9vbS5vbihcInpvb21lbmRcIiwgem9vbUVuZCk7XG5cblx0XHR2YXIgZ3JhcGhXaWR0aCA9IGNvbmZpZy53aWR0aCAtIGNvbmZpZy5tYXJnaW4ucmlnaHQgLSBjb25maWcubWFyZ2luLmxlZnQ7XG5cdFx0dmFyIGdyYXBoSGVpZ2h0ID0gZGF0YS5sZW5ndGggKiA0MDtcblx0XHR2YXIgaGVpZ2h0ID0gZ3JhcGhIZWlnaHQgKyBjb25maWcubWFyZ2luLnRvcCArIGNvbmZpZy5tYXJnaW4uYm90dG9tO1xuXG5cdFx0dmFyIGNhbnZhc193aWR0aCA9ICBncmFwaFdpZHRoO1xuXHRcdHZhciBjYW52YXNfaGVpZ2h0ID0gZ3JhcGhIZWlnaHQ7XG5cblx0XHR2YXIgbGFzdFg9Y2FudmFzX3dpZHRoLzIsIGxhc3RZPWNhbnZhc19oZWlnaHQvMjtcblx0XHR2YXIgbW91c2VEb3duID0gMDtcblxuXHRcdGQzLnNlbGVjdCh0aGlzKS5zZWxlY3QoJ2NhbnZhcycpLnJlbW92ZSgpO1xuXHRcdHZhciBjYW52YXMgPSBkMy5zZWxlY3QodGhpcylcblx0XHQgIC5hcHBlbmQoJ2NhbnZhcycpXG5cdFx0ICAuYXR0cignaWQnLCBcIm1vbl9jYW52YXNcIilcblx0XHQgIC5hdHRyKCd3aWR0aCcsIGNhbnZhc193aWR0aClcblx0XHQgIC5hdHRyKCdoZWlnaHQnLCBjYW52YXNfaGVpZ2h0KTtcblxuXHRcdCAgLy8gY29uc29sZS5sb2coY2FudmFzKTtcblx0XHQgIGNvbnNvbGUubG9nKGNhbnZhcy5ub2RlKCkpO1xuXHRcdC8vIHZhciBjYW52YXMgPSBkb2N1bWVudC5nZXRFbGVtZW50c0J5VGFnTmFtZSgnY2FudmFzJylbMF07XG5cdFx0Ly8gY2FudmFzLndpZHRoID0gY2FudmFzX3dpZHRoOyBjYW52YXMuaGVpZ2h0ID0gY2FudmFzX2hlaWdodDtcblxuXHRcdHZhciBjdHggPSAoY2FudmFzLm5vZGUoKSkuZ2V0Q29udGV4dCgnMmQnKTtcblx0XHQvL3RyYWNrVHJhbnNmb3JtcyhjdHgpO1xuXHRcdGZ1bmN0aW9uIGRyYXdBZ2Fpbigpe1xuXHRcdCAgLy8gQ2xlYXIgdGhlIGVudGlyZSBjYW52YXNcblx0XHQgIC8qdmFyIHAxID0gY3R4LnRyYW5zZm9ybWVkUG9pbnQoMCwwKTtcblx0XHQgIHZhciBwMiA9IGN0eC50cmFuc2Zvcm1lZFBvaW50KGNhbnZhcy53aWR0aCxjYW52YXMuaGVpZ2h0KTtcblx0XHQgIGN0eC5jbGVhclJlY3QocDEueCxwMS55LHAyLngtcDEueCxwMi55LXAxLnkpOyovXG5cblx0XHQgIC8vIHNob3VsZCBiZSBjb25maWd1cmFibGVcblx0XHQgIHZhciB0b3BYID0gMDtcblx0XHQgIHZhciB0b3BZID0gMDtcblx0XHQgIGN0eC5jbGVhclJlY3QodG9wWCwgdG9wWSwgdG9wWCArIGNhbnZhcy5ub2RlKCkud2lkdGgsIHRvcFkgKyBjYW52YXMubm9kZSgpLmhlaWdodCk7XG5cblx0XHQgIGN0eC5mb250ID0gXCIzMHB4IEFyaWFsXCI7XG5cdFx0XHRjdHgudGV4dEFsaWduID0gXCJjZW50ZXJcIjtcblx0XHRcdGN0eC5maWxsVGV4dChcIlRvdG9cIiw3NTAvMiwzNSk7XG5cdFx0XHRjdHguZmlsbFRleHQoXCJUb3RvXCIsNzUwLzIsNzUpO1xuXHRcdFx0Y3R4LmZpbGxUZXh0KFwiVG90b1wiLDc1MC8yLDExNSk7XG5cdFx0XHRjdHguZmlsbFRleHQoXCJUb3RvXCIsNzUwLzIsMTU1KTtcblx0XHR9XG5cdFx0Ly8gZHJhdyB0aGUgY2FudmFzIGZvciB0aGUgZmlyc3QgdGltZVxuXHRcdGRyYXdBZ2FpbigpO1xuXG5cblx0XHR2YXIgbGFzdFg9Y2FudmFzLm5vZGUoKS53aWR0aC8yLCBsYXN0WT1jYW52YXMubm9kZSgpLmhlaWdodC8yO1xuXHRcdHZhciBkcmFnZ2VkO1xuXHRcdHZhciBkcmFnU3RhcnQgPSB7XG5cdFx0XHR4IDogbGFzdFgsXG5cdFx0XHR5IDogbGFzdFlcblx0XHR9O1xuXG5cdFx0Ly8gZXZlbnQgXCJjbGlja2luZ1wiXG5cdFx0Y2FudmFzLm5vZGUoKS5hZGRFdmVudExpc3RlbmVyKCdtb3VzZWRvd24nLGZ1bmN0aW9uKGV2dCl7XG5cdFx0XHQvLyBwZXJtaXRzIGNvbXBhdGliaWxpdHkgd2l0aCBldmVyeSBicm93c2VyXG5cdFx0ICBkb2N1bWVudC5ib2R5LnN0eWxlLm1velVzZXJTZWxlY3QgPSBkb2N1bWVudC5ib2R5LnN0eWxlLndlYmtpdFVzZXJTZWxlY3QgPSBkb2N1bWVudC5ib2R5LnN0eWxlLnVzZXJTZWxlY3QgPSAnbm9uZSc7XG5cdFx0ICBsYXN0WCA9IGV2dC5vZmZzZXRYIHx8IChldnQucGFnZVggLSBjYW52YXMubm9kZSgpLm9mZnNldExlZnQpO1xuXHRcdCAgZHJhZ1N0YXJ0ID0ge1xuXHRcdCAgXHR4IDogbGFzdFgsXG5cdFx0XHRcdHkgOiBsYXN0WVxuXHRcdCAgfTtcblx0XHQgIGRyYWdnZWQgPSBmYWxzZTtcblx0XHQgIG1vdXNlRG93bisrO1xuXHRcdH0sZmFsc2UpO1xuXG5cdFx0Ly8gZXZlbnQgXCJtb3VzZSBtb3ZpbmdcIlxuXHRcdGNhbnZhcy5ub2RlKCkuYWRkRXZlbnRMaXN0ZW5lcignbW91c2Vtb3ZlJyxmdW5jdGlvbihldnQpe1xuXHRcdCAgLy9sYXN0WCA9IGV2dC5vZmZzZXRYIHx8IChldnQucGFnZVggLSBjYW52YXMubm9kZSgpLm9mZnNldExlZnQpO1xuXHRcdFx0bGFzdFggPSAoZXZ0LnBhZ2VYIC0gY2FudmFzLm5vZGUoKS5vZmZzZXRMZWZ0KTtcblx0XHQgIGRyYWdnZWQgPSB0cnVlO1xuXHRcdCAgaWYgKGRyYWdTdGFydCAmJiBtb3VzZURvd24pe1xuXHRcdFx0Ly92YXIgcHQgPSBjdHgudHJhbnNmb3JtZWRQb2ludChsYXN0WCxsYXN0WSk7XG5cdFx0XHRjdHgudHJhbnNsYXRlKGxhc3RYLWRyYWdTdGFydC54LCBsYXN0WS1kcmFnU3RhcnQueSk7XG5cdFx0XHRkcmF3QWdhaW4oKTtcblx0XHQgIH1cblx0XHR9LGZhbHNlKTtcblxuXHRcdC8vIGV2ZW50IFwic3RvcCBjbGlja2luZ1wiXG5cdFx0Y2FudmFzLm5vZGUoKS5hZGRFdmVudExpc3RlbmVyKCdtb3VzZXVwJyxmdW5jdGlvbihldnQpe1xuXHRcdCAgZHJhZ1N0YXJ0ID0gbnVsbDtcblx0XHQgIG1vdXNlRG93bi0tO1xuXHRcdCAgaWYgKCFkcmFnZ2VkKSB6b29tKGV2dC5zaGlmdEtleSA/IC0xIDogMSApO1xuXHRcdH0sZmFsc2UpO1xuXG5cdFx0Lyp2YXIgc2NhbGVGYWN0b3IgPSAxLjE7XG5cdFx0dmFyIHpvb20gPSBmdW5jdGlvbihjbGlja3Mpe1xuXHRcdCAgdmFyIHB0ID0gY3R4LnRyYW5zZm9ybWVkUG9pbnQobGFzdFgsbGFzdFkpO1xuXHRcdCAgY3R4LnRyYW5zbGF0ZShwdC54LHB0LnkpO1xuXHRcdCAgdmFyIGZhY3RvciA9IE1hdGgucG93KHNjYWxlRmFjdG9yLGNsaWNrcyk7XG5cdFx0ICBjdHguc2NhbGUoZmFjdG9yLDEpO1xuXHRcdCAgY3R4LnRyYW5zbGF0ZSgtcHQueCwtcHQueSk7XG5cdFx0ICBkcmF3QWdhaW4oKTtcblx0XHR9XG5cblx0XHR2YXIgaGFuZGxlU2Nyb2xsID0gZnVuY3Rpb24oZXZ0KXtcblx0XHQgIHZhciBkZWx0YSA9IGV2dC53aGVlbERlbHRhID8gZXZ0LndoZWVsRGVsdGEvNDAgOiBldnQuZGV0YWlsID8gLWV2dC5kZXRhaWwgOiAwO1xuXHRcdCAgaWYgKGRlbHRhKSB6b29tKGRlbHRhKTtcblx0XHQgIHJldHVybiBldnQucHJldmVudERlZmF1bHQoKSAmJiBmYWxzZTtcblx0XHR9O1xuXHRcdGNhbnZhcy5hZGRFdmVudExpc3RlbmVyKCdET01Nb3VzZVNjcm9sbCcsaGFuZGxlU2Nyb2xsLGZhbHNlKTtcblx0XHRjYW52YXMuYWRkRXZlbnRMaXN0ZW5lcignbW91c2V3aGVlbCcsaGFuZGxlU2Nyb2xsLGZhbHNlKTtcblxuXHRcdCovXG5cblxuXHRcdGQzLnNlbGVjdCh0aGlzKS5zZWxlY3QoJ3N2ZycpLnJlbW92ZSgpO1xuXG5cdFx0dmFyIHN2ZyA9IGQzLnNlbGVjdCh0aGlzKVxuXHRcdCAgLmFwcGVuZCgnc3ZnJylcblx0XHQgIC5hdHRyKCd3aWR0aCcsIGNvbmZpZy53aWR0aClcblx0XHQgIC5hdHRyKCdoZWlnaHQnLCBoZWlnaHQpXG5cdFx0O1xuXG5cdFx0dmFyIGdyYXBoID0gc3ZnLmFwcGVuZCgnZycpXG5cdFx0ICAuYXR0cigndHJhbnNmb3JtJywgJ3RyYW5zbGF0ZSgwLCAyNSknKTtcblxuXHRcdHZhciB5RG9tYWluID0gW107XG5cdFx0dmFyIHlSYW5nZSA9IFtdO1xuXG5cdFx0ZGF0YS5mb3JFYWNoKGZ1bmN0aW9uIChldmVudCwgaW5kZXgpIHtcblx0XHQgIHlEb21haW4ucHVzaChldmVudC5uYW1lKTtcblx0XHQgIHlSYW5nZS5wdXNoKGluZGV4ICogNDApO1xuXHRcdH0pO1xuXG5cdFx0eVNjYWxlLmRvbWFpbih5RG9tYWluKS5yYW5nZSh5UmFuZ2UpO1xuXG5cdFx0Ly8gdGhpcyBwYXJ0IGluIGNvbW1lbnRzIHVzZWQgdG8gZHJhdyBsaW5lcyBpbiBzdmcgb24gdGhlIGdyYXBoXG5cblx0XHQvLyB0cmFuc2xhdGlvbiBkZSA0MCBwb3VyIGxlcyBsaWduZXNcblxuXHRcdHZhciB5QXhpc0VsID0gZ3JhcGguYXBwZW5kKCdnJylcblx0XHQgIC5jbGFzc2VkKCd5LWF4aXMnLCB0cnVlKVxuXHRcdCAgLmF0dHIoJ3RyYW5zZm9ybScsICd0cmFuc2xhdGUoMCwgNjApJyk7XG5cblx0XHR2YXIgeVRpY2sgPSB5QXhpc0VsLmFwcGVuZCgnZycpLnNlbGVjdEFsbCgnZycpLmRhdGEoeURvbWFpbik7XG5cblx0XHQvL3ZhciB5VGljayA9IGdyYXBoLmFwcGVuZCgnZycpLnNlbGVjdEFsbCgnZycpLmRhdGEoeURvbWFpbik7XG5cblx0XHR5VGljay5lbnRlcigpXG5cdFx0ICAuYXBwZW5kKCdnJylcblx0XHQgIC5hdHRyKCd0cmFuc2Zvcm0nLCBmdW5jdGlvbihkKSB7XG5cdFx0XHRyZXR1cm4gJ3RyYW5zbGF0ZSgwLCAnICsgeVNjYWxlKGQpICsgJyknO1xuXHRcdCAgfSlcblx0XHQgIC5hcHBlbmQoJ2xpbmUnKVxuXHRcdCAgLmNsYXNzZWQoJ3ktdGljaycsIHRydWUpXG5cdFx0ICAuYXR0cigneDEnLCBjb25maWcubWFyZ2luLmxlZnQpXG5cdFx0ICAuYXR0cigneDInLCBjb25maWcubWFyZ2luLmxlZnQgKyBncmFwaFdpZHRoKTtcblxuXHRcdHlUaWNrLmV4aXQoKS5yZW1vdmUoKTtcblxuXHRcdHZhciBjdXJ4LCBjdXJ5O1xuXHRcdHZhciB6b29tUmVjdCA9IHN2Z1xuXHRcdCAgLmFwcGVuZCgncmVjdCcpXG5cdFx0ICAuY2FsbCh6b29tKVxuXHRcdCAgLmNsYXNzZWQoJ3pvb20nLCB0cnVlKVxuXHRcdCAgLmF0dHIoJ3dpZHRoJywgZ3JhcGhXaWR0aClcblx0XHQgIC5hdHRyKCdoZWlnaHQnLCBoZWlnaHQgKVxuXHRcdCAgLmF0dHIoJ3RyYW5zZm9ybScsICd0cmFuc2xhdGUoJyArIGNvbmZpZy5tYXJnaW4ubGVmdCArICcsIDM1KScpXG5cdFx0O1xuXG5cdFx0aWYgKHR5cGVvZiBjb25maWcuZXZlbnRIb3ZlciA9PT0gJ2Z1bmN0aW9uJykge1xuXHRcdCAgem9vbVJlY3Qub24oJ21vdXNlbW92ZScsIGZ1bmN0aW9uKGQsIGUpIHtcblx0XHRcdHZhciBldmVudCA9IGQzLmV2ZW50O1xuXHRcdFx0aWYgKGN1cnggPT0gZXZlbnQuY2xpZW50WCAmJiBjdXJ5ID09IGV2ZW50LmNsaWVudFkpIHJldHVybjtcblx0XHRcdGN1cnggPSBldmVudC5jbGllbnRYO1xuXHRcdFx0Y3VyeSA9IGV2ZW50LmNsaWVudFk7XG5cdFx0XHR6b29tUmVjdC5hdHRyKCdkaXNwbGF5JywgJ25vbmUnKTtcblx0XHRcdHZhciBlbCA9IGRvY3VtZW50LmVsZW1lbnRGcm9tUG9pbnQoZDMuZXZlbnQuY2xpZW50WCwgZDMuZXZlbnQuY2xpZW50WSk7XG5cdFx0XHR6b29tUmVjdC5hdHRyKCdkaXNwbGF5JywgJ2Jsb2NrJyk7XG5cdFx0XHRpZiAoZWwudGFnTmFtZSAhPT0gJ2NpcmNsZScpIHJldHVybjtcblx0XHRcdGNvbmZpZy5ldmVudEhvdmVyKGVsKTtcblx0XHQgIH0pO1xuXHRcdH1cblxuXHRcdGlmICh0eXBlb2YgY29uZmlnLmV2ZW50Q2xpY2sgPT09ICdmdW5jdGlvbicpIHtcblx0XHQgIHpvb21SZWN0Lm9uKCdjbGljaycsIGZ1bmN0aW9uICgpIHtcblx0XHRcdHpvb21SZWN0LmF0dHIoJ2Rpc3BsYXknLCAnbm9uZScpO1xuXHRcdFx0dmFyIGVsID0gZG9jdW1lbnQuZWxlbWVudEZyb21Qb2ludChkMy5ldmVudC5jbGllbnRYLCBkMy5ldmVudC5jbGllbnRZKTtcblx0XHRcdHpvb21SZWN0LmF0dHIoJ2Rpc3BsYXknLCAnYmxvY2snKTtcblx0XHRcdGlmIChlbC50YWdOYW1lICE9PSAnY2lyY2xlJykgcmV0dXJuO1xuXHRcdFx0Y29uZmlnLmV2ZW50Q2xpY2soZWwpO1xuXHRcdCAgfSk7XG5cdFx0fVxuXG5cdFx0eFNjYWxlLnJhbmdlKFswLCBncmFwaFdpZHRoXSkuZG9tYWluKFtjb25maWcuc3RhcnQsIGNvbmZpZy5lbmRdKTtcblxuXHRcdHpvb20ueCh4U2NhbGUpO1xuXG5cdFx0ZnVuY3Rpb24gdXBkYXRlWm9vbSgpIHtcblx0XHQgIGlmIChkMy5ldmVudC5zb3VyY2VFdmVudC50b1N0cmluZygpID09PSAnW29iamVjdCBNb3VzZUV2ZW50XScpIHtcblx0XHRcdHpvb20udHJhbnNsYXRlKFtkMy5ldmVudC50cmFuc2xhdGVbMF0sIDBdKTtcblx0XHQgIH1cblxuXHRcdCAgaWYgKGQzLmV2ZW50LnNvdXJjZUV2ZW50LnRvU3RyaW5nKCkgPT09ICdbb2JqZWN0IFdoZWVsRXZlbnRdJykge1xuXHRcdFx0em9vbS5zY2FsZShkMy5ldmVudC5zY2FsZSk7XG5cdFx0ICB9XG5cblx0XHQgIHJlZHJhdygpO1xuXHRcdH1cblxuXHRcdGZ1bmN0aW9uIHJlZHJhd0RlbGltaXRlcigpIHtcblx0XHQgIHN2Zy5zZWxlY3QoJy5kZWxpbWl0ZXInKS5yZW1vdmUoKTtcblx0XHQgIHZhciBkZWxpbWl0ZXJFbCA9IHN2Z1xuXHRcdFx0LmFwcGVuZCgnZycpXG5cdFx0XHQuY2xhc3NlZCgnZGVsaW1pdGVyJywgdHJ1ZSlcblx0XHRcdC5hdHRyKCd3aWR0aCcsIGdyYXBoV2lkdGgpXG5cdFx0XHQuYXR0cignaGVpZ2h0JywgMTApXG5cdFx0XHQuYXR0cigndHJhbnNmb3JtJywgJ3RyYW5zbGF0ZSgnICsgY29uZmlnLm1hcmdpbi5sZWZ0ICsgJywgJyArIChjb25maWcubWFyZ2luLnRvcCAtIDQ1KSArICcpJylcblx0XHRcdC5jYWxsKGRlbGltaXRlcih7XG5cdFx0XHQgIHhTY2FsZTogeFNjYWxlLFxuXHRcdFx0ICBkYXRlRm9ybWF0OiBjb25maWcubG9jYWxlID8gY29uZmlnLmxvY2FsZS50aW1lRm9ybWF0KFwiJWQgJUIgJVlcIikgOiBkMy50aW1lLmZvcm1hdChcIiVkICVCICVZXCIpXG5cdFx0XHR9KSlcblx0XHQgIDtcblx0XHR9XG5cblx0XHRmdW5jdGlvbiB6b29tRW5kKCkge1xuXHRcdCAgaWYgKGNvbmZpZy5ldmVudFpvb20pIHtcblx0XHRcdGNvbmZpZy5ldmVudFpvb20oeFNjYWxlKTtcblx0XHQgIH1cblx0XHQgIGlmIChjb25maWcuaGFzRGVsaW1pdGVyKSB7XG5cdFx0XHRyZWRyYXdEZWxpbWl0ZXIoKTtcblx0XHQgIH1cblx0XHR9XG5cblx0XHRmdW5jdGlvbiBkcmF3WEF4aXMod2hlcmUpIHtcblxuXHRcdCAgLy8gY29weSBjb25maWcudGlja0Zvcm1hdCBiZWNhdXNlIGQzIGZvcm1hdC5tdWx0aSBlZGl0IGl0cyBnaXZlbiB0aWNrRm9ybWF0IGRhdGFcblx0XHQgIHZhciB0aWNrRm9ybWF0RGF0YSA9IFtdO1xuXG5cdFx0ICBjb25maWcudGlja0Zvcm1hdC5mb3JFYWNoKGZ1bmN0aW9uIChpdGVtKSB7XG5cdFx0XHR2YXIgdGljayA9IGl0ZW0uc2xpY2UoMCk7XG5cdFx0XHR0aWNrRm9ybWF0RGF0YS5wdXNoKHRpY2spO1xuXHRcdCAgfSk7XG5cblx0XHQgIHZhciB0aWNrRm9ybWF0ID0gY29uZmlnLmxvY2FsZSA/IGNvbmZpZy5sb2NhbGUudGltZUZvcm1hdC5tdWx0aSh0aWNrRm9ybWF0RGF0YSkgOiBkMy50aW1lLmZvcm1hdC5tdWx0aSh0aWNrRm9ybWF0RGF0YSk7XG5cdFx0ICB2YXIgeEF4aXMgPSBkMy5zdmcuYXhpcygpXG5cdFx0XHQuc2NhbGUoeFNjYWxlKVxuXHRcdFx0Lm9yaWVudCh3aGVyZSlcblx0XHRcdC50aWNrRm9ybWF0KHRpY2tGb3JtYXQpXG5cdFx0ICA7XG5cblx0XHQgIGlmICh0eXBlb2YgY29uZmlnLmF4aXNGb3JtYXQgPT09ICdmdW5jdGlvbicpIHtcblx0XHRcdGNvbmZpZy5heGlzRm9ybWF0KHhBeGlzKTtcblx0XHQgIH1cblxuXHRcdCAgdmFyIHkgPSAod2hlcmUgPT0gJ2JvdHRvbScgPyBwYXJzZUludChncmFwaEhlaWdodCkgOiAwKSArIGNvbmZpZy5tYXJnaW4udG9wIC0gNDA7XG5cblx0XHQgIGdyYXBoLnNlbGVjdCgnLngtYXhpcy4nICsgd2hlcmUpLnJlbW92ZSgpO1xuXHRcdCAgdmFyIHhBeGlzRWwgPSBncmFwaFxuXHRcdFx0LmFwcGVuZCgnZycpXG5cdFx0XHQuY2xhc3NlZCgneC1heGlzJywgdHJ1ZSlcblx0XHRcdC5jbGFzc2VkKHdoZXJlLCB0cnVlKVxuXHRcdFx0LmF0dHIoJ3RyYW5zZm9ybScsICd0cmFuc2xhdGUoJyArIGNvbmZpZy5tYXJnaW4ubGVmdCArICcsICcgKyB5ICsgJyknKVxuXHRcdFx0LmNhbGwoeEF4aXMpXG5cdFx0ICA7XG5cdFx0fVxuXG5cdFx0ZnVuY3Rpb24gcmVkcmF3KCkge1xuXG5cdFx0ICB2YXIgaGFzVG9wQXhpcyA9IHR5cGVvZiBjb25maWcuaGFzVG9wQXhpcyA9PT0gJ2Z1bmN0aW9uJyA/IGNvbmZpZy5oYXNUb3BBeGlzKGRhdGEpIDogY29uZmlnLmhhc1RvcEF4aXM7XG5cdFx0ICBpZiAoaGFzVG9wQXhpcykge1xuXHRcdFx0ZHJhd1hBeGlzKCd0b3AnKTtcblx0XHQgIH1cblxuXHRcdCAgdmFyIGhhc0JvdHRvbUF4aXMgPSB0eXBlb2YgY29uZmlnLmhhc0JvdHRvbUF4aXMgPT09ICdmdW5jdGlvbicgPyBjb25maWcuaGFzQm90dG9tQXhpcyhkYXRhKSA6IGNvbmZpZy5oYXNCb3R0b21BeGlzO1xuXHRcdCAgaWYgKGhhc0JvdHRvbUF4aXMpIHtcblx0XHRcdGRyYXdYQXhpcygnYm90dG9tJyk7XG5cdFx0ICB9XG5cblx0XHQgIHpvb20uc2l6ZShbY29uZmlnLndpZHRoLCBoZWlnaHRdKTtcblxuXHRcdCAgZ3JhcGguc2VsZWN0KCcuZ3JhcGgtYm9keScpLnJlbW92ZSgpO1xuXHRcdCAgdmFyIGdyYXBoQm9keSA9IGdyYXBoXG5cdFx0XHQuYXBwZW5kKCdnJylcblx0XHRcdC5jbGFzc2VkKCdncmFwaC1ib2R5JywgdHJ1ZSlcblx0XHRcdC5hdHRyKCd0cmFuc2Zvcm0nLCAndHJhbnNsYXRlKCcgKyBjb25maWcubWFyZ2luLmxlZnQgKyAnLCAnICsgKGNvbmZpZy5tYXJnaW4udG9wIC0gMTUpICsgJyknKTtcblxuXHRcdCAgdmFyIGxpbmVzID0gZ3JhcGhCb2R5LnNlbGVjdEFsbCgnZycpLmRhdGEoZGF0YSk7XG5cblx0XHQgIGxpbmVzLmVudGVyKClcblx0XHRcdC5hcHBlbmQoJ2cnKVxuXHRcdFx0LmNsYXNzZWQoJ2xpbmUnLCB0cnVlKVxuXHRcdFx0LmF0dHIoJ3RyYW5zZm9ybScsIGZ1bmN0aW9uKGQpIHtcblx0XHRcdCAgcmV0dXJuICd0cmFuc2xhdGUoMCwnICsgeVNjYWxlKGQubmFtZSkgKyAnKSc7XG5cdFx0XHR9KVxuXHRcdFx0LnN0eWxlKCdmaWxsJywgY29uZmlnLmV2ZW50TGluZUNvbG9yKVxuXHRcdFx0LmNhbGwoZXZlbnRMaW5lKHsgeFNjYWxlOiB4U2NhbGUsIGV2ZW50Q29sb3I6IGNvbmZpZy5ldmVudENvbG9yIH0pKVxuXHRcdCAgO1xuXG5cdFx0ICBsaW5lcy5leGl0KCkucmVtb3ZlKCk7XG5cdFx0fVxuXG5cdFx0cmVkcmF3KCk7XG5cdFx0aWYgKGNvbmZpZy5oYXNEZWxpbWl0ZXIpIHtcblx0XHQgIHJlZHJhd0RlbGltaXRlcigpO1xuXHRcdH1cblx0XHRpZiAoY29uZmlnLmV2ZW50Wm9vbSkge1xuXHRcdCAgY29uZmlnLmV2ZW50Wm9vbSh4U2NhbGUpO1xuXHRcdH1cblx0ICB9KTtcblx0fVxuXG5cdGNvbmZpZ3VyYWJsZShldmVudERyb3BHcmFwaCwgY29uZmlnKTtcblxuXHRyZXR1cm4gZXZlbnREcm9wR3JhcGg7XG4gIH07XG59O1xuIiwiXCJ1c2Ugc3RyaWN0XCI7XG4vKiBnbG9iYWwgcmVxdWlyZSwgbW9kdWxlLCBkMyAqL1xuXG52YXIgY29uZmlndXJhYmxlID0gcmVxdWlyZSgnLi91dGlsL2NvbmZpZ3VyYWJsZScpO1xudmFyIGZpbHRlckRhdGEgPSByZXF1aXJlKCcuL2ZpbHRlckRhdGEnKTtcblxudmFyIGRlZmF1bHRDb25maWcgPSB7XG4gIHhTY2FsZTogbnVsbFxufTtcblxubW9kdWxlLmV4cG9ydHMgPSBmdW5jdGlvbiAoZDMpIHtcbiAgcmV0dXJuIGZ1bmN0aW9uIChjb25maWcpIHtcblxuICAgIGNvbmZpZyA9IGNvbmZpZyB8fCB7XG4gICAgICB4U2NhbGU6IG51bGwsXG4gICAgICBldmVudENvbG9yOiBudWxsXG4gICAgfTtcbiAgICBmb3IgKHZhciBrZXkgaW4gZGVmYXVsdENvbmZpZykge1xuICAgICAgY29uZmlnW2tleV0gPSBjb25maWdba2V5XSB8fCBkZWZhdWx0Q29uZmlnW2tleV07XG4gICAgfVxuXG4gICAgdmFyIGV2ZW50TGluZSA9IGZ1bmN0aW9uIGV2ZW50TGluZShzZWxlY3Rpb24pIHtcbiAgICAgIHNlbGVjdGlvbi5lYWNoKGZ1bmN0aW9uIChkYXRhKSB7XG4gICAgICAgIGQzLnNlbGVjdCh0aGlzKS5zZWxlY3RBbGwoJ3RleHQnKS5yZW1vdmUoKTtcblxuICAgICAgICBkMy5zZWxlY3QodGhpcykuYXBwZW5kKCd0ZXh0JylcbiAgICAgICAgICAudGV4dChmdW5jdGlvbihkKSB7XG4gICAgICAgICAgICB2YXIgY291bnQgPSBmaWx0ZXJEYXRhKGQuZGF0ZXMsIGNvbmZpZy54U2NhbGUpLmxlbmd0aDtcbiAgICAgICAgICAgIHJldHVybiBkLm5hbWUgKyAoY291bnQgPiAwID8gJyAoJyArIGNvdW50ICsgJyknIDogJycpO1xuICAgICAgICAgIH0pXG4gICAgICAgICAgLmF0dHIoJ3RleHQtYW5jaG9yJywgJ2VuZCcpXG4gICAgICAgICAgLmF0dHIoJ3RyYW5zZm9ybScsICd0cmFuc2xhdGUoLTIwKScpXG4gICAgICAgICAgLnN0eWxlKCdmaWxsJywgJ2JsYWNrJylcbiAgICAgICAgO1xuXG4gICAgICAgIC8vZDMuc2VsZWN0KHRoaXMpLnNlbGVjdEFsbCgnY2lyY2xlJykucmVtb3ZlKCk7XG5cbiAgICAgICAgLyp2YXIgY2lyY2xlID0gZDMuc2VsZWN0KHRoaXMpLnNlbGVjdEFsbCgnY2lyY2xlJylcbiAgICAgICAgICAuZGF0YShmdW5jdGlvbihkKSB7XG4gICAgICAgICAgICAvLyBmaWx0ZXIgdmFsdWUgb3V0c2lkZSBvZiByYW5nZVxuICAgICAgICAgICAgcmV0dXJuIGZpbHRlckRhdGEoZC5kYXRlcywgY29uZmlnLnhTY2FsZSk7XG4gICAgICAgICAgfSk7XG5cbiAgICAgICAgY2lyY2xlLmVudGVyKClcbiAgICAgICAgICAuYXBwZW5kKCdjaXJjbGUnKVxuICAgICAgICAgIC5hdHRyKCdjeCcsIGZ1bmN0aW9uKGQpIHtcbiAgICAgICAgICAgIHJldHVybiBjb25maWcueFNjYWxlKGQpO1xuICAgICAgICAgIH0pXG4gICAgICAgICAgLnN0eWxlKCdmaWxsJywgY29uZmlnLmV2ZW50Q29sb3IpXG4gICAgICAgICAgLmF0dHIoJ2N5JywgLTUpXG4gICAgICAgICAgLmF0dHIoJ3InLCAxMClcbiAgICAgICAgO1xuXG4gICAgICAgIGNpcmNsZS5leGl0KCkucmVtb3ZlKCk7Ki9cblxuICAgICAgfSk7XG4gICAgfTtcblxuICAgIGNvbmZpZ3VyYWJsZShldmVudExpbmUsIGNvbmZpZyk7XG5cbiAgICByZXR1cm4gZXZlbnRMaW5lO1xuICB9O1xufTtcbiIsIlwidXNlIHN0cmljdFwiO1xuLyogZ2xvYmFsIG1vZHVsZSAqL1xuXG5tb2R1bGUuZXhwb3J0cyA9IGZ1bmN0aW9uIGZpbHRlckRhdGUoZGF0YSwgc2NhbGUpIHtcbiAgZGF0YSA9IGRhdGEgfHwgW107XG4gIHZhciBmaWx0ZXJlZERhdGEgPSBbXTtcbiAgdmFyIGJvdW5kYXJ5ID0gc2NhbGUucmFuZ2UoKTtcbiAgdmFyIG1pbiA9IGJvdW5kYXJ5WzBdO1xuICB2YXIgbWF4ID0gYm91bmRhcnlbMV07XG4gIGRhdGEuZm9yRWFjaChmdW5jdGlvbiAoZGF0dW0pIHtcbiAgICB2YXIgdmFsdWUgPSBzY2FsZShkYXR1bSk7XG4gICAgaWYgKHZhbHVlIDwgbWluIHx8IHZhbHVlID4gbWF4KSB7XG4gICAgICByZXR1cm47XG4gICAgfVxuICAgIGZpbHRlcmVkRGF0YS5wdXNoKGRhdHVtKTtcbiAgfSk7XG5cbiAgcmV0dXJuIGZpbHRlcmVkRGF0YTtcbn07XG4iLCJtb2R1bGUuZXhwb3J0cyA9IGZ1bmN0aW9uIGNvbmZpZ3VyYWJsZSh0YXJnZXRGdW5jdGlvbiwgY29uZmlnLCBsaXN0ZW5lcnMpIHtcbiAgbGlzdGVuZXJzID0gbGlzdGVuZXJzIHx8IHt9O1xuICBmb3IgKHZhciBpdGVtIGluIGNvbmZpZykge1xuICAgIChmdW5jdGlvbihpdGVtKSB7XG4gICAgICB0YXJnZXRGdW5jdGlvbltpdGVtXSA9IGZ1bmN0aW9uKHZhbHVlKSB7XG4gICAgICAgIGlmICghYXJndW1lbnRzLmxlbmd0aCkgcmV0dXJuIGNvbmZpZ1tpdGVtXTtcbiAgICAgICAgY29uZmlnW2l0ZW1dID0gdmFsdWU7XG4gICAgICAgIGlmIChsaXN0ZW5lcnMuaGFzT3duUHJvcGVydHkoaXRlbSkpIHtcbiAgICAgICAgICBsaXN0ZW5lcnNbaXRlbV0odmFsdWUpO1xuICAgICAgICB9XG5cbiAgICAgICAgcmV0dXJuIHRhcmdldEZ1bmN0aW9uO1xuICAgICAgfTtcbiAgICB9KShpdGVtKTsgLy8gZm9yIGRvZXNuJ3QgY3JlYXRlIGEgY2xvc3VyZSwgZm9yY2luZyBpdFxuICB9XG59O1xuIl19
