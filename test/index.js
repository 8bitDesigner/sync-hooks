var assert = require('assert')
  , sinon = require('sinon')
  , syncHooks = require('../index')
  , mockhooks = require('../mocks')

describe('The sync hooks function', function() {
  it('should require properly configured options', function() {
    assert.throws(function() { syncHooks.verifyOptions() })
    assert.throws(function() { syncHooks.verifyOptions({url: 'foo' }) })
    assert.throws(function() { syncHooks.verifyOptions({url: 'foo', auth: {} }) })

    assert.doesNotThrow(function() { syncHooks.verifyOptions(
      {url: 'foo', auth: {}, eventsHash: {} }
    ) })
  })

  it('should parse a map of events into an array of configs', function() {
    var input = {
          "user/repo": ["push", "issues"],
          "foo/bar":   ["dingus"]
        }
      , output = [
          {user: "user", repo: "repo", events: ["push", "issues"]},
          {user: "foo", repo: "bar", events: ["dingus"]}
        ]

    assert.deepEqual(syncHooks.eventHashToConfigs(input), output)
  })

  it('should return our hook from an array of hooks', function(done) {
    var config = {user: 'foo', repo: 'bar', url: 'http://foobar.com'}
      , oldGetHooks = syncHooks.github.getHooks

    syncHooks.github.getHooks = function(config, callback) {
      callback(null, mockhooks)
    }

    syncHooks.getOurHook('http://foobar.com', config, function(err, hook) {
      assert.deepEqual(hook, mockhooks[1])
      syncHooks.github.getHooks = oldGetHooks
      done()
    })
  })
})
