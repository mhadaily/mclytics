import Ember from 'ember';
import config from '../config/environment';
import AuthenticatedRouteMixin from 'ember-simple-auth/mixins/authenticated-route-mixin';
import d3 from 'd3';

export default Ember.Route.extend(AuthenticatedRouteMixin, {
  queryParams: {
    date: { refreshModel: true },
    department_id: { refreshModel: true }
  },
  beforeModel() {
    this.transitionTo('revenue');
  },
  model(params) {

    let dateFormat = d3.time.format("%Y-%m-%d");

    return Ember.RSVP.hash({
      journalEntries: Ember.$.getJSON(`${config.apiUrl}/api/journal_entries`,params).then(data => {
        return data.map(function(d) {
          d.date = dateFormat.parse(d.date);
          d.amount = Number(d.amount);
          return d;
        });
      }),
      departments: this.store.findAll('department'),
      products: this.store.findAll('product')
    });
  }
});
