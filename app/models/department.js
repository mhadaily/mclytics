import DS from 'ember-data';

export default DS.Model.extend({
  targets: DS.hasMany(),
  name: DS.attr()
});
