var oldOffices = ['rk_190002','rk_190001'];

function getDbName(){
    return 'rk_190003';
}

function updateDb(){
    var fs = api.require('fs');
    // office判断逻辑
    var newOffice = getDbName();

    var ret = fs.existSync({
        path: 'box://res/' + newOffice + '.db'
    });
    if (ret.exist) {
        return true;
    }
    // 旧的是否存在
    var oldOffice;
    for (var i = 0; i < oldOffices.length; i++) {
        ret = fs.existSync({
            path: 'box://res/' + oldOffices[i] + '.db'
        });
        if (ret.exist) {
            oldOffice = oldOffices[i];
            break;
        }
    }
    if (isEmpty(oldOffice)) {
        fs.copyToSync({
            oldPath: 'widget://res/' + newOffice + '.db',
            newPath: 'box://res/'
        });
    } else {
        // 拷贝旧题库做题记录
        syncOldDB(newOffice, oldOffice);
        return false;
    }
    return true;
}


function syncOldDB(newOffice, oldOffice, flag){
    if (flag) {
        api.showProgress({
            title: '正在同步做题记录...',
            text: '请稍候...'     
        });
    }
    var fs = api.require('fs');
    var ret = fs.existSync({
        path: 'box://res/' + newOffice + '.db'
    });
    if (!ret.exist) {
        fs.copyToSync({
            oldPath: 'widget://res/' + newOffice + '.db',
            newPath: 'box://res/'
        });
    }
    var db = api.require('db');
    db.openDatabase({
        name: "old_question_1",
        path: 'box://res/' + oldOffice + '.db'
    }, function(ret, err) {
        if (ret.status) {
            db.openDatabase({
                name: "question_1",
                path: 'box://res/' + newOffice + '.db'
            }, function(ret, err) {
                if (ret.status) {
                    // 获取旧数据
                    db.selectSql({
                        name: "old_question_1",
                        sql: 'select * from question where (temp_answer is not null or rem is not null or collect != 0 or note != 0 or finish != 0 or wrong != 0)'
                    }, function(ret, err) {
                        if (ret.status) {
                            list = ret.data;
                            for (var i = 0; i < list.length; i++) {
                                var part = ""
                                if (!isEmpty(list[i].temp_answer)) {
                                    part += 'temp_answer = "' + list[i].temp_answer + '",'
                                }
                                if (!isEmpty(list[i].rem)) {
                                    part += 'rem = "' + list[i].rem + '",'
                                }
                                var condition = 'update question set ' + part + ' collect = ' + list[i].collect + ',note = ' + list[i].note + ',finish = ' + list[i].finish + ',wrong = ' + list[i].wrong + ' where id =' + list[i].id;
                                db.executeSql({
                                    name: "question_1",
                                    sql: condition
                                }, function(ret, err) {
                                    if (!ret.status) {
                                        alert(JSON.stringify(err));
                                    }
                                });
                            }
                            api.sendEvent({name: 'homeUpdate'});
                            api.hideProgress();
                        } else {
                            alert(JSON.stringify(err));
                        }
                    });
                } else {
                    alert("openDB:" + JSON.stringify(err));
                }
            });
        }
    })
}

function getSectionName(section, subject, type){
    var year = section.substr(0,4);
    var half = section.substr(4,1) == '1' ? '上半年' : '下半年'
    return "{0}年{1}{2}真题".format(year, half, type == 1 ? '上午' : '下午');
}

function trimStart(content){
    while(content.indexOf("&nbsp;") == 0){
        content = content.substr(6, content.length - 1);
    }
    return content;
}

function encrypt(word){
    if (isEmpty(word)) {
        return word;
    }
    var key = CryptoJS.enc.Utf8.parse("rkmiplusfighting");
    var srcs = CryptoJS.enc.Utf8.parse(word);
    var encrypted = CryptoJS.AES.encrypt(srcs, key, {mode:CryptoJS.mode.ECB,padding: CryptoJS.pad.Pkcs7});
    return encrypted.toString();
}

function decrypt(word){
    if (isEmpty(word)) {
        return word;
    }
    try{
        var key = CryptoJS.enc.Utf8.parse("rkmiplusfighting");
        var decrypt = CryptoJS.AES.decrypt(word, key, {mode:CryptoJS.mode.ECB,padding: CryptoJS.pad.Pkcs7});
        return CryptoJS.enc.Utf8.stringify(decrypt).toString();
    } catch (e) {
        console.log(e.name + ": " + e.message);
    }
    return '';
}

var data = {
    '1A': [11001,11011],
    '1B': [10001,10039],
    '2A': [21001,21017],
    '2B': [20001,20040],
    '3A': [31001,31018],
    '3B': [30001,30043],
    '4A': [41001,41016],
    '4B': [40001,40033],
    '5A': [51001,51015],
    '5B': [50001,50038],
    '6A': [61001,61003],
    '6B': [60001,60025]
}

var subjectName = {
    "1":"系统分析师",
    "2":"系统架构设计师",
    "3":"网络规划设计师",
    "4":"系统规划与管理师",
    "5":"信息系统项目管理师",
    "6":"软件设计师",
    "7":"网络工程师",
    "8":"软件评测师",
    "9":"信息系统监理师",
    "10":"信息安全工程师",
    "11":"电子商务设计师",
    "12":"数据库系统工程师",
    "13":"嵌入式系统设计师",
    "14":"多媒体应用设计师",
    "15":"信息系统管理工程师",
    "16":"系统集成项目管理工程师",
    "17":"程序员",
    "18":"网络管理员",
    "19":"信息处理技术员"
}

var subjectCategoryCount = {
    1:{
        1:[15,13,14,13,14,13,13,15,16,14,15],
        2:[15,13,14,13,14,13,13,15,16,14,15],
        3:[15,13,14,13,14,13,13,15,16,14,15]
    },
    2:{
        1:[13,12,11,11,11,11,12,12,12,12,12],
        2:[12,11,11,11,11,12,12,12,12,12],
        3:[12,11,11,11,11,12,12,12,12,12]
    },
    3:{
        1:[14,15,14,17,15,12,13,10,12,12,15,13,14],
        2:[15,14,17,15,12,13,10,12,12,15,13,14],
        3:[14,17,15,12,13,10,12,12,15,13,14]
    },
    4:{
        1:[15,13,14],
        2:[15,13,14],
        3:[15,13,14]
    },
    5:{
        1:[33,35,28,30,30,30,32,26,26,25,31,28,31,31,26,27,29,30,32,31,27,30,29],
        2:[33,35,28,30,30,30,32,26,26,25,31,28,31,31,26,27,29,30,32,31,27,30,29],
        3:[33,35,28,30,30,30,32,26,26,25,31,28,31,31,26,27,29,30,32,31,27,30,29]
    },
    6:{
        1:[34,34,34,31,34,32,35,35,37,36,37,34,36,35,30,36,34,35,34,32,33,32,38],
        2:[34,34,34,31,34,32,35,35,37,36,37,34,36,35,30,36,34,35,34,32,33,32,38]
    },
    7:{
        1:[38,37,39,33,38,35,31,36,35,36,40,39,40,36,36,41,36,39,37,37,43,37,37],
        2:[38,37,39,33,38,35,31,36,35,36,40,39,40,36,36,41,36,39,37,37,43,37,37]
    },
    8:{
        1:[17,15,15,18,15,16,13,17,15,14],
        2:[17,15,15,18,15,16,13,17,15,14]
    },
    9:{
        1:[17,18,16,18,18,18,18,18,17,19,17,14,15,16,17,15,16,14,15,18,17,16],
        2:[18,16,18,18,18,18,18,17,19,17,14,15,16,17,15,16,14,15,18,17,16]
    },
    10:{
        1:[16,13,17,15],
        2:[16,13,17,15]
    },
    11:{
        1:[19,18,17,20,17,17,17,18,18,17],
        2:[19,18,17,20,17,17,17,18,18,17]
    },
    12:{
        1:[21,21,19,21,20,17,18,18,20,19,21,20],
        2:[21,19,21,20,17,18,18,20,19,21,20]
    },
    13:{
        1:[12,14,15,15,14,14,12,10,12],
        2:[12,14,15,15,14,14,12,10,12]
    },
    14:{
        1:[29,24,20,25,23,26,28,24],
        2:[29,24,20,25,23,26,28,24]
    },
    15:{
        1:[42,47,40,49,39,40,45,40,44,45],
        2:[42,47,40,49,39,40,45,40,44,45]
    },
    16:{
        1:[46,44,47,42,43,43,42,39,42,45,46,43,36,39,39,42,41,49,47,38,39,43,35],
        2:[46,44,47,42,43,43,42,39,42,45,46,43,36,39,39,42,41,49,47,38,39,43,35]
    },
    17:{
        1:[39,33,37,34,34,37,36,35,39,36,39,36,38,36,33,38,31,33,33,34,37],
        2:[39,33,37,34,34,37,36,35,39,36,39,36,38,36,33,38,31,33,33,34,37]
    },
    18:{
        1:[40,40,36,38,33,41,37,35,35,34,37,38,34,39,35,38,37,38,39,39,44],
        2:[40,40,36,38,33,41,37,35,35,34,37,38,34,39,35,38,37,38,39,39,44]
    },
    19:{
        1:[24,24,29,28,27,26,28,23,23,22,22,25,23,24,24,25,25,24,26,25,23,26],
        2:[24,27,26,28,23,23,22,22,25,23,24,24,25,25,24,26,25,23,26]
    }
}

var subjectSectionData = {
    "1":[{"title":"计算机系统与配置","progress":"57"},{"title":"操作系统","progress":"61"},{"title":"数据通信与计算机网络","progress":"71"},{"title":"数据库系统","progress":"69"},{"title":"系统配置与性能评价","progress":"12"},{"title":"软件工程","progress":"86"},{"title":"面向对象方法学","progress":"81"},{"title":"项目管理","progress":"42"},{"title":"信息化与信息系统","progress":"61"},{"title":"安全性知识","progress":"44"},{"title":"知识产权","progress":"31"},{"title":"标准化","progress":"3"},{"title":"多媒体技术及其应用","progress":"20"},{"title":"应用数学与经济管理","progress":"61"},{"title":"前沿技术","progress":"2"},{"title":"专业英语","progress":"50"},{"title":"其他","progress":"74"}],
    "2":[{"title":"操作系统","progress":"36"},{"title":"数据库系统","progress":"48"},{"title":"计算机硬件基础及嵌入式系统设计","progress":"45"},{"title":"数据通信与计算机网络","progress":"28"},{"title":"系统安全性与保密性设计","progress":"17"},{"title":"信息化基础","progress":"57"},{"title":"系统开发基础","progress":"154"},{"title":"软件架构设计","progress":"254"},{"title":"应用数学","progress":"17"},{"title":"知识产权与标准化","progress":"30"},{"title":"系统配置与性能评价","progress":"14"},{"title":"专业英语","progress":"55"}],
    "3":[{"title":"网络基础知识","progress":"50"},{"title":"网络安全","progress":"3"},{"title":"网络层","progress":"93"},{"title":"传输层与应用层","progress":"71"},{"title":"数据链路层","progress":"45"},{"title":"网络管理与广域网","progress":"35"},{"title":"网络设备","progress":"5"},{"title":"网络资源设备","progress":"25"},{"title":"计算机硬件基础","progress":"10"},{"title":"计算机网络规划与设计知识","progress":"169"},{"title":"PKI和加解密技术","progress":"65"},{"title":"VPN和访问控制技术","progress":"28"},{"title":"无线、IPv6和QoS","progress":"40"},{"title":"黑客攻击与恶意软件","progress":"28"},{"title":"防火墙和IDS/IPS技术","progress":"15"},{"title":"项目管理、软件、标准化法律法规","progress":"84"},{"title":"系统配置与性能评价","progress":"4"},{"title":"专业英语","progress":"55"},{"title":"其他","progress":"75"}],
    "4":[{"title":"全部","progress":"225"}],
    "5":[{"title":"信息系统基础","list":[{"title":"信息系统","progress":"18"},{"title":"信息系统建设","progress":"15"},{"title":"软件工程知识","progress":"66"},{"title":"软件构件技术知识","progress":"5"},{"title":"软件体系结构","progress":"3"},{"title":"面向对象系统分析与设计","progress":"41"},{"title":"典型应用集成技术","progress":"27"},{"title":"数据库知识","progress":"1"}]},{"title":"计算机网络基础知识","list":[{"title":"网络技术标准与协议","progress":"32"},{"title":"Internet技术及应用","progress":"7"},{"title":"网络分类","progress":"2"},{"title":"网络管理","progress":"3"},{"title":"网络交换技术","progress":"1"},{"title":"网络存储技术","progress":"5"},{"title":"网络接入技术","progress":"7"},{"title":"无线网络技术、光网络技术","progress":"17"},{"title":"网络规划、设计及实施原则","progress":"8"}]},{"title":"信息系统项目管理","list":[{"title":"信息系统项目管理基础","progress":"12"},{"title":"项目人力资源管理","progress":"44"},{"title":"项目成本管理","progress":"53"},{"title":"项目整体管理","progress":"37"},{"title":"项目沟通管理","progress":"59"},{"title":"项目生命周期和组织","progress":"25"},{"title":"项目立项与招投标管理","progress":"32"},{"title":"项目管理过程","progress":"13"},{"title":"项目范围管理","progress":"68"},{"title":"项目质量管理","progress":"64"},{"title":"项目进度管理","progress":"63"},{"title":"项目采购和合同管理","progress":"41"},{"title":"项目风险管理","progress":"68"},{"title":"文档与配置管理","progress":"48"},{"title":"需求管理","progress":"55"}]},{"title":"信息系统项目管理高级知识","list":[{"title":"大型、复杂项目和多项目管理","progress":"70"},{"title":"业务流程管理和重组","progress":"15"},{"title":"信息系统工程监理","progress":"14"},{"title":"信息资源管理","progress":"4"},{"title":"知识管理","progress":"5"},{"title":"项目整体绩效评估","progress":"48"}]},{"title":"信息化基础知识","list":[{"title":"信息与信息化","progress":"12"},{"title":"政府信息化与电子政务","progress":"7"},{"title":"企业信息化与电子商务","progress":"27"},{"title":"战略管理","progress":"14"},{"title":"IT服务管理","progress":"4"},{"title":"新技术","progress":"31"}]},{"title":"信息安全知识","list":[{"title":"信息安全知识","progress":"78"}]},{"title":"法律法规和标准规范","list":[{"title":"法律法规","progress":"73"},{"title":"软件工程的国家标准","progress":"74"},{"title":"综合布线标准和机房建设标准","progress":"28"}]},{"title":"管理科学基础知识","list":[{"title":"运筹学模型","progress":"93"}]},{"title":"项目管理师职业道德","list":[{"title":"项目管理师职业道德","progress":"3"}]},{"title":"专业英语","list":[{"title":"专业英语","progress":"110"}]}],
    "6":[{"title":"计算机组成与结构","list":[{"title":"计算机基本工作原理","progress":"43"},{"title":"存储系统","progress":"28"},{"title":"总线系统","progress":"7"},{"title":"输入输出系统","progress":"14"},{"title":"指令系统和计算机体系结构","progress":"33"},{"title":"系统性能评测和可靠性基础","progress":"9"},{"title":"信息安全和病毒防护","progress":"64"}]},{"title":"程序语言","list":[{"title":"程序设计语言基本概念","progress":"51"},{"title":"汇编、编译、解释系统","progress":"35"},{"title":"文法分析","progress":"46"}]},{"title":"操作系统","list":[{"title":"操作系统定义、分类及功能","progress":"17"},{"title":"进程管理","progress":"56"},{"title":"文件管理","progress":"23"},{"title":"存储管理","progress":"22"},{"title":"设备管理","progress":"13"},{"title":"作业管理","progress":"5"}]},{"title":"软件工程基础知识","list":[{"title":"软件工程概述","progress":"30"},{"title":"软件工具与开发环境","progress":"1"},{"title":"软件开发项目管理","progress":"73"},{"title":"软件质量管理","progress":"32"},{"title":"软件过程管理","progress":"28"}]},{"title":"系统开发与运行","list":[{"title":"结构化分析和设计","progress":"28"},{"title":"系统设计知识","progress":"24"},{"title":"系统的测试与维护","progress":"63"}]},{"title":"网络与多媒体基础知识","list":[{"title":"ISO／OSI网络体系结构","progress":"5"},{"title":"网络互连硬件","progress":"19"},{"title":"网络协议","progress":"30"},{"title":"网络安全","progress":"11"},{"title":"Internet应用","progress":"49"},{"title":"图形和图像","progress":"18"},{"title":"声音及其数字化","progress":"10"},{"title":"动画与视频","progress":"9"},{"title":"多媒体网络","progress":"1"},{"title":"多媒体计算机","progress":"9"}]},{"title":"数据库技术","list":[{"title":"数据库基础知识","progress":"24"},{"title":"E-R模型","progress":"10"},{"title":"E-R模型和关系模型","progress":"12"},{"title":"SQL语言","progress":"34"},{"title":"关系代数","progress":"10"},{"title":"关系代数和关系模型","progress":"14"},{"title":"关系数据库的规范化","progress":"25"},{"title":"控制功能","progress":"2"}]},{"title":"算法与数据结构","list":[{"title":"线性结构","progress":"34"},{"title":"数组、矩阵和广义表","progress":"16"},{"title":"树","progress":"38"},{"title":"图","progress":"13"},{"title":"排序算法","progress":"25"},{"title":"查找算法","progress":"18"},{"title":"算法分析及常用算法","progress":"60"}]},{"title":"面向对象技术","list":[{"title":"面向对象的基本概念","progress":"64"},{"title":"面向对象程序设计","progress":"4"},{"title":"面向对象开发技术","progress":"1"},{"title":"面向对象分析与设计方法","progress":"122"},{"title":"设计模式","progress":"57"}]},{"title":"标准化和知识产权","list":[{"title":"知识产权","progress":"51"}]},{"title":"专业英语","list":[{"title":"专业英语","progress":"110"}]}],
    "7":[{"title":"计算机组成与结构","list":[{"title":"计算机中数据的表示及运算","progress":"11"},{"title":"计算机组成和中央处理器","progress":"11"},{"title":"存储系统","progress":"36"},{"title":"输入输出系统","progress":"11"},{"title":"总线系统","progress":"5"},{"title":"指令系统","progress":"16"},{"title":"系统可靠性基础","progress":"4"}]},{"title":"操作系统","list":[{"title":"操作系统的基本概念","progress":"6"},{"title":"处理机管理","progress":"4"},{"title":"文件管理","progress":"10"},{"title":"存储管理","progress":"6"}]},{"title":"系统开发和运行基础知识","list":[{"title":"需求分析和设计方法","progress":"16"},{"title":"项目管理基础知识","progress":"37"},{"title":"软件的测试与调试","progress":"3"},{"title":"程序语言基础","progress":"14"},{"title":"多媒体基础","progress":"4"}]},{"title":"标准化和知识产权","list":[{"title":"知识产权","progress":"26"}]},{"title":"数据通信基础","list":[{"title":"数据基础","progress":"1"},{"title":"信道特性","progress":"9"},{"title":"传输介质","progress":"5"},{"title":"数据编码","progress":"17"},{"title":"数字调制技术","progress":"26"},{"title":"脉冲编码调制","progress":"24"},{"title":"通信方式和交换方式","progress":"7"},{"title":"多路复用技术","progress":"6"},{"title":"差错控制","progress":"17"}]},{"title":"广域通信网","list":[{"title":"公共交换电话网","progress":"7"},{"title":"X.25公共数据网","progress":"8"},{"title":"帧中继网","progress":"7"}]},{"title":"局域网和城域网","list":[{"title":"局域网技术基础","progress":"4"},{"title":"CSMA／CD协议","progress":"14"},{"title":"以太网","progress":"33"},{"title":"交换式以太网和虚拟局域网","progress":"26"},{"title":"局域网互联","progress":"9"},{"title":"城域网","progress":"4"}]},{"title":"无线通信网","list":[{"title":"移动通信","progress":"8"},{"title":"无线个域网","progress":"2"},{"title":"无线城域网","progress":"1"},{"title":"无线局域网","progress":"37"}]},{"title":"网络互连与互联网","list":[{"title":"网络互连设备","progress":"26"},{"title":"IP协议","progress":"113"},{"title":"ICMP","progress":"13"},{"title":"TCP和LIDP","progress":"34"},{"title":"域名和地址解析","progress":"20"},{"title":"网关协议","progress":"70"},{"title":"路由器技术","progress":"47"},{"title":"IP组播技术","progress":"6"},{"title":"IP QoS技术","progress":"3"},{"title":"Internet应用","progress":"34"},{"title":"UDP","progress":"4"}]},{"title":"下一代互联网","list":[{"title":"IPv6","progress":"30"},{"title":"移动IP","progress":"2"},{"title":"从IPv4向IPv6的过渡","progress":"3"}]},{"title":"网络安全","list":[{"title":"网络安全的基本概念","progress":"9"},{"title":"信息加密技术","progress":"35"},{"title":"认证技术","progress":"33"},{"title":"虚拟专用网","progress":"9"},{"title":"应用层安全协议","progress":"26"},{"title":"入侵检测技术与防火墙","progress":"9"},{"title":"病毒防护","progress":"9"}]},{"title":"网络操作系统与应用服务器配置","list":[{"title":"Linux操作系统基础","progress":"55"},{"title":"Windows Server 2003网络操作系统基础","progress":"8"},{"title":"Windows服务器配置基础","progress":"47"},{"title":"DHCP服务器配置","progress":"33"},{"title":"DNS服务器配置","progress":"29"}]},{"title":"交换机与路由器","list":[{"title":"交换机基础","progress":"19"},{"title":"交换机的配置","progress":"17"},{"title":"路由器基础","progress":"34"},{"title":"路由器的配置","progress":"50"},{"title":"访问控制列表","progress":"8"}]},{"title":"网络管理","list":[{"title":"网络管理基础","progress":"47"},{"title":"常用的网络工具","progress":"66"},{"title":"网络监视和网络管理工具","progress":"17"},{"title":"网络存储技术","progress":"1"}]},{"title":"网络系统分析与设计","list":[{"title":"结构化布线系统","progress":"18"},{"title":"网络系统分析","progress":"8"},{"title":"逻辑网络设计","progress":"11"},{"title":"网络结构设计","progress":"35"},{"title":"网络故障诊断","progress":"10"}]},{"title":"专业英语","list":[{"title":"专业英语","progress":"110"}]}],
    "8":[{"title":"计算机系统构成及硬件基础知识","progress":"51"},{"title":"程序语言基础知识","progress":"86"},{"title":"操作系统基础知识","progress":"36"},{"title":"计算机网络基础知识","progress":"41"},{"title":"软件工程基础知识","progress":"168"},{"title":"软件构件与中间件","progress":"14"},{"title":"信息安全知识","progress":"30"},{"title":"软件的知识产权保护","progress":"15"},{"title":"数据库系统","progress":"45"},{"title":"软件评测基础知识","progress":"100"},{"title":"测试用例设计方法","progress":"49"},{"title":"测试项目管理","progress":"8"},{"title":"软件自动化测试","progress":"7"},{"title":"网络测试","progress":"4"},{"title":"负载压力测试","progress":"16"},{"title":"易用性测试","progress":"5"},{"title":"文档测试","progress":"5"},{"title":"安全测试","progress":"12"},{"title":"兼容性测试","progress":"2"},{"title":"Web应用测试","progress":"4"},{"title":"多媒体基础知识","progress":"2"},{"title":"专业英语","progress":"50"}],
    "9":[{"title":"信息系统工程技术知识","list":[{"title":"信息系统建设","progress":"21"},{"title":"信息网络系统","progress":"161"},{"title":"计算机技术知识与网络知识","progress":"239"},{"title":"软件与软件工程知识","progress":"215"}]},{"title":"信息工程项目管理知识","list":[{"title":"项目管理基础知识","progress":"48"}]},{"title":"信息系统工程监理知识","list":[{"title":"信息系统工程监理概念","progress":"54"},{"title":"信息系统工程监理依据","progress":"25"},{"title":"监理单位的组织建设","progress":"17"},{"title":"监理工作的组织和规划","progress":"99"},{"title":"质量控制","progress":"108"},{"title":"进度控制","progress":"97"},{"title":"变更控制","progress":"62"},{"title":"投资控制","progress":"73"},{"title":"合同管理","progress":"87"},{"title":"安全管理","progress":"52"},{"title":"信息管理","progress":"67"},{"title":"沟通协调","progress":"35"},{"title":"信息系统监理师职业道德要求","progress":"10"}]},{"title":"专业英语","list":[{"title":"专业英语","progress":"105"}]}],
    "10":[{"title":"全部","progress":"300"}],
    "11":[{"title":"计算机系统基础","progress":"41"},{"title":"程序语言基础","progress":"72"},{"title":"多媒体基础","progress":"17"},{"title":"计算机应用","progress":"36"},{"title":"信息化建设","progress":"14"},{"title":"数据库","progress":"22"},{"title":"操作系统","progress":"16"},{"title":"网络营销","progress":"67"},{"title":"知识产权、商标、标准化","progress":"15"},{"title":"计算机网络基础","progress":"59"},{"title":"软件工程","progress":"36"},{"title":"项目管理及计划控制","progress":"1"},{"title":"项目管理基础","progress":"7"},{"title":"电子商务基础","progress":"70"},{"title":"电子商务程序设计基础","progress":"1"},{"title":"电子商务法概述","progress":"13"},{"title":"电子商务信息安全","progress":"92"},{"title":"电子支付技术与系统","progress":"47"},{"title":"电子商务系统建设","progress":"1"},{"title":"电子商务系统规划与设计","progress":"25"},{"title":"电子商务新技术与新应用","progress":"2"},{"title":"现代物流与供应链管理","progress":"46"},{"title":"专业英语","progress":"50"}],
    "12":[{"title":"计算机系统基础","progress":"55"},{"title":"计算机网络","progress":"53"},{"title":"程序语言基础","progress":"34"},{"title":"软件工程","progress":"29"},{"title":"操作系统","progress":"41"},{"title":"知识产权","progress":"21"},{"title":"安全性知识","progress":"28"},{"title":"信息化基础、项目管理","progress":"28"},{"title":"数据库技术基础","progress":"65"},{"title":"数据库设计","progress":"50"},{"title":"数据库运行与管理","progress":"7"},{"title":"数据操作与SQL","progress":"72"},{"title":"数据结构与算法","progress":"6"},{"title":"E-R模型","progress":"16"},{"title":"关系代数和关系模型","progress":"53"},{"title":"关系数据库的规范化","progress":"28"},{"title":"数据仓库与数据挖掘","progress":"18"},{"title":"数据库事务与调度","progress":"54"},{"title":"分布式数据库系统","progress":"13"},{"title":"可靠性与系统性能评测","progress":"3"},{"title":"多媒体基本知识","progress":"26"},{"title":"专业英语","progress":"50"},{"title":"其他","progress":"75"}],
    "13":[{"title":"嵌入式系统基础知识","progress":"18"},{"title":"嵌入式微处理器与接口知识","progress":"32"},{"title":"嵌入式系统开发与维护知识","progress":"1"},{"title":"嵌入式软件程序设计","progress":"7"},{"title":"嵌入式系统设计","progress":"4"},{"title":"嵌入式系统软件及操作系统知识","progress":"19"},{"title":"程序语言基础","progress":"76"},{"title":"操作系统","progress":"64"},{"title":"数据库","progress":"2"},{"title":"网络安全","progress":"28"},{"title":"计算机系统基础","progress":"182"},{"title":"计算机网络基础","progress":"48"},{"title":"软件工程","progress":"73"},{"title":"项目管理基础","progress":"26"},{"title":"知识产权、商标、标准化","progress":"22"},{"title":"多媒体基础","progress":"28"},{"title":"专业英语","progress":"45"}],
    "14":[{"title":"计算机基础知识","list":[{"title":"计算机技术概述","progress":"7"},{"title":"计算机中数据的表示","progress":"15"},{"title":"数据校验码","progress":"3"}]},{"title":"计算机硬件及系统组成","list":[{"title":"计算机的基础组成原理","progress":"8"},{"title":"中央处理器CPU","progress":"23"},{"title":"内部和外部存储器","progress":"30"},{"title":"输入输出接口及其设备","progress":"1"},{"title":"显示器","progress":"5"}]},{"title":"计算机软件基础知识","list":[{"title":"操作系统的原理及使用","progress":"26"},{"title":"程序设计语言基础知识","progress":"34"},{"title":"软件工程","progress":"20"},{"title":"软件项目管理","progress":"7"}]},{"title":"计算机网络与通信基础知识","list":[{"title":"网络参考模型与网络协议","progress":"21"},{"title":"局域网、广域网基本概念及其功能","progress":"12"},{"title":"Internet的基本概念及其应用","progress":"11"},{"title":"网络基础","progress":"6"},{"title":"综合布线","progress":"1"},{"title":"网络设备","progress":"2"}]},{"title":"多媒体技术及其应用","list":[{"title":"多媒体的定义和关键技术","progress":"4"},{"title":"多媒体技术基础","progress":"10"},{"title":"多媒体技术标准","progress":"31"},{"title":"多媒体传输协议","progress":"9"},{"title":"多媒体应用软件","progress":"8"},{"title":"多媒体技术的应用","progress":"1"},{"title":"电视","progress":"27"},{"title":"印刷和打印","progress":"25"}]},{"title":"多媒体数据处理技术","list":[{"title":"音频信息获取和处理","progress":"41"},{"title":"视频信息获取和处理","progress":"36"},{"title":"图像信息获取和处理","progress":"46"},{"title":"多媒体数据压缩编码技术基础","progress":"56"}]},{"title":"信息安全性知识","list":[{"title":"信息安全性基本概念","progress":"10"},{"title":"计算机病毒防范","progress":"3"},{"title":"加密解密机制与信息加密策略","progress":"3"},{"title":"身份验证和访问控制策略","progress":"1"}]},{"title":"知识产权的有关法律、法规","list":[{"title":"知识产权","progress":"10"},{"title":"商标权","progress":"3"},{"title":"计算机软件著作权","progress":"4"}]},{"title":"专业英语","list":[{"title":"专业英语","progress":"40"}]}],
    "15":[{"title":"计算机硬件基础","list":[{"title":"计算机基本组成","progress":"18"},{"title":"计算机的系统结构","progress":"15"},{"title":"计算机存储系统","progress":"14"},{"title":"计算机应用领域","progress":"1"}]},{"title":"操作系统知识","list":[{"title":"操作系统简介","progress":"7"},{"title":"处理机管理","progress":"2"},{"title":"文件管理","progress":"9"},{"title":"存储管理","progress":"2"},{"title":"作业管理","progress":"1"}]},{"title":"程序设计语言","list":[{"title":"程序设计语言基础知识","progress":"18"},{"title":"程序编译、解释系统","progress":"6"}]},{"title":"系统配置和方法","list":[{"title":"系统配置技术","progress":"1"},{"title":"系统性能","progress":"6"},{"title":"系统可靠性","progress":"1"}]},{"title":"数据结构与算法","list":[{"title":"数据结构与算法简介","progress":"7"},{"title":"线性表","progress":"1"},{"title":"栈和队列","progress":"5"},{"title":"数组和广义表","progress":"2"},{"title":"树和二叉树","progress":"3"}]},{"title":"多媒体基础知识","list":[{"title":"多媒体技术概论","progress":"13"},{"title":"多媒体压缩编码技术","progress":"1"},{"title":"多媒体技术应用","progress":"10"}]},{"title":"网络基础知识","list":[{"title":"网络的基础知识","progress":"8"},{"title":"计算机局域网","progress":"7"},{"title":"计算机网络传输","progress":"3"},{"title":"计算机网络体系结构与协议","progress":"12"},{"title":"网络安全","progress":"4"},{"title":"网络的管理与管理软件","progress":"2"},{"title":"因特网基础知识及其应用","progress":"19"}]},{"title":"数据库技术","list":[{"title":"数据库技术基础","progress":"32"},{"title":"数据库管理系统","progress":"5"},{"title":"关系数据库的数据操作","progress":"18"}]},{"title":"安全性知识","list":[{"title":"安全性简介","progress":"5"},{"title":"安全分析","progress":"2"},{"title":"安全管理","progress":"9"},{"title":"安全管理的执行","progress":"1"},{"title":"技术安全措施","progress":"2"},{"title":"物理安全措施","progress":"2"},{"title":"管理安全措施","progress":"1"},{"title":"访问控制和鉴别","progress":"7"},{"title":"可用性保障","progress":"1"},{"title":"计算机病毒的防治与计算机犯罪的防范","progress":"7"}]},{"title":"信息系统开发","list":[{"title":"信息系统概述","progress":"19"},{"title":"信息系统工程概述","progress":"1"},{"title":"信息系统开发概述","progress":"16"},{"title":"信息系统项目","progress":"10"},{"title":"信息系统中的项目管理","progress":"9"},{"title":"信息系统开发的管理工具","progress":"4"}]},{"title":"信息系统分析","list":[{"title":"系统分析任务","progress":"7"},{"title":"结构化分析方法","progress":"17"},{"title":"系统说明书","progress":"3"},{"title":"系统分析工具(UML、U/C矩阵、数据流程图)","progress":"20"}]},{"title":"信息系统设计","list":[{"title":"系统设计概述","progress":"12"},{"title":"结构化设计方法和工具","progress":"11"},{"title":"系统详细设计","progress":"10"},{"title":"系统总体设计","progress":"6"},{"title":"系统设计说明书","progress":"1"}]},{"title":"信息系统实施","list":[{"title":"系统实施概述","progress":"1"},{"title":"程序设计方法","progress":"1"},{"title":"系统测试","progress":"18"}]},{"title":"信息化与标准化","list":[{"title":"信息化战略与策略","progress":"4"},{"title":"企业信息资源管理","progress":"2"},{"title":"标准化基础","progress":"4"},{"title":"标准化应用","progress":"6"}]},{"title":"系统管理规划","list":[{"title":"系统管理的定义","progress":"15"},{"title":"系统管理服务","progress":"4"},{"title":"IT财务管理","progress":"6"},{"title":"制定系统管理计划","progress":"3"}]},{"title":"系统管理综述","list":[{"title":"系统运行","progress":"4"},{"title":"系统用户管理","progress":"8"},{"title":"IT部门人员管理","progress":"16"},{"title":"系统日常操作管理","progress":"5"},{"title":"运作管理工具","progress":"1"},{"title":"成本管理","progress":"15"},{"title":"计费管理","progress":"1"},{"title":"系统管理标准简介","progress":"7"},{"title":"分布式系统的管理","progress":"3"}]},{"title":"资源管理","list":[{"title":"资源管理概述","progress":"7"},{"title":"数据管理","progress":"8"},{"title":"网络资源管理","progress":"10"},{"title":"硬件管理","progress":"2"},{"title":"设施和设备管理","progress":"2"},{"title":"软件管理、软件著作权、商标","progress":"33"}]},{"title":"故障管理","list":[{"title":"故障管理概述","progress":"6"},{"title":"故障管理流程","progress":"5"},{"title":"主要故障处理","progress":"3"},{"title":"问题控制与管理","progress":"9"}]},{"title":"性能及能力管理","list":[{"title":"系统能力管理","progress":"8"},{"title":"系统性能评价","progress":"15"}]},{"title":"系统维护","list":[{"title":"系统维护概述","progress":"5"},{"title":"制定系统维护计划","progress":"1"},{"title":"维护工作的实施","progress":"2"}]},{"title":"新系统运行及系统转换","list":[{"title":"制定计划","progress":"1"},{"title":"系统转换","progress":"6"},{"title":"开发环境管理","progress":"1"}]},{"title":"信息系统评价","list":[{"title":"信息系统评价概述","progress":"9"},{"title":"信息系统评价项目","progress":"1"},{"title":"评价项目的标准","progress":"1"}]},{"title":"系统用户支持","list":[{"title":"用户支持","progress":"1"},{"title":"用户咨询","progress":"1"},{"title":"帮助服务台","progress":"1"}]},{"title":" 软件工程","list":[{"title":"软件工程基础","progress":"2"}]},{"title":"专业英语","list":[{"title":"专业英语","progress":"50"}]}],
    "16":[{"title":"信息化基础","list":[{"title":"信息化概念","progress":"27"},{"title":"电子政务","progress":"27"},{"title":"企业信息化与电子政务","progress":"63"},{"title":"信息资源开发利用及共享","progress":"1"},{"title":"信息化法规政策标准规范","progress":"9"}]},{"title":"信息系统项目管理","list":[{"title":"信息系统服务管理","progress":"23"},{"title":"信息系统集成资质管理","progress":"24"},{"title":"信息系统工程监理资质管理","progress":"12"}]},{"title":"信息系统集成专业技术知识","list":[{"title":"软件工程","progress":"57"},{"title":"面向对象系统分析与设计","progress":"22"},{"title":"软件体系结构","progress":"13"},{"title":"信息系统建设","progress":"14"},{"title":"系统集成","progress":"11"},{"title":"典型应用集成技术","progress":"46"},{"title":"计算机网络知识","progress":"111"}]},{"title":"项目管理一般知识","list":[{"title":"项目管理的理论基础与体系","progress":"26"},{"title":"项目生命周期和组织","progress":"9"}]},{"title":"立项管理","list":[{"title":"立项管理内容","progress":"31"},{"title":"建设方的立项管理","progress":"27"},{"title":"承建方的立项管理","progress":"14"},{"title":"签订合同","progress":"2"}]},{"title":"项目整体管理","list":[{"title":"项目章程","progress":"17"},{"title":"项目整体管理的含义、主要活动和流程","progress":"5"},{"title":"编制初步范围说明书","progress":"5"},{"title":"项目管理计划","progress":"22"},{"title":"项目计划实施的监督和控制","progress":"2"},{"title":"项目整体变更控制","progress":"9"},{"title":"项目收尾","progress":"14"}]},{"title":"范围管理","list":[{"title":"项目范围和项目范围管理","progress":"13"},{"title":"制定范围计划","progress":"6"},{"title":"范围定义和工作分解结构","progress":"24"},{"title":"项目范围确认","progress":"13"},{"title":"项目范围控制","progress":"6"}]},{"title":"项目进度管理","list":[{"title":"活动定义","progress":"1"},{"title":"活动排序","progress":"12"},{"title":"活动资源估算","progress":"9"},{"title":"活动历时估算","progress":"28"},{"title":"制定进度计划","progress":"15"},{"title":"项目进度控制","progress":"26"}]},{"title":"项目成本管理","list":[{"title":"项目成本管理概念及相关术语","progress":"19"},{"title":"项目成本预算","progress":"11"},{"title":"项目成本估算","progress":"24"},{"title":"项目成本控制","progress":"22"}]},{"title":"项目质量管理","list":[{"title":"质量管理基础","progress":"18"},{"title":"制定项目质量计划","progress":"9"},{"title":"项目质量保证","progress":"14"},{"title":"项目质量控制","progress":"32"}]},{"title":"项目人力资源管理","list":[{"title":"项目人力资源管理有关概念","progress":"6"},{"title":"项目人力资源计划制定","progress":"14"},{"title":"项目团队管理","progress":"20"},{"title":"项目团队组织建设","progress":"18"}]},{"title":"项目沟通管理","list":[{"title":"项目沟通管理的基本概念","progress":"10"},{"title":"沟通管理计划编制","progress":"14"},{"title":"信息分发","progress":"9"},{"title":"绩效报告","progress":"4"},{"title":"项目干系人管理","progress":"17"}]},{"title":"项目合同管理","list":[{"title":"项目合同","progress":"9"},{"title":"项目合同的分类","progress":"9"},{"title":"项目合同签订","progress":"9"},{"title":"项目合同管理","progress":"29"}]},{"title":"项目采购管理","list":[{"title":"采购管理的相关概念和主要过程","progress":"10"},{"title":"编制询价计划","progress":"6"},{"title":"编制采购计划","progress":"18"},{"title":"询价","progress":"1"},{"title":"招标","progress":"18"},{"title":"合同管理及收尾","progress":"3"}]},{"title":"信息（文档）与配置管理","list":[{"title":"信息系统项目相关信息（文档）及其管理","progress":"24"},{"title":"配置管理","progress":"44"}]},{"title":"项目变更管理","list":[{"title":"项目变更基本概念","progress":"10"},{"title":"变更管理的基本原则","progress":"3"},{"title":"变更管理组织机构与工作程序","progress":"16"},{"title":"项目变更管理的工作内容","progress":"29"}]},{"title":"信息安全管理","list":[{"title":"信息安全管理","progress":"9"},{"title":"信息系统安全","progress":"15"},{"title":"人员安全管理","progress":"4"},{"title":"物理安全管理","progress":"6"},{"title":"应用系统安全管理","progress":"14"}]},{"title":"项目风险管理","list":[{"title":"风险和风险管理","progress":"12"},{"title":"风险识别","progress":"19"},{"title":"定量风险分析","progress":"17"},{"title":"风险监控","progress":"3"},{"title":"制定定性风险管理计划","progress":"6"},{"title":"应对风险的基本措施（规避/接受/减轻/转移）","progress":"10"}]},{"title":"知识产权管理","list":[{"title":"知识产权管理概念","progress":"4"},{"title":"知识产权管理相关法律法规","progress":"2"},{"title":"知识产权管理工作的范围和内容","progress":"2"}]},{"title":"法律法规和标准规范","list":[{"title":"法律","progress":"43"},{"title":"软件工程的国家标准","progress":"24"},{"title":"机房、网络、综合布线相关标准","progress":"20"}]},{"title":"运维服务管理知识","list":[{"title":"运维服务管理","progress":"1"}]},{"title":"新技术的发展","list":[{"title":"新一代信息技术的发展","progress":"34"}]},{"title":"专业英语","list":[{"title":"专业英语","progress":"110"}]}],
    "17":[{"title":"数据结构与算法","list":[{"title":"算法设计概述","progress":"8"},{"title":"线性表","progress":"79"},{"title":"树和二叉树","progress":"36"},{"title":"图","progress":"17"},{"title":"排序与查找","progress":"33"},{"title":"数据结构基础","progress":"5"},{"title":"矩阵","progress":"17"}]},{"title":"程序语言基础知识","list":[{"title":"汇编系统基本原理","progress":"4"},{"title":"编译系统基本原理","progress":"16"},{"title":"解释系统基本原理","progress":"9"},{"title":"程序语言基础","progress":"97"},{"title":"程序语言的控制结构","progress":"18"},{"title":"程序语言的数据类型","progress":"2"},{"title":"HTML语言","progress":"18"}]},{"title":"操作系统基础知识","list":[{"title":"操作系统的功能、类型和层次结构","progress":"6"},{"title":"处理机管理（进程管理）","progress":"37"},{"title":"存储管理","progress":"18"},{"title":"设备管理","progress":"2"},{"title":"文件管理","progress":"5"},{"title":"网络操作系统","progress":"2"},{"title":"嵌入式操作系统","progress":"3"}]},{"title":"软件开发和运行维护基础知识","list":[{"title":"软件工程和项目管理基础知识","progress":"80"},{"title":"系统分析与系统设计基础知识","progress":"36"},{"title":"程序测试基础知识","progress":"41"},{"title":"程序设计基础知识","progress":"9"},{"title":"软件开发文档基础知识","progress":"5"},{"title":"软件运行和维护基础知识","progress":"13"},{"title":"面向对象技术","progress":"66"},{"title":"统一建模语言(UML)","progress":"35"}]},{"title":"数据库系统","list":[{"title":"数据库管理系统的功能和特征","progress":"9"},{"title":"数据库模型","progress":"2"},{"title":"数据模型","progress":"30"},{"title":"数据库语言","progress":"60"},{"title":"数据操作","progress":"8"},{"title":"数据库的控制功能","progress":"10"}]},{"title":"多媒体技术及其应用","list":[{"title":"多媒体技术基本概念","progress":"23"},{"title":"图形图像","progress":"16"},{"title":"音频","progress":"23"},{"title":"视频","progress":"2"}]},{"title":"计算机硬件基础知识","list":[{"title":"数制及其转换","progress":"15"},{"title":"数据的表示","progress":"49"},{"title":"算术运算和逻辑运算","progress":"16"},{"title":"计算机系统的组成","progress":"1"},{"title":"计算机类型和特点","progress":"1"},{"title":"中央处理器CPU","progress":"56"},{"title":"输入/输出及通信设备","progress":"18"},{"title":"存储器系统","progress":"48"}]},{"title":"计算机应用基础知识","list":[{"title":"Windows基本操作","progress":"45"},{"title":"办公自动化","progress":"69"},{"title":"电子邮件","progress":"12"},{"title":"浏览器","progress":"6"},{"title":"信息处理实务","progress":"5"}]},{"title":"信息安全与系统性能指标","list":[{"title":"数据安全与保密","progress":"21"},{"title":"计算机木马的防治","progress":"2"},{"title":"计算机病毒的防治","progress":"13"}]},{"title":"网络基础知识","list":[{"title":"网络的功能、分类与组成","progress":"13"},{"title":"网络协议与标准","progress":"37"},{"title":"Internet和Intranet初步","progress":"33"},{"title":"网络安全","progress":"12"}]},{"title":"软件的知识产权保护","list":[{"title":"著作权法及实施条例","progress":"18"},{"title":"计算机软件保护条例","progress":"10"},{"title":"专利法及实施细则","progress":"1"},{"title":"商标法及实施条例","progress":"11"},{"title":"反不正当竞争法","progress":"3"}]},{"title":"应用数学","list":[{"title":"应用数学","progress":"55"}]},{"title":"专业英语","list":[{"title":"专业英语","progress":"105"}]}],
    "18":[{"title":"计算机科学基础","list":[{"title":"数制及其转换","progress":"9"},{"title":"数据的表示","progress":"29"},{"title":"数据运算","progress":"7"},{"title":"多媒体技术","progress":"42"}]},{"title":"计算机硬件基础","list":[{"title":"计算机组成","progress":"14"},{"title":"指令系统","progress":"17"},{"title":"中断系统","progress":"5"},{"title":"存储体系","progress":"31"},{"title":"性能评估","progress":"10"},{"title":"中央处理器CPU","progress":"22"}]},{"title":"计算机软件基础","list":[{"title":"程序语言基础","progress":"36"},{"title":"操作系统基础","progress":"10"},{"title":"数据库系统基础","progress":"7"},{"title":"面向对象方法","progress":"7"},{"title":"数据结构","progress":"7"},{"title":"软件工程和项目管理","progress":"11"}]},{"title":"网络体系结构","list":[{"title":"OSI参考模型","progress":"7"},{"title":"协议层次关系","progress":"3"},{"title":"TCP与UDP","progress":"32"},{"title":"IP协议","progress":"12"},{"title":"低层协议","progress":"33"},{"title":"应用层协议","progress":"44"}]},{"title":"数据通信基础","list":[{"title":"信道特性","progress":"31"},{"title":"数字编码与编码效率","progress":"16"},{"title":"调制技术","progress":"2"},{"title":"复用技术","progress":"9"},{"title":"差错控制","progress":"2"}]},{"title":"局域网技术","list":[{"title":"网络传输介质","progress":"13"},{"title":"网络设备","progress":"61"},{"title":"综合布线技术","progress":"12"},{"title":"以太网技术","progress":"40"},{"title":"无线局域网","progress":"14"},{"title":"虚拟局域网","progress":"11"},{"title":"网络设计","progress":"5"}]},{"title":"广域网与接入网技术","list":[{"title":"常见广域网技术","progress":"18"},{"title":"电话线路接入","progress":"8"},{"title":"同轴＋光纤接入","progress":"11"},{"title":"交换技术","progress":"2"},{"title":"路由技术与路由协议","progress":"39"}]},{"title":"因特网与网络互联技术","list":[{"title":"IP地址分类","progress":"16"},{"title":"IP分配与子网划分","progress":"101"},{"title":"CIDR","progress":"3"},{"title":"TCP/IP端口","progress":"3"},{"title":"IPv6协议","progress":"15"},{"title":"互联网应用","progress":"14"}]},{"title":"网络安全技术","list":[{"title":"网络安全基础","progress":"11"},{"title":"计算机病毒与网络攻击","progress":"39"},{"title":"加密与密钥管理技术","progress":"17"},{"title":"数字签名与数字证书","progress":"16"},{"title":"防火墙技术","progress":"14"},{"title":"入侵检测技术","progress":"3"}]},{"title":"网络管理技术","list":[{"title":"网络管理体系","progress":"8"},{"title":"Windows基本管理","progress":"23"},{"title":"Linux基本管理","progress":"46"},{"title":"网络管理协议","progress":"31"},{"title":"网络诊断命令与故障分析","progress":"72"},{"title":"管理工具与网络存储","progress":"3"}]},{"title":"网络应用配置","list":[{"title":"IIS服务配置","progress":"32"},{"title":"DNS服务","progress":"21"},{"title":"DHCP服务","progress":"36"}]},{"title":"网络编程技术","list":[{"title":"HTML基础知识","progress":"85"},{"title":"动态编程技术","progress":"11"},{"title":"XML可扩展标记","progress":"2"}]},{"title":"知识产权知识","list":[{"title":"专利法","progress":"2"},{"title":"著作权法","progress":"19"},{"title":"商标法及实施条例","progress":"5"},{"title":"计算机软件保护条例","progress":"3"},{"title":"反不正当竞争法","progress":"2"}]},{"title":"计算机应用知识","list":[{"title":"Windows基本操作","progress":"30"},{"title":"Word基本操作","progress":"12"},{"title":"Excel基本操作","progress":"27"},{"title":"上网基础操作","progress":"48"},{"title":"云计算","progress":"2"},{"title":"电子政务与电子商务","progress":"1"},{"title":"信息处理实务","progress":"4"},{"title":"前沿技术","progress":"1"}]},{"title":"应用数学","list":[{"title":"应用数学","progress":"3"}]},{"title":"专业英语","list":[{"title":"专业英语","progress":"105"}]}],
    "19":[{"title":"信息处理技术","list":[{"title":"信息处理技术概论","progress":"22"},{"title":"信息处理相关概念和术语","progress":"93"},{"title":"信息处理实务","progress":"161"},{"title":"初等数学基础","progress":"67"},{"title":"信息与网络安全","progress":"71"},{"title":"知识产权与标准法规","progress":"46"}]},{"title":"计算机系统","list":[{"title":"计算机系统基础","progress":"35"},{"title":"计算机系统概论","progress":"31"},{"title":"主机系统","progress":"29"},{"title":"外部设备","progress":"45"},{"title":"软件系统","progress":"36"},{"title":"多媒体信息处理","progress":"16"},{"title":"数据压缩","progress":"7"}]},{"title":"计算机网络","list":[{"title":"计算机网络基础","progress":"18"},{"title":"计算机网络概论","progress":"15"},{"title":"网络协议","progress":"22"},{"title":"网络设备","progress":"6"},{"title":"网络连接","progress":"2"},{"title":"电子邮件","progress":"3"},{"title":"Internet应用","progress":"7"}]},{"title":"操作系统","list":[{"title":"Windows操作系统","progress":"4"},{"title":"Windows操作系统概论","progress":"25"},{"title":"Windows基本操作","progress":"40"},{"title":"Windows文件管理","progress":"32"},{"title":"控制面板与其他功能","progress":"11"}]},{"title":"文字信息","list":[{"title":"文字信息处理","progress":"25"},{"title":"Word文字处理概论","progress":"38"},{"title":"文本内容编辑","progress":"43"},{"title":"格式排版","progress":"37"},{"title":"其他常用操作","progress":"57"}]},{"title":"电子表格","list":[{"title":"电子表格处理","progress":"17"},{"title":"Excel电子表格概论","progress":"18"},{"title":"工作表编辑排版","progress":"8"},{"title":"公式与函数","progress":"170"},{"title":"数据图表与统计分析","progress":"38"}]},{"title":"演示文稿","list":[{"title":"演示文稿处理","progress":"2"},{"title":"演示文稿概论","progress":"20"},{"title":"文稿的编辑排版","progress":"11"},{"title":"动画效果设置与幻灯片放映","progress":"40"}]},{"title":"数据库应用基础","list":[{"title":"数据库概论","progress":"28"},{"title":"Access数据库的基本操作","progress":"32"}]},{"title":"信息化","list":[{"title":"信息化基础","progress":"27"}]},{"title":"计算机基础","list":[{"title":"数据结构","progress":"15"}]},{"title":"专业英语","list":[{"title":"专业英语","progress":"105"}]}]
}