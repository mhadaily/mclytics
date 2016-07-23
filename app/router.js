import Ember from 'ember';
import config from './config/environment';

const Router = Ember.Router.extend({
  location: config.locationType
});

Router.map(function() {
  this.route('settings');
  this.route('login');
  this.route('revenue');
  this.route('annual');
  this.route('operation');
  this.route('conversion');
});

export default Router;
