import Ember from 'ember';
import d3 from 'd3';

var amount = function(d) { return d.amount; };

export default Ember.Component.extend({

  store: Ember.inject.service(),

  data: [],
  departments: [],
  productss: [],
  targets: [],

  entries: Ember.computed('data',function() {

    return crossfilter(this.get('data'));
  }),

  departmentDimension: Ember.computed('entries',function() {
    return this.get('entries').dimension(function(d) { return d.department_id; });
  }),

  productDimension: Ember.computed('entries',function() {
    return this.get('entries').dimension(function(d) { return d.product_id; });
  }),

  dateDimension: Ember.computed('entries',function() {
    var format = d3.time.format("%Y-%m-%d");
    return this.get('entries').dimension(function(d) { return format.parse(d.date); });
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

  totalsByDate: Ember.computed('amountSumByDate', function(){

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

  total: Ember.computed('entries', function() {
   return this.get('data').reduce(function(a,b){return {amount: Number(a.amount) + Number(b.amount)};}).amount;
  })

});
