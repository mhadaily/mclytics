import Ember from 'ember';
import crossfilter from 'npm:crossfilter2';
import dc from 'npm:dc';
import d3 from 'd3';

function reduceAdd(p,v) {
  p.quantity += v.quantity;
  p.amount   += v.amount;
  p.count   += v.count;
  return p;
}
function reduceRem(p,v) {
  p.quantity  -= v.quantity;
  p.amount    -= v.amount;
  p.count    -= v.count;
  return p;
}
function reduceIni() { return {count: 0,quantity: 0, amount: 0.0}; }

function amountAccessor(d) { return Math.round(d.value.amount * 100) / 100; }
function quantityAccessor(d) { return d.value.quantity; }
function countAccessor(d) { return d.value.count; }

var currencyFmt = d3.format("$,.2f");
var quantityFmt = d3.format(",f");
var countFmt = d3.format(",f");
var percentageFmt = d3.format(".2%");

export default Ember.Component.extend({

  data: null,
  crossfilter: null,

  amountND: null,
  countND: null,
  quantityND: null,

  l1CoachGroup: null,
  totalByGroup: null,

  init() {
    this._super(...arguments);

    this.crossfilter = crossfilter(this.data);

    var total       = this.crossfilter.groupAll().reduce(reduceAdd,reduceRem,reduceIni);
    var monthDim    = this.crossfilter.dimension(d=>{return d3.time.month(d.date);});
    var dateMlrDim  = this.crossfilter.dimension(d=>{return d3.time.month(d.date_mlr);});
    var l1CoachDim  = this.crossfilter.dimension(d=>{return d.l1_coach || 'no coach';});
    var groupDim    = this.crossfilter.dimension(d=>{return d.product_group || 'no group';});

    this.monthGroup   = monthDim.group().reduce(reduceAdd,reduceRem,reduceIni);
    this.l1CoachGroup = l1CoachDim.group().reduce(reduceAdd,reduceRem,reduceIni);
    this.totalByGroup   = groupDim.group().reduce(reduceAdd,reduceRem,reduceIni);

    this.on('didInsertElement',function() {


      this.amountND = dc.numberDisplay("#amountND")
        .formatNumber(currencyFmt)
        .valueAccessor(d=>{return d.amount;})
        .group(total);

      this.countND = dc.numberDisplay("#countND")
        .formatNumber(countFmt)
        .valueAccessor(d=>{return d.count;})
        .group(total);

      this.monthChart = dc.barChart('#monthChart')
        .valueAccessor(amountAccessor)
        .x(d3.time.scale().domain([monthDim.bottom(1)[0].date,monthDim.top(1)[0].date]))
        .xUnits(d3.time.months)
        .dimension(monthDim)
        .group(this.monthGroup);

      this.coachChart = dc.rowChart('#coachChart')
        .height(800)
        .elasticX(true)
        .valueAccessor(amountAccessor)
        .dimension(l1CoachDim)
        .group(this.l1CoachGroup);
      this.coachChart.xAxis().ticks(5);


      this.coachPieChart = dc.pieChart('#coachPieChart')
        .height(700)
        .innerRadius(10)
        .legend(dc.legend().x(0).y(0).gap(5).autoItemWidth(true))
        .dimension(l1CoachDim)
        .valueAccessor(amountAccessor)
        .group(this.l1CoachGroup);
      this.coachPieChart;

      this.groupChart = dc.rowChart('#groupChart')
        .height(100)
        .valueAccessor(amountAccessor)
        .dimension(groupDim)
        .group(this.totalByGroup);
      this.groupChart.xAxis().ticks(5);


      this.update();

    });

  },

  update() {
    var rect = document.getElementById('groupChart').parentElement.getBoundingClientRect();
    this.groupChart.width(rect.width);

    rect = document.getElementById('coachChart').parentElement.getBoundingClientRect();
    this.coachChart.width(rect.width);

    rect = document.getElementById('monthChart').parentElement.getBoundingClientRect();
    this.monthChart.width(rect.width);

    rect = document.getElementById('coachPieChart').parentElement.getBoundingClientRect();
    this.coachPieChart.width(rect.width);



    // rect = document.getElementById('yearChart').parentElement.getBoundingClientRect();
    // this.yearChart.width(rect.width);
    //
    dc.renderAll();
  },

  actions: {

    masterReset(){
        dc.filterAll();
        dc.renderAll();
    },

    reset(chart) {
      chart ? this.get(chart).filter(null).redrawGroup() : this.monthly.filterAll();
    }
  }

});
