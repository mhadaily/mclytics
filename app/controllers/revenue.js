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
      monthNames.unshift('' + d.getFullYear() + ',' + d.getMonth() + ',1');
    }
    for (j; j <= 12; j++) {
      monthNames.push('2016,' + j + ',1');
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
