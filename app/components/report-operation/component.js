import Ember from 'ember';
import d3 from 'd3';
import crossfilter from 'npm:crossfilter2';
import dc from 'npm:dc';
import ResizeAware from 'ember-resize/mixins/resize-aware';
import moment from 'moment';


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

      function amountAccessor(d) {
        return Math.round(d.value.amount * 100) / 100;
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

      function reduceChannelAdd(p,v) {
        p[v.department_name] = p[v.department_name] || {};
        p[v.department_name].quantity  = (p[v.department_name].quantity || 0) + v.quantity;
        p[v.department_name].amount    = (p[v.department_name].amount || 0.0) + v.amount;
        return p;
      }

      function reduceChannelRem(p,v) {
        p[v.department_name] = p[v.department_name] || {};
        p[v.department_name].quantity  = (p[v.department_name].quantity || 0) - v.quantity;
        p[v.department_name].amount    = (p[v.department_name].amount || 0.0) - v.amount;
        return p;
      }

      function reduceChannelIni() {
        return {};
      }

      var currencyFmt = d3.format("$,.2f");
      var quantityFmt = d3.format(",f");
      var percentageFmt = d3.format(".2%");
      var labelFmt    = d=>{
        var percentage = d.value.amount / amountTotal.value();
        return `${d.key}: ${currencyFmt(d.value.amount)} @${percentageFmt(percentage)} (${quantityFmt(d.value.quantity)}) `;
      };

      var monthly = crossfilter(this.data);

      var dateDim             = monthly.dimension(d=>{return d3.time.day(d.date);});
      var departmentDim       = monthly.dimension(d=>{return d.department_name;});
      var statusDim           = monthly.dimension(d=>{return d.status;});
      var groupDim            = monthly.dimension(d=>{return d.product_group;});
      var yearDim             = monthly.dimension(d=>{return d.date.getFullYear();});


      var amountByDate        = dateDim.group().reduce(reduceChannelAdd,reduceChannelRem,reduceChannelIni);
      var amountByDepartment  = departmentDim.group().reduce(reduceAdd,reduceRem,reduceIni);
      var amountByStatus      = statusDim.group().reduce(reduceAdd,reduceRem,reduceIni);
      var amountByGroup       = groupDim.group().reduce(reduceAdd,reduceRem,reduceIni);
      var amountByYear        = yearDim.group().reduce(reduceAdd,reduceRem,reduceIni);


      var totalByDepartment   = departmentDim.group().reduce(reduceAdd,reduceRem,reduceIni);

      var amountTotal         = monthly.groupAll().reduceSum(dc.pluck('amount'));
      var quantityTotal       = monthly.groupAll().reduceSum(dc.pluck('quantity'));

      var minDate = d3.time.day(moment(dateDim.bottom(1)[0].date).add(-1,'day').toDate());
      var maxDate = d3.time.month.ceil(dateDim.top(1)[0].date);

      this.boxND = dc.numberDisplay("#boxND")
        .formatNumber(currencyFmt)
        .valueAccessor(function(d){return Math.round(d * 100) / 100;})
        .group(amountTotal);

      this.quantityND = dc.numberDisplay("#quantityND")
        .formatNumber(d3.format(",f"))
        .valueAccessor(d=>{return d;})
        .group(quantityTotal);

      this.projectionND = dc.numberDisplay("#projectionND")
        .formatNumber(d3.format(",f"))
        .valueAccessor(d=>{return d;})
        .group(amountTotal);

      this.monthlyChart = dc.barChart('#monthlyChart')
        .margins({top: 40, right: 30, bottom: 40, left: 60})
        .centerBar(false)
        .valueAccessor(d=>{return d;})
        .gap(4)
        .x(d3.time.scale().domain([minDate,maxDate]))
        .xUnits(d3.time.days)
        .dimension(dateDim)
        .centerBar(true)
        .legend(dc.legend().x(15).y(10).gap(15).autoItemWidth(true).horizontal(true))
        .group(amountByDate,'Corporate',d=>{return d.value['Corporate'] && d.value['Corporate'].amount;})
        .stack(amountByDate,'DIV 2',d=>{return d.value['DIV 2'] && d.value['DIV 2'].amount;})
        .stack(amountByDate,'Dev',d=>{return d.value['Dev'] && d.value['Dev'].amount;})
        .stack(amountByDate,'EVENT',d=>{return d.value['EVENT'] && d.value['EVENT'].amount;})
        .stack(amountByDate,'Not Tagged',d=>{return d.value['Not Tagged'] && d.value['Not Tagged'].amount;})
        .stack(amountByDate,'TTI',d=>{return d.value['TTI'] && d.value['TTI'].amount;})
        .stack(amountByDate,'Traffic',d=>{return d.value['Traffic'] && d.value['Traffic'].amount;})
        .title(function(d) {
          return `${d3.time.format('%Y-%m-%d')(d.key)} ${this.layer} ${d.value[this.layer] && d.value[this.layer].amount} (${d.value[this.layer] && d.value[this.layer].quantity})`;
        })
        .brushOn(true)
        .elasticY(true);
      this.monthlyChart.xAxis().ticks(d3.time.day, 1);

      this.monthlyLineChart = dc.lineChart('#monthlyLineChart')
        .height(480)
        .x(d3.time.scale().domain([minDate,maxDate]))
        .margins({left: 50, top: 50, right: 10, bottom: 60})
        .renderArea(true)
        .brushOn(false)
        .renderDataPoints(true)
        .clipPadding(10)
        .dimension(dateDim)
        .legend(dc.legend().x(15).y(10).gap(15).autoItemWidth(true).horizontal(true))
        .group(amountByDate,'Corporate',d=>{return d.value['Corporate'] && d.value['Corporate'].amount;})
        .stack(amountByDate,'DIV 2',d=>{return d.value['DIV 2'] && d.value['DIV 2'].amount;})
        .stack(amountByDate,'EVENT',d=>{return d.value['EVENT'] && d.value['EVENT'].amount;})
        .stack(amountByDate,'Not Tagged',d=>{return d.value['Not Tagged'] && d.value['Not Tagged'].amount;})
        .stack(amountByDate,'TTI',d=>{return d.value['TTI'] && d.value['TTI'].amount;})
        .stack(amountByDate,'Traffic',d=>{return d.value['Traffic'] && d.value['Traffic'].amount;})
        .stack(amountByDate,'Dev',d=>{return d.value['Dev'] && d.value['Dev'].amount;})
        .title(function(d) {
          return `${d3.time.format('%Y-%m-%d')(d.key)} ${this.layer} ${d.value[this.layer] && d.value[this.layer].amount} (${d.value[this.layer] && d.value[this.layer].quantity})`;
        })
        .brushOn(true)
        .elasticY(true);
      this.monthlyLineChart;


      this.departmentChart = dc.rowChart('#departmentChart')
        .margins({top: 10, right: 30, bottom: 30, left: 10})
        .height(250)
        .valueAccessor(amountAccessor)
        .label(labelFmt)
        .dimension(departmentDim)
        .group(amountByDepartment)
        .elasticX(true);
      this.departmentChart.xAxis().ticks(5);

     this.departmentPieChart = dc.pieChart('#departmentPieChart')
        .width(168)
        .height(180)
        .innerRadius(10)
        .legend(dc.legend().x(0).y(0).gap(5).autoItemWidth(true))
        .dimension(departmentDim)
        .valueAccessor(amountAccessor)
        .group(amountByDepartment)
        .ordinalColors(['#a65628','#4daf4a','#984ea3','#ff7f00','#e41a1c','#377eb8','#ffff33']);
      this.departmentPieChart;

      this.groupChart = dc.rowChart('#groupChart')
        .margins({top: 10, right: 30, bottom: 30, left: 10})
        .height(500)
        .valueAccessor(amountAccessor)
        .label(labelFmt)
        .dimension(groupDim)
        .group(amountByGroup)
        .elasticX(true);
      this.groupChart.xAxis().ticks(5);

      this.statusChart = dc.rowChart('#statusChart')
        .margins({top: 10, right: 30, bottom: 30, left: 10})
        .label(labelFmt)
        .valueAccessor(amountAccessor)
        .dimension(statusDim)
        .group(amountByStatus)
        .elasticX(true);
      this.statusChart.xAxis().ticks(3);


       this.statusPieChart = dc.pieChart('#statusPieChart')
        .width(168)
        .height(180)
        .innerRadius(10)
        .legend(dc.legend().x(0).y(0).gap(5).autoItemWidth(true))
        .dimension(statusDim)
        .valueAccessor(amountAccessor)
        .group(amountByStatus)
        .ordinalColors(['#e41a1c','#377eb8','#4daf4a','#984ea3','#ff7f00','#ffff33','#a65628']);
      this.statusPieChart;




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
      //
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
    this.monthlyChart.width(rect.width);

    rect = document.getElementById('departmentChart').parentElement.getBoundingClientRect();
    this.departmentChart.width(rect.width);

    rect = document.getElementById('statusChart').parentElement.getBoundingClientRect();
    this.statusChart.width(rect.width);

    rect = document.getElementById('groupChart').parentElement.getBoundingClientRect();
    this.groupChart.width(rect.width);

   rect = document.getElementById('departmentPieChart').parentElement.getBoundingClientRect();
    this.departmentPieChart.width(rect.width);

   rect = document.getElementById('statusPieChart').parentElement.getBoundingClientRect();
    this.statusPieChart.width(rect.width);

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
