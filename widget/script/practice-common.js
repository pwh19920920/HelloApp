function getCurrentElement(className){
    return mySwiper.slides.eq(mySwiper.realIndex).find("." + className)[0];
}

function jump(index){
    mySwiper.slideTo(index - 1, 1000, true);

    layer.close(layerIndex);
}

function setting(){
    var html = $api.html($api.byId('mode_div'));
    if (nightChecked == 1) {
        html = html.replace(/night\"/g, "night\" checked");
    }
    if (jumpChecked == 1) {
        html = html.replace(/jump\"/g, "jump\" checked");
    }
    if (randomChecked == 1) {
        html = html.replace(/random\"/g, "random\" checked");
    }
    var index = layer.open({
        type: 1,
        content: html,
        anim: 'up',
        style: 'position:fixed; bottom:0; left:0; width: 100%; border:none;border-radius: 10px 10px 0 0;'
    });
}

function nightMode(){
    if (nightChecked == 1) {
        nightChecked = 0;
        nightImgName = ""
        $api.removeCls($api.dom('html'),'night')
        $api.removeCls($api.dom('body'),'night')

        var html = $api.html($api.byId("question_list"))
        html = html.replace(/_n.png/g, ".png");
        $api.html($api.byId("question_list"), html)

        var src = $api.attr($api.byId("collect_img"), "src");
        src = src.replace(/_n.png/g, ".png");
        $api.attr($api.byId("collect_img"), "src", src)

        $api.attr($api.byId("submit_img"), "src", "../../image/ic_exam_submit.png")
    } else {
        nightChecked = 1;
        nightImgName = "_n"
        $api.addCls($api.dom('html'),'night')
        $api.addCls($api.dom('body'),'night')

        var html = $api.html($api.byId("question_list"))
        html = html.replace(/choose.png/g, "choose_n.png");
        html = html.replace(/normal.png/g, "normal_n.png");
        html = html.replace(/pressed.png/g, "pressed_n.png");
        html = html.replace(/true.png/g, "true_n.png");
        html = html.replace(/false.png/g, "false_n.png");
        html = html.replace(/_1.png/g, "_1_n.png");
        html = html.replace(/_2.png/g, "_2_n.png");
        html = html.replace(/_3.png/g, "_3_n.png");
        $api.html($api.byId("question_list"), html)

        var src = $api.attr($api.byId("collect_img"), "src");
        src = src.replace(/.png/g, "_n.png");
        $api.attr($api.byId("collect_img"), "src", src)

        $api.attr($api.byId("submit_img"), "src", "../../image/ic_exam_submit_n.png")
    }
    mySwiper.update();
    save('night_mode', nightChecked);
    talkingData.onEvent({
        eventId: "mode_night",
        parameters: {
            checked: nightChecked
        }
    });
}

function nightTips(){
    var hour = new Date().getHours()
    if (22 <= hour || hour <= 5) {
        if (getDiffTimeFlag("nightTime")) {
            // 22:00-5:00且未开始夜间模式则提示开启
            if (nightChecked == 0) {
                save("nightTime", new Date().getTime())
                api.confirm({
                    title: '温馨提示',
                    msg: '亲，切换到夜间模式更保护眼睛！\n 小技巧：右上角设置可以手动切换模式哦~',
                    buttons: ['切换', '不切换']
                }, function(ret, err) {
                    if (ret.buttonIndex == 1) {
                        nightMode();
                    }
                });
            }
        }
    } else if (8 <= hour && hour <= 20){
        if (getDiffTimeFlag("dayTime")) {
            // 非22:00-5:00且已开始夜间模式则提示开启
            if (nightChecked == 1) {
                save("dayTime", new Date().getTime())
                api.confirm({
                    title: '温馨提示',
                    msg: '亲，可以切换回日间模式啦\n 小技巧：右上角设置可以手动切换模式哦~',
                    buttons: ['切换', '不切换']
                }, function(ret, err) {
                    if (ret.buttonIndex == 1) {
                        nightMode();
                    }
                });
            }
        }
    }
}

function getDiffTimeFlag(key){
    var time = get(key)
    if (isEmpty(time)) {
        time = 0;
    }
    var diffTime = new Date().getTime() - eval(time)
    return diffTime > 1000 * 3600 * 24 * 4;
}

function closeAllLayer(){
    layer.closeAll()
}