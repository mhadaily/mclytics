import Ember from 'ember';
import d3 from 'd3';
import universe from 'npm:universe';

let dateParser = d3.time.format('%Y-%m-%d').parse;
export default Ember.Controller.extend({

  queryParams: ['date', 'department'],
  date: null,
  department: null,
  // months: listMonths,
  selectedMonth: Ember.computed('date', function () {
    return this.get('date') && dateParser(this.get('date')) || d3.time.month(new Date());
  }),
  selectedDepartment: Ember.computed('department', function () {
    return this.store.peekRecord('department', this.get('department'));
  }),
  months: Ember.computed(function () {
    let monthNames = [];
    let d;
    let i = 1;
    let j = 1;
    let today = new Date();
    let todayMonth = today.getMonth();
    for (i; i <= todayMonth + 1; i++) {
      d = new Date(today.getFullYear(), i, 1);
      let mon = d.getMonth();
      mon < 10 ? mon = '0' + mon : mon;
      monthNames.unshift('' + d.getFullYear() + '-' + mon + '-01');
    }
    for (j; j <= 12; j++) {
      let k = j;
      k < 10 ? k = '0' + k : k;
      monthNames.push('2016-' + k + '-01');
    }
    return monthNames;
  }).volatile(),
  getUniverse() {
    return universe(this.model.monthlyData)
      .then(function (myUniverse) {
        // And now you're ready to query! :)
        return myUniverse;
      });
  }
});
