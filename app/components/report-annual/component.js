import Ember from 'ember';
import d3 from 'd3';
import crossfilter from 'npm:crossfilter2';
import dc from 'npm:dc';
import ResizeAware from 'ember-resize/mixins/resize-aware';


export default Ember.Component.extend(ResizeAware,{

  data: null,
  universe: null,

  didResize() {
    this.update();
  },

  historicalSelect: null,
  departmentChart: null,
  dataTAble: null,
  boxND: null,
  quantityND: null,

  init() {
    this._super(...arguments);

    this.on('didInsertElement', () => {

      function amountAccessor(d) {
        return Math.round(d.value.amount * 100) / 100;
      }

      function quantityAccessor(d) {
        return d.value.quantity;
      }

      function reduceAdd(p,v) {
        p.quantity += v.quantity;
        p.amount += v.amount;
        return p;
      }

      function reduceRem(p,v) {
        p.quantity  -= v.quantity;
        p.amount    -= v.amount;
        return p;
      }

      function reduceIni() {
        return {quantity: 0, amount: 0.0};
      }

      var currencyFmt = d3.format("$,.2f");
      var quantityFmt = d3.format(",f");
      var percentageFmt = d3.format(".2%");
      var labelFmt    = d=>{
        var percentage = d.value.amount / amountTotal.value();
        return `${d.key}: ${currencyFmt(d.value.amount)} @${percentageFmt(percentage)} (${quantityFmt(d.value.quantity)}) `;
      };

      var monthly = crossfilter(this.data);

      var dateDim             = monthly.dimension(d=>{return d3.time.month(d.date);});
      var departmentDim       = monthly.dimension(d=>{return d.department_name;});
      var statusDim           = monthly.dimension(d=>{return d.status;});
      var groupDim            = monthly.dimension(d=>{return d.product_group;});
      var yearDim             = monthly.dimension(d=>{return d.date.getFullYear();});


      var amountByDate        = dateDim.group().reduce(reduceAdd,reduceRem,reduceIni);
      var amountByDepartment  = departmentDim.group().reduce(reduceAdd,reduceRem,reduceIni);
      var amountByStatus      = statusDim.group().reduce(reduceAdd,reduceRem,reduceIni);
      var amountByGroup       = groupDim.group().reduce(reduceAdd,reduceRem,reduceIni);
      var amountByYear        = yearDim.group().reduce(reduceAdd,reduceRem,reduceIni);


      var totalByDepartment   = departmentDim.group().reduce(reduceAdd,reduceRem,reduceIni);

      var amountTotal         = monthly.groupAll().reduceSum(dc.pluck('amount'));
      var quantityTotal       = monthly.groupAll().reduceSum(dc.pluck('quantity'));

      var minDate = d3.time.month(moment(dateDim.bottom(1)[0].date).add(-1,'month').toDate());
      var maxDate = d3.time.month.ceil(dateDim.top(1)[0].date);

      this.boxND = dc.numberDisplay("#boxND")
        .formatNumber(currencyFmt)
        .valueAccessor(function(d){return Math.round(d * 100) / 100;})
        .group(amountTotal);

      this.quantityND = dc.numberDisplay("#quantityND")
        .formatNumber(d3.format(",f"))
        .valueAccessor(function(d){return d;})
        .group(quantityTotal);

      this.historicalSelect = dc.barChart('#historicalSelect')
        .margins({top: 10, right: 25, bottom: 50, left: 60})
        .centerBar(true)
        .height(100)
        .gap(4)
        .valueAccessor(amountAccessor)
        .x(d3.time.scale().domain([minDate,maxDate]))
        .xUnits(d3.time.months)
        .dimension(dateDim)
        .group(amountByDate)
        .brushOn(true)
        .elasticY(true);
      this.historicalSelect.yAxis().ticks(3);
      this.historicalSelect.xAxis().ticks(d3.time.month, 1);

      this.historicalChart = dc.compositeChart('#historicalChart')
      this.historicalChart
        .margins({top: 10, right: 50, bottom: 50, left: 60})
        .height(250)
        .valueAccessor(quantityAccessor)
        .x(d3.time.scale().domain([minDate,maxDate]))
        .xUnits(d3.time.months)
        .dimension(dateDim)
        .group(amountByDate)
        .elasticY(true)
        .brushOn(false)
        .compose([
          dc.barChart(this.historicalChart)
            .centerBar(true)
            .gap(4)
            .valueAccessor(amountAccessor)
            .group(amountByDate),
          dc.lineChart(this.historicalChart)
            .valueAccessor(quantityAccessor)
            .group(amountByDate)
            .ordinalColors(["red"])
            .useRightYAxis(true)
        ]);
      this.historicalChart.xAxis().ticks(d3.time.month, 1);

      this.departmentChart = dc.rowChart('#departmentChart')
        .margins({top: 10, right: 30, bottom: 30, left: 0})
        .height(250)
        .valueAccessor(amountAccessor)
        .label(labelFmt)
        .dimension(departmentDim)
        .group(amountByDepartment)
        .elasticX(true);
      this.departmentChart.xAxis().ticks(5);

      this.groupChart = dc.rowChart('#groupChart')
        .margins({top: 10, right: 30, bottom: 30, left: 0})
        .height(500)
        .valueAccessor(amountAccessor)
        .label(labelFmt)
        .dimension(groupDim)
        .group(amountByGroup)
        .elasticX(true);
      this.groupChart.xAxis().ticks(5);

      this.yearChart = dc.rowChart('#yearChart')
        .margins({top: 10, right: 30, bottom: 30, left: 0})
        .height(150)
        .label(labelFmt)
        .valueAccessor(amountAccessor)
        .dimension(yearDim)
        .group(amountByYear)
        .elasticX(true);
      this.yearChart.xAxis().ticks(5);

      this.statusChart = dc.rowChart('#statusChart')
        .margins({top: 10, right: 30, bottom: 30, left: 0})
        .label(labelFmt)
        .valueAccessor(amountAccessor)
        .dimension(statusDim)
        .group(amountByStatus)
        .elasticX(true);
      this.statusChart.xAxis().ticks(3);

      // this.departmentTable = dc.dataTable('#departmentTable')
      //   .dimension(totalByDepartment)
      //   .group(()=>{return 'departments';})
      //   .columns([
      //     d => { return d.key; },
      //     d => { return quantityFmt(d.value.quantity); },
      //     d => { return currencyFmt(d.value.amount); }
      //   ])
      //   .sortBy(function (d) { return d.key; })
      //   .order(d3.descending);

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
    var rect = document.getElementById('historicalSelect').parentElement.getBoundingClientRect();
    // this.historicalSelect.width(rect.width);
    this.historicalChart.width(rect.width);

    rect = document.getElementById('departmentChart').parentElement.getBoundingClientRect();
    this.departmentChart.width(rect.width);

    rect = document.getElementById('statusChart').parentElement.getBoundingClientRect();
    this.statusChart.width(rect.width);

    rect = document.getElementById('groupChart').parentElement.getBoundingClientRect();
    this.groupChart.width(rect.width);

    rect = document.getElementById('yearChart').parentElement.getBoundingClientRect();
    this.yearChart.width(rect.width);

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
