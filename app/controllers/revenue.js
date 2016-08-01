import Ember from 'ember';
import d3 from 'd3';
import universe from 'npm:universe';

let dateParser = d3.time.format('%Y-%m-%d').parse;
let listMonths = [ new Date(2016,0,1),
        new Date(2016,1,1),
        new Date(2016,2,1),
        new Date(2016,3,1),
        new Date(2016,4,1),
        new Date(2016,5,1),
        new Date(2016,6,1),
        new Date(2016,7,1)];

export default Ember.Controller.extend({

  queryParams: ['date', 'department'],
  date: null,
  department: null,
 // months: listMonths,
  selectedMonth: Ember.computed('date',function(){
    return this.get('date') && dateParser(this.get('date')) || d3.time.month(new Date());
  }),
  selectedDepartment: Ember.computed('department',function() {
    return this.store.peekRecord('department',this.get('department'));
  }),
  months: Ember.computed(function() {
    var monthNames = [];
    var i = -1;
    var d;
    var today = new Date();
    var todayMonth = today.getMonth();
      for(i; i < todayMonth; i++) {
      d = new Date(today.getFullYear(), today.getMonth() - i, 1);
      monthNames.unshift(''+d.getFullYear()+','+d.getMonth()+',1');
    }
    return monthNames;
}).volatile(),
//   years: Ember.computed(function() {
//     var yearsList = [];
//     var i = 0;
//     var d;
//     var today = new Date();
//       for(i; i < 3; i++) {
//       d = new Date(today.setYear(today.getFullYear() - i));
//       yearsList.unshift(''+d.getFullYear()+'');
//     }
//     return yearsList;
// }).volatile(),
  getUniverse() {
    return universe(this.model.monthlyData)
    .then(function(myUniverse){
      // And now you're ready to query! :)
      return myUniverse;
    });
  }
});
