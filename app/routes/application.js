import Ember from 'ember';
import ApplicationRouteMixin from 'ember-simple-auth/mixins/application-route-mixin';
import config from '../config/environment';

export default Ember.Route.extend(ApplicationRouteMixin, {
  model() {
    return Ember.RSVP.hash({
      account: new Ember.RSVP.Promise((resolve, reject) => {

        if (!this.get('session.isAuthenticated')) {
          resolve({});
          return;
        }

        let store = this.store,
          session = this.get('session');

        let headers = {};

        this.get('session').authorize('authorizer:oauth2-bearer', (headerName, headerValue) => {
          headers[headerName] = headerValue;
        });

        return Ember.$.ajax(config.apiUrl + '/api/account', {
          headers: headers
        }).then(data => {
          if (data) {
            store.pushPayload(data);
            resolve(store.peekRecord('user', data.data.id));
          } else {
            reject({});
            session.invalidate();
          }
        }).fail(() => {
          session.invalidate();
        });
      })
    });
  },
  sessionAuthenticated() {
    this.refresh();
    this._super();
  }
});
