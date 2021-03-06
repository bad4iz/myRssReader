'use strict';

var _typeof2 = typeof Symbol === "function" && typeof Symbol.iterator === "symbol" ? function (obj) { return typeof obj; } : function (obj) { return obj && typeof Symbol === "function" && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj; };

var _typeof = typeof Symbol === 'function' && _typeof2(Symbol.iterator) === 'symbol' ? function (obj) {
  return typeof obj === 'undefined' ? 'undefined' : _typeof2(obj);
} : function (obj) {
  return obj && typeof Symbol === 'function' && obj.constructor === Symbol ? 'symbol' : typeof obj === 'undefined' ? 'undefined' : _typeof2(obj);
};function _classCallCheck(instance, Constructor) {
  if (!(instance instanceof Constructor)) {
    throw new TypeError('Cannot call a class as a function');
  }
}(function () {
  var FeednamiClientRequest = function () {
    function FeednamiClientRequest(client, url, options, callback) {
      _classCallCheck(this, FeednamiClientRequest);this.client = client;this.url = url;this.options = options || {};this.callback = callback;
    }FeednamiClientRequest.prototype.run = function run() {
      var _this = this;if (!this.callback) {
        if ('fetch' in window) {
          return this.send().then(function (data) {
            if (data.error) {
              var error = new Error(data.error.message);error.code = data.error.code;return Promise.reject(error);
            }return data.feed;
          });
        }return new Promise(function (resolve, reject) {
          _this.send(function (data) {
            if (data.error) {
              var error = new Error(data.error.message);error.code = data.error.code;reject(error);
            } else {
              resolve(data.feed);
            }
          });
        });
      } else {
        this.send(this.callback);
      }
    };FeednamiClientRequest.prototype.send = function send(callback) {
      var endpoint = window.feednamiEndpoint || 'https://api.feednami.com';var apiRoot = endpoint + '/api/v1.1';var feedUrl = this.url;var options = this.options;var qs = 'url=' + encodeURIComponent(feedUrl);if (this.client.publicApiKey) {
        qs += '&public_api_key=' + this.client.publicApiKey;
      }if (options.format) {
        qs += '&include_xml_document&format=' + options.format;
      }if (options.includeXml) {
        qs += '&include_xml_document';
      }var url = apiRoot + '/feeds/load?' + qs;if ('fetch' in window) {
        return fetch(url).then(function (res) {
          return res.json();
        }).then(function (data) {
          if (callback) {
            callback(data);
          }return data;
        });
      } else if (window.XDomainRequest) {
        (function () {
          var script = document.createElement('script');var callbackName = 'jsonp_callback_' + new Date().getTime() + '_' + Math.round(1000000 * Math.random());url += '&jsonp_callback=' + callbackName;window[callbackName] = function (data) {
            callback(data);document.body.removeChild(script);window[callbackName] = null;try {
              delete window[callbackName];
            } catch (e) {}
          };script.src = url;document.body.appendChild(script);
        })();
      } else {
        (function () {
          var req = new XMLHttpRequest();req.onreadystatechange = function () {
            if (req.readyState == 4) {
              callback(JSON.parse(req.responseText));
            }
          };req.open('GET', url);req.send();
        })();
      }
    };return FeednamiClientRequest;
  }();var FeednamiClient = function () {
    function FeednamiClient() {
      _classCallCheck(this, FeednamiClient);this.promisePolyfillCallbacks = [];this.promiseLoaded = 'Promise' in window;
    }FeednamiClient.prototype.loadPolyfills = function loadPolyfills(callback) {
      if (this.promiseLoaded) {
        callback();
      } else {
        this.promisePolyfillCallbacks.push(callback);if (!this.polyfillScriptsAdded) {
          this.polyfillScriptsAdded = true;var script = document.createElement('script');script.src = 'https://feednami-static.storage.googleapis.com/js/v1.1/promise.js';document.head.appendChild(script);
        }
      }
    };FeednamiClient.prototype.loadPromiseCallback = function loadPromiseCallback() {
      this.promiseLoaded = true;for (var _iterator = this.promisePolyfillCallbacks, _isArray = Array.isArray(_iterator), _i = 0, _iterator = _isArray ? _iterator : _iterator[Symbol.iterator]();;) {
        var _ref;if (_isArray) {
          if (_i >= _iterator.length) break;_ref = _iterator[_i++];
        } else {
          _i = _iterator.next();if (_i.done) break;_ref = _i.value;
        }var callback = _ref;console.log(callback);callback();
      }
    };FeednamiClient.prototype.load = function load(url, options, callback) {
      if ((typeof url === 'undefined' ? 'undefined' : _typeof(url)) == 'object') {
        return this.load(options.url, options, callback);
      }if (typeof options == 'function') {
        return this.load(url, {}, options);
      }var request = new FeednamiClientRequest(this, url, options, callback);return request.run();
    };FeednamiClient.prototype.loadGoogleFormat = function loadGoogleFormat(url, callback) {
      return feednami.load(url, { format: 'google', includeXml: true }, callback);
    };FeednamiClient.prototype.setPublicApiKey = function setPublicApiKey(key) {
      this.publicApiKey = key;
    };return FeednamiClient;
  }();window.feednami = new FeednamiClient();
})();
//# sourceMappingURL=feednami-client-v1.1.js.map