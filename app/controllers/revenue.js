import Ember from 'ember';
import d3 from 'd3';
import universe from 'npm:universe';

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
    new Date(2016,5,1),
    new Date(2016,6,1),
    new Date(2016,7,1),
  ],
  selectedMonth: Ember.computed('date',function(){
    return this.get('date') && dateParser(this.get('date')) || d3.time.month(new Date());
  }),
  selectedDepartment: Ember.computed('department',function() {
    return this.store.peekRecord('department',this.get('department'));
  }),
  getUniverse() {
    return universe(this.model.monthlyData)
    .then(function(myUniverse){
      // And now you're ready to query! :)
      return myUniverse;
    });
  }
});
