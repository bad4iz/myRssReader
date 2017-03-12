/**
 * Created by bad4iz on 09.03.2017.
 */
'use strict';
// Создаётся объект promise
// (function () {
//     window.App = {
//         Models:{},
//         Views:{},
//         Collections:{}
//     };
//
//     App.Models.Rss = Backbone.Model.extend({
//         defaults:{
//             title:'',
//             description: '',
//             url: ''
//         },
//         // urlRoot: '/rssreader.php'
//     });
//
//     App.Collections.RssCollection = Backbone.Collection.extend({
//         model:   App.Models.Rss,
//         url: '/rssreader.php'
//     })
//
//
//
//
// }());

//
// var xhr = new XMLHttpRequest();
//
// // 2. Конфигурируем его: GET-запрос на URL 'phones.json'
// xhr.open('GET', 'http://4pda.ru/feed/rss', false);
//
// // 3. Отсылаем запрос
// xhr.send();
//
// // 4. Если код ответа сервера не 200, то это ошибка
// if (xhr.status != 200) {
//     // обработать ошибку
//     alert( xhr.status + ': ' + xhr.statusText ); // пример вывода: 404: Not Found
// } else {
//     // вывести результат
//     document.write( xhr.responseText ); // responseText -- текст ответа.
// }
//

let swing = false;


const addRssButton = document.getElementById('addRssButton');
const rssButton = document.getElementById('rssButton');
const rssButtonSortTitle = document.getElementById('rssButtonSortTitle');
const rssButtonSortDatePubl = document.getElementById('rssButtonSortDatePubl');
const updateRss = document.getElementById('updateRss');
const ss = document.getElementById('rss');
ss.onclick = function () {
    arrRss.forEach(item=>console.log(item));
};

const textRss = document.getElementById('rssText');
const msgAlert = document.getElementById('msgAlert');
const textarea = document.getElementById('textarea');

let arrRss = [];
let arrFeedRss = [];

class Rss {
    constructor (url){
        this.rssUrl = url;
    }
    getRssUrl(){
        return this.rssUrl;
    }
}

arrRss.push(new Rss('http://www.dailymail.co.uk/home/index.rss'));
arrRss.push(new Rss('http://4pda.ru/feed/rss'));

addRssButton.onclick = function () {
    if(textRss.value &&  /^http/i.test(textRss.value)){
        console.log('addRssButton');
        arrRss.push(new Rss(textRss.value));
        console.log(arrRss);
        console.log(arrFeedRss);
        textRss.value = '';
    }
};

// показать
rssButton.onclick = function () {
    textarea.innerHTML = '';
    arrFeedRss.forEach(item => item.views());
    console.log('показать');
};

rssButtonSortTitle.onclick = function () {
    textarea.innerHTML = '';
    arrFeedRss.sort(ItemRss.sortTitle);
    arrFeedRss.forEach(item => item.views());
    console.log('rssButtonSortTitle');
};

rssButtonSortDatePubl.onclick = function () {
    textarea.innerHTML = '';
    arrFeedRss.sort(ItemRss.sortDate);
    arrFeedRss.forEach(item => item.views());
  console.log('rssButtonSortDatePubl');
};

// обновить
updateRss.onclick = function () {
    textarea.innerHTML = '';
    arrRss = [];
    arrRss.forEach(rss => getPromRss(rss.getRssUrl()));
    arrFeedRss.forEach(item => item.views());
    console.log('обновить');
};

function superFeedsUpdate() {

}

function getFeedRss(url) {
    return new Promise((resolve, reject) => {
        feednami.load(url, function (result) {
            if (result.error) {
                reject(result.error);
            }
            else {
                let entries = result.feed.entries;
                resolve(entries);
            }
        })
    });
}

function getPromRss(url) {
    let feedRss = getFeedRss(url);
    feedRss
        .then(
            entries => {
                arrRss = entries;
                for (let entry of entries) {
                    let itemRss = new ItemRss(entry.title, entry.summary, entry.link, entry.pubdate);
                    arrFeedRss.push(itemRss);
                }
                // console.log(entries);
                arrFeedRss.sort(ItemRss.sortDate);
                arrFeedRss.forEach(item => item.views())
            },
            error => {
                console.log("Ошибка: " + error);
                msgAlert.innerHTML = "Ошибка: Проверте адресс! Скорей всего он не правильный "; // error - аргумент reject
            }
        );
}



class ItemRss {
    constructor(title, discription, url,date) {
        this.parentRss = document.querySelector('#textarea');
        this.title = title;
        this.discription = discription;
        this.url = url;
        this.date = Date.parse(date);
        this.time = new Date(this.date)
    }
    views (){
        let div = document.createElement('div');
        div.className = "itemRss";

        let p = document.createElement('p');
        let a = document.createElement('a');
        a.href = `${this.url}`;
        a.innerHTML = `${this.title}`;

        div.appendChild(a);
        p.innerHTML = `${this.discription} <sub>${this.time.getDate()+ "." +this.time.getMonth() + "  " +this.time.getHours() + ":" + this.time.getMinutes() + ":" + this.time.getSeconds()}</sub>`;
        div.appendChild(p);

        // div.innerHTML = `<p>Ура!</p> ${this.title}`;
        this.parentRss.appendChild(div);
    }
}
ItemRss.sortDate = function (a, b) {
    return a.date - b.date;
};

ItemRss.sortDateRevers = function (a, b) {
    return b.date - a.date;
};

ItemRss.sortTitle = function (a, b) {
    return a.title - b.title;
};

window.onload = function () {
    textarea.innerHTML = '';
    console.log('обновить');
    // arrFeedRss.forEach(item => item.views());
    console.log('показать');
    arrRss.forEach(rss => getPromRss(rss.getRssUrl()));
};