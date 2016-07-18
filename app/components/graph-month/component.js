import Ember from 'ember';
import d3 from 'd3';
import ResizeAware from 'ember-resize/mixins/resize-aware';
import numeral from 'numeral';

var timeFormat = d3.time.format.multi([
  // [".%L",   function(d) { return d.getMilliseconds(); }],
  // [":%S",   function(d) { return d.getSeconds(); }],
  // ["%I:%M", function(d) { return d.getMinutes(); }],
  // ["%I %p", function(d) { return d.getHours(); }],
  ["%a", function(d) { return !d.getDay() && d.getDate() !== 1; }],
  // ["%b %d", function(d) { return d.getDate() != 1; }],
  ["%d", function(d) { return d.getDate() !== 1; }],
  ["%B", function(d) { return d.getMonth(); }],
  ["%Y", function() { return true; }]
]);

var tip = d3.tip()
  .attr('class', 'd3-tip')
  .html(function(d) { return d; });

export default Ember.Component.extend(ResizeAware, {
  didResize() {
    this.update();
  },

  init() {
    this._super(...arguments);

    this.on('didInsertElement',()=>{

      var tip = d3.tip()
        .attr('class', 'd3-tip')
        .html(function(d) { return numeral(d.value.runningAmount).format('0,0.00'); });

      var svg = d3.select(this.element).append('svg').append('g');
      svg.append("g")
        .attr("class", "x axis");
      svg.append("g")
        .attr("class", "y axis")
        .append("text");

      svg.append('path')
        .attr("class", "line");

      svg.append('path')
        .attr("class", "area");
      svg.append('path')
        .attr("class", "target");
      svg.append('text')
        .attr("class", "target")
        .attr("text-anchor", "end");

      svg.call(tip);

      this.update = function() {

          var rect = this.element.getBoundingClientRect(),
            margin = { top: 20, right: 20, bottom: 30, left: 60 },
            width = Math.max(0, rect.width - margin.left - margin.right),
            height = Math.max(0, rect.height - margin.top - margin.bottom);

          var x = d3.scale.ordinal()
            .rangeRoundBands([0, width], 0.1);

          var y = d3.scale.linear()
            .range([height, 0]);

          var xAxis = d3.svg.axis()
              .scale(x)
              .orient("bottom")
              .tickFormat(timeFormat);

          var yAxis = d3.svg.axis()
              .scale(y)
              .orient("left")
              .ticks(5, "$")
              .tickFormat(function(d){return numeral(d).format('0.0a');});

          var line = d3.svg.line()
              .x(function(d) { return x(d.key) + x.rangeBand() / 2; })
              .y(function(d) { return y(d.value); });

          var area = d3.svg.area()
              .x(function(d) { return x(d.key) + x.rangeBand() / 2; })
              .y0(height)
              .y1(function(d) { return y(d.value); });

          var svg = d3.select(this.element).select("svg")
              .attr("width", width + margin.left + margin.right)
              .attr("height", height + margin.top + margin.bottom)
            .select("g")
              .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

          var data = this.get('data');

          var xRange = this.get('range');
          // x.domain(data.map(function(d) { return d.date; }));
          // x.domain(data.map(function(d) { return d.date; }));
          x.domain(xRange);
          // y.domain([0, d3.max(data, function(d) { return d.runningTotal; })]);
          // y.domain([0, d3.max(data, function(d) { return d.value.amount; })]);
          y.domain([0, 12000000]);
          // y.domain([0, this.get('target')]);

          svg.select("g.x.axis")
              .attr("transform", "translate(0," + height + ")")
              .call(xAxis);

          svg.select('g.y.axis')
              .call(yAxis)
            .select("text")
              .attr("transform", "rotate(-90)")
              .attr("y", 6)
              .attr("dy", ".71em")
              .style("text-anchor", "end")
              .text("Revenue");


          svg.select('path.target')
                .datum([{key: xRange[0],value: 0},{key: xRange[xRange.length - 1], value: this.get('target') || 0}])
              .transition().duration(200).ease("quad")
                .attr("d", line);
          svg.select('path.area')
              .datum([{key: xRange[0],value: 0},{key: xRange[xRange.length - 1], value: this.get('target') || 0}])
            .transition().duration(200).ease("quad")
              .attr("d", area);
          svg.select('text.target')
            .transition().duration(200).ease("quad")
              .attr('x', x(xRange[xRange.length - 1]))
              .attr('y', y(this.get('target')) || 0)
              .text(this.get('target') ? 'Target ' + numeral(this.get('target')).format('0,0.00') : 'Target N/A');

          var bars = svg.selectAll(".bar").data(data);

          bars.enter().append("rect")
              .attr("class", "bar")
              .on('mouseover', tip.show)
              .on('mouseout', tip.hide);

          bars
              .transition().duration(200).ease("quad")
                .attr("x", function(d) { return x(d.key); })
                .attr("width", x.rangeBand())
                .attr("y", function(d) { return y(d.value.runningAmount); })
                .attr("height", function(d) { return height - y(d.value.runningAmount); });

          bars.exit().remove();
        };

        this.update();

    });

  },

  target: null,
  targetDaily: Ember.computed('target', 'range', function() {
    return this.get('target') /  this.get('range').length;
  }),

  range: Ember.computed('data', 'selectedDepartment', 'selectedMonth', function() {
    var data = this.get('data');
    return d3.time.day.range(
      d3.min(data, function(d) { return d.key; }),
      d3.time.month.ceil(d3.max(data, function(d) { return d.key; }))
    );
  }),

  dataChanged: Ember.observer('data',function() {
    this.update();
  }),

});
