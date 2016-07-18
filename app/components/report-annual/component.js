import Ember from 'ember';
import universe from 'npm:universe';
import crossfilter from 'npm:crossfilter2';
import dc from 'npm:dc';
import ResizeAware from 'ember-resize/mixins/resize-aware';


export default Ember.Component.extend(ResizeAware,{

  data: null,
  universe: null,

  didResize() {
    this.update();
  },

  monthlyChart: null,
  departmentChart: null,
  dataTAble: null,
  boxND: null,
  quantityND: null,

  init() {
    this._super(...arguments);

    this.on('didInsertElement', () => {

      function reduceAdd(p,v) {
        p.quantity += v.quantity;
        p.amount += v.amount;
        return p;
      }

      function reduceRem(p,v) {
        p.quantity -= v.quantity;
        p.amount -= v.amount;
        return p;
      }

      function reduceIni() {
        return {quantity: 0, amount: 0.0}
      }

      var currencyFmt = d3.format(",.2f");
      var quantityFmt = d3.format(",f");

      var monthly = crossfilter(this.data);

      var dateDim             = monthly.dimension(d=>{return new Date(d.date);});
      var departmentDim       = monthly.dimension(d=>{return d.department_name;});
      var statusDim           = monthly.dimension(d=>{return d.status;});
      var groupDim            = monthly.dimension(d=>{return d.product_group;});

      var amountByDate        = dateDim.group().reduceSum(dc.pluck('amount'));
      var amountByDepartment  = departmentDim.group().reduceSum(dc.pluck('amount'));
      var amountByStatus      = statusDim.group().reduceSum(dc.pluck('amount'));
      var amountByGroup       = groupDim.group().reduceSum(dc.pluck('amount'));

      var totalByDepartment   = departmentDim.group().reduce(reduceAdd,reduceRem,reduceIni);

      var amountTotal         = monthly.groupAll().reduceSum(dc.pluck('amount'));
      var quantityTotal       = monthly.groupAll().reduceSum(dc.pluck('quantity'));

      var minDate = d3.time.month(dateDim.bottom(1)[0].date);
      var maxDate = d3.time.month.ceil(dateDim.top(1)[0].date);

      this.boxND = dc.numberDisplay("#boxND")
        .formatNumber(currencyFmt)
        .valueAccessor(function(d){return Math.round(d * 100) / 100;})
        .group(amountTotal);

      this.quantityND = dc.numberDisplay("#quantityND")
        .formatNumber(d3.format(",f"))
        .valueAccessor(function(d){return d;})
        .group(quantityTotal);

      this.monthlyChart = dc.barChart('#monthlyChart')
        .margins({top: 10, right: 30, bottom: 30, left: 60})
        .centerBar(false)
        .gap(4)
        .x(d3.time.scale().domain([minDate,maxDate]))
        .xUnits(d3.time.months)
        .dimension(dateDim)
        .group(amountByDate)
        .brushOn(true)
        .elasticY(true);

      this.departmentChart = dc.rowChart('#departmentChart')
        .margins({top: 10, right: 30, bottom: 30, left: 0})
        .height(250)
        .dimension(departmentDim)
        .group(amountByDepartment)
        .elasticX(true);
      this.departmentChart.xAxis().ticks(5)

      this.groupChart = dc.rowChart('#groupChart')
        .margins({top: 10, right: 30, bottom: 30, left: 0})
        .height(500)
        .dimension(groupDim)
        .group(amountByGroup)
        .elasticX(true);
      this.groupChart.xAxis().ticks(5)

      this.statusChart = dc.rowChart('#statusChart')
        .margins({top: 10, right: 30, bottom: 30, left: 0})
        .dimension(statusDim)
        .group(amountByStatus)
        .elasticX(true);
      this.statusChart.xAxis().ticks(3)

      this.departmentTable = dc.dataTable('#departmentTable')
        .dimension(totalByDepartment)
        .group(d=>{return 'departments'})
        .columns([
          d => { return d.key; },
          d => { return quantityFmt(d.value.quantity); },
          d => { return currencyFmt(d.value.amount); }
        ])
        .sortBy(function (d) { return d.key })
        .order(d3.descending)

      // this.dataTable = dc.dataTable('#dataTable')
      //   .dimension(dateDim)
      //   .group(d => {return d3.time.month(d.date);})
      //   .columns([
      //     d => {return d.date;},
      //     d => {return d.department_name;},
      //     d => {return d.product_group;},
      //     d => {return d.amount;},
      //   ])
      //

      this.update();

    });

  },

  update() {
    var rect = document.getElementById('monthlyChart').parentElement.getBoundingClientRect();
    this.monthlyChart.width(rect.width)

    rect = document.getElementById('departmentChart').parentElement.getBoundingClientRect();
    this.departmentChart.width(rect.width)

    rect = document.getElementById('statusChart').parentElement.getBoundingClientRect();
    this.statusChart.width(rect.width)

    rect = document.getElementById('groupChart').parentElement.getBoundingClientRect();
    this.groupChart.width(rect.width)

    dc.renderAll();
  },

  actions: {
    reset(chart) {
      if(chart) {
        this.get(chart).filter(null).redrawGroup();
      } else {
        this.monthly.filterAll();
      }
    }
  }

});
