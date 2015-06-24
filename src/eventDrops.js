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

},{"./eventDrops":"/home/melodie/Bureau/EventDrops/lib/eventDrops.js"}],"/home/melodie/Bureau/EventDrops/lib/canvasHandler.js":[function(require,module,exports){
"use strict";
/* global require, module */

var defaultConfig = {
  xScale: null
};

module.exports = function (d3, document, config) {
  return function (config) {

    config = config || {
      xScale: null,
      eventColor: null
    };
    for (var key in defaultConfig) {
     config[key] = config[key] || defaultConfig[key];
    }

    function canvasHandler(x, y) {
      this.graphWidth = x;
      this.graphHeight = y;
      this.lastX = graphWidth/2;
      this.lastY = graphHeight/2;
      this.mouseDown = 0;
      this.ctx = null;
      this.canvas = null;
    }

    /*var graphHeight, graphWidth;
    var lastX, lastY;
    var ctx;
    var mouseDown = 0;
    var dragStart, dragged;*/

    /*var canvasHandler = function () {
      var graphWidth = config.width - config.margin.right - config.margin.left;
      alert(graphWidth);
      var graphHeight = data.length * 40;
      alert(graphHeight);
      var ctx = (canvas.node()).getContext('2d');
      var mouseDown = 0;
      var lastX = graphWidth/2;
      var lastY = graphHeight/2;
    }*/

      this.init = function (selection, x, y) {
        /*this.graphWidth = x;
        this.graphHeight = y;
        this.mouseDown = 0;
        this.lastX = x/2;
        this.lastY = y/2;*/

        selection.each(function (data) {
          d3.select(this).select('canvas').remove();
          var canvas = d3.select(this)
            .append('canvas')
            .attr('id', "mon_canvas")
            .attr('width', this.graphWidth)
            .attr('height', this.graphHeight)
            ;
          this.ctx = canvas.node().getContext('2d');
        });
      }

      this.draw = function(){
        // Clear the entire canvas
        var topX = 0;
        var topY = 0;
        //alert(graphWidth);
        this.ctx.clearRect(topX, topY, topX + graphWidth, topY + graphHeight);

        ctx.font = "30px Arial";
        ctx.textAlign = "center";
        ctx.fillText("Toto",750/2,35);
        ctx.fillText("Toto",750/2,75);
        ctx.fillText("Toto",750/2,115);
        ctx.fillText("Toto",750/2,155);
      }

      this.drawCircle = function (x, y) {
        context.beginPath();
        context.lineWidth="2";
        context.fillStyle="#FF4422";
        context.arc(x, y, 90, 0, 2 * Math.PI);
        context.fill();
      }

      this.mouseDownHandler = function(evt){
        // permits compatibility with every browser
        document.body.style.mozUserSelect = document.body.style.webkitUserSelect = document.body.style.userSelect = 'none';
        //lastX = evt.offsetX || (evt.pageX - canvas.node().offsetLeft);
        lastX = evt.clientX;
        //lastY = graphHeight/2;
        //alert(lastX);
        var dragStart = {
          x : lastX,
          y : lastY
        };
        var dragged = false;
        mouseDown++;

        //canvas.node().addEventListener('mousemove', c.mouseMoveHandler,false);
        //canvas.node().addEventListener('mouseup', c.mouseUpHandler,false);
      }

      this.mouseMoveHandler = function(evt){
        //lastX = evt.offsetX || (evt.pageX - canvas.node().offsetLeft);
        lastX = evt.clientX;
        dragged = true;
        if (dragStart && mouseDown){
          ctx.translate(lastX-dragStart.x, lastY-dragStart.y);
          //ctx.translate([d3.event.translate[0], 0]);
          drawAgain();
        }
      }

      this.mouseUpHandler = function(evt){
        //canvas.node().addEventListener('mousemove', c.mouseMoveHandler,false);
        //canvas.node().addEventListener('mousedown', c.mouseDownHandler,false);

        dragStart = null;
        mouseDown--;
        if (!dragged) zoom(evt.shiftKey ? -1 : 1 );
      }
  }
}

},{}],"/home/melodie/Bureau/EventDrops/lib/delimiter.js":[function(require,module,exports){
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

module.exports = function (d3, document) {
  var eventLine = require('./eventLine')(d3);
  var delimiter = require('./delimiter')(d3);
  var canvasHandler = require('./canvasHandler')(d3, document);

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

		  	window.requestAnimFrame = (function(){
		      return  window.requestAnimationFrame       ||
		              window.webkitRequestAnimationFrame ||
		              window.mozRequestAnimationFrame    ||
		              window.oRequestAnimationFrame      ||
		              window.msRequestAnimationFrame     ||
		              function(/* function */ callback, /* DOMElement */ element) {
		                window.setTimeout(callback, 1000 / 60);
		              };
	    	})();

				var zoom = d3.behavior.zoom().center(null).scaleExtent([config.minScale, config.maxScale]).on("zoom", updateZoom);

				zoom.on("zoomend", zoomEnd);

				var graphWidth = config.width - config.margin.right - config.margin.left;
				var graphHeight = data.length * 40;
				var height = graphHeight + config.margin.top + config.margin.bottom;

				var canvas_width =  graphWidth;
				var canvas_height = graphHeight;

        /*var lastX = graphWidth/2;
        var lastY = graphHeight/2;
        var dragged, dragStart;
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

      canvas.node().addEventListener('mousedown', function (evt) {
        // permits compatibility with every browser
        document.body.style.mozUserSelect = document.body.style.webkitUserSelect = document.body.style.userSelect = 'none';
        lastX = evt.clientX;
        dragStart = {
          x : lastX,
          y : lastY
        };
        dragged = false;
        mouseDown++;
      },false);

      canvas.node().addEventListener('mousemove', function (evt) {
        lastX = evt.clientX;
        dragged = true;
        if (dragStart && mouseDown){
          ctx.translate(lastX-dragStart.x, lastY-dragStart.y);
          drawAgain();
        }
      },false);

      canvas.node().addEventListener('mouseup', function (evt) {
        dragStart = null;
        mouseDown--;
        if (!dragged) zoom(evt.shiftKey ? -1 : 1 );
      },false);*/

			/*var c = new canvasHandler(graphWidth, graphHeight);

      c.init(selection, graphWidth, graphHeight);
			c.draw();*/

			/*var lastX=canvas.node().width/2, lastY=canvas.node().height/2;
			var mouseDown = 0;
			var dragged;
			var dragStart = {
				x : lastX,
				y : lastY
			};
console.log('ok');*/

      /*var canvas = d3.select(this).selectAll('canvas');

			// event "clicking"
			canvas.node().addEventListener('mousedown', c.mouseDownHandler,false);

      canvas.node().addEventListener('mousemove', c.mouseMoveHandler,false);

      canvas.node().addEventListener('mouseup', c.mouseUpHandler,false);
*/
			// event "mouse moving"
			//canvas.node().addEventListener('mousemove', c.mouseMoveHandler,false);

			// event "stop clicking"
			//canvas.node().addEventListener('mouseup', c.mouseUpHandler,false);

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

},{"./canvasHandler":"/home/melodie/Bureau/EventDrops/lib/canvasHandler.js","./delimiter":"/home/melodie/Bureau/EventDrops/lib/delimiter.js","./eventLine":"/home/melodie/Bureau/EventDrops/lib/eventLine.js","./util/configurable":"/home/melodie/Bureau/EventDrops/lib/util/configurable.js"}],"/home/melodie/Bureau/EventDrops/lib/eventLine.js":[function(require,module,exports){
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIm5vZGVfbW9kdWxlcy9icm93c2VyaWZ5L25vZGVfbW9kdWxlcy9icm93c2VyLXBhY2svX3ByZWx1ZGUuanMiLCIuL2xpYi9tYWluLmpzIiwiL2hvbWUvbWVsb2RpZS9CdXJlYXUvRXZlbnREcm9wcy9saWIvY2FudmFzSGFuZGxlci5qcyIsIi9ob21lL21lbG9kaWUvQnVyZWF1L0V2ZW50RHJvcHMvbGliL2RlbGltaXRlci5qcyIsIi9ob21lL21lbG9kaWUvQnVyZWF1L0V2ZW50RHJvcHMvbGliL2V2ZW50RHJvcHMuanMiLCIvaG9tZS9tZWxvZGllL0J1cmVhdS9FdmVudERyb3BzL2xpYi9ldmVudExpbmUuanMiLCIvaG9tZS9tZWxvZGllL0J1cmVhdS9FdmVudERyb3BzL2xpYi9maWx0ZXJEYXRhLmpzIiwiL2hvbWUvbWVsb2RpZS9CdXJlYXUvRXZlbnREcm9wcy9saWIvdXRpbC9jb25maWd1cmFibGUuanMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUE7QUNBQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ2hCQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUM5SEE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ2xEQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUN6WUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDL0RBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDbkJBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EiLCJmaWxlIjoiZ2VuZXJhdGVkLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXNDb250ZW50IjpbIihmdW5jdGlvbiBlKHQsbixyKXtmdW5jdGlvbiBzKG8sdSl7aWYoIW5bb10pe2lmKCF0W29dKXt2YXIgYT10eXBlb2YgcmVxdWlyZT09XCJmdW5jdGlvblwiJiZyZXF1aXJlO2lmKCF1JiZhKXJldHVybiBhKG8sITApO2lmKGkpcmV0dXJuIGkobywhMCk7dmFyIGY9bmV3IEVycm9yKFwiQ2Fubm90IGZpbmQgbW9kdWxlICdcIitvK1wiJ1wiKTt0aHJvdyBmLmNvZGU9XCJNT0RVTEVfTk9UX0ZPVU5EXCIsZn12YXIgbD1uW29dPXtleHBvcnRzOnt9fTt0W29dWzBdLmNhbGwobC5leHBvcnRzLGZ1bmN0aW9uKGUpe3ZhciBuPXRbb11bMV1bZV07cmV0dXJuIHMobj9uOmUpfSxsLGwuZXhwb3J0cyxlLHQsbixyKX1yZXR1cm4gbltvXS5leHBvcnRzfXZhciBpPXR5cGVvZiByZXF1aXJlPT1cImZ1bmN0aW9uXCImJnJlcXVpcmU7Zm9yKHZhciBvPTA7bzxyLmxlbmd0aDtvKyspcyhyW29dKTtyZXR1cm4gc30pIiwiXCJ1c2Ugc3RyaWN0XCI7XG4vKiBnbG9iYWwgcmVxdWlyZSwgZGVmaW5lLCBtb2R1bGUgKi9cblxudmFyIGV2ZW50RHJvcHMgPSByZXF1aXJlKCcuL2V2ZW50RHJvcHMnKTtcblxuaWYgKHR5cGVvZiBkZWZpbmUgPT09IFwiZnVuY3Rpb25cIiAmJiBkZWZpbmUuYW1kKSB7XG4gIGRlZmluZSgnZDMuY2hhcnQuZXZlbnREcm9wcycsIFtcImQzXCJdLCBmdW5jdGlvbiAoZDMpIHtcbiAgICBkMy5jaGFydCA9IGQzLmNoYXJ0IHx8IHt9O1xuICAgIGQzLmNoYXJ0LmV2ZW50RHJvcHMgPSBldmVudERyb3BzKGQzLCBkb2N1bWVudCk7XG4gIH0pO1xufSBlbHNlIGlmICh3aW5kb3cpIHtcbiAgd2luZG93LmQzLmNoYXJ0ID0gd2luZG93LmQzLmNoYXJ0IHx8IHt9O1xuICB3aW5kb3cuZDMuY2hhcnQuZXZlbnREcm9wcyA9IGV2ZW50RHJvcHMod2luZG93LmQzLCBkb2N1bWVudCk7XG59IGVsc2Uge1xuICBtb2R1bGUuZXhwb3J0cyA9IGV2ZW50RHJvcHM7XG59XG4iLCJcInVzZSBzdHJpY3RcIjtcbi8qIGdsb2JhbCByZXF1aXJlLCBtb2R1bGUgKi9cblxudmFyIGRlZmF1bHRDb25maWcgPSB7XG4gIHhTY2FsZTogbnVsbFxufTtcblxubW9kdWxlLmV4cG9ydHMgPSBmdW5jdGlvbiAoZDMsIGRvY3VtZW50LCBjb25maWcpIHtcbiAgcmV0dXJuIGZ1bmN0aW9uIChjb25maWcpIHtcblxuICAgIGNvbmZpZyA9IGNvbmZpZyB8fCB7XG4gICAgICB4U2NhbGU6IG51bGwsXG4gICAgICBldmVudENvbG9yOiBudWxsXG4gICAgfTtcbiAgICBmb3IgKHZhciBrZXkgaW4gZGVmYXVsdENvbmZpZykge1xuICAgICBjb25maWdba2V5XSA9IGNvbmZpZ1trZXldIHx8IGRlZmF1bHRDb25maWdba2V5XTtcbiAgICB9XG5cbiAgICBmdW5jdGlvbiBjYW52YXNIYW5kbGVyKHgsIHkpIHtcbiAgICAgIHRoaXMuZ3JhcGhXaWR0aCA9IHg7XG4gICAgICB0aGlzLmdyYXBoSGVpZ2h0ID0geTtcbiAgICAgIHRoaXMubGFzdFggPSBncmFwaFdpZHRoLzI7XG4gICAgICB0aGlzLmxhc3RZID0gZ3JhcGhIZWlnaHQvMjtcbiAgICAgIHRoaXMubW91c2VEb3duID0gMDtcbiAgICAgIHRoaXMuY3R4ID0gbnVsbDtcbiAgICAgIHRoaXMuY2FudmFzID0gbnVsbDtcbiAgICB9XG5cbiAgICAvKnZhciBncmFwaEhlaWdodCwgZ3JhcGhXaWR0aDtcbiAgICB2YXIgbGFzdFgsIGxhc3RZO1xuICAgIHZhciBjdHg7XG4gICAgdmFyIG1vdXNlRG93biA9IDA7XG4gICAgdmFyIGRyYWdTdGFydCwgZHJhZ2dlZDsqL1xuXG4gICAgLyp2YXIgY2FudmFzSGFuZGxlciA9IGZ1bmN0aW9uICgpIHtcbiAgICAgIHZhciBncmFwaFdpZHRoID0gY29uZmlnLndpZHRoIC0gY29uZmlnLm1hcmdpbi5yaWdodCAtIGNvbmZpZy5tYXJnaW4ubGVmdDtcbiAgICAgIGFsZXJ0KGdyYXBoV2lkdGgpO1xuICAgICAgdmFyIGdyYXBoSGVpZ2h0ID0gZGF0YS5sZW5ndGggKiA0MDtcbiAgICAgIGFsZXJ0KGdyYXBoSGVpZ2h0KTtcbiAgICAgIHZhciBjdHggPSAoY2FudmFzLm5vZGUoKSkuZ2V0Q29udGV4dCgnMmQnKTtcbiAgICAgIHZhciBtb3VzZURvd24gPSAwO1xuICAgICAgdmFyIGxhc3RYID0gZ3JhcGhXaWR0aC8yO1xuICAgICAgdmFyIGxhc3RZID0gZ3JhcGhIZWlnaHQvMjtcbiAgICB9Ki9cblxuICAgICAgdGhpcy5pbml0ID0gZnVuY3Rpb24gKHNlbGVjdGlvbiwgeCwgeSkge1xuICAgICAgICAvKnRoaXMuZ3JhcGhXaWR0aCA9IHg7XG4gICAgICAgIHRoaXMuZ3JhcGhIZWlnaHQgPSB5O1xuICAgICAgICB0aGlzLm1vdXNlRG93biA9IDA7XG4gICAgICAgIHRoaXMubGFzdFggPSB4LzI7XG4gICAgICAgIHRoaXMubGFzdFkgPSB5LzI7Ki9cblxuICAgICAgICBzZWxlY3Rpb24uZWFjaChmdW5jdGlvbiAoZGF0YSkge1xuICAgICAgICAgIGQzLnNlbGVjdCh0aGlzKS5zZWxlY3QoJ2NhbnZhcycpLnJlbW92ZSgpO1xuICAgICAgICAgIHZhciBjYW52YXMgPSBkMy5zZWxlY3QodGhpcylcbiAgICAgICAgICAgIC5hcHBlbmQoJ2NhbnZhcycpXG4gICAgICAgICAgICAuYXR0cignaWQnLCBcIm1vbl9jYW52YXNcIilcbiAgICAgICAgICAgIC5hdHRyKCd3aWR0aCcsIHRoaXMuZ3JhcGhXaWR0aClcbiAgICAgICAgICAgIC5hdHRyKCdoZWlnaHQnLCB0aGlzLmdyYXBoSGVpZ2h0KVxuICAgICAgICAgICAgO1xuICAgICAgICAgIHRoaXMuY3R4ID0gY2FudmFzLm5vZGUoKS5nZXRDb250ZXh0KCcyZCcpO1xuICAgICAgICB9KTtcbiAgICAgIH1cblxuICAgICAgdGhpcy5kcmF3ID0gZnVuY3Rpb24oKXtcbiAgICAgICAgLy8gQ2xlYXIgdGhlIGVudGlyZSBjYW52YXNcbiAgICAgICAgdmFyIHRvcFggPSAwO1xuICAgICAgICB2YXIgdG9wWSA9IDA7XG4gICAgICAgIC8vYWxlcnQoZ3JhcGhXaWR0aCk7XG4gICAgICAgIHRoaXMuY3R4LmNsZWFyUmVjdCh0b3BYLCB0b3BZLCB0b3BYICsgZ3JhcGhXaWR0aCwgdG9wWSArIGdyYXBoSGVpZ2h0KTtcblxuICAgICAgICBjdHguZm9udCA9IFwiMzBweCBBcmlhbFwiO1xuICAgICAgICBjdHgudGV4dEFsaWduID0gXCJjZW50ZXJcIjtcbiAgICAgICAgY3R4LmZpbGxUZXh0KFwiVG90b1wiLDc1MC8yLDM1KTtcbiAgICAgICAgY3R4LmZpbGxUZXh0KFwiVG90b1wiLDc1MC8yLDc1KTtcbiAgICAgICAgY3R4LmZpbGxUZXh0KFwiVG90b1wiLDc1MC8yLDExNSk7XG4gICAgICAgIGN0eC5maWxsVGV4dChcIlRvdG9cIiw3NTAvMiwxNTUpO1xuICAgICAgfVxuXG4gICAgICB0aGlzLmRyYXdDaXJjbGUgPSBmdW5jdGlvbiAoeCwgeSkge1xuICAgICAgICBjb250ZXh0LmJlZ2luUGF0aCgpO1xuICAgICAgICBjb250ZXh0LmxpbmVXaWR0aD1cIjJcIjtcbiAgICAgICAgY29udGV4dC5maWxsU3R5bGU9XCIjRkY0NDIyXCI7XG4gICAgICAgIGNvbnRleHQuYXJjKHgsIHksIDkwLCAwLCAyICogTWF0aC5QSSk7XG4gICAgICAgIGNvbnRleHQuZmlsbCgpO1xuICAgICAgfVxuXG4gICAgICB0aGlzLm1vdXNlRG93bkhhbmRsZXIgPSBmdW5jdGlvbihldnQpe1xuICAgICAgICAvLyBwZXJtaXRzIGNvbXBhdGliaWxpdHkgd2l0aCBldmVyeSBicm93c2VyXG4gICAgICAgIGRvY3VtZW50LmJvZHkuc3R5bGUubW96VXNlclNlbGVjdCA9IGRvY3VtZW50LmJvZHkuc3R5bGUud2Via2l0VXNlclNlbGVjdCA9IGRvY3VtZW50LmJvZHkuc3R5bGUudXNlclNlbGVjdCA9ICdub25lJztcbiAgICAgICAgLy9sYXN0WCA9IGV2dC5vZmZzZXRYIHx8IChldnQucGFnZVggLSBjYW52YXMubm9kZSgpLm9mZnNldExlZnQpO1xuICAgICAgICBsYXN0WCA9IGV2dC5jbGllbnRYO1xuICAgICAgICAvL2xhc3RZID0gZ3JhcGhIZWlnaHQvMjtcbiAgICAgICAgLy9hbGVydChsYXN0WCk7XG4gICAgICAgIHZhciBkcmFnU3RhcnQgPSB7XG4gICAgICAgICAgeCA6IGxhc3RYLFxuICAgICAgICAgIHkgOiBsYXN0WVxuICAgICAgICB9O1xuICAgICAgICB2YXIgZHJhZ2dlZCA9IGZhbHNlO1xuICAgICAgICBtb3VzZURvd24rKztcblxuICAgICAgICAvL2NhbnZhcy5ub2RlKCkuYWRkRXZlbnRMaXN0ZW5lcignbW91c2Vtb3ZlJywgYy5tb3VzZU1vdmVIYW5kbGVyLGZhbHNlKTtcbiAgICAgICAgLy9jYW52YXMubm9kZSgpLmFkZEV2ZW50TGlzdGVuZXIoJ21vdXNldXAnLCBjLm1vdXNlVXBIYW5kbGVyLGZhbHNlKTtcbiAgICAgIH1cblxuICAgICAgdGhpcy5tb3VzZU1vdmVIYW5kbGVyID0gZnVuY3Rpb24oZXZ0KXtcbiAgICAgICAgLy9sYXN0WCA9IGV2dC5vZmZzZXRYIHx8IChldnQucGFnZVggLSBjYW52YXMubm9kZSgpLm9mZnNldExlZnQpO1xuICAgICAgICBsYXN0WCA9IGV2dC5jbGllbnRYO1xuICAgICAgICBkcmFnZ2VkID0gdHJ1ZTtcbiAgICAgICAgaWYgKGRyYWdTdGFydCAmJiBtb3VzZURvd24pe1xuICAgICAgICAgIGN0eC50cmFuc2xhdGUobGFzdFgtZHJhZ1N0YXJ0LngsIGxhc3RZLWRyYWdTdGFydC55KTtcbiAgICAgICAgICAvL2N0eC50cmFuc2xhdGUoW2QzLmV2ZW50LnRyYW5zbGF0ZVswXSwgMF0pO1xuICAgICAgICAgIGRyYXdBZ2FpbigpO1xuICAgICAgICB9XG4gICAgICB9XG5cbiAgICAgIHRoaXMubW91c2VVcEhhbmRsZXIgPSBmdW5jdGlvbihldnQpe1xuICAgICAgICAvL2NhbnZhcy5ub2RlKCkuYWRkRXZlbnRMaXN0ZW5lcignbW91c2Vtb3ZlJywgYy5tb3VzZU1vdmVIYW5kbGVyLGZhbHNlKTtcbiAgICAgICAgLy9jYW52YXMubm9kZSgpLmFkZEV2ZW50TGlzdGVuZXIoJ21vdXNlZG93bicsIGMubW91c2VEb3duSGFuZGxlcixmYWxzZSk7XG5cbiAgICAgICAgZHJhZ1N0YXJ0ID0gbnVsbDtcbiAgICAgICAgbW91c2VEb3duLS07XG4gICAgICAgIGlmICghZHJhZ2dlZCkgem9vbShldnQuc2hpZnRLZXkgPyAtMSA6IDEgKTtcbiAgICAgIH1cbiAgfVxufVxuIiwiXCJ1c2Ugc3RyaWN0XCI7XG4vKiBnbG9iYWwgcmVxdWlyZSwgbW9kdWxlLCBkMyAqL1xuXG52YXIgY29uZmlndXJhYmxlID0gcmVxdWlyZSgnLi91dGlsL2NvbmZpZ3VyYWJsZScpO1xuXG52YXIgZGVmYXVsdENvbmZpZyA9IHtcbiAgeFNjYWxlOiBudWxsLFxuICBkYXRlRm9ybWF0OiBudWxsXG59O1xuXG5tb2R1bGUuZXhwb3J0cyA9IGZ1bmN0aW9uIChkMykge1xuXG4gIHJldHVybiBmdW5jdGlvbiAoY29uZmlnKSB7XG5cbiAgICBjb25maWcgPSBjb25maWcgfHwge307XG4gICAgZm9yICh2YXIga2V5IGluIGRlZmF1bHRDb25maWcpIHtcbiAgICAgIGNvbmZpZ1trZXldID0gY29uZmlnW2tleV0gfHwgZGVmYXVsdENvbmZpZ1trZXldO1xuICAgIH1cblxuICAgIGZ1bmN0aW9uIGRlbGltaXRlcihzZWxlY3Rpb24pIHtcbiAgICAgIHNlbGVjdGlvbi5lYWNoKGZ1bmN0aW9uIChkYXRhKSB7XG4gICAgICAgIGQzLnNlbGVjdCh0aGlzKS5zZWxlY3RBbGwoJ3RleHQnKS5yZW1vdmUoKTtcblxuICAgICAgICB2YXIgbGltaXRzID0gY29uZmlnLnhTY2FsZS5kb21haW4oKTtcblxuICAgICAgICBkMy5zZWxlY3QodGhpcykuYXBwZW5kKCd0ZXh0JylcbiAgICAgICAgICAudGV4dChmdW5jdGlvbiAoKSB7XG5cbiAgICAgICAgICAgIHJldHVybiBjb25maWcuZGF0ZUZvcm1hdChsaW1pdHNbMF0pO1xuICAgICAgICAgIH0pXG4gICAgICAgICAgLmNsYXNzZWQoJ3N0YXJ0JywgdHJ1ZSlcbiAgICAgICAgO1xuXG4gICAgICAgIGQzLnNlbGVjdCh0aGlzKS5hcHBlbmQoJ3RleHQnKVxuICAgICAgICAgIC50ZXh0KGZ1bmN0aW9uICgpIHtcblxuICAgICAgICAgICAgcmV0dXJuIGNvbmZpZy5kYXRlRm9ybWF0KGxpbWl0c1sxXSk7XG4gICAgICAgICAgfSlcbiAgICAgICAgICAuYXR0cigndGV4dC1hbmNob3InLCAnZW5kJylcbiAgICAgICAgICAuYXR0cigndHJhbnNmb3JtJywgJ3RyYW5zbGF0ZSgnICsgY29uZmlnLnhTY2FsZS5yYW5nZSgpWzFdICsgJyknKVxuICAgICAgICAgIC5jbGFzc2VkKCdlbmQnLCB0cnVlKVxuICAgICAgICA7XG4gICAgICB9KTtcbiAgICB9XG5cbiAgICBjb25maWd1cmFibGUoZGVsaW1pdGVyLCBjb25maWcpO1xuXG4gICAgcmV0dXJuIGRlbGltaXRlcjtcbiAgfTtcbn07XG4iLCJcInVzZSBzdHJpY3RcIjtcbi8qIGdsb2JhbCByZXF1aXJlLCBtb2R1bGUgKi9cblxudmFyIGNvbmZpZ3VyYWJsZSA9IHJlcXVpcmUoJy4vdXRpbC9jb25maWd1cmFibGUnKTtcblxubW9kdWxlLmV4cG9ydHMgPSBmdW5jdGlvbiAoZDMsIGRvY3VtZW50KSB7XG4gIHZhciBldmVudExpbmUgPSByZXF1aXJlKCcuL2V2ZW50TGluZScpKGQzKTtcbiAgdmFyIGRlbGltaXRlciA9IHJlcXVpcmUoJy4vZGVsaW1pdGVyJykoZDMpO1xuICB2YXIgY2FudmFzSGFuZGxlciA9IHJlcXVpcmUoJy4vY2FudmFzSGFuZGxlcicpKGQzLCBkb2N1bWVudCk7XG5cbiAgdmFyIGRlZmF1bHRDb25maWcgPSB7XG5cdFx0c3RhcnQ6IG5ldyBEYXRlKDApLFxuXHRcdGVuZDogbmV3IERhdGUoKSxcblx0XHRtaW5TY2FsZTogMCxcblx0XHRtYXhTY2FsZTogSW5maW5pdHksXG5cdFx0d2lkdGg6IDEwMDAsXG5cdFx0bWFyZ2luOiB7XG5cdFx0ICB0b3A6IDYwLFxuXHRcdCAgbGVmdDogMjAwLFxuXHRcdCAgYm90dG9tOiA0MCxcblx0XHQgIHJpZ2h0OiA1MFxuXHRcdH0sXG5cdFx0bG9jYWxlOiBudWxsLFxuXHRcdGF4aXNGb3JtYXQ6IG51bGwsXG5cdFx0dGlja0Zvcm1hdDogW1xuXHRcdFx0W1wiLiVMXCIsIGZ1bmN0aW9uKGQpIHsgcmV0dXJuIGQuZ2V0TWlsbGlzZWNvbmRzKCk7IH1dLFxuXHRcdFx0W1wiOiVTXCIsIGZ1bmN0aW9uKGQpIHsgcmV0dXJuIGQuZ2V0U2Vjb25kcygpOyB9XSxcblx0XHRcdFtcIiVJOiVNXCIsIGZ1bmN0aW9uKGQpIHsgcmV0dXJuIGQuZ2V0TWludXRlcygpOyB9XSxcblx0XHRcdFtcIiVJICVwXCIsIGZ1bmN0aW9uKGQpIHsgcmV0dXJuIGQuZ2V0SG91cnMoKTsgfV0sXG5cdFx0XHRbXCIlYSAlZFwiLCBmdW5jdGlvbihkKSB7IHJldHVybiBkLmdldERheSgpICYmIGQuZ2V0RGF0ZSgpICE9IDE7IH1dLFxuXHRcdFx0W1wiJWIgJWRcIiwgZnVuY3Rpb24oZCkgeyByZXR1cm4gZC5nZXREYXRlKCkgIT0gMTsgfV0sXG5cdFx0XHRbXCIlQlwiLCBmdW5jdGlvbihkKSB7IHJldHVybiBkLmdldE1vbnRoKCk7IH1dLFxuXHRcdFx0W1wiJVlcIiwgZnVuY3Rpb24oKSB7IHJldHVybiB0cnVlOyB9XVxuXHRcdF0sXG5cdFx0ZXZlbnRIb3ZlcjogbnVsbCxcblx0XHRldmVudFpvb206IG51bGwsXG5cdFx0ZXZlbnRDbGljazogbnVsbCxcblx0XHRoYXNEZWxpbWl0ZXI6IHRydWUsXG5cdFx0aGFzVG9wQXhpczogdHJ1ZSxcblx0XHRoYXNCb3R0b21BeGlzOiBmdW5jdGlvbiAoZGF0YSkge1xuXHRcdCAgcmV0dXJuIGRhdGEubGVuZ3RoID49IDEwO1xuXHRcdH0sXG5cdFx0ZXZlbnRMaW5lQ29sb3I6ICdibGFjaycsXG5cdFx0ZXZlbnRDb2xvcjogbnVsbFxuICB9O1xuXG4gIHJldHVybiBmdW5jdGlvbiBldmVudERyb3BzKGNvbmZpZykge1xuXHRcdHZhciB4U2NhbGUgPSBkMy50aW1lLnNjYWxlKCk7XG5cdFx0dmFyIHlTY2FsZSA9IGQzLnNjYWxlLm9yZGluYWwoKTtcblx0XHRjb25maWcgPSBjb25maWcgfHwge307XG5cdFx0Zm9yICh2YXIga2V5IGluIGRlZmF1bHRDb25maWcpIHtcblx0XHQgIGNvbmZpZ1trZXldID0gY29uZmlnW2tleV0gfHwgZGVmYXVsdENvbmZpZ1trZXldO1xuXHRcdH1cblxuXHRcdGZ1bmN0aW9uIGV2ZW50RHJvcEdyYXBoKHNlbGVjdGlvbikge1xuXHRcdCAgc2VsZWN0aW9uLmVhY2goZnVuY3Rpb24gKGRhdGEpIHtcblxuXHRcdCAgXHR3aW5kb3cucmVxdWVzdEFuaW1GcmFtZSA9IChmdW5jdGlvbigpe1xuXHRcdCAgICAgIHJldHVybiAgd2luZG93LnJlcXVlc3RBbmltYXRpb25GcmFtZSAgICAgICB8fFxuXHRcdCAgICAgICAgICAgICAgd2luZG93LndlYmtpdFJlcXVlc3RBbmltYXRpb25GcmFtZSB8fFxuXHRcdCAgICAgICAgICAgICAgd2luZG93Lm1velJlcXVlc3RBbmltYXRpb25GcmFtZSAgICB8fFxuXHRcdCAgICAgICAgICAgICAgd2luZG93Lm9SZXF1ZXN0QW5pbWF0aW9uRnJhbWUgICAgICB8fFxuXHRcdCAgICAgICAgICAgICAgd2luZG93Lm1zUmVxdWVzdEFuaW1hdGlvbkZyYW1lICAgICB8fFxuXHRcdCAgICAgICAgICAgICAgZnVuY3Rpb24oLyogZnVuY3Rpb24gKi8gY2FsbGJhY2ssIC8qIERPTUVsZW1lbnQgKi8gZWxlbWVudCkge1xuXHRcdCAgICAgICAgICAgICAgICB3aW5kb3cuc2V0VGltZW91dChjYWxsYmFjaywgMTAwMCAvIDYwKTtcblx0XHQgICAgICAgICAgICAgIH07XG5cdCAgICBcdH0pKCk7XG5cblx0XHRcdFx0dmFyIHpvb20gPSBkMy5iZWhhdmlvci56b29tKCkuY2VudGVyKG51bGwpLnNjYWxlRXh0ZW50KFtjb25maWcubWluU2NhbGUsIGNvbmZpZy5tYXhTY2FsZV0pLm9uKFwiem9vbVwiLCB1cGRhdGVab29tKTtcblxuXHRcdFx0XHR6b29tLm9uKFwiem9vbWVuZFwiLCB6b29tRW5kKTtcblxuXHRcdFx0XHR2YXIgZ3JhcGhXaWR0aCA9IGNvbmZpZy53aWR0aCAtIGNvbmZpZy5tYXJnaW4ucmlnaHQgLSBjb25maWcubWFyZ2luLmxlZnQ7XG5cdFx0XHRcdHZhciBncmFwaEhlaWdodCA9IGRhdGEubGVuZ3RoICogNDA7XG5cdFx0XHRcdHZhciBoZWlnaHQgPSBncmFwaEhlaWdodCArIGNvbmZpZy5tYXJnaW4udG9wICsgY29uZmlnLm1hcmdpbi5ib3R0b207XG5cblx0XHRcdFx0dmFyIGNhbnZhc193aWR0aCA9ICBncmFwaFdpZHRoO1xuXHRcdFx0XHR2YXIgY2FudmFzX2hlaWdodCA9IGdyYXBoSGVpZ2h0O1xuXG4gICAgICAgIC8qdmFyIGxhc3RYID0gZ3JhcGhXaWR0aC8yO1xuICAgICAgICB2YXIgbGFzdFkgPSBncmFwaEhlaWdodC8yO1xuICAgICAgICB2YXIgZHJhZ2dlZCwgZHJhZ1N0YXJ0O1xuICAgICAgICB2YXIgbW91c2VEb3duID0gMDtcblxuXHRcdFx0XHRkMy5zZWxlY3QodGhpcykuc2VsZWN0KCdjYW52YXMnKS5yZW1vdmUoKTtcblx0XHRcdHZhciBjYW52YXMgPSBkMy5zZWxlY3QodGhpcylcblx0XHRcdCAgLmFwcGVuZCgnY2FudmFzJylcblx0XHRcdCAgLmF0dHIoJ2lkJywgXCJtb25fY2FudmFzXCIpXG5cdFx0XHQgIC5hdHRyKCd3aWR0aCcsIGNhbnZhc193aWR0aClcblx0XHRcdCAgLmF0dHIoJ2hlaWdodCcsIGNhbnZhc19oZWlnaHQpO1xuXG5cdFx0XHQgIC8vIGNvbnNvbGUubG9nKGNhbnZhcyk7XG5cdFx0XHQgIGNvbnNvbGUubG9nKGNhbnZhcy5ub2RlKCkpO1xuXHRcdFx0Ly8gdmFyIGNhbnZhcyA9IGRvY3VtZW50LmdldEVsZW1lbnRzQnlUYWdOYW1lKCdjYW52YXMnKVswXTtcblx0XHRcdC8vIGNhbnZhcy53aWR0aCA9IGNhbnZhc193aWR0aDsgY2FudmFzLmhlaWdodCA9IGNhbnZhc19oZWlnaHQ7XG5cblx0XHRcdHZhciBjdHggPSAoY2FudmFzLm5vZGUoKSkuZ2V0Q29udGV4dCgnMmQnKTtcblx0XHRcdC8vdHJhY2tUcmFuc2Zvcm1zKGN0eCk7XG5cdFx0XHRmdW5jdGlvbiBkcmF3QWdhaW4oKXtcblx0XHRcdCAgLy8gQ2xlYXIgdGhlIGVudGlyZSBjYW52YXNcblx0XHRcdCAgdmFyIHRvcFggPSAwO1xuXHRcdFx0ICB2YXIgdG9wWSA9IDA7XG5cdFx0XHQgIGN0eC5jbGVhclJlY3QodG9wWCwgdG9wWSwgdG9wWCArIGNhbnZhcy5ub2RlKCkud2lkdGgsIHRvcFkgKyBjYW52YXMubm9kZSgpLmhlaWdodCk7XG5cblx0XHRcdCAgY3R4LmZvbnQgPSBcIjMwcHggQXJpYWxcIjtcblx0XHRcdFx0Y3R4LnRleHRBbGlnbiA9IFwiY2VudGVyXCI7XG5cdFx0XHRcdGN0eC5maWxsVGV4dChcIlRvdG9cIiw3NTAvMiwzNSk7XG5cdFx0XHRcdGN0eC5maWxsVGV4dChcIlRvdG9cIiw3NTAvMiw3NSk7XG5cdFx0XHRcdGN0eC5maWxsVGV4dChcIlRvdG9cIiw3NTAvMiwxMTUpO1xuXHRcdFx0XHRjdHguZmlsbFRleHQoXCJUb3RvXCIsNzUwLzIsMTU1KTtcblx0XHRcdH1cblx0XHRcdC8vIGRyYXcgdGhlIGNhbnZhcyBmb3IgdGhlIGZpcnN0IHRpbWVcblx0XHRcdGRyYXdBZ2FpbigpO1xuXG4gICAgICBjYW52YXMubm9kZSgpLmFkZEV2ZW50TGlzdGVuZXIoJ21vdXNlZG93bicsIGZ1bmN0aW9uIChldnQpIHtcbiAgICAgICAgLy8gcGVybWl0cyBjb21wYXRpYmlsaXR5IHdpdGggZXZlcnkgYnJvd3NlclxuICAgICAgICBkb2N1bWVudC5ib2R5LnN0eWxlLm1velVzZXJTZWxlY3QgPSBkb2N1bWVudC5ib2R5LnN0eWxlLndlYmtpdFVzZXJTZWxlY3QgPSBkb2N1bWVudC5ib2R5LnN0eWxlLnVzZXJTZWxlY3QgPSAnbm9uZSc7XG4gICAgICAgIGxhc3RYID0gZXZ0LmNsaWVudFg7XG4gICAgICAgIGRyYWdTdGFydCA9IHtcbiAgICAgICAgICB4IDogbGFzdFgsXG4gICAgICAgICAgeSA6IGxhc3RZXG4gICAgICAgIH07XG4gICAgICAgIGRyYWdnZWQgPSBmYWxzZTtcbiAgICAgICAgbW91c2VEb3duKys7XG4gICAgICB9LGZhbHNlKTtcblxuICAgICAgY2FudmFzLm5vZGUoKS5hZGRFdmVudExpc3RlbmVyKCdtb3VzZW1vdmUnLCBmdW5jdGlvbiAoZXZ0KSB7XG4gICAgICAgIGxhc3RYID0gZXZ0LmNsaWVudFg7XG4gICAgICAgIGRyYWdnZWQgPSB0cnVlO1xuICAgICAgICBpZiAoZHJhZ1N0YXJ0ICYmIG1vdXNlRG93bil7XG4gICAgICAgICAgY3R4LnRyYW5zbGF0ZShsYXN0WC1kcmFnU3RhcnQueCwgbGFzdFktZHJhZ1N0YXJ0LnkpO1xuICAgICAgICAgIGRyYXdBZ2FpbigpO1xuICAgICAgICB9XG4gICAgICB9LGZhbHNlKTtcblxuICAgICAgY2FudmFzLm5vZGUoKS5hZGRFdmVudExpc3RlbmVyKCdtb3VzZXVwJywgZnVuY3Rpb24gKGV2dCkge1xuICAgICAgICBkcmFnU3RhcnQgPSBudWxsO1xuICAgICAgICBtb3VzZURvd24tLTtcbiAgICAgICAgaWYgKCFkcmFnZ2VkKSB6b29tKGV2dC5zaGlmdEtleSA/IC0xIDogMSApO1xuICAgICAgfSxmYWxzZSk7Ki9cblxuXHRcdFx0Lyp2YXIgYyA9IG5ldyBjYW52YXNIYW5kbGVyKGdyYXBoV2lkdGgsIGdyYXBoSGVpZ2h0KTtcblxuICAgICAgYy5pbml0KHNlbGVjdGlvbiwgZ3JhcGhXaWR0aCwgZ3JhcGhIZWlnaHQpO1xuXHRcdFx0Yy5kcmF3KCk7Ki9cblxuXHRcdFx0Lyp2YXIgbGFzdFg9Y2FudmFzLm5vZGUoKS53aWR0aC8yLCBsYXN0WT1jYW52YXMubm9kZSgpLmhlaWdodC8yO1xuXHRcdFx0dmFyIG1vdXNlRG93biA9IDA7XG5cdFx0XHR2YXIgZHJhZ2dlZDtcblx0XHRcdHZhciBkcmFnU3RhcnQgPSB7XG5cdFx0XHRcdHggOiBsYXN0WCxcblx0XHRcdFx0eSA6IGxhc3RZXG5cdFx0XHR9O1xuY29uc29sZS5sb2coJ29rJyk7Ki9cblxuICAgICAgLyp2YXIgY2FudmFzID0gZDMuc2VsZWN0KHRoaXMpLnNlbGVjdEFsbCgnY2FudmFzJyk7XG5cblx0XHRcdC8vIGV2ZW50IFwiY2xpY2tpbmdcIlxuXHRcdFx0Y2FudmFzLm5vZGUoKS5hZGRFdmVudExpc3RlbmVyKCdtb3VzZWRvd24nLCBjLm1vdXNlRG93bkhhbmRsZXIsZmFsc2UpO1xuXG4gICAgICBjYW52YXMubm9kZSgpLmFkZEV2ZW50TGlzdGVuZXIoJ21vdXNlbW92ZScsIGMubW91c2VNb3ZlSGFuZGxlcixmYWxzZSk7XG5cbiAgICAgIGNhbnZhcy5ub2RlKCkuYWRkRXZlbnRMaXN0ZW5lcignbW91c2V1cCcsIGMubW91c2VVcEhhbmRsZXIsZmFsc2UpO1xuKi9cblx0XHRcdC8vIGV2ZW50IFwibW91c2UgbW92aW5nXCJcblx0XHRcdC8vY2FudmFzLm5vZGUoKS5hZGRFdmVudExpc3RlbmVyKCdtb3VzZW1vdmUnLCBjLm1vdXNlTW92ZUhhbmRsZXIsZmFsc2UpO1xuXG5cdFx0XHQvLyBldmVudCBcInN0b3AgY2xpY2tpbmdcIlxuXHRcdFx0Ly9jYW52YXMubm9kZSgpLmFkZEV2ZW50TGlzdGVuZXIoJ21vdXNldXAnLCBjLm1vdXNlVXBIYW5kbGVyLGZhbHNlKTtcblxuXHRcdFx0Lyp2YXIgc2NhbGVGYWN0b3IgPSAxLjE7XG5cdFx0XHR2YXIgem9vbSA9IGZ1bmN0aW9uKGNsaWNrcyl7XG5cdFx0XHQgIHZhciBwdCA9IGN0eC50cmFuc2Zvcm1lZFBvaW50KGxhc3RYLGxhc3RZKTtcblx0XHRcdCAgY3R4LnRyYW5zbGF0ZShwdC54LHB0LnkpO1xuXHRcdFx0ICB2YXIgZmFjdG9yID0gTWF0aC5wb3coc2NhbGVGYWN0b3IsY2xpY2tzKTtcblx0XHRcdCAgY3R4LnNjYWxlKGZhY3RvciwxKTtcblx0XHRcdCAgY3R4LnRyYW5zbGF0ZSgtcHQueCwtcHQueSk7XG5cdFx0XHQgIGRyYXdBZ2FpbigpO1xuXHRcdFx0fVxuXG5cdFx0XHR2YXIgaGFuZGxlU2Nyb2xsID0gZnVuY3Rpb24oZXZ0KXtcblx0XHRcdCAgdmFyIGRlbHRhID0gZXZ0LndoZWVsRGVsdGEgPyBldnQud2hlZWxEZWx0YS80MCA6IGV2dC5kZXRhaWwgPyAtZXZ0LmRldGFpbCA6IDA7XG5cdFx0XHQgIGlmIChkZWx0YSkgem9vbShkZWx0YSk7XG5cdFx0XHQgIHJldHVybiBldnQucHJldmVudERlZmF1bHQoKSAmJiBmYWxzZTtcblx0XHRcdH07XG5cdFx0XHRjYW52YXMuYWRkRXZlbnRMaXN0ZW5lcignRE9NTW91c2VTY3JvbGwnLGhhbmRsZVNjcm9sbCxmYWxzZSk7XG5cdFx0XHRjYW52YXMuYWRkRXZlbnRMaXN0ZW5lcignbW91c2V3aGVlbCcsaGFuZGxlU2Nyb2xsLGZhbHNlKTtcblxuXHRcdFx0Ki9cblxuXG5cdFx0XHRkMy5zZWxlY3QodGhpcykuc2VsZWN0KCdzdmcnKS5yZW1vdmUoKTtcblxuXHRcdFx0dmFyIHN2ZyA9IGQzLnNlbGVjdCh0aGlzKVxuXHRcdFx0ICAuYXBwZW5kKCdzdmcnKVxuXHRcdFx0ICAuYXR0cignd2lkdGgnLCBjb25maWcud2lkdGgpXG5cdFx0XHQgIC5hdHRyKCdoZWlnaHQnLCBoZWlnaHQpXG5cdFx0XHQ7XG5cblx0XHRcdHZhciBncmFwaCA9IHN2Zy5hcHBlbmQoJ2cnKVxuXHRcdFx0ICAuYXR0cigndHJhbnNmb3JtJywgJ3RyYW5zbGF0ZSgwLCAyNSknKTtcblxuXHRcdFx0dmFyIHlEb21haW4gPSBbXTtcblx0XHRcdHZhciB5UmFuZ2UgPSBbXTtcblxuXHRcdFx0ZGF0YS5mb3JFYWNoKGZ1bmN0aW9uIChldmVudCwgaW5kZXgpIHtcblx0XHRcdCAgeURvbWFpbi5wdXNoKGV2ZW50Lm5hbWUpO1xuXHRcdFx0ICB5UmFuZ2UucHVzaChpbmRleCAqIDQwKTtcblx0XHRcdH0pO1xuXG5cdFx0XHR5U2NhbGUuZG9tYWluKHlEb21haW4pLnJhbmdlKHlSYW5nZSk7XG5cblx0XHRcdC8vIHRoaXMgcGFydCBpbiBjb21tZW50cyB1c2VkIHRvIGRyYXcgbGluZXMgaW4gc3ZnIG9uIHRoZSBncmFwaFxuXG5cdFx0XHQvLyB0cmFuc2xhdGlvbiBkZSA0MCBwb3VyIGxlcyBsaWduZXNcblxuXHRcdFx0dmFyIHlBeGlzRWwgPSBncmFwaC5hcHBlbmQoJ2cnKVxuXHRcdFx0ICAuY2xhc3NlZCgneS1heGlzJywgdHJ1ZSlcblx0XHRcdCAgLmF0dHIoJ3RyYW5zZm9ybScsICd0cmFuc2xhdGUoMCwgNjApJyk7XG5cblx0XHRcdHZhciB5VGljayA9IHlBeGlzRWwuYXBwZW5kKCdnJykuc2VsZWN0QWxsKCdnJykuZGF0YSh5RG9tYWluKTtcblxuXHRcdFx0Ly92YXIgeVRpY2sgPSBncmFwaC5hcHBlbmQoJ2cnKS5zZWxlY3RBbGwoJ2cnKS5kYXRhKHlEb21haW4pO1xuXG5cdFx0XHR5VGljay5lbnRlcigpXG5cdFx0XHQgIC5hcHBlbmQoJ2cnKVxuXHRcdFx0ICAuYXR0cigndHJhbnNmb3JtJywgZnVuY3Rpb24oZCkge1xuXHRcdFx0XHRyZXR1cm4gJ3RyYW5zbGF0ZSgwLCAnICsgeVNjYWxlKGQpICsgJyknO1xuXHRcdFx0ICB9KVxuXHRcdFx0ICAuYXBwZW5kKCdsaW5lJylcblx0XHRcdCAgLmNsYXNzZWQoJ3ktdGljaycsIHRydWUpXG5cdFx0XHQgIC5hdHRyKCd4MScsIGNvbmZpZy5tYXJnaW4ubGVmdClcblx0XHRcdCAgLmF0dHIoJ3gyJywgY29uZmlnLm1hcmdpbi5sZWZ0ICsgZ3JhcGhXaWR0aCk7XG5cblx0XHRcdHlUaWNrLmV4aXQoKS5yZW1vdmUoKTtcblxuXHRcdFx0dmFyIGN1cngsIGN1cnk7XG5cdFx0XHR2YXIgem9vbVJlY3QgPSBzdmdcblx0XHRcdCAgLmFwcGVuZCgncmVjdCcpXG5cdFx0XHQgIC5jYWxsKHpvb20pXG5cdFx0XHQgIC5jbGFzc2VkKCd6b29tJywgdHJ1ZSlcblx0XHRcdCAgLmF0dHIoJ3dpZHRoJywgZ3JhcGhXaWR0aClcblx0XHRcdCAgLmF0dHIoJ2hlaWdodCcsIGhlaWdodCApXG5cdFx0XHQgIC5hdHRyKCd0cmFuc2Zvcm0nLCAndHJhbnNsYXRlKCcgKyBjb25maWcubWFyZ2luLmxlZnQgKyAnLCAzNSknKVxuXHRcdFx0O1xuXG5cdFx0XHRpZiAodHlwZW9mIGNvbmZpZy5ldmVudEhvdmVyID09PSAnZnVuY3Rpb24nKSB7XG5cdFx0XHQgIHpvb21SZWN0Lm9uKCdtb3VzZW1vdmUnLCBmdW5jdGlvbihkLCBlKSB7XG5cdFx0XHRcdHZhciBldmVudCA9IGQzLmV2ZW50O1xuXHRcdFx0XHRpZiAoY3VyeCA9PSBldmVudC5jbGllbnRYICYmIGN1cnkgPT0gZXZlbnQuY2xpZW50WSkgcmV0dXJuO1xuXHRcdFx0XHRjdXJ4ID0gZXZlbnQuY2xpZW50WDtcblx0XHRcdFx0Y3VyeSA9IGV2ZW50LmNsaWVudFk7XG5cdFx0XHRcdHpvb21SZWN0LmF0dHIoJ2Rpc3BsYXknLCAnbm9uZScpO1xuXHRcdFx0XHR2YXIgZWwgPSBkb2N1bWVudC5lbGVtZW50RnJvbVBvaW50KGQzLmV2ZW50LmNsaWVudFgsIGQzLmV2ZW50LmNsaWVudFkpO1xuXHRcdFx0XHR6b29tUmVjdC5hdHRyKCdkaXNwbGF5JywgJ2Jsb2NrJyk7XG5cdFx0XHRcdGlmIChlbC50YWdOYW1lICE9PSAnY2lyY2xlJykgcmV0dXJuO1xuXHRcdFx0XHRjb25maWcuZXZlbnRIb3ZlcihlbCk7XG5cdFx0XHQgIH0pO1xuXHRcdFx0fVxuXG5cdFx0XHRpZiAodHlwZW9mIGNvbmZpZy5ldmVudENsaWNrID09PSAnZnVuY3Rpb24nKSB7XG5cdFx0XHQgIHpvb21SZWN0Lm9uKCdjbGljaycsIGZ1bmN0aW9uICgpIHtcblx0XHRcdFx0em9vbVJlY3QuYXR0cignZGlzcGxheScsICdub25lJyk7XG5cdFx0XHRcdHZhciBlbCA9IGRvY3VtZW50LmVsZW1lbnRGcm9tUG9pbnQoZDMuZXZlbnQuY2xpZW50WCwgZDMuZXZlbnQuY2xpZW50WSk7XG5cdFx0XHRcdHpvb21SZWN0LmF0dHIoJ2Rpc3BsYXknLCAnYmxvY2snKTtcblx0XHRcdFx0aWYgKGVsLnRhZ05hbWUgIT09ICdjaXJjbGUnKSByZXR1cm47XG5cdFx0XHRcdGNvbmZpZy5ldmVudENsaWNrKGVsKTtcblx0XHRcdCAgfSk7XG5cdFx0XHR9XG5cblx0XHRcdHhTY2FsZS5yYW5nZShbMCwgZ3JhcGhXaWR0aF0pLmRvbWFpbihbY29uZmlnLnN0YXJ0LCBjb25maWcuZW5kXSk7XG5cblx0XHRcdHpvb20ueCh4U2NhbGUpO1xuXG5cdFx0XHRmdW5jdGlvbiB1cGRhdGVab29tKCkge1xuXHRcdFx0ICBpZiAoZDMuZXZlbnQuc291cmNlRXZlbnQudG9TdHJpbmcoKSA9PT0gJ1tvYmplY3QgTW91c2VFdmVudF0nKSB7XG5cdFx0XHRcdHpvb20udHJhbnNsYXRlKFtkMy5ldmVudC50cmFuc2xhdGVbMF0sIDBdKTtcblx0XHRcdCAgfVxuXG5cdFx0XHQgIGlmIChkMy5ldmVudC5zb3VyY2VFdmVudC50b1N0cmluZygpID09PSAnW29iamVjdCBXaGVlbEV2ZW50XScpIHtcblx0XHRcdFx0em9vbS5zY2FsZShkMy5ldmVudC5zY2FsZSk7XG5cdFx0XHQgIH1cblxuXHRcdFx0ICByZWRyYXcoKTtcblx0XHRcdH1cblxuXHRcdFx0ZnVuY3Rpb24gcmVkcmF3RGVsaW1pdGVyKCkge1xuXHRcdFx0ICBzdmcuc2VsZWN0KCcuZGVsaW1pdGVyJykucmVtb3ZlKCk7XG5cdFx0XHQgIHZhciBkZWxpbWl0ZXJFbCA9IHN2Z1xuXHRcdFx0XHQuYXBwZW5kKCdnJylcblx0XHRcdFx0LmNsYXNzZWQoJ2RlbGltaXRlcicsIHRydWUpXG5cdFx0XHRcdC5hdHRyKCd3aWR0aCcsIGdyYXBoV2lkdGgpXG5cdFx0XHRcdC5hdHRyKCdoZWlnaHQnLCAxMClcblx0XHRcdFx0LmF0dHIoJ3RyYW5zZm9ybScsICd0cmFuc2xhdGUoJyArIGNvbmZpZy5tYXJnaW4ubGVmdCArICcsICcgKyAoY29uZmlnLm1hcmdpbi50b3AgLSA0NSkgKyAnKScpXG5cdFx0XHRcdC5jYWxsKGRlbGltaXRlcih7XG5cdFx0XHRcdCAgeFNjYWxlOiB4U2NhbGUsXG5cdFx0XHRcdCAgZGF0ZUZvcm1hdDogY29uZmlnLmxvY2FsZSA/IGNvbmZpZy5sb2NhbGUudGltZUZvcm1hdChcIiVkICVCICVZXCIpIDogZDMudGltZS5mb3JtYXQoXCIlZCAlQiAlWVwiKVxuXHRcdFx0XHR9KSlcblx0XHRcdCAgO1xuXHRcdFx0fVxuXG5cdFx0XHRmdW5jdGlvbiB6b29tRW5kKCkge1xuXHRcdFx0ICBpZiAoY29uZmlnLmV2ZW50Wm9vbSkge1xuXHRcdFx0XHRjb25maWcuZXZlbnRab29tKHhTY2FsZSk7XG5cdFx0XHQgIH1cblx0XHRcdCAgaWYgKGNvbmZpZy5oYXNEZWxpbWl0ZXIpIHtcblx0XHRcdFx0cmVkcmF3RGVsaW1pdGVyKCk7XG5cdFx0XHQgIH1cblx0XHRcdH1cblxuXHRcdFx0ZnVuY3Rpb24gZHJhd1hBeGlzKHdoZXJlKSB7XG5cblx0XHRcdCAgLy8gY29weSBjb25maWcudGlja0Zvcm1hdCBiZWNhdXNlIGQzIGZvcm1hdC5tdWx0aSBlZGl0IGl0cyBnaXZlbiB0aWNrRm9ybWF0IGRhdGFcblx0XHRcdCAgdmFyIHRpY2tGb3JtYXREYXRhID0gW107XG5cblx0XHRcdCAgY29uZmlnLnRpY2tGb3JtYXQuZm9yRWFjaChmdW5jdGlvbiAoaXRlbSkge1xuXHRcdFx0XHR2YXIgdGljayA9IGl0ZW0uc2xpY2UoMCk7XG5cdFx0XHRcdHRpY2tGb3JtYXREYXRhLnB1c2godGljayk7XG5cdFx0XHQgIH0pO1xuXG5cdFx0XHQgIHZhciB0aWNrRm9ybWF0ID0gY29uZmlnLmxvY2FsZSA/IGNvbmZpZy5sb2NhbGUudGltZUZvcm1hdC5tdWx0aSh0aWNrRm9ybWF0RGF0YSkgOiBkMy50aW1lLmZvcm1hdC5tdWx0aSh0aWNrRm9ybWF0RGF0YSk7XG5cdFx0XHQgIHZhciB4QXhpcyA9IGQzLnN2Zy5heGlzKClcblx0XHRcdFx0LnNjYWxlKHhTY2FsZSlcblx0XHRcdFx0Lm9yaWVudCh3aGVyZSlcblx0XHRcdFx0LnRpY2tGb3JtYXQodGlja0Zvcm1hdClcblx0XHRcdCAgO1xuXG5cdFx0XHQgIGlmICh0eXBlb2YgY29uZmlnLmF4aXNGb3JtYXQgPT09ICdmdW5jdGlvbicpIHtcblx0XHRcdFx0Y29uZmlnLmF4aXNGb3JtYXQoeEF4aXMpO1xuXHRcdFx0ICB9XG5cblx0XHRcdCAgdmFyIHkgPSAod2hlcmUgPT0gJ2JvdHRvbScgPyBwYXJzZUludChncmFwaEhlaWdodCkgOiAwKSArIGNvbmZpZy5tYXJnaW4udG9wIC0gNDA7XG5cblx0XHRcdCAgZ3JhcGguc2VsZWN0KCcueC1heGlzLicgKyB3aGVyZSkucmVtb3ZlKCk7XG5cdFx0XHQgIHZhciB4QXhpc0VsID0gZ3JhcGhcblx0XHRcdFx0LmFwcGVuZCgnZycpXG5cdFx0XHRcdC5jbGFzc2VkKCd4LWF4aXMnLCB0cnVlKVxuXHRcdFx0XHQuY2xhc3NlZCh3aGVyZSwgdHJ1ZSlcblx0XHRcdFx0LmF0dHIoJ3RyYW5zZm9ybScsICd0cmFuc2xhdGUoJyArIGNvbmZpZy5tYXJnaW4ubGVmdCArICcsICcgKyB5ICsgJyknKVxuXHRcdFx0XHQuY2FsbCh4QXhpcylcblx0XHRcdCAgO1xuXHRcdFx0fVxuXG5cdFx0XHRmdW5jdGlvbiByZWRyYXcoKSB7XG5cblx0XHRcdCAgdmFyIGhhc1RvcEF4aXMgPSB0eXBlb2YgY29uZmlnLmhhc1RvcEF4aXMgPT09ICdmdW5jdGlvbicgPyBjb25maWcuaGFzVG9wQXhpcyhkYXRhKSA6IGNvbmZpZy5oYXNUb3BBeGlzO1xuXHRcdFx0ICBpZiAoaGFzVG9wQXhpcykge1xuXHRcdFx0XHRkcmF3WEF4aXMoJ3RvcCcpO1xuXHRcdFx0ICB9XG5cblx0XHRcdCAgdmFyIGhhc0JvdHRvbUF4aXMgPSB0eXBlb2YgY29uZmlnLmhhc0JvdHRvbUF4aXMgPT09ICdmdW5jdGlvbicgPyBjb25maWcuaGFzQm90dG9tQXhpcyhkYXRhKSA6IGNvbmZpZy5oYXNCb3R0b21BeGlzO1xuXHRcdFx0ICBpZiAoaGFzQm90dG9tQXhpcykge1xuXHRcdFx0XHRkcmF3WEF4aXMoJ2JvdHRvbScpO1xuXHRcdFx0ICB9XG5cblx0XHRcdCAgem9vbS5zaXplKFtjb25maWcud2lkdGgsIGhlaWdodF0pO1xuXG5cdFx0XHQgIGdyYXBoLnNlbGVjdCgnLmdyYXBoLWJvZHknKS5yZW1vdmUoKTtcblx0XHRcdCAgdmFyIGdyYXBoQm9keSA9IGdyYXBoXG5cdFx0XHRcdC5hcHBlbmQoJ2cnKVxuXHRcdFx0XHQuY2xhc3NlZCgnZ3JhcGgtYm9keScsIHRydWUpXG5cdFx0XHRcdC5hdHRyKCd0cmFuc2Zvcm0nLCAndHJhbnNsYXRlKCcgKyBjb25maWcubWFyZ2luLmxlZnQgKyAnLCAnICsgKGNvbmZpZy5tYXJnaW4udG9wIC0gMTUpICsgJyknKTtcblxuXHRcdFx0ICB2YXIgbGluZXMgPSBncmFwaEJvZHkuc2VsZWN0QWxsKCdnJykuZGF0YShkYXRhKTtcblxuXHRcdFx0ICBsaW5lcy5lbnRlcigpXG5cdFx0XHRcdC5hcHBlbmQoJ2cnKVxuXHRcdFx0XHQuY2xhc3NlZCgnbGluZScsIHRydWUpXG5cdFx0XHRcdC5hdHRyKCd0cmFuc2Zvcm0nLCBmdW5jdGlvbihkKSB7XG5cdFx0XHRcdCAgcmV0dXJuICd0cmFuc2xhdGUoMCwnICsgeVNjYWxlKGQubmFtZSkgKyAnKSc7XG5cdFx0XHRcdH0pXG5cdFx0XHRcdC5zdHlsZSgnZmlsbCcsIGNvbmZpZy5ldmVudExpbmVDb2xvcilcblx0XHRcdFx0LmNhbGwoZXZlbnRMaW5lKHsgeFNjYWxlOiB4U2NhbGUsIGV2ZW50Q29sb3I6IGNvbmZpZy5ldmVudENvbG9yIH0pKVxuXHRcdFx0ICA7XG5cblx0XHRcdCAgbGluZXMuZXhpdCgpLnJlbW92ZSgpO1xuXHRcdFx0fVxuXG5cdFx0XHRyZWRyYXcoKTtcblx0XHRcdGlmIChjb25maWcuaGFzRGVsaW1pdGVyKSB7XG5cdFx0XHQgIHJlZHJhd0RlbGltaXRlcigpO1xuXHRcdFx0fVxuXHRcdFx0aWYgKGNvbmZpZy5ldmVudFpvb20pIHtcblx0XHRcdCAgY29uZmlnLmV2ZW50Wm9vbSh4U2NhbGUpO1xuXHRcdFx0fVxuXHRcdCAgfSk7XG5cdFx0fVxuXG5cdFx0Y29uZmlndXJhYmxlKGV2ZW50RHJvcEdyYXBoLCBjb25maWcpO1xuXG5cdFx0cmV0dXJuIGV2ZW50RHJvcEdyYXBoO1xuICB9O1xufTtcbiIsIlwidXNlIHN0cmljdFwiO1xuLyogZ2xvYmFsIHJlcXVpcmUsIG1vZHVsZSwgZDMgKi9cblxudmFyIGNvbmZpZ3VyYWJsZSA9IHJlcXVpcmUoJy4vdXRpbC9jb25maWd1cmFibGUnKTtcbnZhciBmaWx0ZXJEYXRhID0gcmVxdWlyZSgnLi9maWx0ZXJEYXRhJyk7XG5cbnZhciBkZWZhdWx0Q29uZmlnID0ge1xuICB4U2NhbGU6IG51bGxcbn07XG5cbm1vZHVsZS5leHBvcnRzID0gZnVuY3Rpb24gKGQzKSB7XG4gIHJldHVybiBmdW5jdGlvbiAoY29uZmlnKSB7XG5cbiAgICBjb25maWcgPSBjb25maWcgfHwge1xuICAgICAgeFNjYWxlOiBudWxsLFxuICAgICAgZXZlbnRDb2xvcjogbnVsbFxuICAgIH07XG4gICAgZm9yICh2YXIga2V5IGluIGRlZmF1bHRDb25maWcpIHtcbiAgICAgIGNvbmZpZ1trZXldID0gY29uZmlnW2tleV0gfHwgZGVmYXVsdENvbmZpZ1trZXldO1xuICAgIH1cblxuICAgIHZhciBldmVudExpbmUgPSBmdW5jdGlvbiBldmVudExpbmUoc2VsZWN0aW9uKSB7XG4gICAgICBzZWxlY3Rpb24uZWFjaChmdW5jdGlvbiAoZGF0YSkge1xuICAgICAgICBkMy5zZWxlY3QodGhpcykuc2VsZWN0QWxsKCd0ZXh0JykucmVtb3ZlKCk7XG5cbiAgICAgICAgZDMuc2VsZWN0KHRoaXMpLmFwcGVuZCgndGV4dCcpXG4gICAgICAgICAgLnRleHQoZnVuY3Rpb24oZCkge1xuICAgICAgICAgICAgdmFyIGNvdW50ID0gZmlsdGVyRGF0YShkLmRhdGVzLCBjb25maWcueFNjYWxlKS5sZW5ndGg7XG4gICAgICAgICAgICByZXR1cm4gZC5uYW1lICsgKGNvdW50ID4gMCA/ICcgKCcgKyBjb3VudCArICcpJyA6ICcnKTtcbiAgICAgICAgICB9KVxuICAgICAgICAgIC5hdHRyKCd0ZXh0LWFuY2hvcicsICdlbmQnKVxuICAgICAgICAgIC5hdHRyKCd0cmFuc2Zvcm0nLCAndHJhbnNsYXRlKC0yMCknKVxuICAgICAgICAgIC5zdHlsZSgnZmlsbCcsICdibGFjaycpXG4gICAgICAgIDtcblxuICAgICAgICAvL2QzLnNlbGVjdCh0aGlzKS5zZWxlY3RBbGwoJ2NpcmNsZScpLnJlbW92ZSgpO1xuXG4gICAgICAgIC8qdmFyIGNpcmNsZSA9IGQzLnNlbGVjdCh0aGlzKS5zZWxlY3RBbGwoJ2NpcmNsZScpXG4gICAgICAgICAgLmRhdGEoZnVuY3Rpb24oZCkge1xuICAgICAgICAgICAgLy8gZmlsdGVyIHZhbHVlIG91dHNpZGUgb2YgcmFuZ2VcbiAgICAgICAgICAgIHJldHVybiBmaWx0ZXJEYXRhKGQuZGF0ZXMsIGNvbmZpZy54U2NhbGUpO1xuICAgICAgICAgIH0pO1xuXG4gICAgICAgIGNpcmNsZS5lbnRlcigpXG4gICAgICAgICAgLmFwcGVuZCgnY2lyY2xlJylcbiAgICAgICAgICAuYXR0cignY3gnLCBmdW5jdGlvbihkKSB7XG4gICAgICAgICAgICByZXR1cm4gY29uZmlnLnhTY2FsZShkKTtcbiAgICAgICAgICB9KVxuICAgICAgICAgIC5zdHlsZSgnZmlsbCcsIGNvbmZpZy5ldmVudENvbG9yKVxuICAgICAgICAgIC5hdHRyKCdjeScsIC01KVxuICAgICAgICAgIC5hdHRyKCdyJywgMTApXG4gICAgICAgIDtcblxuICAgICAgICBjaXJjbGUuZXhpdCgpLnJlbW92ZSgpOyovXG5cbiAgICAgIH0pO1xuICAgIH07XG5cbiAgICBjb25maWd1cmFibGUoZXZlbnRMaW5lLCBjb25maWcpO1xuXG4gICAgcmV0dXJuIGV2ZW50TGluZTtcbiAgfTtcbn07XG4iLCJcInVzZSBzdHJpY3RcIjtcbi8qIGdsb2JhbCBtb2R1bGUgKi9cblxubW9kdWxlLmV4cG9ydHMgPSBmdW5jdGlvbiBmaWx0ZXJEYXRlKGRhdGEsIHNjYWxlKSB7XG4gIGRhdGEgPSBkYXRhIHx8IFtdO1xuICB2YXIgZmlsdGVyZWREYXRhID0gW107XG4gIHZhciBib3VuZGFyeSA9IHNjYWxlLnJhbmdlKCk7XG4gIHZhciBtaW4gPSBib3VuZGFyeVswXTtcbiAgdmFyIG1heCA9IGJvdW5kYXJ5WzFdO1xuICBkYXRhLmZvckVhY2goZnVuY3Rpb24gKGRhdHVtKSB7XG4gICAgdmFyIHZhbHVlID0gc2NhbGUoZGF0dW0pO1xuICAgIGlmICh2YWx1ZSA8IG1pbiB8fCB2YWx1ZSA+IG1heCkge1xuICAgICAgcmV0dXJuO1xuICAgIH1cbiAgICBmaWx0ZXJlZERhdGEucHVzaChkYXR1bSk7XG4gIH0pO1xuXG4gIHJldHVybiBmaWx0ZXJlZERhdGE7XG59O1xuIiwibW9kdWxlLmV4cG9ydHMgPSBmdW5jdGlvbiBjb25maWd1cmFibGUodGFyZ2V0RnVuY3Rpb24sIGNvbmZpZywgbGlzdGVuZXJzKSB7XG4gIGxpc3RlbmVycyA9IGxpc3RlbmVycyB8fCB7fTtcbiAgZm9yICh2YXIgaXRlbSBpbiBjb25maWcpIHtcbiAgICAoZnVuY3Rpb24oaXRlbSkge1xuICAgICAgdGFyZ2V0RnVuY3Rpb25baXRlbV0gPSBmdW5jdGlvbih2YWx1ZSkge1xuICAgICAgICBpZiAoIWFyZ3VtZW50cy5sZW5ndGgpIHJldHVybiBjb25maWdbaXRlbV07XG4gICAgICAgIGNvbmZpZ1tpdGVtXSA9IHZhbHVlO1xuICAgICAgICBpZiAobGlzdGVuZXJzLmhhc093blByb3BlcnR5KGl0ZW0pKSB7XG4gICAgICAgICAgbGlzdGVuZXJzW2l0ZW1dKHZhbHVlKTtcbiAgICAgICAgfVxuXG4gICAgICAgIHJldHVybiB0YXJnZXRGdW5jdGlvbjtcbiAgICAgIH07XG4gICAgfSkoaXRlbSk7IC8vIGZvciBkb2Vzbid0IGNyZWF0ZSBhIGNsb3N1cmUsIGZvcmNpbmcgaXRcbiAgfVxufTtcbiJdfQ==
