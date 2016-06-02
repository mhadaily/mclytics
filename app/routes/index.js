import Ember from 'ember';
import config from '../config/environment';
import AuthenticatedRouteMixin from 'ember-simple-auth/mixins/authenticated-route-mixin';

export default Ember.Route.extend(AuthenticatedRouteMixin, {
  model() {
    return Ember.RSVP.hash({
      ledgerAccounts: Ember.$.getJSON(`${config.apiUrl}/api/ledger_accounts`),
      ledgerEntries: Ember.$.getJSON(`${config.apiUrl}/api/ledger_entries`),
      journalEntries: Ember.$.getJSON(`${config.apiUrl}/api/journal_entries`),
      departments: this.store.findAll('department')
    });
  }
});
