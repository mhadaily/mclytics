import Ember from 'ember';
import config from '../config/environment';
import AuthenticatedRouteMixin from 'ember-simple-auth/mixins/authenticated-route-mixin';
import d3 from 'd3';

let dateParser = d3.time.format('%Y-%m-%d').parse;

export default Ember.Route.extend(AuthenticatedRouteMixin, {
  queryParams: {
    date: {
      refreshModel: true
    }
  },
  model(params) {
    return Ember.RSVP.hash({
      data: Ember.$.getJSON(`${config.apiUrl}/api/sales_orders`, params).then(data => {
        return data.map(function(d) {
          // d.date = dateParser(d.date);
          d.date = new Date(d.date);
          d.amount = Number(d.amount);
          return d;
        });
      }),
      departments: this.store.findAll('department'),
      products: this.store.findAll('product'),
      targets: this.store.findAll('target')
    });
  }
});
