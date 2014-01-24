var GitHub = require('node-github')
  , async = require('async')
  , github = new GitHub({ version: "3.0.0" })
  , _ = require('underscore')
  , noop = function() {}

function main(opts, doneConfiguringHooks) {
  // Should throw if we're missing any requirements
  verifyOptions(opts)

  var repos = eventHashToConfigs(opts.eventsHash)
    , url = opts.url

  // Handle cases where no callback is given
  doneConfiguringHooks = (typeof doneConfiguringHooks === 'function') ? doneConfiguringHooks : noop

  github.authenticate(opts.auth)

  async.map(repos, function(config, doneUpdatingHook) {
    getOurHook(url, config, function(err, hook) {
      if (err) { return done(err) }

      if (hook && ! _(hook.events).isEqual(config.events)) {
        updateHook(hook, config, doneUpdatingHook)
      } else if (!hook) {
        createHook(url, config, doneUpdatingHook)
      } else {
        doneUpdatingHook(null, hook)
      }
    })
  }, doneConfiguringHooks)
}

function eventHashToConfigs(eventsHash) {
  return Object.keys(eventsHash).map(function(repoId) {
    var obj = repoToHash(repoId)
    obj.events = eventsHash[repoId]
    return obj
  })
}

function verifyOptions(opts) {
  if (!opts.auth) {
    throw new Error('A GitHub authentication object is needed')
  }

  if (typeof opts.eventsHash !== 'object') {
    throw new Error('We need a map of repository names to events to bind to')
  }

  if (!opts.url) {
    throw new Error('We need a URL to bind these GitHub hooks to')
  }
}

function repoToHash(name) {
  var bits = name.split('/')
  return {user: bits[0], repo: bits[1]}
}

function getOurHook(url, config, cb) {
  function isOurHook(hook) {
    return (hook.config && hook.config.url === url)
  }

  github.repos.getHooks({user: config.user, repo: config.repo}, function(err, hooks) {
    if (err) { cb(err) }
    else { cb(err, hooks.filter(isOurHook).pop()) }
  })
}

function updateHook(hook, config, cb) {
  var updated = _.extend({}, config)    // user, repo, events
  updated.id = hook.id
  updated.config = hook.config
  updated.name = 'web'

  github.repos.updateHook(updated, cb)
}

function createHook(url, config, cb) {
  var newHook = _.extend({}, config)    // user, repo, events
  newHook.name = 'web'
  newHook.config = {
    url: url,
    content_type: 'json',
    insecure_ssl: '1'
  }

  github.repos.createHook(newHook, cb)
}

// Expose public API for testing
main.createHook = createHook
main.updateHook = updateHook
main.getOurHook = getOurHook
main.repoToHash = repoToHash
main.eventHashToConfigs = eventHashToConfigs
main.verifyOptions = verifyOptions
main.github = github

// Export the main function
module.exports = main
