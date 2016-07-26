import Ember from 'ember';
import config from '../config/environment';
import d3 from 'd3';
import AuthenticatedRouteMixin from 'ember-simple-auth/mixins/authenticated-route-mixin';

export default Ember.Route.extend(AuthenticatedRouteMixin,{
  model(params) {
    let headers = {};

    this.get('session').authorize('authorizer:oauth2-bearer', (headerName, headerValue) => {
      headers[headerName] = headerValue;
    });

    return Ember.$.ajax(`${config.apiUrl}/analytics/conversion`, {
        headers:headers,
        data: Ember.merge(params,{interval: 'month'})
      }).then(data => {
      return d3.csv.parse(data,d=>{
        d.date            = new Date(d.date);
        d.date_mlr        = new Date(d.date_mlr);
        d.quantity        = +d.quantity;
        d.amount          = parseFloat(d.amount.slice(1));
        d.count           = +d.count;
        d.date_mlr_count  = +d.date_mlr_count;
        return d;
      });
    });
  }
});
