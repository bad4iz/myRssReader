'use strict';

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

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
      var _this = this;

      if (!Array.isArray(arr)) {
        throw new Error('не массив!');
      }
      while (this.msgAlert.hasChildNodes()) {
        this.msgAlert.removeChild(this.msgAlert.lastChild);
      }
      var div = document.createElement('div');
      div.className = "FeedsView";
      arr.forEach(function (item) {
        var div = document.createElement('div');
        div.className = 'urlFeed';
        var buttonIsUnsubscribe = document.createElement('input');
        buttonIsUnsubscribe.type = 'button';
        buttonIsUnsubscribe.value = 'удалить подписку';
        div.appendChild(item.view());
        buttonIsUnsubscribe.onclick = function () {
          var msgAlert = document.getElementById('msgAlert');
          msgAlert.removeChild(div);
          feedsCollection.deleteFeed(item);
        };
        div.appendChild(buttonIsUnsubscribe);
        _this.msgAlert.appendChild(div);
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

var FeedsView = function () {
  function FeedsView() {
    _classCallCheck(this, FeedsView);

    this.textarea = document.getElementById('textarea');
  }

  _createClass(FeedsView, [{
    key: 'view',
    value: function view(feedsItem) {
      var _this2 = this;

      feedsItem.forEach(function (item) {
        return _this2.textarea.appendChild(item.view());
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
      var description = document.createElement('p');
      description.textContent = this.description;
      dataPubl.appendChild(document.createTextNode(this.pubDate));
      a.href = this.link;
      var h2 = document.createElement('h2');
      h2.appendChild(document.createTextNode(this.title));
      a.appendChild(h2);
      div.appendChild(dataPubl);
      div.appendChild(a);
      div.appendChild(description);
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
      var _this3 = this;

      return new Promise(function (resolve, reject) {
        feednami.load(_this3.rssUrl, function (result) {
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
      var _this4 = this;

      return new Promise(function (resolve, reject) {
        var feedsPromise = _this4.getFeedRssPromis();
        feedsPromise.then(function (items) {
          var _iteratorNormalCompletion = true;
          var _didIteratorError = false;
          var _iteratorError = undefined;

          try {
            for (var _iterator = items[Symbol.iterator](), _step; !(_iteratorNormalCompletion = (_step = _iterator.next()).done); _iteratorNormalCompletion = true) {
              var item = _step.value;

              item.idFeedModel = _this4.idFeedModel;
              _this4._feedsItem.push(new ItemFeed(item));
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
      var _this5 = this;

      this.feedsItem = [];
      this.feeds.forEach(function (item) {
        return _this5.feedsItem = _this5.feedsItem.concat(item.feeds);
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
      var _this6 = this;

      if (rssFeed instanceof FeedModel) {
        var feedsPromise = rssFeed.feedsPromis();
        feedsPromise.then(function () {
          _this6.feeds.push(rssFeed);
          _this6.feedsItem = _this6.feedsItem.concat(rssFeed.feeds);
          _this6.visibleAllFeeds();
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
  var a = new FeedModel('http://lenta.ru/rss/last24');
  feedsCollection.feed = new FeedModel('http://4pda.ru/feed/rss');
  feedsCollection.feed = new FeedModel('https://www.liteforex.ru/rss/company-news/');
  feedsCollection.feed = a;
} catch (e) {
  console.log(e.name + ': ' + e.message);
}

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
    feedsCollection.feed = new FeedModel(textRss.value);
    textRss.value = '';
  };
};

/**
 * кнопка показать ленты
 *
 * @constructor
 */


var ButtonRssController = function () {
  function ButtonRssController() {
    _classCallCheck(this, ButtonRssController);

    var rss = document.getElementById('rss');
    var textRss = rss.textContent;
    var msgAlert = document.getElementById('msgAlert');
    this._flagVisible = false;
    rss.onclick = this.click(textRss, this);
  }

  _createClass(ButtonRssController, [{
    key: 'click',
    value: function click(textButton, context) {
      return function () {
        if (!context.flagVisible) {
          while (msgAlert.hasChildNodes()) {
            msgAlert.removeChild(msgAlert.lastChild);
            rss.textContent = textButton;
          }
        } else {
          feedListView.view(feedsCollection.feed);
          rss.textContent = "скрыть";
        }
      };
    }
  }, {
    key: 'flagVisible',
    get: function get() {
      this._flagVisible = !this._flagVisible;
      return this._flagVisible;
    }
  }]);

  return ButtonRssController;
}();
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
      if (two.title < one.title) {
        return -1;
      } else if (two.title > one.title) {
        return 1;
      }
      return 0;
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