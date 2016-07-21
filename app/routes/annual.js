import Ember from 'ember';
import config from '../config/environment';
import AuthenticatedRouteMixin from 'ember-simple-auth/mixins/authenticated-route-mixin';
import d3 from 'd3';

export default Ember.Route.extend(AuthenticatedRouteMixin, {
  model(params) {
    let headers = {};

    this.get('session').authorize('authorizer:oauth2-bearer', (headerName, headerValue) => {
      headers[headerName] = headerValue;
    });

    return Ember.$.ajax(`${config.apiUrl}/analytics/sales_orders.csv`,
      {headers:headers},
      Ember.merge(params,{interval:'month',all:1})).then(data => {
      return d3.csv.parse(data,d=>{
        d.date      = new Date(d.date);
        d.quantity  = +d.quantity;
        d.amount    = +d.amount;
        return d;
      });
    });
  }
});
