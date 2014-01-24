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
      , oldGetHooks = syncHooks.github.repos.getHooks

    syncHooks.github.repos.getHooks = function(config, callback) {
      callback(null, mockhooks)
    }

    syncHooks.getOurHook('http://foobar.com', config, function(err, hook) {
      assert.deepEqual(hook, mockhooks[1])
      syncHooks.github.repos.getHooks = oldGetHooks
      done()
    })
  })

  /*
  it("should not find hooks on a repo that is inaccessible", function (done) {
    var octopie = octoFactory();
    octopie.add('fullscreeninc/bacon');
    octopie._configureHooks(function (err, hooks) {
      assert.deepEqual(hooks, [])
      done();
    });
  });

  it("should create our hook in response to not finding our hook", function (done) {
    var octopie = octoFactory();
    octopie.add('ryancbarry/underscore');
    octopie.on('issues', function () {});
    octopie.on('pull_request', function () {});
    octopie._configureHooks(function (err, hooks) {
      console.log('configured : hooks:\n', hooks);
      // assert.deepEqual(hooks, [])
      // var hook = hooks[0];
      // assert(hook.config.url === 'http://google.com');
      // assert(hook.name === 'web');
      // assert.deepEqual(hook.events, ['issues', 'pull_request']);
      // assert(hook.config.content_type === 'json');
      // assert(hook.config.insecure_ssl === '1');
      done();
    });
  });
  */
})
