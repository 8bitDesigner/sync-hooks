# What is this thing?
This node module exposes a function for configuring event hooks in GitHub.

## How do I use this!?

``` javascript
var syncHooks = require('sync-hooks')

syncHooks({

  // This URL will be pinged by GitHub when one of your configured events triggers
  url: 'http://my.build.server.com/'

  // This is a GitHub authentication object, for more information on its options
  // see https://github.com/ajaxorg/node-github#authentication
  auth: {
    type: 'oauth',
    token: '12356' // Generated from here: https://github.com/settings/applications
  },

  // A hash of repositories on the left, to arrays of events to listen to on
  // the right
  eventsHash: {
    'fullscreeninc/my-project': ['pull_request', 'issues', 'push'],
    '8bitDesigner/socks': ['issues'],
    'ryancbarry/isawesome': ['push']
  }
, function(err, hooks) {
  // Do something now that your awesome GitHub hooks are installed
})
```
