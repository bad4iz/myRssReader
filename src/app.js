/**
 *   Views
 */

let feedsCollection;

/**
 * показ списка подписок
 */
class FeedListView {
    constructor(fileId) {
        this.msgAlert = document.getElementById(fileId);
    }

    view(arr) {
        if (!Array.isArray(arr)) {
            throw new Error('не массив!');
        }
        while (this.msgAlert.hasChildNodes()) {
            this.msgAlert.removeChild(this.msgAlert.lastChild);
        }
        let div = document.createElement('div');
        div.className = 'FeedsView';
        arr.forEach(item => {
            let myDiv = document.createElement('div');
            myDiv.className = 'urlFeed';
            let buttonIsUnsubscribe = document.createElement('input');
            buttonIsUnsubscribe.type = 'button';
            buttonIsUnsubscribe.value = 'удалить подписку';
            myDiv.appendChild(item.view());
            buttonIsUnsubscribe.onclick = function() {
                const msgAlert = document.getElementById('msgAlert');
                msgAlert.removeChild(myDiv);
                feedsCollection.deleteFeed(item);
            };
            myDiv.appendChild(buttonIsUnsubscribe);
            this.msgAlert.appendChild(myDiv);
        });
    }
}

let feedListView = new FeedListView('msgAlert');

class FeedsView {
    constructor() {
        this.textarea = document.getElementById('textarea');
    }

    view(feedsItem) {
        feedsItem.forEach(item => this.textarea.appendChild(item.view()));
    }
}

/**
 * Models
 */
class ItemFeed {
    constructor(obj) {
        this.id = ItemFeed.id++;
        this.title = obj.title;
        this.description = obj.description;
        this.pubDate = obj.pubDate;
        this.pubdatMs = obj.pubdatMs;
        this.author = obj.author;
        this.link = obj.link;
        this.isRead = false;
        this.idFeedModel = obj.idFeedModel;
    }

    read() {
        this.isRead = !this.isRead;
        return this.isRead;
    }

    view() {
        let div = document.createElement('div');
        div.className = 'itemFeed';
        let a = document.createElement('a');
        let inputIsRead = document.createElement('input');
        inputIsRead.type = 'checkbox';
        let dataPubl = document.createElement('p');
        let description = document.createElement('p');
        description.textContent = this.description;
        dataPubl.appendChild(document.createTextNode(this.pubDate));
        a.href = this.link;
        let h2 = document.createElement('h2');
        h2.appendChild(document.createTextNode(this.title));
        a.appendChild(h2);
        div.appendChild(dataPubl);
        div.appendChild(a);
        div.appendChild(description);
        div.appendChild(inputIsRead);
        return div;
    }
}
ItemFeed.id = 0;

class FeedModel {
    constructor(url) {
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

    getFeedRssPromis() {
        return new Promise((resolve, reject) => {
            feednami.load(this.rssUrl, function(result) {
                if (result.error) {
                    reject(result.error);
                }
                else {
                    let entries = result.feed.entries;
                    resolve(entries);
                }
            });
        });
    }

    feedsPromis() {
        return new Promise((resolve, reject) => {
            let feedsPromise = this.getFeedRssPromis();
            feedsPromise
                .then(
                    items => {
                        for (let item of items) {
                            item.idFeedModel = this.idFeedModel;
                            this._feedsItem.push(new ItemFeed(item));
                        }
                        resolve(true);
                    }
                );
        });
    }

    get feeds() {
        return this._feedsItem;
    }

    get url() {
        return this.rssUrl;
    }

    unsubscribe() {
        this.isUnsubscribe = !this.isUnsubscribe;
        return this.isUnsubscribe;
    }

    view() {
        let p = document.createElement('p');
        p.appendChild(document.createTextNode(this.url));
        return p;
    }
}
FeedModel.id = 0;

/**
 * Collections
 */
class FeedsCollection {
    constructor() {
        this.feeds = [];
        this.feedsItem = [];
        this.feedsView = (new FeedsView());
    }

    set feed(rssFeed) {
        if (rssFeed instanceof FeedModel) {
            let feedsPromise = rssFeed.feedsPromis();
            feedsPromise
                .then(() => {
                    this.feeds.push(rssFeed);
                    this.feedsItem = this.feedsItem.concat(rssFeed.feeds);
                    this.visibleAllFeeds();
                });
        } else {
            throw new Error('неправильный класс!');
        }
    }

    get feed() {
        return this.feeds;
    }

    visibleAllFeeds(fn) {
        while (textarea.hasChildNodes()) {
            textarea.removeChild(textarea.lastChild);
        }
        this.feedsView.view(this.feedsItem.sort(fn));
    }

    deleteFeed(feed) {
        if (!(feed instanceof FeedModel)) {
            throw new Error('неправильный класс!');
        }
        let index = this.feeds.indexOf(feed);
        if (index === -1) {
            return;
        }
        this.feeds.splice(index, 1);

        let feedsCollectionArr = JSON.parse(window.localStorage.feedsCollectionArr);
        let rssIndex = feedsCollectionArr.indexOf(feed.rssUrl);
        if (rssIndex === -1) {
            return;
        }
        feedsCollectionArr.splice(rssIndex, 1);
        window.localStorage.feedsCollectionArr = JSON.stringify(feedsCollectionArr);

        this.redesign();
    }

    redesign() {
        this.feedsItem = [];
        this.feeds.forEach(item => this.feedsItem = this.feedsItem.concat(item.feeds));
        this.visibleAllFeeds();
    }

    setfeedsItem(arr) {
        if (!Array.isArray(arr)) {
            return;
        }
        this.feedsItem = this.feedsItem.concat(arr);
    }

    view() {
    }
}

feedsCollection = new FeedsCollection();

if (window.localStorage.feedsCollectionArr) {
    let feedsCollectionArr = JSON.parse(window.localStorage.feedsCollectionArr);
    feedsCollectionArr.forEach(rss => {
        feedsCollection.feed = new FeedModel(rss);
    });
} else {
    try {
        feedsCollectionArr = ['http://4pda.ru/feed/rss', 'https://www.liteforex.ru/rss/company-news/', 'http://lenta.ru/rss/last24'];
        window.localStorage.feedsCollectionArr = JSON.stringify(feedsCollectionArr);

        feedsCollectionArr.forEach(rss => {
            feedsCollection.feed = new FeedModel(rss);
        });
    } catch (e) { }
}
/**
 * Controllers
 */

/**
 * кнопка добавление рсс ленты
 * @constructor
 */
class ButtonAddController {
    constructor() {
        const addRssButton = document.getElementById('addRssButton');
        const textRss = document.getElementById('rssText');

        addRssButton.onclick = function() {
            if (/^http/i.test(textRss.value)) {
                feedsCollection.feed = new FeedModel(textRss.value);

                let feedsCollectionArr = JSON.parse(window.localStorage.feedsCollectionArr);
                feedsCollectionArr.push(textRss.value);
                window.localStorage.feedsCollectionArr = JSON.stringify(feedsCollectionArr);
            }
            textRss.value = '';
        };
    }
}

/**
 * кнопка показать ленты
 *
 * @constructor
 */
class ButtonRssController {
    constructor() {
        const rss = document.getElementById('rss');
        const textRss = rss.textContent;
        const msgAlert = document.getElementById('msgAlert');
        this._flagVisible = false;
        rss.onclick = this.click(textRss, this);
    }

    click(textButton, context) {
        return function() {
            if (!context.flagVisible) {
                while (this.msgAlert.hasChildNodes()) {
                    this.msgAlert.removeChild(msgAlert.lastChild);
                    rss.textContent = textButton;
                }
            } else {
                feedListView.view(feedsCollection.feed);
                rss.textContent = 'скрыть';
            }
        };
    }

    get flagVisible() {
        this._flagVisible = !this._flagVisible;
        return this._flagVisible;
    }
}
/**
 *  кнопка сортировки по названию
 */
class ButtonSortTitle {
    constructor() {
        const buttonSortTitle = document.getElementById('rssButtonSortTitle');
        const textarea = document.getElementById('textarea');
        buttonSortTitle.onclick = function() {
            while (textarea.hasChildNodes()) {
                textarea.removeChild(textarea.lastChild);
            }

            let sortTitle = function(one, two) {
                if (two.title < one.title) {
                    return -1;
                } else if (two.title > one.title) {
                    return 1;
                }
                return 0;
            };
            feedsCollection.visibleAllFeeds(sortTitle)
        }
    }
}

/**
 *  кнопка сортировки по дате публикации
 */
class ButtonSortDatePubl {
    constructor() {
        const buttonSortDatePubl = document.getElementById('rssButtonSortDatePubl');
        const textarea = document.getElementById('textarea');
        buttonSortDatePubl.onclick = function() {
            while (textarea.hasChildNodes()) {
                textarea.removeChild(textarea.lastChild);
            }
            let sortDatePubl = function(one, two) {
                return two.pubdatMs - one.pubdatMs;
            };
            feedsCollection.visibleAllFeeds(sortDatePubl);
        };
    }
}


let buttonAddFeeds = new ButtonAddController();
let buttonRss = new ButtonRssController();
let buttonSortTitle = new ButtonSortTitle();
let buttonSortDatePubl = new ButtonSortDatePubl();

buttonAddFeeds;
buttonRss;
buttonSortTitle;
buttonSortDatePubl;
