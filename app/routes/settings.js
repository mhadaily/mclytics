import Ember from 'ember';
import AuthenticatedRouteMixin from 'ember-simple-auth/mixins/authenticated-route-mixin';

export default Ember.Route.extend(AuthenticatedRouteMixin, {
  session: Ember.inject.service(),
  model: function() {
    return this.modelFor('application').account
  },
  actions: {
    invalidateSession() {
      this.get('session').invalidate();
    }
  }
});
