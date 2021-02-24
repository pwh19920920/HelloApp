var host = "http://rk.miplus.cloud";
var version = "1.1.0"
var dbVersion = 4;
// var host = "http://192.168.3.9:8090";

var colors = ['blue','green','green-light','purple','orange','pink','blue-green']

function fixWhiteStatusBar(header){
    $api.fixStatusBar(header);
}

function randomColor(){
    var index = Math.floor((Math.random() * colors.length));
    return colors[index];
}

function haoping(type){
    try{
        talkingData.onEvent({
            eventId: "haoping"
        });
    } catch (e) {
        console.log(e.name + ": " + e.message);
    }
    if (api.systemType == 'android') {
        var mMarket = api.require('mMarket');
        var param = {
            pkg : 'me.hxyfj.rk'
        };
        mMarket.androidScore(param);
    } else {
        if (type == 1) {
            var mMarket = api.require('mMarket');
            var param = {
                appid : '1498444438'
            };
            mMarket.iosShowStar(param);
        } else {
            var mMarket = api.require('mMarket');
            var param = {
                appid : '1498444438'
            };
            mMarket.iosShowComment(param);
        }
    }
}

function saveUser(value){
    save("user", value)
}

function getUser(){
    return get("user")
}

function saveProgress(key, type, value){
    save("progress_" + get("subject") + "_" + type + "_" + key, value)
}

function getProgress(key, type){
    var progress = get("progress_" + get("subject") + "_" + type + "_" + key);
    if (progress == 1) {
        return null;
    }
    return progress;
}

function removeProgress(key){
    remove("progress" + key)
}

function save(key, value){
    if (typeof value === 'undefined') {
        value = ""
    }
    api.setPrefs({
        key: key,
        value: value
    });
}

function get(key, defaultVal){
    var value = api.getPrefs({
        sync: true,
        key: key
    });
    if (key == 'subject' && isEmpty(value)) {
        value = '1'
        save("subject","1")
    }
    if (isEmpty(value) && isNotEmpty(defaultVal)) {
        return defaultVal;
    }
    return value;
}

function remove(key){
    api.removePrefs({
        key: key
    });
}

function isNotEmpty(obj) {
    return !isEmpty(obj);
}

function isEmpty(obj) {
    if (obj === null) return true;
    if (typeof obj === 'undefined') {
        return true;
    }
    if (typeof obj === 'string') {
        if (obj === "" || obj == "<null>") {
            return true;
        }
    }
    return false;
}

function toastShort(msg, location){
    api.toast({
        msg: msg,
        duration: 1200,
        location: location ? location : 'middle'
    });
}

function toast(msg, location){
    api.toast({
        msg: msg,
        duration: 2000,
        location: location ? location : 'middle'
    });
}

function toastLong(msg, location){
    api.toast({
        msg: msg,
        duration: 4000,
        location: location ? location : 'middle'
    });
}

function toastLongLong(msg, location){
    api.toast({
        msg: msg,
        duration: 6000,
        location: location ? location : 'middle'
    });
}

function openHomeWin(module, option) {
    try{
        api.require('talkingData').onEvent({
            eventId: module
        });
    } catch (e) {
        console.log(e.name + ": " + e.message);
    }
    if (module == 'note' || module == 'collect' || module == 'book') {
        api.openWin({
            name: 'note',
            url: './note.html',
            pageParam: {
                module: module
            }
        });
    } else if (module == 'exam') {
        api.openWin({
            name: 'practice',
            url: './practice.html',
            pageParam: {
                module: module,
                title: '模拟测验'
            },
            allowEdit: true,
            slidBackEnabled: false
        });
    } else if (module == 'random') {
        api.openWin({
            name: 'condition',
            url: './condition.html',
        });
    } else {
        api.openWin({
            name: module,
            url: './' + module + '.html',
        });
    }
}

function openSettingWin(module, option) {
    try{
        api.require('talkingData').onEvent({
            eventId: module
        });
    } catch (e) {
        console.log(e.name + ": " + e.message);
    }
    api.openWin({
        name: module,
        url: '../setting/' + module + '.html',
    });
}

function loadWebView(type){
    loadWebView(type, false)
}

function loadWebView(type, scaleEnabled){
    var isTrack = true;

    var url;
    switch(type) {
        case 'scoreSearch':
            url = 'http://query.ruankao.org.cn/score/main';
            break;
        case 'certificateSearch':
            url = 'http://query.ruankao.org.cn/certificate/main';
            break;
        case 'problem':
            url = 'https://support.qq.com/product/76773';
            break;
        case 'guide':
            url = 'http://www.ruankao.org.cn/platform';
            break;
        default:
            isTrack = false;
            url = type;
            break;
    }
    if (isTrack) {
        api.require('talkingData').onEvent({eventId: "webview_" + type});
    }
    var browser = api.require('webBrowser');
    browser.open({
        url:url,
        titleBar:{
            bg: 'rgb(51,154,254)'
        },
        scaleEnabled:scaleEnabled
    });
}

function http(url, method, params, flag, successfn){
    if (flag) {
        api.showProgress({
            title: '努力加载中...',
            text: '请稍候...'
        });
    }

    params.c_data = getCommonRequest()
    params.tk = get("token")

    api.ajax({
        url : host + url,
        method: method,
        headers: {
            'c_data': getCommonRequest(),
            'tk': get("token")
        },
        data: {
            values: params,
        }
    }, function(ret, err) {
        // 隐藏进度框
        api.hideProgress();
        if (ret) {
            if(ret.code == 1){
                successfn(ret.data)
            } else if (ret.code == 46000) {
                saveUser("");
                remove("token")
            } else {
                toast(ret.message);
            }
        } else {
            toast(err.msg);
        }
    });
}

function httpByBody(url, method, body, flag, successfn){
    if (flag) {
        api.showProgress({
            title: '努力加载中...',
            text: '请稍候...'
        });
    }

    api.ajax({
        url : host + url,
        method: method,
        headers: {
            'c_data': getCommonRequest(),
            'tk': get("token"),
            'Content-Type': 'application/json'
        },
        data: {
            body: body,
        }
    }, function(ret, err) {
        // 隐藏进度框
        api.hideProgress();
        if (ret) {
            if(ret.code == 1){
                successfn(ret.data)
            } else if (ret.code == 46000) {
                saveUser("");
            } else {
                toast(ret.message);
            }
        } else {
            toast(err.msg);
        }
    });
}

function ajax(url, method, params, callback){
    params.c_data = getCommonRequest()
    params.tk = get("token")

    api.ajax({
        url : host + url,
        method: method,
        headers: {
            'c_data': getCommonRequest(),
            'tk': get("token")
        },
        data: {
            values: params,
        }
    }, function(ret, err) {
        callback(ret, err);
    });
}

function getCommonRequest(){
    var commonData = {};
    commonData.did = getDeviceId()
    commonData.ver = version
    commonData.device = api.deviceModel
    commonData.p = getPlatform();
    commonData.count = getCount();
    commonData.subject = get("subject")
    commonData.dbVer = get("dbVersion", dbVersion);

    return JSON.stringify(commonData);
}

function getDeviceId(){
    return get("deviceId", api.deviceId)
}

function getPlatform(){
    // return 2;
    return api.systemType == 'ios' ? 2 : 1;
}

function getCount(){
    return get("count", 0);
}

function randomString(){
    return Math.random().toString(36).substring(2);
}

function isAuditReal(){
    return get("isAuditReal") == true || get("isAuditReal") == "true";
}

function isAuditForViewHidden(){
    return get("isAuditForViewHidden") == true || get("isAuditForViewHidden") == "true";
}

function getAutoDeleteTimes(){
    var deleteChecked = get("delete_mode")
    if (deleteChecked == 1) {
        remove("delete_mode")
        save("autoDeleteTimes", 1);
        return 1;
    }
    return get("autoDeleteTimes", 0)
}

function openQuestionDetail(id){
    api.openWin({
        name: 'practice',
        url: './practice.html',
        pageParam: {
            condition: "id = " + id
        },
        allowEdit: true
    });
}

function openAuditWin(noAuditFunc, auditFunc){
    if (getPlatform() == 2) {
        if (isEmpty(get("isAuditReal"))) {
            http('/config/info', 'get', {}, false, function(data){
                if (data.isAudit) {
                    auditFunc();
                    return;
                }
            })
        } else if (isAuditReal()){
            auditFunc();
            return;
        }
    }
    noAuditFunc()
}

function loadStyle(url){
    var link = document.createElement('link');
    link.type = 'text/css';
    link.rel = 'stylesheet';
    link.href = url;
    var head = document.getElementsByTagName('head')[0];
    head.appendChild(link);
}

String.prototype.MD5 = function (bit)
{
    var sMessage = this;
    function RotateLeft(lValue, iShiftBits) { return (lValue<<iShiftBits) | (lValue>>>(32-iShiftBits)); }
    function AddUnsigned(lX,lY)
    {
        var lX4,lY4,lX8,lY8,lResult;
        lX8 = (lX & 0x80000000);
        lY8 = (lY & 0x80000000);
        lX4 = (lX & 0x40000000);
        lY4 = (lY & 0x40000000);
        lResult = (lX & 0x3FFFFFFF)+(lY & 0x3FFFFFFF);
        if (lX4 & lY4) return (lResult ^ 0x80000000 ^ lX8 ^ lY8);
        if (lX4 | lY4)
        {
            if (lResult & 0x40000000) return (lResult ^ 0xC0000000 ^ lX8 ^ lY8);
            else return (lResult ^ 0x40000000 ^ lX8 ^ lY8);
        } else return (lResult ^ lX8 ^ lY8);
    }
    function F(x,y,z) { return (x & y) | ((~x) & z); }
    function G(x,y,z) { return (x & z) | (y & (~z)); }
    function H(x,y,z) { return (x ^ y ^ z); }
    function I(x,y,z) { return (y ^ (x | (~z))); }
    function FF(a,b,c,d,x,s,ac)
    {
        a = AddUnsigned(a, AddUnsigned(AddUnsigned(F(b, c, d), x), ac));
        return AddUnsigned(RotateLeft(a, s), b);
    }
    function GG(a,b,c,d,x,s,ac)
    {
        a = AddUnsigned(a, AddUnsigned(AddUnsigned(G(b, c, d), x), ac));
        return AddUnsigned(RotateLeft(a, s), b);
    }
    function HH(a,b,c,d,x,s,ac)
    {
        a = AddUnsigned(a, AddUnsigned(AddUnsigned(H(b, c, d), x), ac));
        return AddUnsigned(RotateLeft(a, s), b);
    }
    function II(a,b,c,d,x,s,ac)
    {
        a = AddUnsigned(a, AddUnsigned(AddUnsigned(I(b, c, d), x), ac));
        return AddUnsigned(RotateLeft(a, s), b);
    }
    function ConvertToWordArray(sMessage)
    {
        var lWordCount;
        var lMessageLength = sMessage.length;
        var lNumberOfWords_temp1=lMessageLength + 8;
        var lNumberOfWords_temp2=(lNumberOfWords_temp1-(lNumberOfWords_temp1 % 64))/64;
        var lNumberOfWords = (lNumberOfWords_temp2+1)*16;
        var lWordArray=Array(lNumberOfWords-1);
        var lBytePosition = 0;
        var lByteCount = 0;
        while ( lByteCount < lMessageLength )
        {
            lWordCount = (lByteCount-(lByteCount % 4))/4;
            lBytePosition = (lByteCount % 4)*8;
            lWordArray[lWordCount] = (lWordArray[lWordCount] | (sMessage.charCodeAt(lByteCount)<<lBytePosition));
            lByteCount++;
        }
        lWordCount = (lByteCount-(lByteCount % 4))/4;
        lBytePosition = (lByteCount % 4)*8;
        lWordArray[lWordCount] = lWordArray[lWordCount] | (0x80<<lBytePosition);
        lWordArray[lNumberOfWords-2] = lMessageLength<<3;
        lWordArray[lNumberOfWords-1] = lMessageLength>>>29;
        return lWordArray;
    }
    function WordToHex(lValue)
    {
        var WordToHexValue="",WordToHexValue_temp="",lByte,lCount;
        for (lCount = 0;lCount<=3;lCount++)
        {
            lByte = (lValue>>>(lCount*8)) & 255;
            WordToHexValue_temp = "0" + lByte.toString(16);
            WordToHexValue = WordToHexValue + WordToHexValue_temp.substr(WordToHexValue_temp.length-2,2);
        }
        return WordToHexValue;
    }
    var x=Array();
    var k,AA,BB,CC,DD,a,b,c,d
    var S11=7, S12=12, S13=17, S14=22;
    var S21=5, S22=9 , S23=14, S24=20;
    var S31=4, S32=11, S33=16, S34=23;
    var S41=6, S42=10, S43=15, S44=21;
    // Steps 1 and 2. Append padding bits and length and convert to words
    x = ConvertToWordArray(sMessage);
    // Step 3. Initialise
    a = 0x67452301; b = 0xEFCDAB89; c = 0x98BADCFE; d = 0x10325476;
    // Step 4. Process the message in 16-word blocks
    for (k=0;k<x.length;k+=16)
    {
        AA=a; BB=b; CC=c; DD=d;
        a=FF(a,b,c,d,x[k+0], S11,0xD76AA478);
        d=FF(d,a,b,c,x[k+1], S12,0xE8C7B756);
        c=FF(c,d,a,b,x[k+2], S13,0x242070DB);
        b=FF(b,c,d,a,x[k+3], S14,0xC1BDCEEE);
        a=FF(a,b,c,d,x[k+4], S11,0xF57C0FAF);
        d=FF(d,a,b,c,x[k+5], S12,0x4787C62A);
        c=FF(c,d,a,b,x[k+6], S13,0xA8304613);
        b=FF(b,c,d,a,x[k+7], S14,0xFD469501);
        a=FF(a,b,c,d,x[k+8], S11,0x698098D8);
        d=FF(d,a,b,c,x[k+9], S12,0x8B44F7AF);
        c=FF(c,d,a,b,x[k+10],S13,0xFFFF5BB1);
        b=FF(b,c,d,a,x[k+11],S14,0x895CD7BE);
        a=FF(a,b,c,d,x[k+12],S11,0x6B901122);
        d=FF(d,a,b,c,x[k+13],S12,0xFD987193);
        c=FF(c,d,a,b,x[k+14],S13,0xA679438E);
        b=FF(b,c,d,a,x[k+15],S14,0x49B40821);
        a=GG(a,b,c,d,x[k+1], S21,0xF61E2562);
        d=GG(d,a,b,c,x[k+6], S22,0xC040B340);
        c=GG(c,d,a,b,x[k+11],S23,0x265E5A51);
        b=GG(b,c,d,a,x[k+0], S24,0xE9B6C7AA);
        a=GG(a,b,c,d,x[k+5], S21,0xD62F105D);
        d=GG(d,a,b,c,x[k+10],S22,0x2441453);
        c=GG(c,d,a,b,x[k+15],S23,0xD8A1E681);
        b=GG(b,c,d,a,x[k+4], S24,0xE7D3FBC8);
        a=GG(a,b,c,d,x[k+9], S21,0x21E1CDE6);
        d=GG(d,a,b,c,x[k+14],S22,0xC33707D6);
        c=GG(c,d,a,b,x[k+3], S23,0xF4D50D87);
        b=GG(b,c,d,a,x[k+8], S24,0x455A14ED);
        a=GG(a,b,c,d,x[k+13],S21,0xA9E3E905);
        d=GG(d,a,b,c,x[k+2], S22,0xFCEFA3F8);
        c=GG(c,d,a,b,x[k+7], S23,0x676F02D9);
        b=GG(b,c,d,a,x[k+12],S24,0x8D2A4C8A);
        a=HH(a,b,c,d,x[k+5], S31,0xFFFA3942);
        d=HH(d,a,b,c,x[k+8], S32,0x8771F681);
        c=HH(c,d,a,b,x[k+11],S33,0x6D9D6122);
        b=HH(b,c,d,a,x[k+14],S34,0xFDE5380C);
        a=HH(a,b,c,d,x[k+1], S31,0xA4BEEA44);
        d=HH(d,a,b,c,x[k+4], S32,0x4BDECFA9);
        c=HH(c,d,a,b,x[k+7], S33,0xF6BB4B60);
        b=HH(b,c,d,a,x[k+10],S34,0xBEBFBC70);
        a=HH(a,b,c,d,x[k+13],S31,0x289B7EC6);
        d=HH(d,a,b,c,x[k+0], S32,0xEAA127FA);
        c=HH(c,d,a,b,x[k+3], S33,0xD4EF3085);
        b=HH(b,c,d,a,x[k+6], S34,0x4881D05);
        a=HH(a,b,c,d,x[k+9], S31,0xD9D4D039);
        d=HH(d,a,b,c,x[k+12],S32,0xE6DB99E5);
        c=HH(c,d,a,b,x[k+15],S33,0x1FA27CF8);
        b=HH(b,c,d,a,x[k+2], S34,0xC4AC5665);
        a=II(a,b,c,d,x[k+0], S41,0xF4292244);
        d=II(d,a,b,c,x[k+7], S42,0x432AFF97);
        c=II(c,d,a,b,x[k+14],S43,0xAB9423A7);
        b=II(b,c,d,a,x[k+5], S44,0xFC93A039);
        a=II(a,b,c,d,x[k+12],S41,0x655B59C3);
        d=II(d,a,b,c,x[k+3], S42,0x8F0CCC92);
        c=II(c,d,a,b,x[k+10],S43,0xFFEFF47D);
        b=II(b,c,d,a,x[k+1], S44,0x85845DD1);
        a=II(a,b,c,d,x[k+8], S41,0x6FA87E4F);
        d=II(d,a,b,c,x[k+15],S42,0xFE2CE6E0);
        c=II(c,d,a,b,x[k+6], S43,0xA3014314);
        b=II(b,c,d,a,x[k+13],S44,0x4E0811A1);
        a=II(a,b,c,d,x[k+4], S41,0xF7537E82);
        d=II(d,a,b,c,x[k+11],S42,0xBD3AF235);
        c=II(c,d,a,b,x[k+2], S43,0x2AD7D2BB);
        b=II(b,c,d,a,x[k+9], S44,0xEB86D391);
        a=AddUnsigned(a,AA); b=AddUnsigned(b,BB); c=AddUnsigned(c,CC); d=AddUnsigned(d,DD);
    }
    if(bit==16) {
        return WordToHex(b)+WordToHex(c);
    } else {
        return WordToHex(a)+WordToHex(b)+WordToHex(c)+WordToHex(d);
    }
}

String.prototype.format = function(args) {
    var result = this;
    if (arguments.length > 0) {
        if (arguments.length == 1 && typeof (args) == "object") {
            for (var key in args) {
                if(args[key]!=undefined){
                    var reg = new RegExp("({" + key + "})", "g");
                    result = result.replace(reg, args[key]);
                }
            }
        }
        else {
            for (var i = 0; i < arguments.length; i++) {
                if (arguments[i] != undefined) {
                    var reg = new RegExp("({)" + i + "(})", "g");
                    result = result.replace(reg, arguments[i]);
             }
          }
       }
   }
   return result;
}

Array.prototype.indexOf = function(val) {
    for (var i = 0; i < this.length; i++) {
        if (this[i] == val) return i;
    }
    return -1;
};

Array.prototype.remove = function(val) {
    var index = this.indexOf(val);
    if (index > -1) {
        this.splice(index, 1);
    }
};
