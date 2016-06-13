import Ember from 'ember';
import d3 from 'd3';

let dateParser = d3.time.format('%Y-%m-%d').parse;

export default Ember.Controller.extend({
  queryParams: ['date', 'department'],
  date: null,
  department: null,
  months: [
    new Date('2016-01-01 00:00:00'),
    new Date('2016-02-01 00:00:00'),
    new Date('2016-03-01 00:00:00'),
    new Date('2016-04-01 00:00:00'),
    new Date('2016-05-01 00:00:00'),
    new Date('2016-06-01 00:00:00'),
  ],
  selectedMonth: Ember.computed('date',function(){
    return this.get('date') && dateParser(this.get('date')) || d3.time.month(new Date());
  }),
  selectedDepartment: Ember.computed('department',function() {
    return this.store.peekRecord('department',this.get('department'));
  })
});
