(function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);var f=new Error("Cannot find module '"+o+"'");throw f.code="MODULE_NOT_FOUND",f}var l=n[o]={exports:{}};t[o][0].call(l.exports,function(e){var n=t[o][1][e];return s(n?n:e)},l,l.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({"./lib/main.js":[function(require,module,exports){
"use strict";
/* global require, define, module */

var eventDrops = require('./eventDrops');

if (typeof define === "function" && define.amd) {
  define('d3.chart.eventDrops', ["d3"], function (d3) {
    d3.chart = d3.chart || {};
    d3.chart.eventDrops = eventDrops(d3);
  });
} else if (window) {
  window.d3.chart = window.d3.chart || {};
  window.d3.chart.eventDrops = eventDrops(window.d3);
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

module.exports = function (d3) {
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
		var canvas_height = graphHeight

		var lastX=canvas_width/2, lastY=canvas_height/2;

		d3.select(this).select('canvas').remove();
		var canvas = d3.select(this)
		  .append('canvas')
		  .attr('id', "mon_canvas")
		  .attr('width', canvas_width)
		  .attr('height', canvas_height)

		var canvas = document.getElementsByTagName('canvas')[0];
		canvas.width = canvas_width; canvas.height = canvas_height;

		var ctx = canvas.getContext('2d');
		trackTransforms(ctx);
		function drawAgain(){
		  // Clear the entire canvas
		  var p1 = ctx.transformedPoint(0,0);
		  var p2 = ctx.transformedPoint(canvas.width,canvas.height);
		  ctx.clearRect(p1.x,p1.y,p2.x-p1.x,p2.y-p1.y);

		  ctx.font = "30px Arial";
		ctx.textAlign = "center";
		ctx.fillText("Toto",750/2,35);
		ctx.fillText("Toto",750/2,75);
		ctx.fillText("Toto",750/2,115);
		ctx.fillText("Toto",750/2,155);
		}
		// draw the canvas for the first time
		drawAgain();


		var lastX=canvas.width/2, lastY=canvas.height/2;
		var dragStart,dragged;

		// event "clicking"
		canvas.addEventListener('mousedown',function(evt){
		  document.body.style.mozUserSelect = document.body.style.webkitUserSelect = document.body.style.userSelect = 'none';
		  lastX = evt.offsetX || (evt.pageX - canvas.offsetLeft);
		  //lastY = evt.offsetY || (evt.pageY - canvas.offsetTop);
		  dragStart = ctx.transformedPoint(lastX,lastY);
		  dragged = false;
		},false);

		// event "mouse moving"
		canvas.addEventListener('mousemove',function(evt){
		  lastX = evt.offsetX || (evt.pageX - canvas.offsetLeft);
		  //lastY = evt.offsetY || (evt.pageY - canvas.offsetTop);
		  dragged = true;
		  if (dragStart){
			var pt = ctx.transformedPoint(lastX,lastY);
			ctx.translate(pt.x-dragStart.x,pt.y-dragStart.y);
			drawAgain();
		  }
		},false);

		// event "stop clicking"
		canvas.addEventListener('mouseup',function(evt){
		  dragStart = null;
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

	// Adds ctx.getTransform() - returns an SVGMatrix
  // Adds ctx.transformedPoint(x,y) - returns an SVGPoint
  function trackTransforms(ctx){
	var svg = document.createElementNS("http://www.w3.org/2000/svg",'svg');
	var xform = svg.createSVGMatrix();
	ctx.getTransform = function(){ return xform; };

	var savedTransforms = [];
	var save = ctx.save;
	ctx.save = function(){
	  savedTransforms.push(xform.translate(0,0));
	  return save.call(ctx);
	};
	var restore = ctx.restore;
	ctx.restore = function(){
	  xform = savedTransforms.pop();
	  return restore.call(ctx);
	};

	var scale = ctx.scale;
	ctx.scale = function(sx,sy){
	  xform = xform.scaleNonUniform(sx,sy);
	  return scale.call(ctx,sx,sy);
	};
	var rotate = ctx.rotate;
	ctx.rotate = function(radians){
	  xform = xform.rotate(radians*180/Math.PI);
	  return rotate.call(ctx,radians);
	};
	var translate = ctx.translate;
	ctx.translate = function(dx,dy){
	  xform = xform.translate(dx,dy);
	  return translate.call(ctx,dx,dy);
	};
	var transform = ctx.transform;
	ctx.transform = function(a,b,c,d,e,f){
	  var m2 = svg.createSVGMatrix();
	  m2.a=a; m2.b=b; m2.c=c; m2.d=d; m2.e=e; m2.f=f;
	  xform = xform.multiply(m2);
	  return transform.call(ctx,a,b,c,d,e,f);
	};
	var setTransform = ctx.setTransform;
	ctx.setTransform = function(a,b,c,d,e,f){
	  xform.a = a;
	  xform.b = b;
	  xform.c = c;
	  xform.d = d;
	  xform.e = e;
	  xform.f = f;
	  return setTransform.call(ctx,a,b,c,d,e,f);
	};
	var pt  = svg.createSVGPoint();
	ctx.transformedPoint = function(x,y){
	  pt.x=x; pt.y=y;
	  return pt.matrixTransform(xform.inverse());
	}
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIm5vZGVfbW9kdWxlcy9icm93c2VyaWZ5L25vZGVfbW9kdWxlcy9icm93c2VyLXBhY2svX3ByZWx1ZGUuanMiLCIuL2xpYi9tYWluLmpzIiwiL2hvbWUvbWVsb2RpZS9CdXJlYXUvRXZlbnREcm9wcy9saWIvZGVsaW1pdGVyLmpzIiwiL2hvbWUvbWVsb2RpZS9CdXJlYXUvRXZlbnREcm9wcy9saWIvZXZlbnREcm9wcy5qcyIsIi9ob21lL21lbG9kaWUvQnVyZWF1L0V2ZW50RHJvcHMvbGliL2V2ZW50TGluZS5qcyIsIi9ob21lL21lbG9kaWUvQnVyZWF1L0V2ZW50RHJvcHMvbGliL2ZpbHRlckRhdGEuanMiLCIvaG9tZS9tZWxvZGllL0J1cmVhdS9FdmVudERyb3BzL2xpYi91dGlsL2NvbmZpZ3VyYWJsZS5qcyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQTtBQ0FBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDaEJBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNsREE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDeFpBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQy9EQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ25CQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBIiwiZmlsZSI6ImdlbmVyYXRlZC5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzQ29udGVudCI6WyIoZnVuY3Rpb24gZSh0LG4scil7ZnVuY3Rpb24gcyhvLHUpe2lmKCFuW29dKXtpZighdFtvXSl7dmFyIGE9dHlwZW9mIHJlcXVpcmU9PVwiZnVuY3Rpb25cIiYmcmVxdWlyZTtpZighdSYmYSlyZXR1cm4gYShvLCEwKTtpZihpKXJldHVybiBpKG8sITApO3ZhciBmPW5ldyBFcnJvcihcIkNhbm5vdCBmaW5kIG1vZHVsZSAnXCIrbytcIidcIik7dGhyb3cgZi5jb2RlPVwiTU9EVUxFX05PVF9GT1VORFwiLGZ9dmFyIGw9bltvXT17ZXhwb3J0czp7fX07dFtvXVswXS5jYWxsKGwuZXhwb3J0cyxmdW5jdGlvbihlKXt2YXIgbj10W29dWzFdW2VdO3JldHVybiBzKG4/bjplKX0sbCxsLmV4cG9ydHMsZSx0LG4scil9cmV0dXJuIG5bb10uZXhwb3J0c312YXIgaT10eXBlb2YgcmVxdWlyZT09XCJmdW5jdGlvblwiJiZyZXF1aXJlO2Zvcih2YXIgbz0wO288ci5sZW5ndGg7bysrKXMocltvXSk7cmV0dXJuIHN9KSIsIlwidXNlIHN0cmljdFwiO1xuLyogZ2xvYmFsIHJlcXVpcmUsIGRlZmluZSwgbW9kdWxlICovXG5cbnZhciBldmVudERyb3BzID0gcmVxdWlyZSgnLi9ldmVudERyb3BzJyk7XG5cbmlmICh0eXBlb2YgZGVmaW5lID09PSBcImZ1bmN0aW9uXCIgJiYgZGVmaW5lLmFtZCkge1xuICBkZWZpbmUoJ2QzLmNoYXJ0LmV2ZW50RHJvcHMnLCBbXCJkM1wiXSwgZnVuY3Rpb24gKGQzKSB7XG4gICAgZDMuY2hhcnQgPSBkMy5jaGFydCB8fCB7fTtcbiAgICBkMy5jaGFydC5ldmVudERyb3BzID0gZXZlbnREcm9wcyhkMyk7XG4gIH0pO1xufSBlbHNlIGlmICh3aW5kb3cpIHtcbiAgd2luZG93LmQzLmNoYXJ0ID0gd2luZG93LmQzLmNoYXJ0IHx8IHt9O1xuICB3aW5kb3cuZDMuY2hhcnQuZXZlbnREcm9wcyA9IGV2ZW50RHJvcHMod2luZG93LmQzKTtcbn0gZWxzZSB7XG4gIG1vZHVsZS5leHBvcnRzID0gZXZlbnREcm9wcztcbn1cbiIsIlwidXNlIHN0cmljdFwiO1xuLyogZ2xvYmFsIHJlcXVpcmUsIG1vZHVsZSwgZDMgKi9cblxudmFyIGNvbmZpZ3VyYWJsZSA9IHJlcXVpcmUoJy4vdXRpbC9jb25maWd1cmFibGUnKTtcblxudmFyIGRlZmF1bHRDb25maWcgPSB7XG4gIHhTY2FsZTogbnVsbCxcbiAgZGF0ZUZvcm1hdDogbnVsbFxufTtcblxubW9kdWxlLmV4cG9ydHMgPSBmdW5jdGlvbiAoZDMpIHtcblxuICByZXR1cm4gZnVuY3Rpb24gKGNvbmZpZykge1xuXG4gICAgY29uZmlnID0gY29uZmlnIHx8IHt9O1xuICAgIGZvciAodmFyIGtleSBpbiBkZWZhdWx0Q29uZmlnKSB7XG4gICAgICBjb25maWdba2V5XSA9IGNvbmZpZ1trZXldIHx8IGRlZmF1bHRDb25maWdba2V5XTtcbiAgICB9XG5cbiAgICBmdW5jdGlvbiBkZWxpbWl0ZXIoc2VsZWN0aW9uKSB7XG4gICAgICBzZWxlY3Rpb24uZWFjaChmdW5jdGlvbiAoZGF0YSkge1xuICAgICAgICBkMy5zZWxlY3QodGhpcykuc2VsZWN0QWxsKCd0ZXh0JykucmVtb3ZlKCk7XG5cbiAgICAgICAgdmFyIGxpbWl0cyA9IGNvbmZpZy54U2NhbGUuZG9tYWluKCk7XG5cbiAgICAgICAgZDMuc2VsZWN0KHRoaXMpLmFwcGVuZCgndGV4dCcpXG4gICAgICAgICAgLnRleHQoZnVuY3Rpb24gKCkge1xuXG4gICAgICAgICAgICByZXR1cm4gY29uZmlnLmRhdGVGb3JtYXQobGltaXRzWzBdKTtcbiAgICAgICAgICB9KVxuICAgICAgICAgIC5jbGFzc2VkKCdzdGFydCcsIHRydWUpXG4gICAgICAgIDtcblxuICAgICAgICBkMy5zZWxlY3QodGhpcykuYXBwZW5kKCd0ZXh0JylcbiAgICAgICAgICAudGV4dChmdW5jdGlvbiAoKSB7XG5cbiAgICAgICAgICAgIHJldHVybiBjb25maWcuZGF0ZUZvcm1hdChsaW1pdHNbMV0pO1xuICAgICAgICAgIH0pXG4gICAgICAgICAgLmF0dHIoJ3RleHQtYW5jaG9yJywgJ2VuZCcpXG4gICAgICAgICAgLmF0dHIoJ3RyYW5zZm9ybScsICd0cmFuc2xhdGUoJyArIGNvbmZpZy54U2NhbGUucmFuZ2UoKVsxXSArICcpJylcbiAgICAgICAgICAuY2xhc3NlZCgnZW5kJywgdHJ1ZSlcbiAgICAgICAgO1xuICAgICAgfSk7XG4gICAgfVxuXG4gICAgY29uZmlndXJhYmxlKGRlbGltaXRlciwgY29uZmlnKTtcblxuICAgIHJldHVybiBkZWxpbWl0ZXI7XG4gIH07XG59O1xuIiwiXCJ1c2Ugc3RyaWN0XCI7XG4vKiBnbG9iYWwgcmVxdWlyZSwgbW9kdWxlICovXG5cbnZhciBjb25maWd1cmFibGUgPSByZXF1aXJlKCcuL3V0aWwvY29uZmlndXJhYmxlJyk7XG5cbm1vZHVsZS5leHBvcnRzID0gZnVuY3Rpb24gKGQzKSB7XG4gIHZhciBldmVudExpbmUgPSByZXF1aXJlKCcuL2V2ZW50TGluZScpKGQzKTtcbiAgdmFyIGRlbGltaXRlciA9IHJlcXVpcmUoJy4vZGVsaW1pdGVyJykoZDMpO1xuXG4gIHZhciBkZWZhdWx0Q29uZmlnID0ge1xuXHRzdGFydDogbmV3IERhdGUoMCksXG5cdGVuZDogbmV3IERhdGUoKSxcblx0bWluU2NhbGU6IDAsXG5cdG1heFNjYWxlOiBJbmZpbml0eSxcblx0d2lkdGg6IDEwMDAsXG5cdG1hcmdpbjoge1xuXHQgIHRvcDogNjAsXG5cdCAgbGVmdDogMjAwLFxuXHQgIGJvdHRvbTogNDAsXG5cdCAgcmlnaHQ6IDUwXG5cdH0sXG5cdGxvY2FsZTogbnVsbCxcblx0YXhpc0Zvcm1hdDogbnVsbCxcblx0dGlja0Zvcm1hdDogW1xuXHRcdFtcIi4lTFwiLCBmdW5jdGlvbihkKSB7IHJldHVybiBkLmdldE1pbGxpc2Vjb25kcygpOyB9XSxcblx0XHRbXCI6JVNcIiwgZnVuY3Rpb24oZCkgeyByZXR1cm4gZC5nZXRTZWNvbmRzKCk7IH1dLFxuXHRcdFtcIiVJOiVNXCIsIGZ1bmN0aW9uKGQpIHsgcmV0dXJuIGQuZ2V0TWludXRlcygpOyB9XSxcblx0XHRbXCIlSSAlcFwiLCBmdW5jdGlvbihkKSB7IHJldHVybiBkLmdldEhvdXJzKCk7IH1dLFxuXHRcdFtcIiVhICVkXCIsIGZ1bmN0aW9uKGQpIHsgcmV0dXJuIGQuZ2V0RGF5KCkgJiYgZC5nZXREYXRlKCkgIT0gMTsgfV0sXG5cdFx0W1wiJWIgJWRcIiwgZnVuY3Rpb24oZCkgeyByZXR1cm4gZC5nZXREYXRlKCkgIT0gMTsgfV0sXG5cdFx0W1wiJUJcIiwgZnVuY3Rpb24oZCkgeyByZXR1cm4gZC5nZXRNb250aCgpOyB9XSxcblx0XHRbXCIlWVwiLCBmdW5jdGlvbigpIHsgcmV0dXJuIHRydWU7IH1dXG5cdF0sXG5cdGV2ZW50SG92ZXI6IG51bGwsXG5cdGV2ZW50Wm9vbTogbnVsbCxcblx0ZXZlbnRDbGljazogbnVsbCxcblx0aGFzRGVsaW1pdGVyOiB0cnVlLFxuXHRoYXNUb3BBeGlzOiB0cnVlLFxuXHRoYXNCb3R0b21BeGlzOiBmdW5jdGlvbiAoZGF0YSkge1xuXHQgIHJldHVybiBkYXRhLmxlbmd0aCA+PSAxMDtcblx0fSxcblx0ZXZlbnRMaW5lQ29sb3I6ICdibGFjaycsXG5cdGV2ZW50Q29sb3I6IG51bGxcbiAgfTtcblxuICByZXR1cm4gZnVuY3Rpb24gZXZlbnREcm9wcyhjb25maWcpIHtcblx0dmFyIHhTY2FsZSA9IGQzLnRpbWUuc2NhbGUoKTtcblx0dmFyIHlTY2FsZSA9IGQzLnNjYWxlLm9yZGluYWwoKTtcblx0Y29uZmlnID0gY29uZmlnIHx8IHt9O1xuXHRmb3IgKHZhciBrZXkgaW4gZGVmYXVsdENvbmZpZykge1xuXHQgIGNvbmZpZ1trZXldID0gY29uZmlnW2tleV0gfHwgZGVmYXVsdENvbmZpZ1trZXldO1xuXHR9XG5cblx0ZnVuY3Rpb24gZXZlbnREcm9wR3JhcGgoc2VsZWN0aW9uKSB7XG5cdCAgc2VsZWN0aW9uLmVhY2goZnVuY3Rpb24gKGRhdGEpIHtcblx0XHR2YXIgem9vbSA9IGQzLmJlaGF2aW9yLnpvb20oKS5jZW50ZXIobnVsbCkuc2NhbGVFeHRlbnQoW2NvbmZpZy5taW5TY2FsZSwgY29uZmlnLm1heFNjYWxlXSkub24oXCJ6b29tXCIsIHVwZGF0ZVpvb20pO1xuXG5cdFx0em9vbS5vbihcInpvb21lbmRcIiwgem9vbUVuZCk7XG5cblx0XHR2YXIgZ3JhcGhXaWR0aCA9IGNvbmZpZy53aWR0aCAtIGNvbmZpZy5tYXJnaW4ucmlnaHQgLSBjb25maWcubWFyZ2luLmxlZnQ7XG5cdFx0dmFyIGdyYXBoSGVpZ2h0ID0gZGF0YS5sZW5ndGggKiA0MDtcblx0XHR2YXIgaGVpZ2h0ID0gZ3JhcGhIZWlnaHQgKyBjb25maWcubWFyZ2luLnRvcCArIGNvbmZpZy5tYXJnaW4uYm90dG9tO1xuXG5cdFx0dmFyIGNhbnZhc193aWR0aCA9ICBncmFwaFdpZHRoO1xuXHRcdHZhciBjYW52YXNfaGVpZ2h0ID0gZ3JhcGhIZWlnaHRcblxuXHRcdHZhciBsYXN0WD1jYW52YXNfd2lkdGgvMiwgbGFzdFk9Y2FudmFzX2hlaWdodC8yO1xuXG5cdFx0ZDMuc2VsZWN0KHRoaXMpLnNlbGVjdCgnY2FudmFzJykucmVtb3ZlKCk7XG5cdFx0dmFyIGNhbnZhcyA9IGQzLnNlbGVjdCh0aGlzKVxuXHRcdCAgLmFwcGVuZCgnY2FudmFzJylcblx0XHQgIC5hdHRyKCdpZCcsIFwibW9uX2NhbnZhc1wiKVxuXHRcdCAgLmF0dHIoJ3dpZHRoJywgY2FudmFzX3dpZHRoKVxuXHRcdCAgLmF0dHIoJ2hlaWdodCcsIGNhbnZhc19oZWlnaHQpXG5cblx0XHR2YXIgY2FudmFzID0gZG9jdW1lbnQuZ2V0RWxlbWVudHNCeVRhZ05hbWUoJ2NhbnZhcycpWzBdO1xuXHRcdGNhbnZhcy53aWR0aCA9IGNhbnZhc193aWR0aDsgY2FudmFzLmhlaWdodCA9IGNhbnZhc19oZWlnaHQ7XG5cblx0XHR2YXIgY3R4ID0gY2FudmFzLmdldENvbnRleHQoJzJkJyk7XG5cdFx0dHJhY2tUcmFuc2Zvcm1zKGN0eCk7XG5cdFx0ZnVuY3Rpb24gZHJhd0FnYWluKCl7XG5cdFx0ICAvLyBDbGVhciB0aGUgZW50aXJlIGNhbnZhc1xuXHRcdCAgdmFyIHAxID0gY3R4LnRyYW5zZm9ybWVkUG9pbnQoMCwwKTtcblx0XHQgIHZhciBwMiA9IGN0eC50cmFuc2Zvcm1lZFBvaW50KGNhbnZhcy53aWR0aCxjYW52YXMuaGVpZ2h0KTtcblx0XHQgIGN0eC5jbGVhclJlY3QocDEueCxwMS55LHAyLngtcDEueCxwMi55LXAxLnkpO1xuXG5cdFx0ICBjdHguZm9udCA9IFwiMzBweCBBcmlhbFwiO1xuXHRcdGN0eC50ZXh0QWxpZ24gPSBcImNlbnRlclwiO1xuXHRcdGN0eC5maWxsVGV4dChcIlRvdG9cIiw3NTAvMiwzNSk7XG5cdFx0Y3R4LmZpbGxUZXh0KFwiVG90b1wiLDc1MC8yLDc1KTtcblx0XHRjdHguZmlsbFRleHQoXCJUb3RvXCIsNzUwLzIsMTE1KTtcblx0XHRjdHguZmlsbFRleHQoXCJUb3RvXCIsNzUwLzIsMTU1KTtcblx0XHR9XG5cdFx0Ly8gZHJhdyB0aGUgY2FudmFzIGZvciB0aGUgZmlyc3QgdGltZVxuXHRcdGRyYXdBZ2FpbigpO1xuXG5cblx0XHR2YXIgbGFzdFg9Y2FudmFzLndpZHRoLzIsIGxhc3RZPWNhbnZhcy5oZWlnaHQvMjtcblx0XHR2YXIgZHJhZ1N0YXJ0LGRyYWdnZWQ7XG5cblx0XHQvLyBldmVudCBcImNsaWNraW5nXCJcblx0XHRjYW52YXMuYWRkRXZlbnRMaXN0ZW5lcignbW91c2Vkb3duJyxmdW5jdGlvbihldnQpe1xuXHRcdCAgZG9jdW1lbnQuYm9keS5zdHlsZS5tb3pVc2VyU2VsZWN0ID0gZG9jdW1lbnQuYm9keS5zdHlsZS53ZWJraXRVc2VyU2VsZWN0ID0gZG9jdW1lbnQuYm9keS5zdHlsZS51c2VyU2VsZWN0ID0gJ25vbmUnO1xuXHRcdCAgbGFzdFggPSBldnQub2Zmc2V0WCB8fCAoZXZ0LnBhZ2VYIC0gY2FudmFzLm9mZnNldExlZnQpO1xuXHRcdCAgLy9sYXN0WSA9IGV2dC5vZmZzZXRZIHx8IChldnQucGFnZVkgLSBjYW52YXMub2Zmc2V0VG9wKTtcblx0XHQgIGRyYWdTdGFydCA9IGN0eC50cmFuc2Zvcm1lZFBvaW50KGxhc3RYLGxhc3RZKTtcblx0XHQgIGRyYWdnZWQgPSBmYWxzZTtcblx0XHR9LGZhbHNlKTtcblxuXHRcdC8vIGV2ZW50IFwibW91c2UgbW92aW5nXCJcblx0XHRjYW52YXMuYWRkRXZlbnRMaXN0ZW5lcignbW91c2Vtb3ZlJyxmdW5jdGlvbihldnQpe1xuXHRcdCAgbGFzdFggPSBldnQub2Zmc2V0WCB8fCAoZXZ0LnBhZ2VYIC0gY2FudmFzLm9mZnNldExlZnQpO1xuXHRcdCAgLy9sYXN0WSA9IGV2dC5vZmZzZXRZIHx8IChldnQucGFnZVkgLSBjYW52YXMub2Zmc2V0VG9wKTtcblx0XHQgIGRyYWdnZWQgPSB0cnVlO1xuXHRcdCAgaWYgKGRyYWdTdGFydCl7XG5cdFx0XHR2YXIgcHQgPSBjdHgudHJhbnNmb3JtZWRQb2ludChsYXN0WCxsYXN0WSk7XG5cdFx0XHRjdHgudHJhbnNsYXRlKHB0LngtZHJhZ1N0YXJ0LngscHQueS1kcmFnU3RhcnQueSk7XG5cdFx0XHRkcmF3QWdhaW4oKTtcblx0XHQgIH1cblx0XHR9LGZhbHNlKTtcblxuXHRcdC8vIGV2ZW50IFwic3RvcCBjbGlja2luZ1wiXG5cdFx0Y2FudmFzLmFkZEV2ZW50TGlzdGVuZXIoJ21vdXNldXAnLGZ1bmN0aW9uKGV2dCl7XG5cdFx0ICBkcmFnU3RhcnQgPSBudWxsO1xuXHRcdCAgaWYgKCFkcmFnZ2VkKSB6b29tKGV2dC5zaGlmdEtleSA/IC0xIDogMSApO1xuXHRcdH0sZmFsc2UpO1xuXG5cdFx0Lyp2YXIgc2NhbGVGYWN0b3IgPSAxLjE7XG5cdFx0dmFyIHpvb20gPSBmdW5jdGlvbihjbGlja3Mpe1xuXHRcdCAgdmFyIHB0ID0gY3R4LnRyYW5zZm9ybWVkUG9pbnQobGFzdFgsbGFzdFkpO1xuXHRcdCAgY3R4LnRyYW5zbGF0ZShwdC54LHB0LnkpO1xuXHRcdCAgdmFyIGZhY3RvciA9IE1hdGgucG93KHNjYWxlRmFjdG9yLGNsaWNrcyk7XG5cdFx0ICBjdHguc2NhbGUoZmFjdG9yLDEpO1xuXHRcdCAgY3R4LnRyYW5zbGF0ZSgtcHQueCwtcHQueSk7XG5cdFx0ICBkcmF3QWdhaW4oKTtcblx0XHR9XG5cblx0XHR2YXIgaGFuZGxlU2Nyb2xsID0gZnVuY3Rpb24oZXZ0KXtcblx0XHQgIHZhciBkZWx0YSA9IGV2dC53aGVlbERlbHRhID8gZXZ0LndoZWVsRGVsdGEvNDAgOiBldnQuZGV0YWlsID8gLWV2dC5kZXRhaWwgOiAwO1xuXHRcdCAgaWYgKGRlbHRhKSB6b29tKGRlbHRhKTtcblx0XHQgIHJldHVybiBldnQucHJldmVudERlZmF1bHQoKSAmJiBmYWxzZTtcblx0XHR9O1xuXHRcdGNhbnZhcy5hZGRFdmVudExpc3RlbmVyKCdET01Nb3VzZVNjcm9sbCcsaGFuZGxlU2Nyb2xsLGZhbHNlKTtcblx0XHRjYW52YXMuYWRkRXZlbnRMaXN0ZW5lcignbW91c2V3aGVlbCcsaGFuZGxlU2Nyb2xsLGZhbHNlKTtcblxuXHRcdCovXG5cblxuXHRcdGQzLnNlbGVjdCh0aGlzKS5zZWxlY3QoJ3N2ZycpLnJlbW92ZSgpO1xuXG5cdFx0dmFyIHN2ZyA9IGQzLnNlbGVjdCh0aGlzKVxuXHRcdCAgLmFwcGVuZCgnc3ZnJylcblx0XHQgIC5hdHRyKCd3aWR0aCcsIGNvbmZpZy53aWR0aClcblx0XHQgIC5hdHRyKCdoZWlnaHQnLCBoZWlnaHQpXG5cdFx0O1xuXG5cdFx0dmFyIGdyYXBoID0gc3ZnLmFwcGVuZCgnZycpXG5cdFx0ICAuYXR0cigndHJhbnNmb3JtJywgJ3RyYW5zbGF0ZSgwLCAyNSknKTtcblxuXHRcdHZhciB5RG9tYWluID0gW107XG5cdFx0dmFyIHlSYW5nZSA9IFtdO1xuXG5cdFx0ZGF0YS5mb3JFYWNoKGZ1bmN0aW9uIChldmVudCwgaW5kZXgpIHtcblx0XHQgIHlEb21haW4ucHVzaChldmVudC5uYW1lKTtcblx0XHQgIHlSYW5nZS5wdXNoKGluZGV4ICogNDApO1xuXHRcdH0pO1xuXG5cdFx0eVNjYWxlLmRvbWFpbih5RG9tYWluKS5yYW5nZSh5UmFuZ2UpO1xuXG5cdFx0Ly8gdGhpcyBwYXJ0IGluIGNvbW1lbnRzIHVzZWQgdG8gZHJhdyBsaW5lcyBpbiBzdmcgb24gdGhlIGdyYXBoXG5cblx0XHQvLyB0cmFuc2xhdGlvbiBkZSA0MCBwb3VyIGxlcyBsaWduZXNcblxuXHRcdHZhciB5QXhpc0VsID0gZ3JhcGguYXBwZW5kKCdnJylcblx0XHQgIC5jbGFzc2VkKCd5LWF4aXMnLCB0cnVlKVxuXHRcdCAgLmF0dHIoJ3RyYW5zZm9ybScsICd0cmFuc2xhdGUoMCwgNjApJyk7XG5cblx0XHR2YXIgeVRpY2sgPSB5QXhpc0VsLmFwcGVuZCgnZycpLnNlbGVjdEFsbCgnZycpLmRhdGEoeURvbWFpbik7XG5cblx0XHQvL3ZhciB5VGljayA9IGdyYXBoLmFwcGVuZCgnZycpLnNlbGVjdEFsbCgnZycpLmRhdGEoeURvbWFpbik7XG5cblx0XHR5VGljay5lbnRlcigpXG5cdFx0ICAuYXBwZW5kKCdnJylcblx0XHQgIC5hdHRyKCd0cmFuc2Zvcm0nLCBmdW5jdGlvbihkKSB7XG5cdFx0XHRyZXR1cm4gJ3RyYW5zbGF0ZSgwLCAnICsgeVNjYWxlKGQpICsgJyknO1xuXHRcdCAgfSlcblx0XHQgIC5hcHBlbmQoJ2xpbmUnKVxuXHRcdCAgLmNsYXNzZWQoJ3ktdGljaycsIHRydWUpXG5cdFx0ICAuYXR0cigneDEnLCBjb25maWcubWFyZ2luLmxlZnQpXG5cdFx0ICAuYXR0cigneDInLCBjb25maWcubWFyZ2luLmxlZnQgKyBncmFwaFdpZHRoKTtcblxuXHRcdHlUaWNrLmV4aXQoKS5yZW1vdmUoKTtcblxuXHRcdHZhciBjdXJ4LCBjdXJ5O1xuXHRcdHZhciB6b29tUmVjdCA9IHN2Z1xuXHRcdCAgLmFwcGVuZCgncmVjdCcpXG5cdFx0ICAuY2FsbCh6b29tKVxuXHRcdCAgLmNsYXNzZWQoJ3pvb20nLCB0cnVlKVxuXHRcdCAgLmF0dHIoJ3dpZHRoJywgZ3JhcGhXaWR0aClcblx0XHQgIC5hdHRyKCdoZWlnaHQnLCBoZWlnaHQgKVxuXHRcdCAgLmF0dHIoJ3RyYW5zZm9ybScsICd0cmFuc2xhdGUoJyArIGNvbmZpZy5tYXJnaW4ubGVmdCArICcsIDM1KScpXG5cdFx0O1xuXG5cdFx0aWYgKHR5cGVvZiBjb25maWcuZXZlbnRIb3ZlciA9PT0gJ2Z1bmN0aW9uJykge1xuXHRcdCAgem9vbVJlY3Qub24oJ21vdXNlbW92ZScsIGZ1bmN0aW9uKGQsIGUpIHtcblx0XHRcdHZhciBldmVudCA9IGQzLmV2ZW50O1xuXHRcdFx0aWYgKGN1cnggPT0gZXZlbnQuY2xpZW50WCAmJiBjdXJ5ID09IGV2ZW50LmNsaWVudFkpIHJldHVybjtcblx0XHRcdGN1cnggPSBldmVudC5jbGllbnRYO1xuXHRcdFx0Y3VyeSA9IGV2ZW50LmNsaWVudFk7XG5cdFx0XHR6b29tUmVjdC5hdHRyKCdkaXNwbGF5JywgJ25vbmUnKTtcblx0XHRcdHZhciBlbCA9IGRvY3VtZW50LmVsZW1lbnRGcm9tUG9pbnQoZDMuZXZlbnQuY2xpZW50WCwgZDMuZXZlbnQuY2xpZW50WSk7XG5cdFx0XHR6b29tUmVjdC5hdHRyKCdkaXNwbGF5JywgJ2Jsb2NrJyk7XG5cdFx0XHRpZiAoZWwudGFnTmFtZSAhPT0gJ2NpcmNsZScpIHJldHVybjtcblx0XHRcdGNvbmZpZy5ldmVudEhvdmVyKGVsKTtcblx0XHQgIH0pO1xuXHRcdH1cblxuXHRcdGlmICh0eXBlb2YgY29uZmlnLmV2ZW50Q2xpY2sgPT09ICdmdW5jdGlvbicpIHtcblx0XHQgIHpvb21SZWN0Lm9uKCdjbGljaycsIGZ1bmN0aW9uICgpIHtcblx0XHRcdHpvb21SZWN0LmF0dHIoJ2Rpc3BsYXknLCAnbm9uZScpO1xuXHRcdFx0dmFyIGVsID0gZG9jdW1lbnQuZWxlbWVudEZyb21Qb2ludChkMy5ldmVudC5jbGllbnRYLCBkMy5ldmVudC5jbGllbnRZKTtcblx0XHRcdHpvb21SZWN0LmF0dHIoJ2Rpc3BsYXknLCAnYmxvY2snKTtcblx0XHRcdGlmIChlbC50YWdOYW1lICE9PSAnY2lyY2xlJykgcmV0dXJuO1xuXHRcdFx0Y29uZmlnLmV2ZW50Q2xpY2soZWwpO1xuXHRcdCAgfSk7XG5cdFx0fVxuXG5cdFx0eFNjYWxlLnJhbmdlKFswLCBncmFwaFdpZHRoXSkuZG9tYWluKFtjb25maWcuc3RhcnQsIGNvbmZpZy5lbmRdKTtcblxuXHRcdHpvb20ueCh4U2NhbGUpO1xuXG5cdFx0ZnVuY3Rpb24gdXBkYXRlWm9vbSgpIHtcblx0XHQgIGlmIChkMy5ldmVudC5zb3VyY2VFdmVudC50b1N0cmluZygpID09PSAnW29iamVjdCBNb3VzZUV2ZW50XScpIHtcblx0XHRcdHpvb20udHJhbnNsYXRlKFtkMy5ldmVudC50cmFuc2xhdGVbMF0sIDBdKTtcblx0XHQgIH1cblxuXHRcdCAgaWYgKGQzLmV2ZW50LnNvdXJjZUV2ZW50LnRvU3RyaW5nKCkgPT09ICdbb2JqZWN0IFdoZWVsRXZlbnRdJykge1xuXHRcdFx0em9vbS5zY2FsZShkMy5ldmVudC5zY2FsZSk7XG5cdFx0ICB9XG5cblx0XHQgIHJlZHJhdygpO1xuXHRcdH1cblxuXHRcdGZ1bmN0aW9uIHJlZHJhd0RlbGltaXRlcigpIHtcblx0XHQgIHN2Zy5zZWxlY3QoJy5kZWxpbWl0ZXInKS5yZW1vdmUoKTtcblx0XHQgIHZhciBkZWxpbWl0ZXJFbCA9IHN2Z1xuXHRcdFx0LmFwcGVuZCgnZycpXG5cdFx0XHQuY2xhc3NlZCgnZGVsaW1pdGVyJywgdHJ1ZSlcblx0XHRcdC5hdHRyKCd3aWR0aCcsIGdyYXBoV2lkdGgpXG5cdFx0XHQuYXR0cignaGVpZ2h0JywgMTApXG5cdFx0XHQuYXR0cigndHJhbnNmb3JtJywgJ3RyYW5zbGF0ZSgnICsgY29uZmlnLm1hcmdpbi5sZWZ0ICsgJywgJyArIChjb25maWcubWFyZ2luLnRvcCAtIDQ1KSArICcpJylcblx0XHRcdC5jYWxsKGRlbGltaXRlcih7XG5cdFx0XHQgIHhTY2FsZTogeFNjYWxlLFxuXHRcdFx0ICBkYXRlRm9ybWF0OiBjb25maWcubG9jYWxlID8gY29uZmlnLmxvY2FsZS50aW1lRm9ybWF0KFwiJWQgJUIgJVlcIikgOiBkMy50aW1lLmZvcm1hdChcIiVkICVCICVZXCIpXG5cdFx0XHR9KSlcblx0XHQgIDtcblx0XHR9XG5cblx0XHRmdW5jdGlvbiB6b29tRW5kKCkge1xuXHRcdCAgaWYgKGNvbmZpZy5ldmVudFpvb20pIHtcblx0XHRcdGNvbmZpZy5ldmVudFpvb20oeFNjYWxlKTtcblx0XHQgIH1cblx0XHQgIGlmIChjb25maWcuaGFzRGVsaW1pdGVyKSB7XG5cdFx0XHRyZWRyYXdEZWxpbWl0ZXIoKTtcblx0XHQgIH1cblx0XHR9XG5cblx0XHRmdW5jdGlvbiBkcmF3WEF4aXMod2hlcmUpIHtcblxuXHRcdCAgLy8gY29weSBjb25maWcudGlja0Zvcm1hdCBiZWNhdXNlIGQzIGZvcm1hdC5tdWx0aSBlZGl0IGl0cyBnaXZlbiB0aWNrRm9ybWF0IGRhdGFcblx0XHQgIHZhciB0aWNrRm9ybWF0RGF0YSA9IFtdO1xuXG5cdFx0ICBjb25maWcudGlja0Zvcm1hdC5mb3JFYWNoKGZ1bmN0aW9uIChpdGVtKSB7XG5cdFx0XHR2YXIgdGljayA9IGl0ZW0uc2xpY2UoMCk7XG5cdFx0XHR0aWNrRm9ybWF0RGF0YS5wdXNoKHRpY2spO1xuXHRcdCAgfSk7XG5cblx0XHQgIHZhciB0aWNrRm9ybWF0ID0gY29uZmlnLmxvY2FsZSA/IGNvbmZpZy5sb2NhbGUudGltZUZvcm1hdC5tdWx0aSh0aWNrRm9ybWF0RGF0YSkgOiBkMy50aW1lLmZvcm1hdC5tdWx0aSh0aWNrRm9ybWF0RGF0YSk7XG5cdFx0ICB2YXIgeEF4aXMgPSBkMy5zdmcuYXhpcygpXG5cdFx0XHQuc2NhbGUoeFNjYWxlKVxuXHRcdFx0Lm9yaWVudCh3aGVyZSlcblx0XHRcdC50aWNrRm9ybWF0KHRpY2tGb3JtYXQpXG5cdFx0ICA7XG5cblx0XHQgIGlmICh0eXBlb2YgY29uZmlnLmF4aXNGb3JtYXQgPT09ICdmdW5jdGlvbicpIHtcblx0XHRcdGNvbmZpZy5heGlzRm9ybWF0KHhBeGlzKTtcblx0XHQgIH1cblxuXHRcdCAgdmFyIHkgPSAod2hlcmUgPT0gJ2JvdHRvbScgPyBwYXJzZUludChncmFwaEhlaWdodCkgOiAwKSArIGNvbmZpZy5tYXJnaW4udG9wIC0gNDA7XG5cblx0XHQgIGdyYXBoLnNlbGVjdCgnLngtYXhpcy4nICsgd2hlcmUpLnJlbW92ZSgpO1xuXHRcdCAgdmFyIHhBeGlzRWwgPSBncmFwaFxuXHRcdFx0LmFwcGVuZCgnZycpXG5cdFx0XHQuY2xhc3NlZCgneC1heGlzJywgdHJ1ZSlcblx0XHRcdC5jbGFzc2VkKHdoZXJlLCB0cnVlKVxuXHRcdFx0LmF0dHIoJ3RyYW5zZm9ybScsICd0cmFuc2xhdGUoJyArIGNvbmZpZy5tYXJnaW4ubGVmdCArICcsICcgKyB5ICsgJyknKVxuXHRcdFx0LmNhbGwoeEF4aXMpXG5cdFx0ICA7XG5cdFx0fVxuXG5cdFx0ZnVuY3Rpb24gcmVkcmF3KCkge1xuXG5cdFx0ICB2YXIgaGFzVG9wQXhpcyA9IHR5cGVvZiBjb25maWcuaGFzVG9wQXhpcyA9PT0gJ2Z1bmN0aW9uJyA/IGNvbmZpZy5oYXNUb3BBeGlzKGRhdGEpIDogY29uZmlnLmhhc1RvcEF4aXM7XG5cdFx0ICBpZiAoaGFzVG9wQXhpcykge1xuXHRcdFx0ZHJhd1hBeGlzKCd0b3AnKTtcblx0XHQgIH1cblxuXHRcdCAgdmFyIGhhc0JvdHRvbUF4aXMgPSB0eXBlb2YgY29uZmlnLmhhc0JvdHRvbUF4aXMgPT09ICdmdW5jdGlvbicgPyBjb25maWcuaGFzQm90dG9tQXhpcyhkYXRhKSA6IGNvbmZpZy5oYXNCb3R0b21BeGlzO1xuXHRcdCAgaWYgKGhhc0JvdHRvbUF4aXMpIHtcblx0XHRcdGRyYXdYQXhpcygnYm90dG9tJyk7XG5cdFx0ICB9XG5cblx0XHQgIHpvb20uc2l6ZShbY29uZmlnLndpZHRoLCBoZWlnaHRdKTtcblxuXHRcdCAgZ3JhcGguc2VsZWN0KCcuZ3JhcGgtYm9keScpLnJlbW92ZSgpO1xuXHRcdCAgdmFyIGdyYXBoQm9keSA9IGdyYXBoXG5cdFx0XHQuYXBwZW5kKCdnJylcblx0XHRcdC5jbGFzc2VkKCdncmFwaC1ib2R5JywgdHJ1ZSlcblx0XHRcdC5hdHRyKCd0cmFuc2Zvcm0nLCAndHJhbnNsYXRlKCcgKyBjb25maWcubWFyZ2luLmxlZnQgKyAnLCAnICsgKGNvbmZpZy5tYXJnaW4udG9wIC0gMTUpICsgJyknKTtcblxuXHRcdCAgdmFyIGxpbmVzID0gZ3JhcGhCb2R5LnNlbGVjdEFsbCgnZycpLmRhdGEoZGF0YSk7XG5cblx0XHQgIGxpbmVzLmVudGVyKClcblx0XHRcdC5hcHBlbmQoJ2cnKVxuXHRcdFx0LmNsYXNzZWQoJ2xpbmUnLCB0cnVlKVxuXHRcdFx0LmF0dHIoJ3RyYW5zZm9ybScsIGZ1bmN0aW9uKGQpIHtcblx0XHRcdCAgcmV0dXJuICd0cmFuc2xhdGUoMCwnICsgeVNjYWxlKGQubmFtZSkgKyAnKSc7XG5cdFx0XHR9KVxuXHRcdFx0LnN0eWxlKCdmaWxsJywgY29uZmlnLmV2ZW50TGluZUNvbG9yKVxuXHRcdFx0LmNhbGwoZXZlbnRMaW5lKHsgeFNjYWxlOiB4U2NhbGUsIGV2ZW50Q29sb3I6IGNvbmZpZy5ldmVudENvbG9yIH0pKVxuXHRcdCAgO1xuXG5cdFx0ICBsaW5lcy5leGl0KCkucmVtb3ZlKCk7XG5cdFx0fVxuXG5cdFx0cmVkcmF3KCk7XG5cdFx0aWYgKGNvbmZpZy5oYXNEZWxpbWl0ZXIpIHtcblx0XHQgIHJlZHJhd0RlbGltaXRlcigpO1xuXHRcdH1cblx0XHRpZiAoY29uZmlnLmV2ZW50Wm9vbSkge1xuXHRcdCAgY29uZmlnLmV2ZW50Wm9vbSh4U2NhbGUpO1xuXHRcdH1cblx0ICB9KTtcblx0fVxuXG5cdC8vIEFkZHMgY3R4LmdldFRyYW5zZm9ybSgpIC0gcmV0dXJucyBhbiBTVkdNYXRyaXhcbiAgLy8gQWRkcyBjdHgudHJhbnNmb3JtZWRQb2ludCh4LHkpIC0gcmV0dXJucyBhbiBTVkdQb2ludFxuICBmdW5jdGlvbiB0cmFja1RyYW5zZm9ybXMoY3R4KXtcblx0dmFyIHN2ZyA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnROUyhcImh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnXCIsJ3N2ZycpO1xuXHR2YXIgeGZvcm0gPSBzdmcuY3JlYXRlU1ZHTWF0cml4KCk7XG5cdGN0eC5nZXRUcmFuc2Zvcm0gPSBmdW5jdGlvbigpeyByZXR1cm4geGZvcm07IH07XG5cblx0dmFyIHNhdmVkVHJhbnNmb3JtcyA9IFtdO1xuXHR2YXIgc2F2ZSA9IGN0eC5zYXZlO1xuXHRjdHguc2F2ZSA9IGZ1bmN0aW9uKCl7XG5cdCAgc2F2ZWRUcmFuc2Zvcm1zLnB1c2goeGZvcm0udHJhbnNsYXRlKDAsMCkpO1xuXHQgIHJldHVybiBzYXZlLmNhbGwoY3R4KTtcblx0fTtcblx0dmFyIHJlc3RvcmUgPSBjdHgucmVzdG9yZTtcblx0Y3R4LnJlc3RvcmUgPSBmdW5jdGlvbigpe1xuXHQgIHhmb3JtID0gc2F2ZWRUcmFuc2Zvcm1zLnBvcCgpO1xuXHQgIHJldHVybiByZXN0b3JlLmNhbGwoY3R4KTtcblx0fTtcblxuXHR2YXIgc2NhbGUgPSBjdHguc2NhbGU7XG5cdGN0eC5zY2FsZSA9IGZ1bmN0aW9uKHN4LHN5KXtcblx0ICB4Zm9ybSA9IHhmb3JtLnNjYWxlTm9uVW5pZm9ybShzeCxzeSk7XG5cdCAgcmV0dXJuIHNjYWxlLmNhbGwoY3R4LHN4LHN5KTtcblx0fTtcblx0dmFyIHJvdGF0ZSA9IGN0eC5yb3RhdGU7XG5cdGN0eC5yb3RhdGUgPSBmdW5jdGlvbihyYWRpYW5zKXtcblx0ICB4Zm9ybSA9IHhmb3JtLnJvdGF0ZShyYWRpYW5zKjE4MC9NYXRoLlBJKTtcblx0ICByZXR1cm4gcm90YXRlLmNhbGwoY3R4LHJhZGlhbnMpO1xuXHR9O1xuXHR2YXIgdHJhbnNsYXRlID0gY3R4LnRyYW5zbGF0ZTtcblx0Y3R4LnRyYW5zbGF0ZSA9IGZ1bmN0aW9uKGR4LGR5KXtcblx0ICB4Zm9ybSA9IHhmb3JtLnRyYW5zbGF0ZShkeCxkeSk7XG5cdCAgcmV0dXJuIHRyYW5zbGF0ZS5jYWxsKGN0eCxkeCxkeSk7XG5cdH07XG5cdHZhciB0cmFuc2Zvcm0gPSBjdHgudHJhbnNmb3JtO1xuXHRjdHgudHJhbnNmb3JtID0gZnVuY3Rpb24oYSxiLGMsZCxlLGYpe1xuXHQgIHZhciBtMiA9IHN2Zy5jcmVhdGVTVkdNYXRyaXgoKTtcblx0ICBtMi5hPWE7IG0yLmI9YjsgbTIuYz1jOyBtMi5kPWQ7IG0yLmU9ZTsgbTIuZj1mO1xuXHQgIHhmb3JtID0geGZvcm0ubXVsdGlwbHkobTIpO1xuXHQgIHJldHVybiB0cmFuc2Zvcm0uY2FsbChjdHgsYSxiLGMsZCxlLGYpO1xuXHR9O1xuXHR2YXIgc2V0VHJhbnNmb3JtID0gY3R4LnNldFRyYW5zZm9ybTtcblx0Y3R4LnNldFRyYW5zZm9ybSA9IGZ1bmN0aW9uKGEsYixjLGQsZSxmKXtcblx0ICB4Zm9ybS5hID0gYTtcblx0ICB4Zm9ybS5iID0gYjtcblx0ICB4Zm9ybS5jID0gYztcblx0ICB4Zm9ybS5kID0gZDtcblx0ICB4Zm9ybS5lID0gZTtcblx0ICB4Zm9ybS5mID0gZjtcblx0ICByZXR1cm4gc2V0VHJhbnNmb3JtLmNhbGwoY3R4LGEsYixjLGQsZSxmKTtcblx0fTtcblx0dmFyIHB0ICA9IHN2Zy5jcmVhdGVTVkdQb2ludCgpO1xuXHRjdHgudHJhbnNmb3JtZWRQb2ludCA9IGZ1bmN0aW9uKHgseSl7XG5cdCAgcHQueD14OyBwdC55PXk7XG5cdCAgcmV0dXJuIHB0Lm1hdHJpeFRyYW5zZm9ybSh4Zm9ybS5pbnZlcnNlKCkpO1xuXHR9XG4gIH1cblxuXHRjb25maWd1cmFibGUoZXZlbnREcm9wR3JhcGgsIGNvbmZpZyk7XG5cblx0cmV0dXJuIGV2ZW50RHJvcEdyYXBoO1xuICB9O1xufTtcbiIsIlwidXNlIHN0cmljdFwiO1xuLyogZ2xvYmFsIHJlcXVpcmUsIG1vZHVsZSwgZDMgKi9cblxudmFyIGNvbmZpZ3VyYWJsZSA9IHJlcXVpcmUoJy4vdXRpbC9jb25maWd1cmFibGUnKTtcbnZhciBmaWx0ZXJEYXRhID0gcmVxdWlyZSgnLi9maWx0ZXJEYXRhJyk7XG5cbnZhciBkZWZhdWx0Q29uZmlnID0ge1xuICB4U2NhbGU6IG51bGxcbn07XG5cbm1vZHVsZS5leHBvcnRzID0gZnVuY3Rpb24gKGQzKSB7XG4gIHJldHVybiBmdW5jdGlvbiAoY29uZmlnKSB7XG5cbiAgICBjb25maWcgPSBjb25maWcgfHwge1xuICAgICAgeFNjYWxlOiBudWxsLFxuICAgICAgZXZlbnRDb2xvcjogbnVsbFxuICAgIH07XG4gICAgZm9yICh2YXIga2V5IGluIGRlZmF1bHRDb25maWcpIHtcbiAgICAgIGNvbmZpZ1trZXldID0gY29uZmlnW2tleV0gfHwgZGVmYXVsdENvbmZpZ1trZXldO1xuICAgIH1cblxuICAgIHZhciBldmVudExpbmUgPSBmdW5jdGlvbiBldmVudExpbmUoc2VsZWN0aW9uKSB7XG4gICAgICBzZWxlY3Rpb24uZWFjaChmdW5jdGlvbiAoZGF0YSkge1xuICAgICAgICBkMy5zZWxlY3QodGhpcykuc2VsZWN0QWxsKCd0ZXh0JykucmVtb3ZlKCk7XG5cbiAgICAgICAgZDMuc2VsZWN0KHRoaXMpLmFwcGVuZCgndGV4dCcpXG4gICAgICAgICAgLnRleHQoZnVuY3Rpb24oZCkge1xuICAgICAgICAgICAgdmFyIGNvdW50ID0gZmlsdGVyRGF0YShkLmRhdGVzLCBjb25maWcueFNjYWxlKS5sZW5ndGg7XG4gICAgICAgICAgICByZXR1cm4gZC5uYW1lICsgKGNvdW50ID4gMCA/ICcgKCcgKyBjb3VudCArICcpJyA6ICcnKTtcbiAgICAgICAgICB9KVxuICAgICAgICAgIC5hdHRyKCd0ZXh0LWFuY2hvcicsICdlbmQnKVxuICAgICAgICAgIC5hdHRyKCd0cmFuc2Zvcm0nLCAndHJhbnNsYXRlKC0yMCknKVxuICAgICAgICAgIC5zdHlsZSgnZmlsbCcsICdibGFjaycpXG4gICAgICAgIDtcblxuICAgICAgICAvL2QzLnNlbGVjdCh0aGlzKS5zZWxlY3RBbGwoJ2NpcmNsZScpLnJlbW92ZSgpO1xuXG4gICAgICAgIC8qdmFyIGNpcmNsZSA9IGQzLnNlbGVjdCh0aGlzKS5zZWxlY3RBbGwoJ2NpcmNsZScpXG4gICAgICAgICAgLmRhdGEoZnVuY3Rpb24oZCkge1xuICAgICAgICAgICAgLy8gZmlsdGVyIHZhbHVlIG91dHNpZGUgb2YgcmFuZ2VcbiAgICAgICAgICAgIHJldHVybiBmaWx0ZXJEYXRhKGQuZGF0ZXMsIGNvbmZpZy54U2NhbGUpO1xuICAgICAgICAgIH0pO1xuXG4gICAgICAgIGNpcmNsZS5lbnRlcigpXG4gICAgICAgICAgLmFwcGVuZCgnY2lyY2xlJylcbiAgICAgICAgICAuYXR0cignY3gnLCBmdW5jdGlvbihkKSB7XG4gICAgICAgICAgICByZXR1cm4gY29uZmlnLnhTY2FsZShkKTtcbiAgICAgICAgICB9KVxuICAgICAgICAgIC5zdHlsZSgnZmlsbCcsIGNvbmZpZy5ldmVudENvbG9yKVxuICAgICAgICAgIC5hdHRyKCdjeScsIC01KVxuICAgICAgICAgIC5hdHRyKCdyJywgMTApXG4gICAgICAgIDtcblxuICAgICAgICBjaXJjbGUuZXhpdCgpLnJlbW92ZSgpOyovXG5cbiAgICAgIH0pO1xuICAgIH07XG5cbiAgICBjb25maWd1cmFibGUoZXZlbnRMaW5lLCBjb25maWcpO1xuXG4gICAgcmV0dXJuIGV2ZW50TGluZTtcbiAgfTtcbn07XG4iLCJcInVzZSBzdHJpY3RcIjtcbi8qIGdsb2JhbCBtb2R1bGUgKi9cblxubW9kdWxlLmV4cG9ydHMgPSBmdW5jdGlvbiBmaWx0ZXJEYXRlKGRhdGEsIHNjYWxlKSB7XG4gIGRhdGEgPSBkYXRhIHx8IFtdO1xuICB2YXIgZmlsdGVyZWREYXRhID0gW107XG4gIHZhciBib3VuZGFyeSA9IHNjYWxlLnJhbmdlKCk7XG4gIHZhciBtaW4gPSBib3VuZGFyeVswXTtcbiAgdmFyIG1heCA9IGJvdW5kYXJ5WzFdO1xuICBkYXRhLmZvckVhY2goZnVuY3Rpb24gKGRhdHVtKSB7XG4gICAgdmFyIHZhbHVlID0gc2NhbGUoZGF0dW0pO1xuICAgIGlmICh2YWx1ZSA8IG1pbiB8fCB2YWx1ZSA+IG1heCkge1xuICAgICAgcmV0dXJuO1xuICAgIH1cbiAgICBmaWx0ZXJlZERhdGEucHVzaChkYXR1bSk7XG4gIH0pO1xuXG4gIHJldHVybiBmaWx0ZXJlZERhdGE7XG59O1xuIiwibW9kdWxlLmV4cG9ydHMgPSBmdW5jdGlvbiBjb25maWd1cmFibGUodGFyZ2V0RnVuY3Rpb24sIGNvbmZpZywgbGlzdGVuZXJzKSB7XG4gIGxpc3RlbmVycyA9IGxpc3RlbmVycyB8fCB7fTtcbiAgZm9yICh2YXIgaXRlbSBpbiBjb25maWcpIHtcbiAgICAoZnVuY3Rpb24oaXRlbSkge1xuICAgICAgdGFyZ2V0RnVuY3Rpb25baXRlbV0gPSBmdW5jdGlvbih2YWx1ZSkge1xuICAgICAgICBpZiAoIWFyZ3VtZW50cy5sZW5ndGgpIHJldHVybiBjb25maWdbaXRlbV07XG4gICAgICAgIGNvbmZpZ1tpdGVtXSA9IHZhbHVlO1xuICAgICAgICBpZiAobGlzdGVuZXJzLmhhc093blByb3BlcnR5KGl0ZW0pKSB7XG4gICAgICAgICAgbGlzdGVuZXJzW2l0ZW1dKHZhbHVlKTtcbiAgICAgICAgfVxuXG4gICAgICAgIHJldHVybiB0YXJnZXRGdW5jdGlvbjtcbiAgICAgIH07XG4gICAgfSkoaXRlbSk7IC8vIGZvciBkb2Vzbid0IGNyZWF0ZSBhIGNsb3N1cmUsIGZvcmNpbmcgaXRcbiAgfVxufTtcbiJdfQ==
