import Ember from 'ember';
import config from '../config/environment';
import d3 from 'd3';
import AuthenticatedRouteMixin from 'ember-simple-auth/mixins/authenticated-route-mixin';

export default Ember.Route.extend(AuthenticatedRouteMixin, {
  model(params) {
    let headers = {};

    this.get('session').authorize('authorizer:oauth2-bearer', (headerName, headerValue) => {
      headers[headerName] = headerValue;
    });

    return Ember.$.ajax(`${config.apiUrl}/analytics/sales_orders.csv`, {
        headers:headers,
        data: Ember.merge(params,{interval:'day'})
      }).then(data => {
      return d3.csv.parse(data,d=>{
        d.date      = moment(d.date).format('MM/DD/YYYY');
        d.date      = new Date(d.date);
        d.quantity  = +d.quantity;
        d.amount    = +d.amount;
        return d;
      });
    });
  }
});
