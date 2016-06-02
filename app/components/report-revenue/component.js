import Ember from 'ember';

export default Ember.Component.extend({

  store: Ember.inject.service(),

  ledgerAccounts: [],
  ledgerEntries: [],
  journalEntries: [],
  departments: [],

  entries: Ember.computed('journalEntries',function() {
    return crossfilter(this.journalEntries);
  }),

  entriesByDepartment: Ember.computed('entries',function() {
    return this.get('entries').dimension(function(d) { return d.department_id; });
  }),

  amountSumByDepartement: Ember.computed('entriesByDepartment',function() {
    return this.get('entriesByDepartment').group().reduceSum(function(d) { return d.amount; });
  }),

  entriesByProduct: Ember.computed('entries',function() {
    return this.get('entries').dimension(function(d) { return d.product_id; });
  }),

  amountSumByProduct: Ember.computed('entriesByProduct',function() {
    return this.get('entriesByProduct').group().reduceSum(function(d) { return d.amount; });
  }),

  entriesByDate: Ember.computed('entries',function() {
    return this.get('entries').dimension(function(d) { return new Date(d.date); });
  }),

  amountSumByDate: Ember.computed('entries',function() {
    return this.get('entriesByDate').group().reduceSum(function(d) { return d.amount; });
  }),

  totals: Ember.computed('amountSumByDepartement', function(){
    var departments = this.get('departments');

    return this.get('amountSumByDepartement').all().map(d => {
      return {name: this.get('store').peekRecord('department',d.key).get('name'),total: d.value}
    });
  }),

  totalsByDate: Ember.computed('amountSumByDate', function(){
    return this.get('amountSumByDate').all().map(function(d) {
      return {date: d.key, total: d.value}
    });
  })
});
