import Ember from 'ember';
import DS from 'ember-data';

export default DS.Model.extend({
  product: DS.belongsTo(),
  department: DS.belongsTo(),
  date: DS.attr(),
  interval: DS.attr(),
  amount: DS.attr()
});
