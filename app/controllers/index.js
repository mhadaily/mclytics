import Ember from 'ember';
import d3 from 'd3';

export default Ember.Controller.extend({
  queryParams: ['date','department_id'],
  date: null,
  department_id: null,
  department: Ember.computed('department_id', function() {
    return this.get('department_id') && this.store.find('department', this.get('department_id'));
  }),
  selectedMonth: Ember.computed('date',function() {
    if(this.get('date')) {
      return d3.time.format("%Y-%m-%d").parse(this.get('date'));
    } else {
      return d3.time.month(new Date());
    }
  }),
  months: [
    new Date('2016-01-01 00:00:00'),
    new Date('2016-02-01 00:00:00'),
    new Date('2016-03-01 00:00:00'),
    new Date('2016-04-01 00:00:00'),
    new Date('2016-05-01 00:00:00'),
    new Date('2016-06-01 00:00:00'),
  ]
});
