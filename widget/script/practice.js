function exam(){
    var content = "您确定要交卷吗？"
    for (var i = 0; i < list.length; i++) {
        if (list[i].finished != 1) {
            content = "您还有题目未答，确定要交卷吗？";
            break;
        }
    }
    api.confirm({
        title: '温馨提示',
        msg: content,
        buttons: ['确定', '取消']
    }, function(ret, err) {
        var index = ret.buttonIndex;
        if (index == 1) {
            grading();
        }
    });
}

function grading(){
    var score = 0
    for (var i = 0; i < list.length; i++) {
        if (!isEmpty(list[i].exam_answer)) {
            finish(list[i].exam_answer, i);
            list[i].finish = eval(list[i].finish) + 1;

            if (list[i].answer == list[i].exam_answer) {
                score++;
                autoDeleteQuestion(i)
            } else {
                note(list[i].id)
                list[i].wrong = eval(list[i].wrong) + 1;
            }
        }
    }
    var seconds = totalTime - time
    
    var records = get("noSubmitRecords")
    records = isEmpty(records) ? [] : JSON.parse(records)
    records.push({"score": score, "seconds": seconds})
    save('noSubmitRecords', records)

    ajax('/record/save', 'post', {"score": score, "seconds": seconds}, function(ret, err){
        if (ret && ret.code == 1) {
            records.pop()
            save('noSubmitRecords', records)
        }
    });
    api.openWin({
        name: 'result',
        url: './result.html',
        pageParam: {
            score: score,
            time: seconds,
            data: list
        },
        reload: true
    });
    talkingData.onEvent({
        eventId: "exam_score",
        parameters: {
            score: score,
            subject: subject
        }
    });

    setTimeout(function () {
        api.closeWin({name:'practice'});
        api.sendEvent({name: 'homeUpdate'});
        api.sendEvent({name: 'note_update'});
    }, 1000);
}

function jumpMode(){
    if (jumpChecked == 1) {
        jumpChecked = 0;
    } else {
        jumpChecked = 1;
    }
    save('jump_mode', jumpChecked);
    talkingData.onEvent({
        eventId: "mode_jump",
        parameters: {
            checked: jumpChecked
        }
    });
}

function randomMode(){
    if (randomChecked == 1) {
        randomChecked = 0;
    } else {
        randomChecked = 1;
        toastLong("Tips：\n顺序打乱功能需要重新进入练习界面才能生效哦~")
    }
    save('random_mode', randomChecked);
    talkingData.onEvent({
        eventId: "mode_random",
        parameters: {
            checked: randomChecked
        }
    });
}

function popup(){
    layerIndex = layer.open({
        type: 1,
        content: $api.html($api.byId('card')),
        anim: 'up',
        style: 'position:fixed; bottom:0; left:0; width: 100%; height: 310px; padding:0 0 10px; border:none;border-radius: 10px 10px 0 0;',
        success: function(){
            $api.addCls($api.dom('html'), 'overflow-hidden');
            $api.addCls($api.dom('body'), 'overflow-hidden');
        },  
        end: function(){
            $api.removeCls($api.dom('html'), 'overflow-hidden');
            $api.removeCls($api.dom('body'), 'overflow-hidden');
        }
    });
}

function checked(e, option){
    if (module == "exam") {
        examChecked(e, option)
        return;
    }
    var parent = $api.closest(e, '.question');
    var answer = list[mySwiper.realIndex].answer;
    list[mySwiper.realIndex].finished = 1;
    // 正确与否
    list[mySwiper.realIndex].isTrue = option == answer;
    if (list[mySwiper.realIndex].isTrue) {
        $api.attr($api.first(e, 'img'), "src", "../../image/ic_exam_answer_true" + nightImgName + ".png");
        $api.text($api.byId('true_count'),eval($api.text($api.byId('true_count'))) + 1);

        $api.addCls($api.eq($api.byId('card_list'), mySwiper.realIndex + 1),'true-index');
        
        autoDeleteQuestion();

        if(jumpChecked == 1){
            setTimeout(function () {
                mySwiper.slideNext();
            }, 400);
        }
    } else {
        $api.attr($api.first(e, 'img'), "src", "../../image/ic_exam_answer_false" + nightImgName + ".png");
        $api.attr($api.first($api.domAll(parent, 'p.option')[answer.charCodeAt() - 65], 'img'), "src", "../../image/ic_exam_answer_true" + nightImgName + ".png");
        $api.text($api.byId('false_count'),eval($api.text($api.byId('false_count'))) + 1);
        
        $api.addCls($api.eq($api.byId('card_list'), mySwiper.realIndex + 1),'false-index');
        // 添加错题
        note();
    }
    $api.addCls(parent, 'show-answer')
    // 记录已答题
    finish(option);
    // 设置高度
    initCurrentHeight()
    // 修改试题统计
    insidestatistics()
    // 记录做题进度
    if (isNotEmpty(api.pageParam.section)) {
        saveProgress(api.pageParam.section, api.pageParam.type, mySwiper.realIndex + 1)
    }
}

function operateSubmit(e){
    var parent = $api.closest(e, '.question');
    list[mySwiper.realIndex].finished = 1;
    // 正确与否
    $api.text($api.byId('true_count'),eval($api.text($api.byId('true_count'))) + 1);
    $api.addCls($api.eq($api.byId('card_list'), mySwiper.realIndex + 1),'true-index');
 
    $api.addCls(parent, 'show-answer')
    // 记录已答题
    finish('');
    // 设置高度
    initCurrentHeight()
    // 修改试题统计
    insidestatistics()
    // 记录做题进度
    if (isNotEmpty(api.pageParam.section)) {
        saveProgress(api.pageParam.section, api.pageParam.type, mySwiper.realIndex + 1)
    }
}

function examChecked(e, option){
    var parent = $api.closest(e, '.question');
    var answer = list[mySwiper.realIndex].answer;
    if (list[mySwiper.realIndex].finished != 1) {
        $api.attr($api.first($api.domAll(parent, 'p.option')[0], 'img'), "src", "../../image/ic_exam_a_normal" + nightImgName + ".png");
        $api.attr($api.first($api.domAll(parent, 'p.option')[1], 'img'), "src", "../../image/ic_exam_b_normal" + nightImgName + ".png");
        $api.attr($api.first($api.domAll(parent, 'p.option')[2], 'img'), "src", "../../image/ic_exam_c_normal" + nightImgName + ".png");
        $api.attr($api.first($api.domAll(parent, 'p.option')[3], 'img'), "src", "../../image/ic_exam_d_normal" + nightImgName + ".png");
        $api.attr($api.first(e, 'img'), "src", "../../image/ic_exam_" + option.toLowerCase() + "_pressed" + nightImgName + ".png");
        
        $api.addCls($api.eq($api.byId('card_list'), mySwiper.realIndex + 1),'checked-index');
        // 记录已答题
        list[mySwiper.realIndex].exam_answer = option;
        list[mySwiper.realIndex].finished = 1;

        // 考试做到最后一题提醒交卷
        if (module == "exam" && mySwiper.realIndex == list.length - 1) {
            var isAllFinished = true;
            for (var i = 0; i < list.length; i++) {
                if (list[i].finished != 1) {
                    isAllFinished = false;
                    break;
                }
            }
            if (isAllFinished) {
                api.confirm({
                    title: '温馨提示',
                    msg: "您已经做到最后一题，是否需要立即交卷？",
                    buttons: ['交卷', '再等等']
                }, function(ret, err) {
                    var index = ret.buttonIndex;
                    if (index == 1) {
                        grading();
                    }
                });
            }
        }
        if(jumpChecked == 1){
            setTimeout(function () {
                mySwiper.slideNext();
            }, 400);
        }
    } else {
        $api.attr($api.first(e, 'img'), "src", "../../image/ic_exam_" + option.toLowerCase() + "_normal" + nightImgName + ".png");
       
        $api.removeCls($api.eq($api.byId('card_list'), mySwiper.realIndex + 1),'checked-index');
        list[mySwiper.realIndex].exam_answer = null;
        list[mySwiper.realIndex].finished = 0;
    }
}

// index从1开始
function showPage(){
    var nowIndex = isEmpty(mySwiper) ? 1 : mySwiper.realIndex + 1;
    // 设置高度
    initCurrentHeight()

    $api.text($api.byId('count'),nowIndex + '/' + list.length);
    for (var i = 1; i < list.length + 1; i++) {
        $api.removeCls($api.eq($api.byId('card_list'), i), 'current-index');
    }
    $api.addCls($api.eq($api.byId('card_list'), nowIndex), 'current-index');
    // 收藏
    if (list[nowIndex - 1].collect == 0) {
        $api.attr($api.byId('collect_img'),'src','../../image/ic_star_normal' + nightImgName + '.png');
        $api.attr($api.byId('collect_img_note'),'src','../../image/ic_star_normal' + nightImgName + '.png');
    } else {
        $api.attr($api.byId('collect_img'),'src','../../image/ic_star_pressed' + nightImgName + '.png');
        $api.attr($api.byId('collect_img_note'),'src','../../image/ic_star_pressed' + nightImgName + '.png');
    }

    // 记录做题进度(专项全真练习时会传sectionLong,平时为1)
    if (isNotEmpty(api.pageParam.section) && mode == 2) {
        // 进度从1开始
        saveProgress(api.pageParam.section, api.pageParam.section, nowIndex)
    }
}

function insidestatistics(isTrue){
    var i = mySwiper.realIndex;
    var e = getCurrentElement("question");
    list[i].finish = eval(list[i].finish) + 1;
    if (!list[i].isTrue) {
        list[i].wrong = eval(list[i].wrong) + 1
    }
    $api.text(getCurrentElement("statistics-finish-count"),list[i].finish);
    $api.text(getCurrentElement("statistics-wrong-count"),list[i].wrong);
}

// 错题移除才会调用
function reStatistics(){
    if (list.length == 0) {
        goback()
        return;
    }
    var trueCount = 0;
    var falseCount = 0;
    for (var i = 0; i < list.length; i++) {
        if (isNotEmpty(list[i].isTrue)) {
            if (list[i].isTrue) {
                trueCount++;
            } else {
                falseCount++;
            }
        }
    }
    $api.text($api.byId('true_count'),trueCount);
    $api.text($api.byId('false_count'),falseCount);
 
    initCardView();
    showPage()
}

function initCardView(){
    $api.html($api.byId('card_list'),"")
    var cardHtml = "";
    for (var i = 0; i < list.length; i++) {
        var className = "";
        // 错题移除才有的逻辑
        if (isNotEmpty(list[i].isTrue)) {
            className = list[i].isTrue ? " true-index" : " false-index";
        }
        cardHtml += '<li class="aui-col-xs-2' + className + '" onclick="jump(' + eval(i+1) + ')"><div><span>' + eval(i+1) + '</span></div></li>';
    }
    // 答题卡边距
    for (var i = 0; i < 12; i++) {
        cardHtml += '<li class="aui-col-xs-2"><div class="margin" style="{0}"></div></li>';
    }

    $api.append($api.byId('card_list'), cardHtml);
}

function collect(){
    // 添加收藏
    if (list[mySwiper.realIndex].collect == 0) {
        db.executeSql({
            name: 'rk',
            sql: 'update question set collect = 1, collect_time = {0} where id = {1}'.format(new Date().getTime(), list[mySwiper.realIndex].id)
        }, function(ret, err) {
            if (ret.status) {
                toastShort('收藏成功', 'button')

                list[mySwiper.realIndex].collect = 1;
            
                $api.attr($api.byId('collect_img'),'src','../../image/ic_star_pressed' + nightImgName + '.png');
                $api.attr($api.byId('collect_img_note'),'src','../../image/ic_star_pressed' + nightImgName + '.png');
            } else {
                alert(JSON.stringify(err));
            }
        });
    } else { // 删除收藏
        db.executeSql({
            name: 'rk',
            sql: 'update question set collect = 0 where id =' + list[mySwiper.realIndex].id
        }, function(ret, err) {
            if (ret.status) {
                toastShort('取消收藏', 'button')

                list[mySwiper.realIndex].collect = 0;
                
                $api.attr($api.byId('collect_img'),'src','../../image/ic_star_normal' + nightImgName + '.png');
                $api.attr($api.byId('collect_img_note'),'src','../../image/ic_star_normal' + nightImgName + '.png');
            } else {
                alert(JSON.stringify(err));
            }
        });
    }
}

function finish(option, i){
    if (isEmpty(i)) {
        i = mySwiper.realIndex;
    }
    // 错题模式下记录已做题
    list[i].note_answer = option;
    if (randomChecked == 1) {
        option = arr[arrFinal.indexOf(option)]
    }
    db.executeSql({
        name: 'rk',
        sql: 'update question set finish = finish + 1, temp_answer = "' + option + '" where id =' + list[i].id
    }, function(ret, err) {
        if (ret.status) {
        } else {
            alert(JSON.stringify(err));
        }
    });
}

function note(id){
    if (isEmpty(id)) {
        id = list[mySwiper.realIndex].id;
    }
    db.executeSql({
        name: 'rk',
        sql: 'update question set note = 1, wrong = wrong + 1, note_time = {0} where id = {1}'.format(new Date().getTime(), id) 
    }, function(ret, err) {
        if (ret.status) {

        } else {
            alert(JSON.stringify(err));
        }
    });
}

function deleteQuestion(flag){
    var index = mySwiper.realIndex;
    if (list.length == 0 || index >= list.length) {
        return;
    }
    db.executeSql({
        name: 'rk',
        sql: 'update question set note = 0 where id =' + list[index].id
    }, function(ret, err) {
        if (ret.status) {
            if (flag) {
                mySwiper.removeSlide(index)
                list.splice(index, 1)
                reStatistics()
                toast('错题已移除', 'button')
            }
        } else {
            alert(JSON.stringify(err));
        }
    });
}

 function showFinishedAnswer(index, option, flag){
    var parent = mySwiper.slides[index];
    var e = $api.domAll(parent, 'p.option')[option.charCodeAt() - 65];
    var answer = list[index].answer;
    list[index].finished = 1;

    if (isEmpty(option)) {
        return;
    }
    if (option == answer && flag) {
        $api.attr($api.first(e, 'img'), "src", "../../image/ic_exam_answer_true" + nightImgName + ".png");
        $api.text($api.byId('true_count'),eval($api.text($api.byId('true_count'))) + 1);
        
        $api.addCls($api.eq($api.byId('card_list'), index + 1),'true-index');
    } else {
        $api.attr($api.first(e, 'img'), "src", "../../image/ic_exam_answer_false" + nightImgName + ".png");
        $api.attr($api.first($api.domAll(parent, 'p.option')[answer.charCodeAt() - 65], 'img'), "src", "../../image/ic_exam_answer_true" + nightImgName + ".png");
        $api.text($api.byId('false_count'),eval($api.text($api.byId('false_count'))) + 1);
        
        $api.addCls($api.eq($api.byId('card_list'), index + 1),'false-index');
    }
    $api.addCls(parent, 'show-answer')
    // 设置高度
    initCurrentHeight()
}

function rem(){
     api.openWin({
        name: 'save_rem',
        url: './save_rem.html',
        pageParam: {
            index: mySwiper.realIndex,
            id: list[mySwiper.realIndex].id,
            rem: list[mySwiper.realIndex].rem
        },
        allowEdit: true,
    });
}

function operateBuy(){
    api.openWin({
        name: 'vip',
        url: '../soft/soft_frame.html'
    });
}

function copyAnalysis(){
    if (list[mySwiper.realIndex].type != 1) {
        return;
    }
    var curSecond = (new Date().getTime()) / 1000;
    if (Math.abs(curSecond - backSecond) > 2) {
        backSecond = curSecond;

        if (Math.floor(Math.random() * 100 + 1 < 10)) {
            api.toast({
                msg: "小技巧：快速双击可以自动复制解析哦~",
                duration: 1200,
                location: 'bottom'
            });
        }
    } else {
        try {
            var content = $api.text(getCurrentElement("analysis_content"));
            content = content.replace(/【解析】/g, "");
            var clipBoard = api.require('clipBoard');
            clipBoard.set({
                value: content
            }, function(ret, err) {
                backSecond = 0;

                api.toast({
                    msg: "解析一键复制成功~",
                    duration: 1200,
                    location: 'bottom'
                });
            });
        } catch (e) {
            console.log(e.name + ": " + e.message);
        }
    }
}

function replaceRandom(analysis, arr, arrFinal){
    if (subject != 1) {
        return analysis;
    }

    analysis = analysis.replace(/答案为A/g, "答案为##" + arrFinal[arr.indexOf('A')] + "##");
    analysis = analysis.replace(/答案为B/g, "答案为##" + arrFinal[arr.indexOf('B')] + "##");
    analysis = analysis.replace(/答案为C/g, "答案为##" + arrFinal[arr.indexOf('C')] + "##");
    analysis = analysis.replace(/答案为D/g, "答案为##" + arrFinal[arr.indexOf('D')] + "##");
    analysis = analysis.replace(/A为正确/g, "##" + arrFinal[arr.indexOf('A')] + "##为正确");
    analysis = analysis.replace(/B为正确/g, "##" + arrFinal[arr.indexOf('B')] + "##为正确");
    analysis = analysis.replace(/C为正确/g, "##" + arrFinal[arr.indexOf('C')] + "##为正确");
    analysis = analysis.replace(/D为正确/g, "##" + arrFinal[arr.indexOf('D')] + "##为正确");
    analysis = analysis.replace(/答案是A/g, "答案是##" + arrFinal[arr.indexOf('A')] + "##");
    analysis = analysis.replace(/答案是B/g, "答案是##" + arrFinal[arr.indexOf('B')] + "##");
    analysis = analysis.replace(/答案是C/g, "答案是##" + arrFinal[arr.indexOf('C')] + "##");
    analysis = analysis.replace(/答案是D/g, "答案是##" + arrFinal[arr.indexOf('D')] + "##");
    analysis = analysis.replace(/选项为A/g, "选项为##" + arrFinal[arr.indexOf('A')] + "##");
    analysis = analysis.replace(/选项为B/g, "选项为##" + arrFinal[arr.indexOf('B')] + "##");
    analysis = analysis.replace(/选项为C/g, "选项为##" + arrFinal[arr.indexOf('C')] + "##");
    analysis = analysis.replace(/选项为D/g, "选项为##" + arrFinal[arr.indexOf('D')] + "##");
    analysis = analysis.replace(/选项是A/g, "选项是##" + arrFinal[arr.indexOf('A')] + "##");
    analysis = analysis.replace(/选项是B/g, "选项是##" + arrFinal[arr.indexOf('B')] + "##");
    analysis = analysis.replace(/选项是C/g, "选项是##" + arrFinal[arr.indexOf('C')] + "##");
    analysis = analysis.replace(/选项是D/g, "选项是##" + arrFinal[arr.indexOf('D')] + "##");
    analysis = analysis.replace(/选A/g, "选##" + arrFinal[arr.indexOf('A')] + "##");
    analysis = analysis.replace(/选B/g, "选##" + arrFinal[arr.indexOf('B')] + "##");
    analysis = analysis.replace(/选C/g, "选##" + arrFinal[arr.indexOf('C')] + "##");
    analysis = analysis.replace(/选D/g, "选##" + arrFinal[arr.indexOf('D')] + "##");
    analysis = analysis.replace(/选择A/g, "选择##" + arrFinal[arr.indexOf('A')] + "##");
    analysis = analysis.replace(/选择B/g, "选择##" + arrFinal[arr.indexOf('B')] + "##");
    analysis = analysis.replace(/选择C/g, "选择##" + arrFinal[arr.indexOf('C')] + "##");
    analysis = analysis.replace(/选择D/g, "选择##" + arrFinal[arr.indexOf('D')] + "##");
    analysis = analysis.replace(/项A/g, "项##" + arrFinal[arr.indexOf('A')] + "##");
    analysis = analysis.replace(/项B/g, "项##" + arrFinal[arr.indexOf('B')] + "##");
    analysis = analysis.replace(/项C/g, "项##" + arrFinal[arr.indexOf('C')] + "##");
    analysis = analysis.replace(/项D/g, "项##" + arrFinal[arr.indexOf('D')] + "##");
    analysis = analysis.replace(/A选/g, "##" + arrFinal[arr.indexOf('A')] + "##选");
    analysis = analysis.replace(/B选/g, "##" + arrFinal[arr.indexOf('B')] + "##选");
    analysis = analysis.replace(/C选/g, "##" + arrFinal[arr.indexOf('C')] + "##选");
    analysis = analysis.replace(/D选/g, "##" + arrFinal[arr.indexOf('D')] + "##选");
    analysis = analysis.replace(/A项/g, "##" + arrFinal[arr.indexOf('A')] + "##项");
    analysis = analysis.replace(/B项/g, "##" + arrFinal[arr.indexOf('B')] + "##项");
    analysis = analysis.replace(/C项/g, "##" + arrFinal[arr.indexOf('C')] + "##项");
    analysis = analysis.replace(/D项/g, "##" + arrFinal[arr.indexOf('D')] + "##项");
    analysis = analysis.replace(/A叙述/g, "##" + arrFinal[arr.indexOf('A')] + "##叙述");
    analysis = analysis.replace(/B叙述/g, "##" + arrFinal[arr.indexOf('B')] + "##叙述");
    analysis = analysis.replace(/C叙述/g, "##" + arrFinal[arr.indexOf('C')] + "##叙述");
    analysis = analysis.replace(/D叙述/g, "##" + arrFinal[arr.indexOf('D')] + "##叙述");
    analysis = analysis.replace(/A正确/g, "##" + arrFinal[arr.indexOf('A')] + "##正确");
    analysis = analysis.replace(/B正确/g, "##" + arrFinal[arr.indexOf('B')] + "##正确");
    analysis = analysis.replace(/C正确/g, "##" + arrFinal[arr.indexOf('C')] + "##正确");
    analysis = analysis.replace(/D正确/g, "##" + arrFinal[arr.indexOf('D')] + "##正确");
    analysis = analysis.replace(/A错误/g, "##" + arrFinal[arr.indexOf('A')] + "##错误");
    analysis = analysis.replace(/B错误/g, "##" + arrFinal[arr.indexOf('B')] + "##错误");
    analysis = analysis.replace(/C错误/g, "##" + arrFinal[arr.indexOf('C')] + "##错误");
    analysis = analysis.replace(/D错误/g, "##" + arrFinal[arr.indexOf('D')] + "##错误");
    analysis = analysis.replace(/A和##/g, "##" + arrFinal[arr.indexOf('A')] + "##和##");
    analysis = analysis.replace(/B和##/g, "##" + arrFinal[arr.indexOf('B')] + "##和##");
    analysis = analysis.replace(/C和##/g, "##" + arrFinal[arr.indexOf('C')] + "##和##");
    analysis = analysis.replace(/D和##/g, "##" + arrFinal[arr.indexOf('D')] + "##和##");
    analysis = analysis.replace(/A、##/g, "##" + arrFinal[arr.indexOf('A')] + "##、##");
    analysis = analysis.replace(/B、##/g, "##" + arrFinal[arr.indexOf('B')] + "##、##");
    analysis = analysis.replace(/C、##/g, "##" + arrFinal[arr.indexOf('C')] + "##、##");
    analysis = analysis.replace(/D、##/g, "##" + arrFinal[arr.indexOf('D')] + "##、##");
    analysis = analysis.replace(/A、##/g, "##" + arrFinal[arr.indexOf('A')] + "##、##");
    analysis = analysis.replace(/B、##/g, "##" + arrFinal[arr.indexOf('B')] + "##、##");
    analysis = analysis.replace(/C、##/g, "##" + arrFinal[arr.indexOf('C')] + "##、##");
    analysis = analysis.replace(/D、##/g, "##" + arrFinal[arr.indexOf('D')] + "##、##");
    analysis = analysis.replace(/A、##/g, "##" + arrFinal[arr.indexOf('A')] + "##、##");
    analysis = analysis.replace(/B、##/g, "##" + arrFinal[arr.indexOf('B')] + "##、##");
    analysis = analysis.replace(/C、##/g, "##" + arrFinal[arr.indexOf('C')] + "##、##");
    analysis = analysis.replace(/D、##/g, "##" + arrFinal[arr.indexOf('D')] + "##、##");
    analysis = analysis.replace(/##、A/g, "##、##" + arrFinal[arr.indexOf('A')] + "##");
    analysis = analysis.replace(/##、B/g, "##、##" + arrFinal[arr.indexOf('B')] + "##");
    analysis = analysis.replace(/##、C/g, "##、##" + arrFinal[arr.indexOf('C')] + "##");
    analysis = analysis.replace(/##、D/g, "##、##" + arrFinal[arr.indexOf('D')] + "##");
    analysis = analysis.replace(/##和A/g, "##和##" + arrFinal[arr.indexOf('A')] + "##");
    analysis = analysis.replace(/##和B/g, "##和##" + arrFinal[arr.indexOf('B')] + "##");
    analysis = analysis.replace(/##和C/g, "##和##" + arrFinal[arr.indexOf('C')] + "##");
    analysis = analysis.replace(/##和D/g, "##和##" + arrFinal[arr.indexOf('D')] + "##");
    analysis = analysis.replace(/A与##/g, "##" + arrFinal[arr.indexOf('A')] + "##与##");
    analysis = analysis.replace(/B与##/g, "##" + arrFinal[arr.indexOf('B')] + "##与##");
    analysis = analysis.replace(/C与##/g, "##" + arrFinal[arr.indexOf('C')] + "##与##");
    analysis = analysis.replace(/D与##/g, "##" + arrFinal[arr.indexOf('D')] + "##与##");
    
    analysis = analysis.replace(/##A##/g, "A");
    analysis = analysis.replace(/##B##/g, "B");
    analysis = analysis.replace(/##C##/g, "C");
    analysis = analysis.replace(/##D##/g, "D");

    // analysis = analysis.replace(/##A##/g, "<span style=\"color: red;font-weight:bold\">A</span>");
    // analysis = analysis.replace(/##B##/g, "<span style=\"color: red;font-weight:bold\">B</span>");
    // analysis = analysis.replace(/##C##/g, "<span style=\"color: red;font-weight:bold\">C</span>");
    // analysis = analysis.replace(/##D##/g, "<span style=\"color: red;font-weight:bold\">D</span>");
    return analysis;
}

function correctQuestions(){
    handlerAnalysis()
    try{
        if (module != "exam_note") {
            var correctQuestionList = get("correctQuestions");
            if (isNotEmpty(correctQuestionList)) {
                correctQuestionList = JSON.parse(correctQuestionList);
                for (var i = 0; i < list.length; i++) {
                    var correctQuestion = correctQuestionList[list[i].id];
                    if (isNotEmpty(correctQuestionList[list[i].id])) {
                        list[i].content = isEmpty(correctQuestion.content) ? list[i].content : correctQuestion.content;
                        list[i].optionA = isEmpty(correctQuestion.optionA) ? list[i].optionA : correctQuestion.optionA;
                        list[i].optionB = isEmpty(correctQuestion.optionB) ? list[i].optionB : correctQuestion.optionB;
                        list[i].optionC = isEmpty(correctQuestion.optionC) ? list[i].optionC : correctQuestion.optionC;
                        list[i].optionD = isEmpty(correctQuestion.optionD) ? list[i].optionD : correctQuestion.optionD;
                        list[i].answer = isEmpty(correctQuestion.answer) ? list[i].answer : correctQuestion.answer;
                        list[i].analysis = isEmpty(correctQuestion.analysis) ? list[i].analysis : correctQuestion.analysis;
                    }
                }
            }
        }
    } catch (e) {
        console.log(e.name + ": " + e.message);
    }
}

function randomHandler(){
    if(randomChecked == 1 && module != "exam_note"){
        // 打乱顺序
        arr.sort(function(){ return 0.5 - Math.random() })
        for (var i = 0; i < list.length; i++) {
            if (list[i].sort_id > 70) {
                continue;
            }
            // 修改乱序后的选项和答案
            list[i].answer = arrFinal[arr.indexOf(list[i].answer)]
            var options = [list[i].optionA,list[i].optionB,list[i].optionC,list[i].optionD]
            list[i].optionA = options[arrFinal.indexOf(arr[0])]
            list[i].optionB = options[arrFinal.indexOf(arr[1])]
            list[i].optionC = options[arrFinal.indexOf(arr[2])]
            list[i].optionD = options[arrFinal.indexOf(arr[3])]
            if (!isEmpty(list[i].temp_answer)) {
                list[i].temp_answer = arrFinal[arr.indexOf(list[i].temp_answer)]
            }
            if (!isEmpty(list[i].analysis)) {
                list[i].analysis = replaceRandom(list[i].analysis, arr, arrFinal)
            }
        }
    }   
}

function initListHtml(start, end){
    if (end > start && end > list.length) {
        console.log("ArrayIndexOutOfBoundsException:" + start + "," + end);
        return;
    }
    var analysisHidden = get("analysisHidden")
    for (var i = start; i < end; i++) {
        var rem;
        if (isNotEmpty(list[i].rem)) {
            list[i].rem = list[i].rem.replace(/&quot;/g, "\"");
        }
        if (list[i].type == 1) {
            list[i].percent = 0;
            if (list[i].finish != 0) {
                list[i].percent = Math.round((list[i].finish - list[i].wrong) / list[i].finish * 1000) / 10; 
            }
        }
        if (analysisHidden === 1 & list[i].type == 1) {
            list[i].analysis = "加载中..."
        } else if (analysisHidden === 2 & list[i].type > 1) {
            list[i].analysis = "加载中..."
        } else if (analysisHidden === 0) {
            list[i].analysis = "加载中..."
        }
        list[i].content = list[i].content.replace(/src=\"/g, "onclick=\"imgDetail(this)\" src=\"");
        list[i].analysis = list[i].analysis.replace(/src=\"/g, "onclick=\"imgDetail(this)\" src=\"");

        var html = template(document.getElementById('questionTpl').innerHTML, {question: list[i], nightImgName: nightImgName});
        $api.append($api.byId('question_list'), html);
    }
}

function initCurrentHeight(){
    setTimeout(function () {
        var e = getCurrentElement("question");
        var height = $api.cssVal(e,'height');
        if (isEmpty(height)) {
            return;
        }
        height = height.substr(0,height.length - 2);
        if (height < api.winHeight) {
            height = api.winHeight
        }
        $api.css($api.byId('page'),'height:' + height  + "px");
    }, 200);
    setTimeout(function () {
        var e = getCurrentElement("question");
        var height = $api.cssVal(e,'height');
        if (isEmpty(height)) {
            return;
        }
        height = height.substr(0,height.length - 2);
        if (height < api.winHeight) {
            height = api.winHeight
        }
        $api.css($api.byId('page'),'height:' + height  + "px");
    }, 1000);
}

function autoDeleteQuestion(index){
    if (isEmpty(index)) {
        index = mySwiper.realIndex;
    }
    if (autoDeleteTimes > 0 && list[index].note >= autoDeleteTimes) {
        deleteQuestion();
    } else if (list[index].note > 0) {
        db.executeSql({
            name: 'rk',
            sql: 'update question set note = note + 1 where id =' + list[index].id
        }, function(ret, err) {});
    }
}

function noteHandler(){
    if (module == 'note') {
        if (noteSortType == 2) {
            list.sort(sortByTime)
        } else if (noteSortType == 3){
            list.sort(sortByRate)
        }
    }
}

function sortById(a,b){
    return a.id - b.id
}

function sortByTime(a,b){
    return b.note_time - a.note_time
}

function sortByRate(a,b){
    return b.wrong / b.finish - a.wrong / a.finish
}

function noteSort(){
    if (noteSortType == 1) {
        noteSortType = 2;
        list.sort(sortByTime)
        toast("已设置为按时间排序", 'button')
    } else if (noteSortType == 2) {
        noteSortType = 3;
        list.sort(sortByRate)
        toast("已设置为按错误率排序", 'button')
    } else {
        noteSortType = 1;
        list.sort(sortById)
        toast("已设置为按默认排序", 'button')
    }
    save("noteSortType", noteSortType)
    
    $api.html($api.byId('question_list'), "");
    $api.text($api.byId('true_count'),0);
    $api.text($api.byId('false_count'),0);
    initCardView()
    initListHtml(0, list.length);
    mySwiper.update()
    for (var i = 0; i < list.length; i++) {
        if (isNotEmpty(list[i].note_answer)) {
            showFinishedAnswer(i, list[i].note_answer, true)
        }
    }
    showPage()
}

function slideNext(){
    if(mySwiper.realIndex == list.length - 1){
        toast("亲，这已经是最后一题了哦")
        return;
    }
    mySwiper.slideNext();
}

function slidePrev(){
    if(mySwiper.realIndex == 0){
        toast("亲，这已经是第一题了哦")
        return;
    }
    mySwiper.slidePrev();
}

function handlerAnalysis(){
    if (module == "exam_note"){
        return;
    }
    for (var i = 0; i < list.length; i++) {
        list[i].analysis = decrypt(list[i].analysis)
    }
}

function error(questionId){
    api.openWin({
        name: 'error',
        url: './error.html',
        pageParam: {
            questionId: questionId
        }
    });
}

function imgDetail(ele){
    var photoBrowser = api.require('photoBrowser');
    photoBrowser.open({
        images: [
            $api.attr(ele, "src")
        ],
        bgColor: '#000'
    }, function(ret, err) {
        if (ret) {
            if (ret.eventType == 'click') {
                photoBrowser.close();
            }
            api.addEventListener({
                name: 'keyback'
            }, function(ret, err) {
                photoBrowser.close();
                api.addEventListener({
                    name: 'keyback'
                }, function(ret, err) {
                    goback()
                });
            });
        }
    });
}