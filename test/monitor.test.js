// Generated by CoffeeScript 1.8.0
var config, rewire, testTokens, verdicts;

config = require('../lib/config.js');

rewire = require('rewire');

verdicts = require('./cache/builder.js').generateVerdicts();

testTokens = [
  {
    accessToken: 'testtoken0000'
  }, {
    accessToken: 'testtoken0001'
  }, {
    accessToken: 'testtoken0002'
  }
];

config.accounts = testTokens;

describe('monitor module', function() {
  var createMonitor, monitor;
  monitor = rewire('../lib/monitor.js');
  monitor.__set__({
    logger: {
      debug: function() {},
      warn: function() {},
      info: function() {},
      error: function() {}
    },
    config: config,
    fs: {
      readFileSync: function() {
        return JSON.stringify(verdicts);
      }
    },
    db: {
      getClient: function() {
        return {
          rpop: function() {}
        };
      }
    },
    messenger: {
      push: function() {}
    },
    token: {
      verify: function() {},
      isVerificationDone: function() {
        return true;
      },
      getValidTokens: config.accounts
    },
    createVisitor: function() {
      return {
        visit: function() {}
      };
    }
  });
  createMonitor = monitor.createMonitor;
  describe('create monitor', function() {
    it('should throw error when no token configured', function() {
      var restore;
      restore = monitor.__set__('config', {
        accounts: []
      });
      createMonitor.should["throw"]('config error, access tokens empty');
      restore();
    });
    it('should throw error when no verdicts configured', function() {
      var restore;
      restore = monitor.__set__({
        fs: {
          readFileSync: function() {
            return JSON.stringify([]);
          }
        }
      });
      createMonitor.should["throw"]('config error, verdicts empty');
      restore();
    });
  });
  describe('visit sites', function() {
    var called, makeCalledFalse, makeCalledTrue, restore;
    called = false;
    makeCalledTrue = function() {
      called = true;
    };
    makeCalledFalse = function() {
      called = false;
    };
    restore = null;
    beforeEach(function() {
      makeCalledFalse();
      restore = monitor.__set__({
        createVisitor: function() {
          return {
            visit: function() {}
          };
        }
      });
    });
    afterEach(function() {
      return restore();
    });
    it('should not visit any site when all seeds delayed', function() {
      var m;
      monitor.__set__({
        createVisitor: function() {
          return {
            visit: makeCalledTrue
          };
        }
      });
      m = createMonitor();
      m.seeds = [];
      m.visitSites();
      called.should.be["false"];
    });
  });
  describe('process delay queue', function() {
    var called, makeCalledFalse, makeCalledTrue, makeRpop, restore;
    makeRpop = function(queue) {
      return function(key, callback) {
        if (0 < queue.length) {
          return callback(null, queue.pop());
        } else {
          return callback(null, null);
        }
      };
    };
    called = false;
    makeCalledTrue = function() {
      called = true;
    };
    makeCalledFalse = function() {
      called = false;
    };
    restore = null;
    beforeEach(function() {
      makeCalledFalse();
      restore = monitor.__set__({
        setTimeout: function() {},
        db: {
          getClient: function() {
            return {
              rpop: function() {}
            };
          }
        }
      });
    });
    afterEach(function() {
      return restore();
    });
    it('should pass error to db rethrow handler', function() {
      var m;
      monitor.__set__({
        db: {
          getClient: function() {
            return {
              rpop: function(key, callback) {
                return callback(new Error('foo'));
              }
            };
          },
          redisErrorRethrow: makeCalledTrue
        }
      });
      m = createMonitor();
      m.processDelayQueue();
      called.should.be["true"];
    });
    it('should push back delayed seeds when timeout', function() {
      var m, queue, remainingVdts, v, vdts;
      v = verdicts.slice().pop();
      queue = [
        JSON.stringify({
          id: v.id,
          site: v.site
        })
      ];
      vdts = verdicts.slice();
      remainingVdts = vdts.slice(0, vdts.length - 1);
      m = null;
      monitor.__set__({
        db: {
          getClient: function() {
            return {
              rpop: makeRpop(queue)
            };
          }
        },
        setTimeout: function(callback, timeout) {
          makeCalledTrue();
          m.seeds.map(function(seed, idx) {
            return seed.equal(remainingVdts[idx]).should.be["true"];
          });
          callback();
          m.seeds.map(function(seed, idx) {
            return seed.equal(vdts[idx]).should.be["true"];
          });
        }
      });
      m = createMonitor();
      m.visitSites = function() {};
      m.processDelayQueue();
      called.should.be["true"];
    });
  });
  describe('process push queue', function() {
    var called, makeCalledFalse, makeCalledTrue, makeRpop, restore;
    makeRpop = function(queue) {
      return function(key, callback) {
        if (0 < queue.length) {
          return callback(null, queue.pop());
        } else {
          return callback(null, null);
        }
      };
    };
    called = false;
    makeCalledTrue = function() {
      called = true;
    };
    makeCalledFalse = function() {
      called = false;
    };
    restore = null;
    beforeEach(function() {
      makeCalledFalse();
      restore = monitor.__set__({
        db: {
          getClient: function() {
            return {
              rpop: function() {}
            };
          }
        },
        messenger: {
          push: function() {}
        }
      });
    });
    afterEach(function() {
      return restore();
    });
    it('should push messages after push queue cleared', function() {
      var m;
      monitor.__set__({
        db: {
          getClient: function() {
            return {
              rpop: makeRpop([])
            };
          }
        }
      });
      m = createMonitor();
      m.pushMessages = makeCalledTrue;
      m.processPushQueue();
      called.should.be["true"];
    });
    it('should pass error to db rethrow handler', function() {
      var m;
      monitor.__set__({
        db: {
          getClient: function() {
            return {
              rpop: function(key, callback) {
                return callback(new Error('foo'));
              }
            };
          },
          redisErrorRethrow: makeCalledTrue
        }
      });
      m = createMonitor();
      m.processPushQueue();
      called.should.be["true"];
    });
    it('should not push any message when push queue empty', function() {
      var m;
      monitor.__set__({
        db: {
          getClient: function() {
            return {
              rpop: makeRpop([])
            };
          }
        },
        messenger: {
          push: makeCalledTrue
        }
      });
      m = createMonitor();
      m.processPushQueue();
      called.should.be["false"];
    });
  });
});
