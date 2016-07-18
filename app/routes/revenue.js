import Ember from 'ember';
import config from '../config/environment';
import AuthenticatedRouteMixin from 'ember-simple-auth/mixins/authenticated-route-mixin';

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
      monthlyData: Ember.$.getJSON(`${config.apiUrl}/api/sales_orders`, Ember.merge(params,{interval:'month',all:1})).then(data => {
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
