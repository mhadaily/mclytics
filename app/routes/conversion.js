import Ember from 'ember';

export default Ember.Route.extend({
  model() {
    let headers = {};

    this.get('session').authorize('authorizer:oauth2-bearer', (headerName, headerValue) => {
      headers[headerName] = headerValue;
    });

    return Ember.$.ajax(`${config.apiUrl}/analytics/sales_orders.csv?product_id`, {
        headers:headers,
        data: Ember.merge(params,{interval:'day'})
      }).then(data => {
      return d3.csv.parse(data,d=>{
        d.date      = new Date(d.date);
        d.quantity  = +d.quantity;
        d.amount    = +d.amount;
        return d;
      });
    });
  }
});
