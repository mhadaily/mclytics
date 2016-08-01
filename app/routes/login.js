import Ember from 'ember';

export default Ember.Route.extend({
  session: Ember.inject.service(),
  activate: function() {
    Ember.$('body').addClass('login');
  },
  deactivate: function() {
    Ember.$('body').removeClass('login');
  }
});
