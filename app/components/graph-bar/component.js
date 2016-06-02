import Ember from 'ember';
import d3 from 'd3';
import numeral from 'numeral';
import ResizeAware from 'ember-resize/mixins/resize-aware';

export default Ember.Component.extend(ResizeAware, {
  debouncedDidResize() {
    // this.update();
  },

  init() {
    this._super(...arguments);

    this.on('didInsertElement',function() {

      this.update();

    });
  },

  update() {

    var rect    = this.element.getBoundingClientRect(),
        margin  = {top: 20, right: 20, bottom: 30, left: 40},
        width   = Math.max(0, rect.width - margin.left - margin.right),
        height  = Math.max(0, rect.height - margin.top - margin.bottom);

    var x = d3.scale.ordinal()
        .rangeRoundBands([0, width], .1);

    var y = d3.scale.linear()
        .range([height, 0]);

    var timeFormat = d3.time.format.multi([
      [".%L",   function(d) { return d.getMilliseconds(); }],
      [":%S",   function(d) { return d.getSeconds(); }],
      ["%I:%M", function(d) { return d.getMinutes(); }],
      ["%I %p", function(d) { return d.getHours(); }],
      // ["%a %d", function(d) { return d.getDay() && d.getDate() != 1; }],
      // ["%b %d", function(d) { return d.getDate() != 1; }],
      ["%d", function(d) { return d.getDate() != 1; }],
      ["%B",    function(d) { return d.getMonth(); }],
      ["%Y",    function() { return true; }]
    ]);

    var xAxis = d3.svg.axis()
        .scale(x)
        .orient("bottom")
        .ticks(10)
        .tickFormat(timeFormat);

    var yAxis = d3.svg.axis()
        .scale(y)
        .orient("left")
        .ticks(10, "$")
        .tickFormat(function(d){return numeral(d).format('0a');});

    var svg = d3.select(this.element).append("svg")
        .attr("width", width + margin.left + margin.right)
        .attr("height", height + margin.top + margin.bottom)
      .append("g")
        .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

    var data = this.get('data');

      x.domain(data.map(function(d) { return d.date; }));
      y.domain([0, d3.max(data, function(d) { return d.total; })]);

      svg.append("g")
          .attr("class", "x axis")
          .attr("transform", "translate(0," + height + ")")
          .call(xAxis);

      svg.append("g")
          .attr("class", "y axis")
          .call(yAxis)
        .append("text")
          .attr("transform", "rotate(-90)")
          .attr("y", 6)
          .attr("dy", ".71em")
          .style("text-anchor", "end")
          .text("Revenue");

      svg.selectAll(".bar")
          .data(data)
        .enter().append("rect")
          .attr("class", "bar")
          .attr("x", function(d) { return x(d.date); })
          .attr("width", x.rangeBand())
          .attr("y", function(d) { return y(d.total); })
          .attr("height", function(d) { return height - y(d.total); });  }

});
