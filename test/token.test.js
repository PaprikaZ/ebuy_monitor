// Generated by CoffeeScript 1.8.0
var rewire;

rewire = require('rewire');

describe('token module', function() {
  var getValidTokens, isVerificationDone, testTokens, token, verify;
  token = rewire('../lib/token.js');
  verify = token.verify;
  isVerificationDone = token.isVerificationDone;
  getValidTokens = token.getValidTokens;
  testTokens = ['testtoken0000', 'testtoken0001', 'testtoken0002'];
  describe('verify', function() {
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
      return restore = token.__set__({
        logger: {
          debug: function() {},
          info: function() {},
          warn: function() {},
          error: function() {}
        },
        request: {
          get: function(options, callback) {
            callback(null, {
              statusCode: 200,
              url: 'www.example.com'
            }, 'foo');
          }
        }
      });
    });
    afterEach(function() {
      return restore();
    });
    it('should change verifications done to true only after all tokens verified', function() {
      var counter;
      counter = testTokens.length;
      token.__set__({
        request: {
          get: function(options, callback) {
            isVerificationDone().should.be["false"];
            counter = counter - 1;
            callback(null, {
              statusCode: 200,
              url: 'www.example.com'
            }, 'foo');
            if (0 === counter) {
              makeCalledTrue();
              isVerificationDone().should.be["true"];
            } else {
              isVerificationDone().should.be["false"];
            }
          }
        }
      });
      verify(testTokens);
      isVerificationDone().should.be["true"];
      called.should.be["true"];
    });
    it('should drop invalid tokens after all tokens verified', function() {
      token.__set__({
        request: {
          get: function(options, callback) {
            makeCalledTrue();
            if (options.auth.user === 'testtoken0001') {
              callback(new Error('foo'));
            } else if (options.auth.user === 'testtoken0002') {
              callback(null, {
                statusCode: -1,
                url: 'www.example.com'
              });
            } else {
              callback(null, {
                statusCode: 200,
                url: 'www.example.com'
              }, 'foo');
            }
          }
        }
      });
      verify(testTokens);
      getValidTokens().should.eql(['testtoken0000']);
      called.should.be["true"];
    });
    it('should throw error when all tokens are invalid', function() {
      token.__set__({
        request: {
          get: function(options, callback) {
            makeCalledTrue();
            callback(new Error('foo'));
          }
        }
      });
      verify.bind(null, testTokens).should["throw"]('config error, all token invalid');
      called.should.be["true"];
    });
    it('should not throw error when request caught error', function() {
      token.__set__({
        request: {
          get: function(options, callback) {
            makeCalledTrue();
            if (options.auth.user === 'testtoken0000') {
              callback(new Error('foo'));
            } else {
              callback(null, {
                statusCode: 200,
                url: 'www.example.com'
              }, 'foo');
            }
          }
        }
      });
      verify.bind(null, testTokens).should.not["throw"]();
      called.should.be["true"];
    });
    it('should not throw error when response nok', function() {
      token.__set__({
        request: {
          get: function(options, callback) {
            makeCalledTrue();
            if (options.auth.user === 'testtoken0000') {
              callback(null, {
                statusCode: -1,
                url: 'www.example.com'
              });
            } else {
              callback(null, {
                statusCode: 200,
                url: 'www.example.com'
              }, 'foo');
            }
          }
        }
      });
      verify.bind(null, testTokens).should.not["throw"]();
      called.should.be["true"];
    });
  });
});
