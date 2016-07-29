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
    let headers = {};

    this.get('session').authorize('authorizer:oauth2-bearer', (headerName, headerValue) => {
      headers[headerName] = headerValue;
    });

    return Ember.RSVP.hash({
      data: Ember.$.ajax(`${config.apiUrl}/api/sales_orders`,
        {
          headers:headers,
          data: params
        }).then(data => {
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
