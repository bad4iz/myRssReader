/*
*  а) кратко опишите функциональность кода в виде комментариев в тексте. + сделано
*  б) укажите бизнес-задачу, которую решает данный код.
*  данный код отслеживает заходы на страницу, перехват ключевых факторов перехода и запись в куки
*  в) найдите ошибки в коде.
*  описано в коде
*  г) предложите варианты технической оптимизации кода
*  очень много ифЕлсов
*  провести декомпозицию
* */

(function() {
    var cookie_name = "scb_utmz";
    var url = document.location.href;  // не используется
    var path = "/"; // \
    var domain = "sovcombank.ru";
    var cookie_value = "";
    var duration = 182 * 24 * 60 * 600; // полгода как и __utmz // полгода помоему это 182 * 24 * 60 * 60 в обычном и в 182.5 * 24 * 60 * 60 высокосном
    // устанавливаются куки
    var setCookie = function(sKey, sValue, vEnd, sPath, sDomain, bSecure) { // много аргументов функции лучше передать обьект с полями
        // проверка соотверствия ключу
        if (!sKey || /^(?:expire|max\-age|path|domain|secure)$/i.test(sKey)) {
            return false;
        }
        var sExpires = "";
        if (vEnd) {
            //  выбираем по конструктору дату окончания хранения
            switch (vEnd.constructor) {
                case Number:
                    sExpires = vEnd === Infinity ? "; expires=Fri, 31 Dec 9999 23:59:59 GMT" : "; max-age=" + vEnd; // если не бесконечность то  max-age= vEnd  надо так  "; expires= vEnd"
                    break;
                case String:
                    sExpires = "; expires=" + vEnd; // переконвертировать vEnd  с проверкой в число или Объект типа Date
                    break;
                case Date:
                    sExpires = "; expires=" + vEnd.toUTCString();
                    break;
            }
        }
        document.cookie =  encodeURIComponent(sKey) + "=" +
            encodeURIComponent(sValue) + sExpires + (sDomain ? "; domain=" + sDomain : "") +
            (sPath ? "; path=" + sPath : "") + (bSecure ? "; secure" : "");
        return true;
    };

    // получение куки по имени
    function getCookie(cookieName){
        var name = cookieName + "=";
        // разбиваем строку в массив по ";"
        var cookieArray = document.cookie.split(';');
        for(var i = 0; i < cookieArray.length; i++){
            // удаляем пробелы с начала и конца строки
            var cookie = cookieArray[i].replace(/^\s+|\s+$/g, '');
            // если name стоит первым то возвращаем значение вырезанное из cookie
            if (cookie.indexOf(name) == 0){ return cookie.substring(name.length,cookie.length); }
        }
        return null;
    }; // ; тут можно не ставить

    // получить значение запроса по параметру
    var getUrlParameter = function(sParam) {
        // получаем строку запроса
        var sPageURL = window.location.search.substring(1);
        // разбиваем строку в массив
        var sURLVariables = sPageURL.split('&');
        for (var i = 0; i < sURLVariables.length; i++)  {
            // разбиваем строку в массив
            var sParameterName = sURLVariables[i].split('=');
            // если превый элемент равен запросу возвращаем второй элемент массива
            if (sParameterName[0] == sParam)  {
                return sParameterName[1];
            }
        }
        return "(not set)";
    };

    var organic_sources = [
        {
            pattern: "google",
            key: "q"
        },
        {
            pattern: "nova.rambler.ru",
            key: "query"
        },
        {
            pattern: "yahoo.com",
            key: "p"
        },
        {
            pattern: "aport.ru",
            key: "r"
        },
        {
            pattern: "go.mail.ru",
            key: "q"
        },
        {
            pattern: "nigma.ru",
            key: "s"
        },
        {
            pattern: "webalta.ru",
            key: "q"
        },
        {
            pattern: "aport.ru",
            key: "r"
        },
        {
            pattern: "poisk.ru",
            key: "text"
        },
        {
            pattern: "km.ru",
            key: "sq"
        },
        {
            pattern: "liveinternet.ru",
            key: "q"
        },
        {
            pattern: "quintura.ru",
            key: "request"
        },
        {
            pattern: "search.qip.ru",
            key: "query"
        },
        {
            pattern: "gde.ru",
            key: "keywords"
        },
        {
            pattern: "bing.com",
            key: "q"
        }
    ];

    // запись в куки
    var setSovcomCookie = function() {
        var gclid = getUrlParameter('gclid');
        var source = getUrlParameter('utm_source');
        var medium = getUrlParameter('utm_medium');
        var campaign = getUrlParameter('utm_campaign');
        var keyword = getUrlParameter('utm_term');
        var content = getUrlParameter('utm_content');

        if (gclid !== "(not set)") { // если gclid не пустое
            cookie_value = "utmgclid=" + gclid + "|utmccn=(not set)|utmcmd=(not set)";
            setCookie(cookie_name, cookie_value, duration, path, domain);
        }
        else if (source !== "(not set)") {// если utm_source не пустое
            cookie_value = "utmcsr=" + source + "|utmccn=" + campaign + "|utmcmd=" + medium + "|utmctr=" + keyword + "|utmcct=" + content;
            setCookie(cookie_name, cookie_value, duration, path, domain);
        }
        else if (document.referrer === "") { // если переходов небыло
            var c_value = getCookie(cookie_name); // получаем куки scb_utmz
            cookie_value = "utmcsr=(direct)|utmccn=direct|utmcmd=Direct";

            if (!c_value) { // если кук нет записываем по умолчанию
                setCookie(cookie_name, cookie_value, duration, path, domain);
            }
            else if (c_value.indexOf("(direct)") > -1) {  // здесь опять записываем по умолчанию даже если "(direct)" есть
                setCookie(cookie_name, cookie_value, duration, path, domain);
            }
            else {//  запись куки полученые из  getCookie(cookie_name)
                setCookie(cookie_name, c_value, duration, path, domain);
            }
        }
        else { // если был переход
            var ref = document.referrer; // получаем переход
            var isOrganic = false;
            // перебор масива organic_sources
            for (var i = 0; i < organic_sources.length; i++) {
                var s = organic_sources[i];
                // поиск вхождения элементов organic_sources в переходе
                if (ref.search(s.pattern) > -1) {
                    //  создаем регулярное выражение с ключом элемента organic_sources
                    var keywordPattern = new RegExp(s.key + "=([^&]+)");
                    // массив с результатами поиска по регулярки
                    var match = keywordPattern.exec(ref);
                    // если match из двух элементов запись второго в keyword
                    keyword = match && match.length == 2 ? match[1] : "(not set)" // надо точка с запятой
                    // подготовка куки
                    cookie_value = "utmcsr=" + s.pattern + "|utmccn=" + campaign + "|utmcmd=organic|utmctr=" + keyword + "|utmcct=" + content;
                    // запись в куки
                    setCookie(cookie_name, cookie_value, duration, path, domain);

                    isOrganic = true;
                    break;
                }
            }

            if (false === isOrganic && /^https?:\/\/sovcombank\.kr/.exec(ref) == null) { // вызовиться только если  /^https?:\/\/sovcombank\.kr/.exec(ref) будет null а
                // isOrganic будет false. выборка регулярки будет почти 100% null
                var arr_ref = ref.match(/^https?:\/\/(\w|\d|-|\.)*\.\w{2,24}/); // получение адреса
                cookie_value = "utmcsr=" + arr_ref[0] + "|utmccn=" + campaign + "|utmcmd=referral|utmctr=" + keyword + "|utmcct=" + content;
                setCookie(cookie_name, cookie_value, duration, path, domain);
            }
        }

        setCookie("__sovcom_sess", 1, 30 * 60, path, domain);   // запись в куки __sovcom_sess = 1 на 30 минут и непонятные числовые значеня лучше вынести в переменные
    };
    try {
        // вызов setSovcomCookie() если нет кук __sovcom_sess  и есть getUrlParameter = gclid или utm_source
        if (null === getCookie("__sovcom_sess") || getUrlParameter('gclid') !== "(not set)" || getUrlParameter('utm_source') !== "(not set)") { setSovcomCookie(); }
        // иначе просто запись в куки __sovcom_sess = 1 на 30 минут
        else { setCookie("__sovcom_sess", 1, 30 * 60, path, domain); }
    } catch (e) {}
})();
