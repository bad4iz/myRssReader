'use strict';

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var FeedsView = function () {
  function FeedsView() {
    _classCallCheck(this, FeedsView);

    this.textarea = document.getElementById('textarea');
  }

  _createClass(FeedsView, [{
    key: 'view',
    value: function view(feedsItem) {
      var _this = this;

      feedsItem.forEach(function (item) {
        return _this.textarea.appendChild(item.view());
      });
    }
  }]);

  return FeedsView;
}();

///////////////////////////////////////////////////
//    Models
////////////////////////////////////////////////////

var ItemFeed = function () {
  function ItemFeed(obj) {
    _classCallCheck(this, ItemFeed);

    this.id = ItemFeed.id++;
    this.title = obj.title;
    this.description = obj.description;
    this.pubDate = obj.pubDate;
    this.pubdate_ms = obj.pubdate_ms;
    this.author = obj.author;
    this.link = obj.link;
    this.isRead = false;
    this.idFeedModel = obj.idFeedModel;
  }

  _createClass(ItemFeed, [{
    key: 'read',
    value: function read() {
      this.isRead = !this.isRead;
      return this.isRead;
    }
  }, {
    key: 'view',
    value: function view() {
      var div = document.createElement('div');
      var a = document.createElement('a');
      var inputIsRead = document.createElement('input');
      inputIsRead.type = 'checkbox';
      var dataPubl = document.createElement('p');
      dataPubl.appendChild(document.createTextNode(this.pubdate_ms));
      a.href = this.link;
      var h2 = document.createElement('h2');
      h2.appendChild(document.createTextNode(this.title));
      a.appendChild(h2);
      div.appendChild(dataPubl);
      div.appendChild(a);
      div.appendChild(inputIsRead);
      return div;
    }
  }]);

  return ItemFeed;
}();

ItemFeed.id = 0;

var FeedModel = function () {
  function FeedModel(url) {
    _classCallCheck(this, FeedModel);

    if (/^http/i.test(url)) {
      this.idFeedModel = FeedModel.id++;
      this.rssUrl = url;
      this._feedsItem = [];
      // this.feedsPromis();
      this.isUnsubscribe = false;
    } else {
      throw new Error('не содержит урл!');
    }
  }

  _createClass(FeedModel, [{
    key: 'getFeedRssPromis',
    value: function getFeedRssPromis() {
      var _this2 = this;

      return new Promise(function (resolve, reject) {
        feednami.load(_this2.rssUrl, function (result) {
          if (result.error) {
            reject(result.error);
          } else {
            var entries = result.feed.entries;
            resolve(entries);
          }
        });
      });
    }
  }, {
    key: 'feedsPromis',
    value: function feedsPromis() {
      var _this3 = this;

      return new Promise(function (resolve, reject) {
        var feedsPromise = _this3.getFeedRssPromis();
        feedsPromise.then(function (items) {
          var _iteratorNormalCompletion = true;
          var _didIteratorError = false;
          var _iteratorError = undefined;

          try {
            for (var _iterator = items[Symbol.iterator](), _step; !(_iteratorNormalCompletion = (_step = _iterator.next()).done); _iteratorNormalCompletion = true) {
              var item = _step.value;

              item.idFeedModel = _this3.idFeedModel;
              _this3._feedsItem.push(new ItemFeed(item));
            }
          } catch (err) {
            _didIteratorError = true;
            _iteratorError = err;
          } finally {
            try {
              if (!_iteratorNormalCompletion && _iterator.return) {
                _iterator.return();
              }
            } finally {
              if (_didIteratorError) {
                throw _iteratorError;
              }
            }
          }

          resolve(true);
        }, function (error) {
          console.log("Ошибка: " + error);
          msgAlert.innerHTML = "Ошибка: Проверте адресс! Скорей всего он не правильный "; // error - аргумент reject
          reject(result.error);
        });
      });
    }
  }, {
    key: 'unsubscribe',
    value: function unsubscribe() {
      this.isUnsubscribe = !this.isUnsubscribe;
      return this.isUnsubscribe;
    }
  }, {
    key: 'view',
    value: function view() {
      var p = document.createElement('p');
      p.appendChild(document.createTextNode(this.url));
      return p;
    }
  }, {
    key: 'feeds',
    get: function get() {
      return this._feedsItem;
    }
  }, {
    key: 'url',
    get: function get() {
      return this.rssUrl;
    }
  }]);

  return FeedModel;
}();

FeedModel.id = 0;
///////////////////////////////////////
//       Collections
//////////////////////////////////////

var FeedsCollection = function () {
  function FeedsCollection() {
    _classCallCheck(this, FeedsCollection);

    this.feeds = [];
    this.feedsItem = [];
    this.feedsView = new FeedsView();
  }

  _createClass(FeedsCollection, [{
    key: 'visibleAllFeeds',
    value: function visibleAllFeeds(fn) {
      if (typeof fn !== "function") {
        fn = '';
      }
      while (textarea.hasChildNodes()) {
        textarea.removeChild(textarea.lastChild);
      }
      this.feedsView.view(this.feedsItem.sort(fn));
    }
  }, {
    key: 'deleteFeed',
    value: function deleteFeed(feed) {
      if (!(feed instanceof FeedModel)) {
        throw new Error('неправильный класс!');
      }
      var index = this.feeds.indexOf(feed);
      if (index === -1) {
        console.error("нет такого элемента");
        return;
      }
      this.feeds.splice(index, 1);
      this.redesign();
      console.log("объект удален");
    }
  }, {
    key: 'redesign',
    value: function redesign() {
      var _this4 = this;

      this.feedsItem = [];
      this.feeds.forEach(function (item) {
        return _this4.feedsItem = _this4.feedsItem.concat(item.feeds);
      });
      this.visibleAllFeeds();
    }
  }, {
    key: 'setfeedsItem',
    value: function setfeedsItem(arr) {
      if (!Array.isArray(arr)) {
        console.error("передали в feedsItem не массив");
        return;
      }
      this.feedsItem = this.feedsItem.concat(arr);
    }
  }, {
    key: 'view',
    value: function view() {
      console.log('FeedsCollection');
    }
  }, {
    key: 'feed',
    set: function set(rssFeed) {
      var _this5 = this;

      if (rssFeed instanceof FeedModel) {
        var feedsPromise = rssFeed.feedsPromis();
        feedsPromise.then(function () {
          _this5.feeds.push(rssFeed);
          _this5.feedsItem = _this5.feedsItem.concat(rssFeed.feeds);
          _this5.visibleAllFeeds();
        });
      } else {
        throw new Error('неправильный класс!');
      }
    },
    get: function get() {
      return this.feeds;
    }
  }]);

  return FeedsCollection;
}();

var feedsCollection = new FeedsCollection();
try {
  var a = new FeedModel('http://4pda.ru/feed/rss');
  feedsCollection.feed = new FeedModel('http://4pda.ru/feed/rss');
  feedsCollection.feed = new FeedModel('https://www.liteforex.ru/rss/company-news/');
  feedsCollection.feed = a;
} catch (e) {
  console.log(e.name + ': ' + e.message);
}

///////////////////////////////////////////////////
//
//   Views
//
////////////////////////////////////////////////////
/**
 * показ списка подписок
 */

var FeedListView = function () {
  function FeedListView(fileId) {
    _classCallCheck(this, FeedListView);

    this.msgAlert = document.getElementById(fileId);
  }

  _createClass(FeedListView, [{
    key: 'view',
    value: function view(arr) {
      var _this6 = this;

      if (!Array.isArray(arr)) {
        throw new Error('не массив!');
      }
      while (this.msgAlert.hasChildNodes()) {
        this.msgAlert.removeChild(this.msgAlert.lastChild);
      }
      var div = document.createElement('div');
      div.className = "FeedsView";
      arr.forEach(function (item) {
        _this6.msgAlert.appendChild(item.view());
        var buttonIsUnsubscribe = document.createElement('input');
        buttonIsUnsubscribe.type = 'button';
        buttonIsUnsubscribe.value = 'удалить';
        buttonIsUnsubscribe.onclick = function () {
          var msgAlert = document.getElementById('msgAlert');

          while (msgAlert.hasChildNodes()) {
            msgAlert.removeChild(msgAlert.lastChild);
          }
          feedsCollection.deleteFeed(item);
        };
        _this6.msgAlert.appendChild(buttonIsUnsubscribe);
      });
    }
  }]);

  return FeedListView;
}();

var feedListView = new FeedListView('msgAlert');

var FeedView = function () {
  function FeedView(item) {
    _classCallCheck(this, FeedView);

    this.element = 'div';
    console.log(item.author);
  }

  _createClass(FeedView, [{
    key: 'view',
    value: function view() {
      var elm = document.createElement(this.element);
    }
  }]);

  return FeedView;
}();

///////////////////////////////////////////////////
//    Controllers
////////////////////////////////////////////////////

/**
 * кнопка добавление рсс ленты
 * @constructor
 */


var ButtonAddController = function ButtonAddController() {
  _classCallCheck(this, ButtonAddController);

  var addRssButton = document.getElementById('addRssButton');
  var textRss = document.getElementById('rssText');

  addRssButton.onclick = function () {
    feeds.feed = new RssFeedModel(textRss.value);
    textRss.value = '';
  };
};

/**
 * кнопка показать ленты
 *
 * @constructor
 */


var ButtonRssController = function ButtonRssController() {
  _classCallCheck(this, ButtonRssController);

  var rss = document.getElementById('rss');
  var msgAlert = document.getElementById('msgAlert');
  rss.onclick = function () {
    feedListView.view(feedsCollection.feed);
  };
};
/**
 *  кнопка сортировки по названию
 */


var ButtonSortTitle = function ButtonSortTitle() {
  _classCallCheck(this, ButtonSortTitle);

  var buttonSortTitle = document.getElementById('rssButtonSortTitle');
  var textarea = document.getElementById('textarea');
  buttonSortTitle.onclick = function () {
    while (textarea.hasChildNodes()) {
      textarea.removeChild(textarea.lastChild);
    }

    var sortTitle = function sortTitle(one, two) {
      return two.title - one.title;
    };
    feedsCollection.visibleAllFeeds(sortTitle);
  };
};

/**
 *  кнопка сортировки по дате публикации
 */


var ButtonSortDatePubl = function ButtonSortDatePubl() {
  _classCallCheck(this, ButtonSortDatePubl);

  var buttonSortDatePubl = document.getElementById('rssButtonSortDatePubl');
  var textarea = document.getElementById('textarea');
  buttonSortDatePubl.onclick = function () {
    while (textarea.hasChildNodes()) {
      textarea.removeChild(textarea.lastChild);
    }
    var sortDatePubl = function sortDatePubl(one, two) {
      return two.pubdate_ms - one.pubdate_ms;
    };
    feedsCollection.visibleAllFeeds(sortDatePubl);
  };
};

var buttonAddFeeds = new ButtonAddController();
var buttonRss = new ButtonRssController();
var buttonSortTitle = new ButtonSortTitle();
var buttonSortDatePubl = new ButtonSortDatePubl();
/////////////////////////////////////////////////////
//# sourceMappingURL=app.js.map