import Ember from 'ember';
import d3 from 'd3';
import numeral from 'numeral';
import ResizeAware from 'ember-resize/mixins/resize-aware';

export default Ember.Component.extend(ResizeAware, {

  // debouncedDidResize() {
  //   this.update();
  // },

  didResize() {
    this.update();
  },

  init() {
    this._super(...arguments);

    this.on('didInsertElement',function() {
      var svg = d3.select(this.element).append('svg').append('g');
      svg.append("g")
        .attr("class", "x axis");
      svg.append("g")
        .attr("class", "y axis")
        .append("text");

      svg.append('path')
        .attr("class", "line")
      svg.append('path')
        .attr("class", "area")
      svg.append('path')
        .attr("class", "target")
      this.update();

    });
  },

  update() {

    var rect    = this.element.getBoundingClientRect(),
        margin  = {top: 20, right: 20, bottom: 30, left: 60},
        width   = Math.max(0, rect.width - margin.left - margin.right),
        height  = Math.max(0, rect.height - margin.top - margin.bottom);

    var x = d3.scale.ordinal()
        .rangeRoundBands([0, width], .1);

    var y = d3.scale.linear()
        .range([height, 0]);

    var timeFormat = d3.time.format.multi([
      // [".%L",   function(d) { return d.getMilliseconds(); }],
      // [":%S",   function(d) { return d.getSeconds(); }],
      // ["%I:%M", function(d) { return d.getMinutes(); }],
      // ["%I %p", function(d) { return d.getHours(); }],
      // ["%a",    function(d) { return !d.getDay() && d.getDate() != 1; }],
      // ["%b %d", function(d) { return d.getDate() != 1; }],
      ["%d",    function(d) { return d.getDate() != 1; }],
      ["%B",    function(d) { return d.getMonth(); }],
      ["%Y",    function() { return true; }]
    ]);

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
        .x(function(d) { return x(d.date); })
        .y(function(d) { return y(d.runningTotal); });

    var area = d3.svg.area()
        .x(function(d) { return x(d.date); })
        .y0(height)
        .y1(function(d) { return y(d.runningTotal); });

    var svg = d3.select(this.element).select("svg")
        .attr("width", width + margin.left + margin.right)
        .attr("height", height + margin.top + margin.bottom)
      .select("g")
        .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

    var data = this.get('data');

      // x.domain(data.map(function(d) { return d.date; }));
      // x.domain(data.map(function(d) { return d.date; }));
      x.domain(d3.time.day.range(new Date('2016-05-31 00:00:00'), d3.time.month.ceil(new Date())));
      // y.domain([0, d3.max(data, function(d) { return d.runningTotal; })]);
      y.domain([0, 12000211.00]);

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

      svg.select('path.line')
          .datum(data)
          .attr("d", line);

      svg.select('path.area')
          .datum(data)
          .attr("d", area);

      svg.select('path.target')
          .datum([{date:new Date('2016-06-01 00:00:00'),runningTotal:0},{date:new Date('2016-06-30 00:00:00'),runningTotal:12000211.00}])
          .attr("d", line);

      var bars = svg.selectAll(".bar").data(data);
      bars.enter().append("rect")
        .attr("class", "bar");
      bars.attr("x", function(d) { return x(d.date); })
        .attr("width", x.rangeBand())
        .attr("y", function(d) { return y(d.total); })
        .attr("height", function(d) { return height - y(d.total); });
      // bars.remove();

  }

});
