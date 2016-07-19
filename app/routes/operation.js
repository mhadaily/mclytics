import Ember from 'ember';
import config from '../config/environment';
import d3 from 'd3';
import AuthenticatedRouteMixin from 'ember-simple-auth/mixins/authenticated-route-mixin';

export default Ember.Route.extend(AuthenticatedRouteMixin, {
  model(params) {
    return Ember.$.get(`${config.apiUrl}/analytics/sales_orders.csv`, Ember.merge(params,{interval:'day'})).then(data => {
      return d3.csv.parse(data,d=>{
        d.date      = new Date(d.date);
        d.quantity  = +d.quantity;
        d.amount    = +d.amount;
        return d;
      });
    });
  }
});
