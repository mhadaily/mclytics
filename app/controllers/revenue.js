import Ember from 'ember';
import d3 from 'd3';

let dateParser = d3.time.format('%Y-%m-%d').parse;

export default Ember.Controller.extend({
  queryParams: ['date', 'department'],
  date: null,
  department: null,
  months: [
    new Date(2016,0,1),
    new Date(2016,1,1),
    new Date(2016,2,1),
    new Date(2016,3,1),
    new Date(2016,4,1),
    new Date(2016,5,1)
  ],
  selectedMonth: Ember.computed('date',function(){
    return this.get('date') && dateParser(this.get('date')) || d3.time.month(new Date());
  }),
  selectedDepartment: Ember.computed('department',function() {
    return this.store.peekRecord('department',this.get('department'));
  })
});
