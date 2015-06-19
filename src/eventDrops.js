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
		var canvas_height = graphHeight;

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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIm5vZGVfbW9kdWxlcy9icm93c2VyaWZ5L25vZGVfbW9kdWxlcy9icm93c2VyLXBhY2svX3ByZWx1ZGUuanMiLCIuL2xpYi9tYWluLmpzIiwiL2hvbWUvbWVsb2RpZS9CdXJlYXUvRXZlbnREcm9wcy9saWIvZGVsaW1pdGVyLmpzIiwiL2hvbWUvbWVsb2RpZS9CdXJlYXUvRXZlbnREcm9wcy9saWIvZXZlbnREcm9wcy5qcyIsIi9ob21lL21lbG9kaWUvQnVyZWF1L0V2ZW50RHJvcHMvbGliL2V2ZW50TGluZS5qcyIsIi9ob21lL21lbG9kaWUvQnVyZWF1L0V2ZW50RHJvcHMvbGliL2ZpbHRlckRhdGEuanMiLCIvaG9tZS9tZWxvZGllL0J1cmVhdS9FdmVudERyb3BzL2xpYi91dGlsL2NvbmZpZ3VyYWJsZS5qcyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQTtBQ0FBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDaEJBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNsREE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDeFpBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQy9EQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ25CQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBIiwiZmlsZSI6ImdlbmVyYXRlZC5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzQ29udGVudCI6WyIoZnVuY3Rpb24gZSh0LG4scil7ZnVuY3Rpb24gcyhvLHUpe2lmKCFuW29dKXtpZighdFtvXSl7dmFyIGE9dHlwZW9mIHJlcXVpcmU9PVwiZnVuY3Rpb25cIiYmcmVxdWlyZTtpZighdSYmYSlyZXR1cm4gYShvLCEwKTtpZihpKXJldHVybiBpKG8sITApO3ZhciBmPW5ldyBFcnJvcihcIkNhbm5vdCBmaW5kIG1vZHVsZSAnXCIrbytcIidcIik7dGhyb3cgZi5jb2RlPVwiTU9EVUxFX05PVF9GT1VORFwiLGZ9dmFyIGw9bltvXT17ZXhwb3J0czp7fX07dFtvXVswXS5jYWxsKGwuZXhwb3J0cyxmdW5jdGlvbihlKXt2YXIgbj10W29dWzFdW2VdO3JldHVybiBzKG4/bjplKX0sbCxsLmV4cG9ydHMsZSx0LG4scil9cmV0dXJuIG5bb10uZXhwb3J0c312YXIgaT10eXBlb2YgcmVxdWlyZT09XCJmdW5jdGlvblwiJiZyZXF1aXJlO2Zvcih2YXIgbz0wO288ci5sZW5ndGg7bysrKXMocltvXSk7cmV0dXJuIHN9KSIsIlwidXNlIHN0cmljdFwiO1xuLyogZ2xvYmFsIHJlcXVpcmUsIGRlZmluZSwgbW9kdWxlICovXG5cbnZhciBldmVudERyb3BzID0gcmVxdWlyZSgnLi9ldmVudERyb3BzJyk7XG5cbmlmICh0eXBlb2YgZGVmaW5lID09PSBcImZ1bmN0aW9uXCIgJiYgZGVmaW5lLmFtZCkge1xuICBkZWZpbmUoJ2QzLmNoYXJ0LmV2ZW50RHJvcHMnLCBbXCJkM1wiXSwgZnVuY3Rpb24gKGQzKSB7XG4gICAgZDMuY2hhcnQgPSBkMy5jaGFydCB8fCB7fTtcbiAgICBkMy5jaGFydC5ldmVudERyb3BzID0gZXZlbnREcm9wcyhkMyk7XG4gIH0pO1xufSBlbHNlIGlmICh3aW5kb3cpIHtcbiAgd2luZG93LmQzLmNoYXJ0ID0gd2luZG93LmQzLmNoYXJ0IHx8IHt9O1xuICB3aW5kb3cuZDMuY2hhcnQuZXZlbnREcm9wcyA9IGV2ZW50RHJvcHMod2luZG93LmQzKTtcbn0gZWxzZSB7XG4gIG1vZHVsZS5leHBvcnRzID0gZXZlbnREcm9wcztcbn1cbiIsIlwidXNlIHN0cmljdFwiO1xuLyogZ2xvYmFsIHJlcXVpcmUsIG1vZHVsZSwgZDMgKi9cblxudmFyIGNvbmZpZ3VyYWJsZSA9IHJlcXVpcmUoJy4vdXRpbC9jb25maWd1cmFibGUnKTtcblxudmFyIGRlZmF1bHRDb25maWcgPSB7XG4gIHhTY2FsZTogbnVsbCxcbiAgZGF0ZUZvcm1hdDogbnVsbFxufTtcblxubW9kdWxlLmV4cG9ydHMgPSBmdW5jdGlvbiAoZDMpIHtcblxuICByZXR1cm4gZnVuY3Rpb24gKGNvbmZpZykge1xuXG4gICAgY29uZmlnID0gY29uZmlnIHx8IHt9O1xuICAgIGZvciAodmFyIGtleSBpbiBkZWZhdWx0Q29uZmlnKSB7XG4gICAgICBjb25maWdba2V5XSA9IGNvbmZpZ1trZXldIHx8IGRlZmF1bHRDb25maWdba2V5XTtcbiAgICB9XG5cbiAgICBmdW5jdGlvbiBkZWxpbWl0ZXIoc2VsZWN0aW9uKSB7XG4gICAgICBzZWxlY3Rpb24uZWFjaChmdW5jdGlvbiAoZGF0YSkge1xuICAgICAgICBkMy5zZWxlY3QodGhpcykuc2VsZWN0QWxsKCd0ZXh0JykucmVtb3ZlKCk7XG5cbiAgICAgICAgdmFyIGxpbWl0cyA9IGNvbmZpZy54U2NhbGUuZG9tYWluKCk7XG5cbiAgICAgICAgZDMuc2VsZWN0KHRoaXMpLmFwcGVuZCgndGV4dCcpXG4gICAgICAgICAgLnRleHQoZnVuY3Rpb24gKCkge1xuXG4gICAgICAgICAgICByZXR1cm4gY29uZmlnLmRhdGVGb3JtYXQobGltaXRzWzBdKTtcbiAgICAgICAgICB9KVxuICAgICAgICAgIC5jbGFzc2VkKCdzdGFydCcsIHRydWUpXG4gICAgICAgIDtcblxuICAgICAgICBkMy5zZWxlY3QodGhpcykuYXBwZW5kKCd0ZXh0JylcbiAgICAgICAgICAudGV4dChmdW5jdGlvbiAoKSB7XG5cbiAgICAgICAgICAgIHJldHVybiBjb25maWcuZGF0ZUZvcm1hdChsaW1pdHNbMV0pO1xuICAgICAgICAgIH0pXG4gICAgICAgICAgLmF0dHIoJ3RleHQtYW5jaG9yJywgJ2VuZCcpXG4gICAgICAgICAgLmF0dHIoJ3RyYW5zZm9ybScsICd0cmFuc2xhdGUoJyArIGNvbmZpZy54U2NhbGUucmFuZ2UoKVsxXSArICcpJylcbiAgICAgICAgICAuY2xhc3NlZCgnZW5kJywgdHJ1ZSlcbiAgICAgICAgO1xuICAgICAgfSk7XG4gICAgfVxuXG4gICAgY29uZmlndXJhYmxlKGRlbGltaXRlciwgY29uZmlnKTtcblxuICAgIHJldHVybiBkZWxpbWl0ZXI7XG4gIH07XG59O1xuIiwiXCJ1c2Ugc3RyaWN0XCI7XG4vKiBnbG9iYWwgcmVxdWlyZSwgbW9kdWxlICovXG5cbnZhciBjb25maWd1cmFibGUgPSByZXF1aXJlKCcuL3V0aWwvY29uZmlndXJhYmxlJyk7XG5cbm1vZHVsZS5leHBvcnRzID0gZnVuY3Rpb24gKGQzKSB7XG4gIHZhciBldmVudExpbmUgPSByZXF1aXJlKCcuL2V2ZW50TGluZScpKGQzKTtcbiAgdmFyIGRlbGltaXRlciA9IHJlcXVpcmUoJy4vZGVsaW1pdGVyJykoZDMpO1xuXG4gIHZhciBkZWZhdWx0Q29uZmlnID0ge1xuXHRzdGFydDogbmV3IERhdGUoMCksXG5cdGVuZDogbmV3IERhdGUoKSxcblx0bWluU2NhbGU6IDAsXG5cdG1heFNjYWxlOiBJbmZpbml0eSxcblx0d2lkdGg6IDEwMDAsXG5cdG1hcmdpbjoge1xuXHQgIHRvcDogNjAsXG5cdCAgbGVmdDogMjAwLFxuXHQgIGJvdHRvbTogNDAsXG5cdCAgcmlnaHQ6IDUwXG5cdH0sXG5cdGxvY2FsZTogbnVsbCxcblx0YXhpc0Zvcm1hdDogbnVsbCxcblx0dGlja0Zvcm1hdDogW1xuXHRcdFtcIi4lTFwiLCBmdW5jdGlvbihkKSB7IHJldHVybiBkLmdldE1pbGxpc2Vjb25kcygpOyB9XSxcblx0XHRbXCI6JVNcIiwgZnVuY3Rpb24oZCkgeyByZXR1cm4gZC5nZXRTZWNvbmRzKCk7IH1dLFxuXHRcdFtcIiVJOiVNXCIsIGZ1bmN0aW9uKGQpIHsgcmV0dXJuIGQuZ2V0TWludXRlcygpOyB9XSxcblx0XHRbXCIlSSAlcFwiLCBmdW5jdGlvbihkKSB7IHJldHVybiBkLmdldEhvdXJzKCk7IH1dLFxuXHRcdFtcIiVhICVkXCIsIGZ1bmN0aW9uKGQpIHsgcmV0dXJuIGQuZ2V0RGF5KCkgJiYgZC5nZXREYXRlKCkgIT0gMTsgfV0sXG5cdFx0W1wiJWIgJWRcIiwgZnVuY3Rpb24oZCkgeyByZXR1cm4gZC5nZXREYXRlKCkgIT0gMTsgfV0sXG5cdFx0W1wiJUJcIiwgZnVuY3Rpb24oZCkgeyByZXR1cm4gZC5nZXRNb250aCgpOyB9XSxcblx0XHRbXCIlWVwiLCBmdW5jdGlvbigpIHsgcmV0dXJuIHRydWU7IH1dXG5cdF0sXG5cdGV2ZW50SG92ZXI6IG51bGwsXG5cdGV2ZW50Wm9vbTogbnVsbCxcblx0ZXZlbnRDbGljazogbnVsbCxcblx0aGFzRGVsaW1pdGVyOiB0cnVlLFxuXHRoYXNUb3BBeGlzOiB0cnVlLFxuXHRoYXNCb3R0b21BeGlzOiBmdW5jdGlvbiAoZGF0YSkge1xuXHQgIHJldHVybiBkYXRhLmxlbmd0aCA+PSAxMDtcblx0fSxcblx0ZXZlbnRMaW5lQ29sb3I6ICdibGFjaycsXG5cdGV2ZW50Q29sb3I6IG51bGxcbiAgfTtcblxuICByZXR1cm4gZnVuY3Rpb24gZXZlbnREcm9wcyhjb25maWcpIHtcblx0dmFyIHhTY2FsZSA9IGQzLnRpbWUuc2NhbGUoKTtcblx0dmFyIHlTY2FsZSA9IGQzLnNjYWxlLm9yZGluYWwoKTtcblx0Y29uZmlnID0gY29uZmlnIHx8IHt9O1xuXHRmb3IgKHZhciBrZXkgaW4gZGVmYXVsdENvbmZpZykge1xuXHQgIGNvbmZpZ1trZXldID0gY29uZmlnW2tleV0gfHwgZGVmYXVsdENvbmZpZ1trZXldO1xuXHR9XG5cblx0ZnVuY3Rpb24gZXZlbnREcm9wR3JhcGgoc2VsZWN0aW9uKSB7XG5cdCAgc2VsZWN0aW9uLmVhY2goZnVuY3Rpb24gKGRhdGEpIHtcblx0XHR2YXIgem9vbSA9IGQzLmJlaGF2aW9yLnpvb20oKS5jZW50ZXIobnVsbCkuc2NhbGVFeHRlbnQoW2NvbmZpZy5taW5TY2FsZSwgY29uZmlnLm1heFNjYWxlXSkub24oXCJ6b29tXCIsIHVwZGF0ZVpvb20pO1xuXG5cdFx0em9vbS5vbihcInpvb21lbmRcIiwgem9vbUVuZCk7XG5cblx0XHR2YXIgZ3JhcGhXaWR0aCA9IGNvbmZpZy53aWR0aCAtIGNvbmZpZy5tYXJnaW4ucmlnaHQgLSBjb25maWcubWFyZ2luLmxlZnQ7XG5cdFx0dmFyIGdyYXBoSGVpZ2h0ID0gZGF0YS5sZW5ndGggKiA0MDtcblx0XHR2YXIgaGVpZ2h0ID0gZ3JhcGhIZWlnaHQgKyBjb25maWcubWFyZ2luLnRvcCArIGNvbmZpZy5tYXJnaW4uYm90dG9tO1xuXG5cdFx0dmFyIGNhbnZhc193aWR0aCA9ICBncmFwaFdpZHRoO1xuXHRcdHZhciBjYW52YXNfaGVpZ2h0ID0gZ3JhcGhIZWlnaHQ7XG5cblx0XHR2YXIgbGFzdFg9Y2FudmFzX3dpZHRoLzIsIGxhc3RZPWNhbnZhc19oZWlnaHQvMjtcblxuXHRcdGQzLnNlbGVjdCh0aGlzKS5zZWxlY3QoJ2NhbnZhcycpLnJlbW92ZSgpO1xuXHRcdHZhciBjYW52YXMgPSBkMy5zZWxlY3QodGhpcylcblx0XHQgIC5hcHBlbmQoJ2NhbnZhcycpXG5cdFx0ICAuYXR0cignaWQnLCBcIm1vbl9jYW52YXNcIilcblx0XHQgIC5hdHRyKCd3aWR0aCcsIGNhbnZhc193aWR0aClcblx0XHQgIC5hdHRyKCdoZWlnaHQnLCBjYW52YXNfaGVpZ2h0KVxuXG5cdFx0dmFyIGNhbnZhcyA9IGRvY3VtZW50LmdldEVsZW1lbnRzQnlUYWdOYW1lKCdjYW52YXMnKVswXTtcblx0XHRjYW52YXMud2lkdGggPSBjYW52YXNfd2lkdGg7IGNhbnZhcy5oZWlnaHQgPSBjYW52YXNfaGVpZ2h0O1xuXG5cdFx0dmFyIGN0eCA9IGNhbnZhcy5nZXRDb250ZXh0KCcyZCcpO1xuXHRcdHRyYWNrVHJhbnNmb3JtcyhjdHgpO1xuXHRcdGZ1bmN0aW9uIGRyYXdBZ2Fpbigpe1xuXHRcdCAgLy8gQ2xlYXIgdGhlIGVudGlyZSBjYW52YXNcblx0XHQgIHZhciBwMSA9IGN0eC50cmFuc2Zvcm1lZFBvaW50KDAsMCk7XG5cdFx0ICB2YXIgcDIgPSBjdHgudHJhbnNmb3JtZWRQb2ludChjYW52YXMud2lkdGgsY2FudmFzLmhlaWdodCk7XG5cdFx0ICBjdHguY2xlYXJSZWN0KHAxLngscDEueSxwMi54LXAxLngscDIueS1wMS55KTtcblxuXHRcdCAgY3R4LmZvbnQgPSBcIjMwcHggQXJpYWxcIjtcblx0XHRjdHgudGV4dEFsaWduID0gXCJjZW50ZXJcIjtcblx0XHRjdHguZmlsbFRleHQoXCJUb3RvXCIsNzUwLzIsMzUpO1xuXHRcdGN0eC5maWxsVGV4dChcIlRvdG9cIiw3NTAvMiw3NSk7XG5cdFx0Y3R4LmZpbGxUZXh0KFwiVG90b1wiLDc1MC8yLDExNSk7XG5cdFx0Y3R4LmZpbGxUZXh0KFwiVG90b1wiLDc1MC8yLDE1NSk7XG5cdFx0fVxuXHRcdC8vIGRyYXcgdGhlIGNhbnZhcyBmb3IgdGhlIGZpcnN0IHRpbWVcblx0XHRkcmF3QWdhaW4oKTtcblxuXG5cdFx0dmFyIGxhc3RYPWNhbnZhcy53aWR0aC8yLCBsYXN0WT1jYW52YXMuaGVpZ2h0LzI7XG5cdFx0dmFyIGRyYWdTdGFydCxkcmFnZ2VkO1xuXG5cdFx0Ly8gZXZlbnQgXCJjbGlja2luZ1wiXG5cdFx0Y2FudmFzLmFkZEV2ZW50TGlzdGVuZXIoJ21vdXNlZG93bicsZnVuY3Rpb24oZXZ0KXtcblx0XHQgIGRvY3VtZW50LmJvZHkuc3R5bGUubW96VXNlclNlbGVjdCA9IGRvY3VtZW50LmJvZHkuc3R5bGUud2Via2l0VXNlclNlbGVjdCA9IGRvY3VtZW50LmJvZHkuc3R5bGUudXNlclNlbGVjdCA9ICdub25lJztcblx0XHQgIGxhc3RYID0gZXZ0Lm9mZnNldFggfHwgKGV2dC5wYWdlWCAtIGNhbnZhcy5vZmZzZXRMZWZ0KTtcblx0XHQgIC8vbGFzdFkgPSBldnQub2Zmc2V0WSB8fCAoZXZ0LnBhZ2VZIC0gY2FudmFzLm9mZnNldFRvcCk7XG5cdFx0ICBkcmFnU3RhcnQgPSBjdHgudHJhbnNmb3JtZWRQb2ludChsYXN0WCxsYXN0WSk7XG5cdFx0ICBkcmFnZ2VkID0gZmFsc2U7XG5cdFx0fSxmYWxzZSk7XG5cblx0XHQvLyBldmVudCBcIm1vdXNlIG1vdmluZ1wiXG5cdFx0Y2FudmFzLmFkZEV2ZW50TGlzdGVuZXIoJ21vdXNlbW92ZScsZnVuY3Rpb24oZXZ0KXtcblx0XHQgIGxhc3RYID0gZXZ0Lm9mZnNldFggfHwgKGV2dC5wYWdlWCAtIGNhbnZhcy5vZmZzZXRMZWZ0KTtcblx0XHQgIC8vbGFzdFkgPSBldnQub2Zmc2V0WSB8fCAoZXZ0LnBhZ2VZIC0gY2FudmFzLm9mZnNldFRvcCk7XG5cdFx0ICBkcmFnZ2VkID0gdHJ1ZTtcblx0XHQgIGlmIChkcmFnU3RhcnQpe1xuXHRcdFx0dmFyIHB0ID0gY3R4LnRyYW5zZm9ybWVkUG9pbnQobGFzdFgsbGFzdFkpO1xuXHRcdFx0Y3R4LnRyYW5zbGF0ZShwdC54LWRyYWdTdGFydC54LHB0LnktZHJhZ1N0YXJ0LnkpO1xuXHRcdFx0ZHJhd0FnYWluKCk7XG5cdFx0ICB9XG5cdFx0fSxmYWxzZSk7XG5cblx0XHQvLyBldmVudCBcInN0b3AgY2xpY2tpbmdcIlxuXHRcdGNhbnZhcy5hZGRFdmVudExpc3RlbmVyKCdtb3VzZXVwJyxmdW5jdGlvbihldnQpe1xuXHRcdCAgZHJhZ1N0YXJ0ID0gbnVsbDtcblx0XHQgIGlmICghZHJhZ2dlZCkgem9vbShldnQuc2hpZnRLZXkgPyAtMSA6IDEgKTtcblx0XHR9LGZhbHNlKTtcblxuXHRcdC8qdmFyIHNjYWxlRmFjdG9yID0gMS4xO1xuXHRcdHZhciB6b29tID0gZnVuY3Rpb24oY2xpY2tzKXtcblx0XHQgIHZhciBwdCA9IGN0eC50cmFuc2Zvcm1lZFBvaW50KGxhc3RYLGxhc3RZKTtcblx0XHQgIGN0eC50cmFuc2xhdGUocHQueCxwdC55KTtcblx0XHQgIHZhciBmYWN0b3IgPSBNYXRoLnBvdyhzY2FsZUZhY3RvcixjbGlja3MpO1xuXHRcdCAgY3R4LnNjYWxlKGZhY3RvciwxKTtcblx0XHQgIGN0eC50cmFuc2xhdGUoLXB0LngsLXB0LnkpO1xuXHRcdCAgZHJhd0FnYWluKCk7XG5cdFx0fVxuXG5cdFx0dmFyIGhhbmRsZVNjcm9sbCA9IGZ1bmN0aW9uKGV2dCl7XG5cdFx0ICB2YXIgZGVsdGEgPSBldnQud2hlZWxEZWx0YSA/IGV2dC53aGVlbERlbHRhLzQwIDogZXZ0LmRldGFpbCA/IC1ldnQuZGV0YWlsIDogMDtcblx0XHQgIGlmIChkZWx0YSkgem9vbShkZWx0YSk7XG5cdFx0ICByZXR1cm4gZXZ0LnByZXZlbnREZWZhdWx0KCkgJiYgZmFsc2U7XG5cdFx0fTtcblx0XHRjYW52YXMuYWRkRXZlbnRMaXN0ZW5lcignRE9NTW91c2VTY3JvbGwnLGhhbmRsZVNjcm9sbCxmYWxzZSk7XG5cdFx0Y2FudmFzLmFkZEV2ZW50TGlzdGVuZXIoJ21vdXNld2hlZWwnLGhhbmRsZVNjcm9sbCxmYWxzZSk7XG5cblx0XHQqL1xuXG5cblx0XHRkMy5zZWxlY3QodGhpcykuc2VsZWN0KCdzdmcnKS5yZW1vdmUoKTtcblxuXHRcdHZhciBzdmcgPSBkMy5zZWxlY3QodGhpcylcblx0XHQgIC5hcHBlbmQoJ3N2ZycpXG5cdFx0ICAuYXR0cignd2lkdGgnLCBjb25maWcud2lkdGgpXG5cdFx0ICAuYXR0cignaGVpZ2h0JywgaGVpZ2h0KVxuXHRcdDtcblxuXHRcdHZhciBncmFwaCA9IHN2Zy5hcHBlbmQoJ2cnKVxuXHRcdCAgLmF0dHIoJ3RyYW5zZm9ybScsICd0cmFuc2xhdGUoMCwgMjUpJyk7XG5cblx0XHR2YXIgeURvbWFpbiA9IFtdO1xuXHRcdHZhciB5UmFuZ2UgPSBbXTtcblxuXHRcdGRhdGEuZm9yRWFjaChmdW5jdGlvbiAoZXZlbnQsIGluZGV4KSB7XG5cdFx0ICB5RG9tYWluLnB1c2goZXZlbnQubmFtZSk7XG5cdFx0ICB5UmFuZ2UucHVzaChpbmRleCAqIDQwKTtcblx0XHR9KTtcblxuXHRcdHlTY2FsZS5kb21haW4oeURvbWFpbikucmFuZ2UoeVJhbmdlKTtcblxuXHRcdC8vIHRoaXMgcGFydCBpbiBjb21tZW50cyB1c2VkIHRvIGRyYXcgbGluZXMgaW4gc3ZnIG9uIHRoZSBncmFwaFxuXG5cdFx0Ly8gdHJhbnNsYXRpb24gZGUgNDAgcG91ciBsZXMgbGlnbmVzXG5cblx0XHR2YXIgeUF4aXNFbCA9IGdyYXBoLmFwcGVuZCgnZycpXG5cdFx0ICAuY2xhc3NlZCgneS1heGlzJywgdHJ1ZSlcblx0XHQgIC5hdHRyKCd0cmFuc2Zvcm0nLCAndHJhbnNsYXRlKDAsIDYwKScpO1xuXG5cdFx0dmFyIHlUaWNrID0geUF4aXNFbC5hcHBlbmQoJ2cnKS5zZWxlY3RBbGwoJ2cnKS5kYXRhKHlEb21haW4pO1xuXG5cdFx0Ly92YXIgeVRpY2sgPSBncmFwaC5hcHBlbmQoJ2cnKS5zZWxlY3RBbGwoJ2cnKS5kYXRhKHlEb21haW4pO1xuXG5cdFx0eVRpY2suZW50ZXIoKVxuXHRcdCAgLmFwcGVuZCgnZycpXG5cdFx0ICAuYXR0cigndHJhbnNmb3JtJywgZnVuY3Rpb24oZCkge1xuXHRcdFx0cmV0dXJuICd0cmFuc2xhdGUoMCwgJyArIHlTY2FsZShkKSArICcpJztcblx0XHQgIH0pXG5cdFx0ICAuYXBwZW5kKCdsaW5lJylcblx0XHQgIC5jbGFzc2VkKCd5LXRpY2snLCB0cnVlKVxuXHRcdCAgLmF0dHIoJ3gxJywgY29uZmlnLm1hcmdpbi5sZWZ0KVxuXHRcdCAgLmF0dHIoJ3gyJywgY29uZmlnLm1hcmdpbi5sZWZ0ICsgZ3JhcGhXaWR0aCk7XG5cblx0XHR5VGljay5leGl0KCkucmVtb3ZlKCk7XG5cblx0XHR2YXIgY3VyeCwgY3VyeTtcblx0XHR2YXIgem9vbVJlY3QgPSBzdmdcblx0XHQgIC5hcHBlbmQoJ3JlY3QnKVxuXHRcdCAgLmNhbGwoem9vbSlcblx0XHQgIC5jbGFzc2VkKCd6b29tJywgdHJ1ZSlcblx0XHQgIC5hdHRyKCd3aWR0aCcsIGdyYXBoV2lkdGgpXG5cdFx0ICAuYXR0cignaGVpZ2h0JywgaGVpZ2h0IClcblx0XHQgIC5hdHRyKCd0cmFuc2Zvcm0nLCAndHJhbnNsYXRlKCcgKyBjb25maWcubWFyZ2luLmxlZnQgKyAnLCAzNSknKVxuXHRcdDtcblxuXHRcdGlmICh0eXBlb2YgY29uZmlnLmV2ZW50SG92ZXIgPT09ICdmdW5jdGlvbicpIHtcblx0XHQgIHpvb21SZWN0Lm9uKCdtb3VzZW1vdmUnLCBmdW5jdGlvbihkLCBlKSB7XG5cdFx0XHR2YXIgZXZlbnQgPSBkMy5ldmVudDtcblx0XHRcdGlmIChjdXJ4ID09IGV2ZW50LmNsaWVudFggJiYgY3VyeSA9PSBldmVudC5jbGllbnRZKSByZXR1cm47XG5cdFx0XHRjdXJ4ID0gZXZlbnQuY2xpZW50WDtcblx0XHRcdGN1cnkgPSBldmVudC5jbGllbnRZO1xuXHRcdFx0em9vbVJlY3QuYXR0cignZGlzcGxheScsICdub25lJyk7XG5cdFx0XHR2YXIgZWwgPSBkb2N1bWVudC5lbGVtZW50RnJvbVBvaW50KGQzLmV2ZW50LmNsaWVudFgsIGQzLmV2ZW50LmNsaWVudFkpO1xuXHRcdFx0em9vbVJlY3QuYXR0cignZGlzcGxheScsICdibG9jaycpO1xuXHRcdFx0aWYgKGVsLnRhZ05hbWUgIT09ICdjaXJjbGUnKSByZXR1cm47XG5cdFx0XHRjb25maWcuZXZlbnRIb3ZlcihlbCk7XG5cdFx0ICB9KTtcblx0XHR9XG5cblx0XHRpZiAodHlwZW9mIGNvbmZpZy5ldmVudENsaWNrID09PSAnZnVuY3Rpb24nKSB7XG5cdFx0ICB6b29tUmVjdC5vbignY2xpY2snLCBmdW5jdGlvbiAoKSB7XG5cdFx0XHR6b29tUmVjdC5hdHRyKCdkaXNwbGF5JywgJ25vbmUnKTtcblx0XHRcdHZhciBlbCA9IGRvY3VtZW50LmVsZW1lbnRGcm9tUG9pbnQoZDMuZXZlbnQuY2xpZW50WCwgZDMuZXZlbnQuY2xpZW50WSk7XG5cdFx0XHR6b29tUmVjdC5hdHRyKCdkaXNwbGF5JywgJ2Jsb2NrJyk7XG5cdFx0XHRpZiAoZWwudGFnTmFtZSAhPT0gJ2NpcmNsZScpIHJldHVybjtcblx0XHRcdGNvbmZpZy5ldmVudENsaWNrKGVsKTtcblx0XHQgIH0pO1xuXHRcdH1cblxuXHRcdHhTY2FsZS5yYW5nZShbMCwgZ3JhcGhXaWR0aF0pLmRvbWFpbihbY29uZmlnLnN0YXJ0LCBjb25maWcuZW5kXSk7XG5cblx0XHR6b29tLngoeFNjYWxlKTtcblxuXHRcdGZ1bmN0aW9uIHVwZGF0ZVpvb20oKSB7XG5cdFx0ICBpZiAoZDMuZXZlbnQuc291cmNlRXZlbnQudG9TdHJpbmcoKSA9PT0gJ1tvYmplY3QgTW91c2VFdmVudF0nKSB7XG5cdFx0XHR6b29tLnRyYW5zbGF0ZShbZDMuZXZlbnQudHJhbnNsYXRlWzBdLCAwXSk7XG5cdFx0ICB9XG5cblx0XHQgIGlmIChkMy5ldmVudC5zb3VyY2VFdmVudC50b1N0cmluZygpID09PSAnW29iamVjdCBXaGVlbEV2ZW50XScpIHtcblx0XHRcdHpvb20uc2NhbGUoZDMuZXZlbnQuc2NhbGUpO1xuXHRcdCAgfVxuXG5cdFx0ICByZWRyYXcoKTtcblx0XHR9XG5cblx0XHRmdW5jdGlvbiByZWRyYXdEZWxpbWl0ZXIoKSB7XG5cdFx0ICBzdmcuc2VsZWN0KCcuZGVsaW1pdGVyJykucmVtb3ZlKCk7XG5cdFx0ICB2YXIgZGVsaW1pdGVyRWwgPSBzdmdcblx0XHRcdC5hcHBlbmQoJ2cnKVxuXHRcdFx0LmNsYXNzZWQoJ2RlbGltaXRlcicsIHRydWUpXG5cdFx0XHQuYXR0cignd2lkdGgnLCBncmFwaFdpZHRoKVxuXHRcdFx0LmF0dHIoJ2hlaWdodCcsIDEwKVxuXHRcdFx0LmF0dHIoJ3RyYW5zZm9ybScsICd0cmFuc2xhdGUoJyArIGNvbmZpZy5tYXJnaW4ubGVmdCArICcsICcgKyAoY29uZmlnLm1hcmdpbi50b3AgLSA0NSkgKyAnKScpXG5cdFx0XHQuY2FsbChkZWxpbWl0ZXIoe1xuXHRcdFx0ICB4U2NhbGU6IHhTY2FsZSxcblx0XHRcdCAgZGF0ZUZvcm1hdDogY29uZmlnLmxvY2FsZSA/IGNvbmZpZy5sb2NhbGUudGltZUZvcm1hdChcIiVkICVCICVZXCIpIDogZDMudGltZS5mb3JtYXQoXCIlZCAlQiAlWVwiKVxuXHRcdFx0fSkpXG5cdFx0ICA7XG5cdFx0fVxuXG5cdFx0ZnVuY3Rpb24gem9vbUVuZCgpIHtcblx0XHQgIGlmIChjb25maWcuZXZlbnRab29tKSB7XG5cdFx0XHRjb25maWcuZXZlbnRab29tKHhTY2FsZSk7XG5cdFx0ICB9XG5cdFx0ICBpZiAoY29uZmlnLmhhc0RlbGltaXRlcikge1xuXHRcdFx0cmVkcmF3RGVsaW1pdGVyKCk7XG5cdFx0ICB9XG5cdFx0fVxuXG5cdFx0ZnVuY3Rpb24gZHJhd1hBeGlzKHdoZXJlKSB7XG5cblx0XHQgIC8vIGNvcHkgY29uZmlnLnRpY2tGb3JtYXQgYmVjYXVzZSBkMyBmb3JtYXQubXVsdGkgZWRpdCBpdHMgZ2l2ZW4gdGlja0Zvcm1hdCBkYXRhXG5cdFx0ICB2YXIgdGlja0Zvcm1hdERhdGEgPSBbXTtcblxuXHRcdCAgY29uZmlnLnRpY2tGb3JtYXQuZm9yRWFjaChmdW5jdGlvbiAoaXRlbSkge1xuXHRcdFx0dmFyIHRpY2sgPSBpdGVtLnNsaWNlKDApO1xuXHRcdFx0dGlja0Zvcm1hdERhdGEucHVzaCh0aWNrKTtcblx0XHQgIH0pO1xuXG5cdFx0ICB2YXIgdGlja0Zvcm1hdCA9IGNvbmZpZy5sb2NhbGUgPyBjb25maWcubG9jYWxlLnRpbWVGb3JtYXQubXVsdGkodGlja0Zvcm1hdERhdGEpIDogZDMudGltZS5mb3JtYXQubXVsdGkodGlja0Zvcm1hdERhdGEpO1xuXHRcdCAgdmFyIHhBeGlzID0gZDMuc3ZnLmF4aXMoKVxuXHRcdFx0LnNjYWxlKHhTY2FsZSlcblx0XHRcdC5vcmllbnQod2hlcmUpXG5cdFx0XHQudGlja0Zvcm1hdCh0aWNrRm9ybWF0KVxuXHRcdCAgO1xuXG5cdFx0ICBpZiAodHlwZW9mIGNvbmZpZy5heGlzRm9ybWF0ID09PSAnZnVuY3Rpb24nKSB7XG5cdFx0XHRjb25maWcuYXhpc0Zvcm1hdCh4QXhpcyk7XG5cdFx0ICB9XG5cblx0XHQgIHZhciB5ID0gKHdoZXJlID09ICdib3R0b20nID8gcGFyc2VJbnQoZ3JhcGhIZWlnaHQpIDogMCkgKyBjb25maWcubWFyZ2luLnRvcCAtIDQwO1xuXG5cdFx0ICBncmFwaC5zZWxlY3QoJy54LWF4aXMuJyArIHdoZXJlKS5yZW1vdmUoKTtcblx0XHQgIHZhciB4QXhpc0VsID0gZ3JhcGhcblx0XHRcdC5hcHBlbmQoJ2cnKVxuXHRcdFx0LmNsYXNzZWQoJ3gtYXhpcycsIHRydWUpXG5cdFx0XHQuY2xhc3NlZCh3aGVyZSwgdHJ1ZSlcblx0XHRcdC5hdHRyKCd0cmFuc2Zvcm0nLCAndHJhbnNsYXRlKCcgKyBjb25maWcubWFyZ2luLmxlZnQgKyAnLCAnICsgeSArICcpJylcblx0XHRcdC5jYWxsKHhBeGlzKVxuXHRcdCAgO1xuXHRcdH1cblxuXHRcdGZ1bmN0aW9uIHJlZHJhdygpIHtcblxuXHRcdCAgdmFyIGhhc1RvcEF4aXMgPSB0eXBlb2YgY29uZmlnLmhhc1RvcEF4aXMgPT09ICdmdW5jdGlvbicgPyBjb25maWcuaGFzVG9wQXhpcyhkYXRhKSA6IGNvbmZpZy5oYXNUb3BBeGlzO1xuXHRcdCAgaWYgKGhhc1RvcEF4aXMpIHtcblx0XHRcdGRyYXdYQXhpcygndG9wJyk7XG5cdFx0ICB9XG5cblx0XHQgIHZhciBoYXNCb3R0b21BeGlzID0gdHlwZW9mIGNvbmZpZy5oYXNCb3R0b21BeGlzID09PSAnZnVuY3Rpb24nID8gY29uZmlnLmhhc0JvdHRvbUF4aXMoZGF0YSkgOiBjb25maWcuaGFzQm90dG9tQXhpcztcblx0XHQgIGlmIChoYXNCb3R0b21BeGlzKSB7XG5cdFx0XHRkcmF3WEF4aXMoJ2JvdHRvbScpO1xuXHRcdCAgfVxuXG5cdFx0ICB6b29tLnNpemUoW2NvbmZpZy53aWR0aCwgaGVpZ2h0XSk7XG5cblx0XHQgIGdyYXBoLnNlbGVjdCgnLmdyYXBoLWJvZHknKS5yZW1vdmUoKTtcblx0XHQgIHZhciBncmFwaEJvZHkgPSBncmFwaFxuXHRcdFx0LmFwcGVuZCgnZycpXG5cdFx0XHQuY2xhc3NlZCgnZ3JhcGgtYm9keScsIHRydWUpXG5cdFx0XHQuYXR0cigndHJhbnNmb3JtJywgJ3RyYW5zbGF0ZSgnICsgY29uZmlnLm1hcmdpbi5sZWZ0ICsgJywgJyArIChjb25maWcubWFyZ2luLnRvcCAtIDE1KSArICcpJyk7XG5cblx0XHQgIHZhciBsaW5lcyA9IGdyYXBoQm9keS5zZWxlY3RBbGwoJ2cnKS5kYXRhKGRhdGEpO1xuXG5cdFx0ICBsaW5lcy5lbnRlcigpXG5cdFx0XHQuYXBwZW5kKCdnJylcblx0XHRcdC5jbGFzc2VkKCdsaW5lJywgdHJ1ZSlcblx0XHRcdC5hdHRyKCd0cmFuc2Zvcm0nLCBmdW5jdGlvbihkKSB7XG5cdFx0XHQgIHJldHVybiAndHJhbnNsYXRlKDAsJyArIHlTY2FsZShkLm5hbWUpICsgJyknO1xuXHRcdFx0fSlcblx0XHRcdC5zdHlsZSgnZmlsbCcsIGNvbmZpZy5ldmVudExpbmVDb2xvcilcblx0XHRcdC5jYWxsKGV2ZW50TGluZSh7IHhTY2FsZTogeFNjYWxlLCBldmVudENvbG9yOiBjb25maWcuZXZlbnRDb2xvciB9KSlcblx0XHQgIDtcblxuXHRcdCAgbGluZXMuZXhpdCgpLnJlbW92ZSgpO1xuXHRcdH1cblxuXHRcdHJlZHJhdygpO1xuXHRcdGlmIChjb25maWcuaGFzRGVsaW1pdGVyKSB7XG5cdFx0ICByZWRyYXdEZWxpbWl0ZXIoKTtcblx0XHR9XG5cdFx0aWYgKGNvbmZpZy5ldmVudFpvb20pIHtcblx0XHQgIGNvbmZpZy5ldmVudFpvb20oeFNjYWxlKTtcblx0XHR9XG5cdCAgfSk7XG5cdH1cblxuXHQvLyBBZGRzIGN0eC5nZXRUcmFuc2Zvcm0oKSAtIHJldHVybnMgYW4gU1ZHTWF0cml4XG4gIC8vIEFkZHMgY3R4LnRyYW5zZm9ybWVkUG9pbnQoeCx5KSAtIHJldHVybnMgYW4gU1ZHUG9pbnRcbiAgZnVuY3Rpb24gdHJhY2tUcmFuc2Zvcm1zKGN0eCl7XG5cdHZhciBzdmcgPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50TlMoXCJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2Z1wiLCdzdmcnKTtcblx0dmFyIHhmb3JtID0gc3ZnLmNyZWF0ZVNWR01hdHJpeCgpO1xuXHRjdHguZ2V0VHJhbnNmb3JtID0gZnVuY3Rpb24oKXsgcmV0dXJuIHhmb3JtOyB9O1xuXG5cdHZhciBzYXZlZFRyYW5zZm9ybXMgPSBbXTtcblx0dmFyIHNhdmUgPSBjdHguc2F2ZTtcblx0Y3R4LnNhdmUgPSBmdW5jdGlvbigpe1xuXHQgIHNhdmVkVHJhbnNmb3Jtcy5wdXNoKHhmb3JtLnRyYW5zbGF0ZSgwLDApKTtcblx0ICByZXR1cm4gc2F2ZS5jYWxsKGN0eCk7XG5cdH07XG5cdHZhciByZXN0b3JlID0gY3R4LnJlc3RvcmU7XG5cdGN0eC5yZXN0b3JlID0gZnVuY3Rpb24oKXtcblx0ICB4Zm9ybSA9IHNhdmVkVHJhbnNmb3Jtcy5wb3AoKTtcblx0ICByZXR1cm4gcmVzdG9yZS5jYWxsKGN0eCk7XG5cdH07XG5cblx0dmFyIHNjYWxlID0gY3R4LnNjYWxlO1xuXHRjdHguc2NhbGUgPSBmdW5jdGlvbihzeCxzeSl7XG5cdCAgeGZvcm0gPSB4Zm9ybS5zY2FsZU5vblVuaWZvcm0oc3gsc3kpO1xuXHQgIHJldHVybiBzY2FsZS5jYWxsKGN0eCxzeCxzeSk7XG5cdH07XG5cdHZhciByb3RhdGUgPSBjdHgucm90YXRlO1xuXHRjdHgucm90YXRlID0gZnVuY3Rpb24ocmFkaWFucyl7XG5cdCAgeGZvcm0gPSB4Zm9ybS5yb3RhdGUocmFkaWFucyoxODAvTWF0aC5QSSk7XG5cdCAgcmV0dXJuIHJvdGF0ZS5jYWxsKGN0eCxyYWRpYW5zKTtcblx0fTtcblx0dmFyIHRyYW5zbGF0ZSA9IGN0eC50cmFuc2xhdGU7XG5cdGN0eC50cmFuc2xhdGUgPSBmdW5jdGlvbihkeCxkeSl7XG5cdCAgeGZvcm0gPSB4Zm9ybS50cmFuc2xhdGUoZHgsZHkpO1xuXHQgIHJldHVybiB0cmFuc2xhdGUuY2FsbChjdHgsZHgsZHkpO1xuXHR9O1xuXHR2YXIgdHJhbnNmb3JtID0gY3R4LnRyYW5zZm9ybTtcblx0Y3R4LnRyYW5zZm9ybSA9IGZ1bmN0aW9uKGEsYixjLGQsZSxmKXtcblx0ICB2YXIgbTIgPSBzdmcuY3JlYXRlU1ZHTWF0cml4KCk7XG5cdCAgbTIuYT1hOyBtMi5iPWI7IG0yLmM9YzsgbTIuZD1kOyBtMi5lPWU7IG0yLmY9Zjtcblx0ICB4Zm9ybSA9IHhmb3JtLm11bHRpcGx5KG0yKTtcblx0ICByZXR1cm4gdHJhbnNmb3JtLmNhbGwoY3R4LGEsYixjLGQsZSxmKTtcblx0fTtcblx0dmFyIHNldFRyYW5zZm9ybSA9IGN0eC5zZXRUcmFuc2Zvcm07XG5cdGN0eC5zZXRUcmFuc2Zvcm0gPSBmdW5jdGlvbihhLGIsYyxkLGUsZil7XG5cdCAgeGZvcm0uYSA9IGE7XG5cdCAgeGZvcm0uYiA9IGI7XG5cdCAgeGZvcm0uYyA9IGM7XG5cdCAgeGZvcm0uZCA9IGQ7XG5cdCAgeGZvcm0uZSA9IGU7XG5cdCAgeGZvcm0uZiA9IGY7XG5cdCAgcmV0dXJuIHNldFRyYW5zZm9ybS5jYWxsKGN0eCxhLGIsYyxkLGUsZik7XG5cdH07XG5cdHZhciBwdCAgPSBzdmcuY3JlYXRlU1ZHUG9pbnQoKTtcblx0Y3R4LnRyYW5zZm9ybWVkUG9pbnQgPSBmdW5jdGlvbih4LHkpe1xuXHQgIHB0Lng9eDsgcHQueT15O1xuXHQgIHJldHVybiBwdC5tYXRyaXhUcmFuc2Zvcm0oeGZvcm0uaW52ZXJzZSgpKTtcblx0fVxuICB9XG5cblx0Y29uZmlndXJhYmxlKGV2ZW50RHJvcEdyYXBoLCBjb25maWcpO1xuXG5cdHJldHVybiBldmVudERyb3BHcmFwaDtcbiAgfTtcbn07XG4iLCJcInVzZSBzdHJpY3RcIjtcbi8qIGdsb2JhbCByZXF1aXJlLCBtb2R1bGUsIGQzICovXG5cbnZhciBjb25maWd1cmFibGUgPSByZXF1aXJlKCcuL3V0aWwvY29uZmlndXJhYmxlJyk7XG52YXIgZmlsdGVyRGF0YSA9IHJlcXVpcmUoJy4vZmlsdGVyRGF0YScpO1xuXG52YXIgZGVmYXVsdENvbmZpZyA9IHtcbiAgeFNjYWxlOiBudWxsXG59O1xuXG5tb2R1bGUuZXhwb3J0cyA9IGZ1bmN0aW9uIChkMykge1xuICByZXR1cm4gZnVuY3Rpb24gKGNvbmZpZykge1xuXG4gICAgY29uZmlnID0gY29uZmlnIHx8IHtcbiAgICAgIHhTY2FsZTogbnVsbCxcbiAgICAgIGV2ZW50Q29sb3I6IG51bGxcbiAgICB9O1xuICAgIGZvciAodmFyIGtleSBpbiBkZWZhdWx0Q29uZmlnKSB7XG4gICAgICBjb25maWdba2V5XSA9IGNvbmZpZ1trZXldIHx8IGRlZmF1bHRDb25maWdba2V5XTtcbiAgICB9XG5cbiAgICB2YXIgZXZlbnRMaW5lID0gZnVuY3Rpb24gZXZlbnRMaW5lKHNlbGVjdGlvbikge1xuICAgICAgc2VsZWN0aW9uLmVhY2goZnVuY3Rpb24gKGRhdGEpIHtcbiAgICAgICAgZDMuc2VsZWN0KHRoaXMpLnNlbGVjdEFsbCgndGV4dCcpLnJlbW92ZSgpO1xuXG4gICAgICAgIGQzLnNlbGVjdCh0aGlzKS5hcHBlbmQoJ3RleHQnKVxuICAgICAgICAgIC50ZXh0KGZ1bmN0aW9uKGQpIHtcbiAgICAgICAgICAgIHZhciBjb3VudCA9IGZpbHRlckRhdGEoZC5kYXRlcywgY29uZmlnLnhTY2FsZSkubGVuZ3RoO1xuICAgICAgICAgICAgcmV0dXJuIGQubmFtZSArIChjb3VudCA+IDAgPyAnICgnICsgY291bnQgKyAnKScgOiAnJyk7XG4gICAgICAgICAgfSlcbiAgICAgICAgICAuYXR0cigndGV4dC1hbmNob3InLCAnZW5kJylcbiAgICAgICAgICAuYXR0cigndHJhbnNmb3JtJywgJ3RyYW5zbGF0ZSgtMjApJylcbiAgICAgICAgICAuc3R5bGUoJ2ZpbGwnLCAnYmxhY2snKVxuICAgICAgICA7XG5cbiAgICAgICAgLy9kMy5zZWxlY3QodGhpcykuc2VsZWN0QWxsKCdjaXJjbGUnKS5yZW1vdmUoKTtcblxuICAgICAgICAvKnZhciBjaXJjbGUgPSBkMy5zZWxlY3QodGhpcykuc2VsZWN0QWxsKCdjaXJjbGUnKVxuICAgICAgICAgIC5kYXRhKGZ1bmN0aW9uKGQpIHtcbiAgICAgICAgICAgIC8vIGZpbHRlciB2YWx1ZSBvdXRzaWRlIG9mIHJhbmdlXG4gICAgICAgICAgICByZXR1cm4gZmlsdGVyRGF0YShkLmRhdGVzLCBjb25maWcueFNjYWxlKTtcbiAgICAgICAgICB9KTtcblxuICAgICAgICBjaXJjbGUuZW50ZXIoKVxuICAgICAgICAgIC5hcHBlbmQoJ2NpcmNsZScpXG4gICAgICAgICAgLmF0dHIoJ2N4JywgZnVuY3Rpb24oZCkge1xuICAgICAgICAgICAgcmV0dXJuIGNvbmZpZy54U2NhbGUoZCk7XG4gICAgICAgICAgfSlcbiAgICAgICAgICAuc3R5bGUoJ2ZpbGwnLCBjb25maWcuZXZlbnRDb2xvcilcbiAgICAgICAgICAuYXR0cignY3knLCAtNSlcbiAgICAgICAgICAuYXR0cigncicsIDEwKVxuICAgICAgICA7XG5cbiAgICAgICAgY2lyY2xlLmV4aXQoKS5yZW1vdmUoKTsqL1xuXG4gICAgICB9KTtcbiAgICB9O1xuXG4gICAgY29uZmlndXJhYmxlKGV2ZW50TGluZSwgY29uZmlnKTtcblxuICAgIHJldHVybiBldmVudExpbmU7XG4gIH07XG59O1xuIiwiXCJ1c2Ugc3RyaWN0XCI7XG4vKiBnbG9iYWwgbW9kdWxlICovXG5cbm1vZHVsZS5leHBvcnRzID0gZnVuY3Rpb24gZmlsdGVyRGF0ZShkYXRhLCBzY2FsZSkge1xuICBkYXRhID0gZGF0YSB8fCBbXTtcbiAgdmFyIGZpbHRlcmVkRGF0YSA9IFtdO1xuICB2YXIgYm91bmRhcnkgPSBzY2FsZS5yYW5nZSgpO1xuICB2YXIgbWluID0gYm91bmRhcnlbMF07XG4gIHZhciBtYXggPSBib3VuZGFyeVsxXTtcbiAgZGF0YS5mb3JFYWNoKGZ1bmN0aW9uIChkYXR1bSkge1xuICAgIHZhciB2YWx1ZSA9IHNjYWxlKGRhdHVtKTtcbiAgICBpZiAodmFsdWUgPCBtaW4gfHwgdmFsdWUgPiBtYXgpIHtcbiAgICAgIHJldHVybjtcbiAgICB9XG4gICAgZmlsdGVyZWREYXRhLnB1c2goZGF0dW0pO1xuICB9KTtcblxuICByZXR1cm4gZmlsdGVyZWREYXRhO1xufTtcbiIsIm1vZHVsZS5leHBvcnRzID0gZnVuY3Rpb24gY29uZmlndXJhYmxlKHRhcmdldEZ1bmN0aW9uLCBjb25maWcsIGxpc3RlbmVycykge1xuICBsaXN0ZW5lcnMgPSBsaXN0ZW5lcnMgfHwge307XG4gIGZvciAodmFyIGl0ZW0gaW4gY29uZmlnKSB7XG4gICAgKGZ1bmN0aW9uKGl0ZW0pIHtcbiAgICAgIHRhcmdldEZ1bmN0aW9uW2l0ZW1dID0gZnVuY3Rpb24odmFsdWUpIHtcbiAgICAgICAgaWYgKCFhcmd1bWVudHMubGVuZ3RoKSByZXR1cm4gY29uZmlnW2l0ZW1dO1xuICAgICAgICBjb25maWdbaXRlbV0gPSB2YWx1ZTtcbiAgICAgICAgaWYgKGxpc3RlbmVycy5oYXNPd25Qcm9wZXJ0eShpdGVtKSkge1xuICAgICAgICAgIGxpc3RlbmVyc1tpdGVtXSh2YWx1ZSk7XG4gICAgICAgIH1cblxuICAgICAgICByZXR1cm4gdGFyZ2V0RnVuY3Rpb247XG4gICAgICB9O1xuICAgIH0pKGl0ZW0pOyAvLyBmb3IgZG9lc24ndCBjcmVhdGUgYSBjbG9zdXJlLCBmb3JjaW5nIGl0XG4gIH1cbn07XG4iXX0=
