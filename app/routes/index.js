import Ember from 'ember';
import config from '../config/environment';
import AuthenticatedRouteMixin from 'ember-simple-auth/mixins/authenticated-route-mixin';

export default Ember.Route.extend(AuthenticatedRouteMixin, {
  model() {
    return Ember.RSVP.hash({
      journalEntries: Ember.$.getJSON(`${config.apiUrl}/api/journal_entries`),
      departments: this.store.findAll('department'),
      products: this.store.findAll('product'),
    });
  }
});
