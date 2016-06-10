import Ember from 'ember';
import d3 from 'd3';

var amount = function(d) { return d.amount; };

function leastSquares(xSeries,ySeries) {

  var reduceSumFunc = function(prev, cur) { return prev + cur; };

  var xBar = xSeries.reduce(reduceSumFunc,0) * 1.0 / xSeries.length;
  var yBar = ySeries.reduce(reduceSumFunc,0) * 1.0 / ySeries.length;

  var ssXX = xSeries.map(function(d) { return Math.pow(d - xBar, 2); })
    .reduce(reduceSumFunc,0);

  var ssYY = ySeries.map(function(d) { return Math.pow(d - yBar, 2); })
    .reduce(reduceSumFunc,0);

  var ssXY = xSeries.map(function(d, i) { return (d - xBar) * (ySeries[i] - yBar); })
    .reduce(reduceSumFunc,0);

  var slope = ssXY / ssXX;
  var intercept = yBar - (xBar * slope);
  var rSquare = Math.pow(ssXY, 2) / (ssXX * ssYY);

  return [slope, intercept, rSquare];
}

export default Ember.Component.extend({

  store: Ember.inject.service(),

  data: [],
  departments: [],
  productss: [],
  targets: [],

  selectedYear: 2016,
  selectedDepartment: null,
  selectedMonth: d3.time.month(new Date()),

  entries: Ember.computed('data',function() {
    return crossfilter(this.get('data'));
  }),

  filter() {
    if(this.get('selectedDepartment')) {
      this.get('departmentDimension').filter(this.get('selectedDepartment.key'));
    } else {
      this.get('departmentDimension').filterAll();
    }

    if(this.get('selectedMonth')) {
      this.get('monthDimension').filter(this.get('selectedMonth.key'));
    } else {
      this.get('monthDimension').filterAll();
    }

    this.get('dateDimension').filterAll();
    this.get('productDimension').filterAll();
  },

  projection: Ember.computed('totalsByDate', 'selectedDepartment', 'selectedMonth', function() {

    this.filter();

    var xSeries = d3.range(1,this.get('totalsByDate').length),
      ySeries = this.get('totalsByDate').slice(0,-1).map(function(d) {return d.runningTotal;}),
      leastSquaresCoeff = leastSquares(xSeries,ySeries);

    return leastSquaresCoeff[0] * 30 + leastSquaresCoeff[1]
  }),

  target: Ember.computed('data', function() {
    let targets = {}

    targets[new Date('2016-06-01 00:00:00')] = {
      "null": 12000211.00
    }

    return 12000211.00
  }),

  total: Ember.computed('entries', 'selectedDepartment', 'selectedMonth', function() {

    this.filter();

    return this.get('entries').groupAll().reduceSum(function(d){return d.amount;}).value();
  //  return this.get('data').reduce(function(a,b){return {amount: Number(a.amount) + Number(b.amount)};}).amount;
  }),

  actions: {
    selectDepartment(department) {
      this.set('selectedDepartment', department)
    }
  },

  departmentDimension: Ember.computed('entries', function() {
    return this.get('entries').dimension(function(d) { return d.department_id; });
  }),

  productDimension: Ember.computed('entries',function() {
    return this.get('entries').dimension(function(d) { return d.product_id; });
  }),

  dateDimension: Ember.computed('entries',function() {
    return this.get('entries').dimension(function(d) { return d.date; });
  }),

  monthDimension: Ember.computed('entries',function() {
    return this.get('entries').dimension(function(d) { return d.date; });
  }),

  groupDimension: Ember.computed('entries',function() {
    return this.get('entries').dimension(function(d) { return d.product.product_group ? d.product.product_group : 'no group' });
  }),

  departmentGroup: Ember.computed('entries', function() {
    return this.get('departmentDimension').group().all().map(d => {
      d.name = this.get('store').peekRecord('department',d.key).get('name');
      return d;
    });
  }),

  amountSumByDepartement: Ember.computed('departmentDimension',function() {
    return this.get('departmentDimension').group().reduceSum(function(d) { return d.amount; });
  }),

  amountSumByProduct: Ember.computed('productDimension',function() {
    return this.get('productDimension').group().reduceSum(function(d) { return d.amount; });
  }),

  amountSumByDate: Ember.computed('data',function() {
    return this.get('dateDimension').group().reduceSum(function(d) { return d.amount; });
  }),

  totalsByDepartment: Ember.computed('amountSumByDepartement', function(){
    var departments = this.get('departments');

    return this.get('amountSumByDepartement').all().map(d => {
      this.get('dateDimension').filterAll();
      this.get('departmentDimension').filter(d.key);

      var products = this.get('groupDimension').group().reduceSum(d => {return d.amount; }).all().map(d => {
        return {
          name: d.key,
          total: d.value
        }
      });

      return {
        name: this.get('store').peekRecord('department',d.key).get('name'),
        total: d.value,
        products: products
      };
    });
  }),

  totalsByDate: Ember.computed('entries', function(){

    this.get('departmentDimension').filterAll();
    this.get('productDimension').filterAll();

    return this.get('dateDimension').group().all().map(d => {

      this.get('dateDimension').filter(d.key);
      var total = this.get('entries').groupAll().reduceSum(function(d){return d.amount}).value();
      this.get('dateDimension').filterRange([d3.time.month(d.key),d.key]);
      var runningTotal = total + this.get('entries').groupAll().reduceSum(function(d){return d.amount}).value();

      return {
        date: d.key,
        count: d.value,
        total: total,
        runningTotal: runningTotal
      }
    });
  }),

});
