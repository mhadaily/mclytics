import Ember from 'ember';
import d3 from 'd3';

let dateParser = d3.time.format('%Y-%m-%d').parse;

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

  selectedMonth: null,
  selectedDepartment: null,
  targets: [],

  target: Ember.computed('targets', 'selectedDepartment', 'selectedMonth',function(){
    return this.get('targets').find((d) => {
      return d.get('department.id') == this.get('selectedDepartment.id') && dateParser(d.get('date')).toString() == this.get('selectedMonth').toString();
    });
  }),

  projection: Ember.computed('datesGroup', function() {

    let numDays = this.get('datesGroup').length,
    daysInMonth = moment(this.get('selectedMonth')).daysInMonth(),
    totalAmount = this.get('totalAmount');

    // return (totalAmount / Math.max(0, numDays - 0.5)) * daysInMonth;
    return (totalAmount / Math.max(0, numDays - 1.5)) * 30.5;

  }),

  percentToTarget: Ember.computed('target','totalAmount',function() {
    let numDays = this.get('datesGroup').length,
    daysInMonth = moment(this.get('selectedMonth')).daysInMonth(),
    target = this.get('target.amount') / daysInMonth * numDays;

    return this.get('target.amount') && this.get('totalAmount') / target;
  }),

  totalAmount: Ember.computed('entries','selectedDepartment', function() {
    this.get('departments').filter(this.get('selectedDepartment.id'));
    this.get('dates').filterAll();
    this.get('groups').filterAll();
    return this.get('entries').groupAll().reduceSum(function(d){return d.amount;}).value();
  }),

  totalCount: Ember.computed('entries','selectedDepartment', function() {
    this.get('departments').filter(this.get('selectedDepartment.id'));
    return this.get('entries').groupAll().reduceSum(function(d){return d.count;}).value();
  }),

  entries: Ember.computed('data.data', function(){
    return crossfilter(this.get('data.data'));
  }),

  dates: Ember.computed('entries', function() {
    return this.get('entries').dimension(d => {return d3.time.day(d.date);});
  }),

  months: Ember.computed('entries', function() {
    return this.get('entries').dimension(d => {return d3.time.month(d.date);});
  }),

  groups: Ember.computed('entries', function() {
    return this.get('entries').dimension(d => {return d.product.product_group || 'No Group';});
  }),

  departments: Ember.computed('entries', function() {
    return this.get('entries').dimension(d => {return d.department_id;});
  }),

  datesGroup: Ember.computed('entries', 'selectedDepartment',function() {
    this.get('departments').filter(this.get('selectedDepartment.id'));
    let runningAmount = 0, runningCount = 0;
    return Ember.copy(this.get('dates').group().reduce(add,del,init).all().map((d) => {
      d.value.runningAmount = runningAmount += d.value.amount;
      d.value.runningCount  = runningCount += d.value.count;
      return d;
    }),true);
  }),

  departmentsGroup: Ember.computed('entries',function() {
    let runningAmount = 0, runningCount = 0;
    this.get('dates').filterAll();
    this.get('departments').filterAll();
    this.get('groups').filterAll();
    return Ember.copy(this.get('departments').group().reduce(add,del,init).all().map(d => {
      this.get('departments').filter(d.key);
      d.name = this.get('store').peekRecord('department',d.key).get('name');
      d.products = Ember.copy(this.get('groups').group().reduce(add,del,init).all(),true);
      d.value.runningAmount = runningAmount += d.value.amount;
      d.value.runningCount = runningCount += d.value.count;
      return d;
    }),true);
  }),

  groupsGroup: Ember.computed('entries',function() {
    let runningAmount = 0, runningCount = 0;
    this.get('dates').filterAll();
    this.get('departments').filterAll();
    this.get('groups').filterAll();
    return Ember.copy(this.get('groups').group().reduce(add,del,init).all().map(d => {
      this.get('groups').filter(d.key);
      d.name = d.key
      d.departments = Ember.copy(this.get('departments').group().reduce(add,del,init).all().map(d=>{
        d.name = this.get('store').peekRecord('department',d.key).get('name');
        return d;
      }),true);
      d.value.runningAmount = runningAmount += d.value.amount;
      d.value.runningCount = runningCount += d.value.count;
      return d;
    }),true);
  }),

});

function add(p,v) {
  return {
    count: p.count + v.count,
    amount: p.amount + v.amount
  };
}

function del(p,v) {
  return {
    count: p.count - v.count,
    amount: p.amount - v.amount
  }
}

function init() {
  return {
    count: 0,
    amount: 0,
  }
}
