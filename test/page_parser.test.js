// Generated by CoffeeScript 1.8.0
var cacheDir, fs, pageParser, path, rewire, urlToHtmlTable, util;

util = require('util');

path = require('path');

fs = require('fs');

rewire = require('rewire');

pageParser = rewire('../lib/page_parser.js');

cacheDir = './cache';

urlToHtmlTable = require('./cache/html.json');

describe('page parser', function() {
  var MANDATORY_FIELDS, Parser, createSiteDescribe, _MANDATORY_PARSE_FIELDS;
  pageParser.__set__({
    logger: {
      debug: function() {},
      info: function() {},
      warn: function() {},
      error: function() {}
    }
  });
  Parser = pageParser.__get__('Parser');
  _MANDATORY_PARSE_FIELDS = pageParser.__get__('_MANDATORY_PARSE_FIELDS');
  MANDATORY_FIELDS = pageParser.__get__('MANDATORY_FIELDS');
  describe('site selector', function() {
    var createParser;
    createParser = pageParser.createParser;
    it('should select amazon cn parser when given www.amazon.cn', function() {
      var AmazonCNParser, parser;
      AmazonCNParser = pageParser.__get__('AmazonCNParser');
      parser = createParser('www.amazon.cn');
      parser.should.be.a.AmazonCNParser;
    });
    it('should select amazon us parser when given www.amazon.com', function() {
      var AmazonUSParser, parser;
      AmazonUSParser = pageParser.__get__('AmazonUSParser');
      parser = createParser('www.amazon.com');
      parser.should.be.a.AmazonUSParser;
    });
    it('should select amazon jp parser when given www.amazon.co.jp', function() {
      var AmazonJPParser, parser;
      AmazonJPParser = pageParser.__get__('AmazonJPParser');
      parser = createParser('www.amazon.co.jp');
      parser.should.be.a.AmazonJPParser;
    });
    it('should select jingdong parser when given www.jd.com', function() {
      var JingdongParser, parser;
      JingdongParser = pageParser.__get__('JingdongParser');
      parser = createParser('www.jd.com');
      parser.should.be.a.JingdongParser;
    });
    it('should throw error when neither above site given', function() {
      createParser.bind(null, 'foo').should["throw"]('no available parser');
    });
  });
  createSiteDescribe = function(title, siteRegExp, site) {
    var createParser;
    createParser = pageParser.createParser;
    describe(title, function() {
      var behavior, defaultParser, file, siteParser, table, url;
      table = {};
      for (url in urlToHtmlTable) {
        file = urlToHtmlTable[url];
        if (siteRegExp.test(url)) {
          table[url] = path.join(cacheDir, file);
        }
      }
      if (0 < Object.getOwnPropertyNames(table).length) {
        defaultParser = new Parser();
        siteParser = createParser(site);
        for (url in table) {
          file = table[url];
          behavior = util.format('should parse %s as expect', url);
          it(behavior, function() {
            var html, result;
            html = fs.readFileSync(path.join(__dirname, file));
            result = siteParser.parse(html);
            MANDATORY_FIELDS.map(function(field) {
              result.should.have.property(field);
            });
            _MANDATORY_PARSE_FIELDS.map(function(field) {
              var defaultValue, siteValue;
              defaultValue = defaultParser[field]();
              siteValue = result[field];
              siteValue.should.not.equal(defaultValue);
            });
          });
        }
      } else {
        it('should parse all predefined cached pages as expect');
      }
    });
  };
  createSiteDescribe('amazon cn', /amazon\.cn/, 'www.amazon.cn');
  createSiteDescribe('amazon us', /amazon\.com/, 'www.amazon.com');
  createSiteDescribe('amazon jp', /amazon\.co\.jp/, 'www.amazon.co.jp');
  createSiteDescribe('jingdong', /jd\.com/, 'www.jd.com');
});
