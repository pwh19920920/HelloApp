function initData(){
    subject = get("subject");
    talkingData = api.require('talkingData');
    db = api.require('db');
    
    openDatabase();
}

function changeSubject(){
    $api.text($api.byId('subject'), subjectName[subject])
    expandArray = []
}

function openDatabase(){
    var isExist = updateDb()
    var name = getDbName();
    if (!isOpenDatabase) {
        openDataBase(name, isExist)
    } else {
        showIndex();
    }
}

function openDataBase(name, isExist){
    db.openDatabase({
        name: 'rk',
        path: 'box://res/' + name + '.db'
        // path: 'box://res/9.db'
        // path: 'box://res/5_20180121/5.db'
    }, function(ret, err) {
        if (ret.status) {
            isOpenDatabase = true;
            if (isExist) {
                showIndex();
            } else {
                setTimeout(function(){
                    showIndex();
                }, 1000)
            }
        } else {
            alert("openDB:" + JSON.stringify(err));
        }
    });
}


function showIndex() {
    showSectionList()
    var condition = 'subject = ' + subject
    db.selectSql({
        name: 'rk',
        sql: 'SELECT count(*) as count FROM question where type = 1 and ' + condition
    }, function(ret, err) {
        if (ret.status) {
            var sum = ret.data[0].count

            db.selectSql({
                name: 'rk',
                sql: 'SELECT count(*) as count FROM question where finish != 0 and ' + condition
            }, function(ret, err) {
                if (ret.status) {
                    $api.text($api.byId('finish'), ret.data[0].count);
                    // 计算百分比
                    var percent = $api.text($api.byId('finish')) / sum * 1000;
                    if (sum == 0) {
                        percent = 0
                    }
                    percent = eval(Math.round(percent) / 10);

                    $api.text($api.byId('rate'), percent  + "%");

                    save("count", ret.data[0].count)
                } else {
                    alert(JSON.stringify(err));
                }
            });
        } else {
            alert("error251:" + JSON.stringify(err));
        }
    });
    db.selectSql({
        name: 'rk',
        sql: 'SELECT count(*) as count FROM question where finish > 0 and finish != wrong and ' + condition
    }, function(ret, err) {
        if (ret.status) {
            $api.text($api.byId('true'), ret.data[0].count + '道');
        } else {
            alert("error262:" + JSON.stringify(err));
        }
    });
    db.selectSql({
        name: 'rk',
        sql: 'select * from config where config_key = "dbVersion"'
    }, function(ret, err) {
        if (ret.status) {
            var dbVersion = ret.data[0].config_value;
            if (isNotEmpty(dbVersion) && dbVersion > 0) {
                save("dbVersion", dbVersion)
            }
        }
    });
}

function begHaoping(){
    if (isNotEmpty(get("haopingV2"))) {
        return;
    }
    setTimeout(function(){
        var buttons = api.systemType == 'android' ? ['喜欢，五星好评！', '不喜欢，去吐槽！'] : ['喜欢，五星好评！', '不喜欢，去吐槽！', '随便逛逛'];
        api.confirm({
            msg: '嗨~亲~\n你觉得软考通好用吗？\n如果还行，就为我点个赞吧~',
            buttons: buttons
        }, function(ret, err) {
            if (ret.buttonIndex == 1) {
                save("haopingV2", 1);
                haoping(1);
            } else if (ret.buttonIndex == 2) {
                save("haopingV2", 1);
                api.openWin({
                    name: 'feedback',
                    url: '../setting/feedback.html'
                });
            }
        });
    }, 1500)
}


function privacy(){
    if (isNotEmpty(get("privacy"))) {
        return;
    }
    if (getPlatform() == 2) {
        return;
    }
    layer.open({
        type: 1,
        content: $api.html($api.byId('privacy')),
        anim: 'up',
        shadeClose: false,
        style: 'position: fixed;bottom: 38%;left: 12%;width: 76%;background: #fff;border-radius: 12px;border: 1px solid #EBEEF5;',
        success: function(){
            api.sendEvent({
                name: 'shadowShow',
                extra: {
                    show: true
                }
            });
        },  
        end: function(){
            api.sendEvent({
                name: 'shadowShow',
                extra: {
                    show: false
                }
            });
        }
    })
}

function privacyChoose(type){
    if (type == 1) {
        api.closeWidget({
            silent: true
        });
    } else if (type == 2) {
        save("privacy", 1);
        layer.closeAll();
    }
}
