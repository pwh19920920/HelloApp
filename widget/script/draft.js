var draftMap = {};
var draftMoveFunc = function(e){e.preventDefault();};

function showDraft() {
    document.body.style.overflow='hidden';        
    document.addEventListener("touchmove",draftMoveFunc,false);//禁止页面滑动

    $api.css($api.byId("draft"), 'display:block');
    // $api.html($api.byId("canvasMake"), "<canvas id='canvas' width='{0}px' height='{1}px'></canvas>".format(412, 838))
    $api.html($api.byId("canvasMake"), "<canvas id='canvas' width='{0}px' height='{1}px'></canvas>".format(api.winWidth, api.winHeight))
    drawingBoard.init();
}

function closeDraft() {
    document.body.style.overflow='';//出现滚动条
    document.removeEventListener("touchmove",draftMoveFunc,false);   

    $api.css($api.byId("draft"), 'display:none');
    draftMap[mySwiper.realIndex] = {
        "imgArr": drawingBoard.imgArr,
        "imgDeleteArr": drawingBoard.imgDeleteArr
    }
}

var drawingBoard = {
    canvas: null,
    ctx: null,
    ul_node: null,
    imgArr: [], //存放图片
    imgDeleteArr: [], //存放图片
    init: function() {
        this.canvas = document.getElementById('canvas');
        this.ctx = document.getElementById('canvas').getContext('2d')
        this.ul_node = document.getElementById('draft-btns')
        this.ctx.lineWidth = 1
        this.ctx.strokeStyle = "#000000";

        this.ctx.lineCap = 'round';
        this.ctx.lineJoin = 'round';
        this.drawing(); //开始画画
        this.btnsFnAll();

        var obj = draftMap[mySwiper.realIndex];
        if (obj) {
            this.imgArr = obj.imgArr;
            this.imgDeleteArr = obj.imgDeleteArr;
            this.ctx.putImageData(this.imgArr[this.imgArr.length - 1], 0, 0)

            this.showDraftIcon()
        } else {
            this.imgArr = [];
            this.imgDeleteArr = [];

            var imgData = this.ctx.getImageData(0, 0, this.canvas.offsetWidth, this.canvas.offsetHeight);
            this.imgArr.push(imgData)
        }
    },
    drawing: function() {
        var self = this;
        var left = this.canvas.offsetLeft;
        this.canvas.addEventListener('touchstart', function(e) {
            var e_x = e.targetTouches[0].clientX; //鼠标在画布上的x点
            var e_y = e.targetTouches[0].clientY;
            self.ctx.beginPath(); //开始绘制
            self.ctx.moveTo(e_x - left, e_y - left); //落笔点，开始点
            // var imgData = self.ctx.getImageData(0, 0, self.canvas.offsetWidth, self.canvas.offsetHeight);
            // self.imgArr.push(imgData)
        })
        this.canvas.addEventListener('touchmove', function(e) {
            self.ctx.lineTo(e.targetTouches[0].clientX - left, e.targetTouches[0].clientY - left); //落笔点，开始点
            self.ctx.stroke();
        })
        this.canvas.addEventListener('touchend', function(e) {
            var imgData = self.ctx.getImageData(0, 0, self.canvas.offsetWidth, self.canvas.offsetHeight);
            self.imgArr.push(imgData)
            self.imgDeleteArr = []
            self.ctx.closePath(); //闭合当前的路径 结束绘制

            self.showDraftIcon()
        })
    },
    btnsFnAll: function() {
        var self = this;
        this.ul_node.addEventListener('click', function(e) {
            switch (e.target.id) {
                case 'draft-delete': //清屏
                    self.ctx.clearRect(0, 0, self.canvas.offsetWidth, self.canvas.offsetHeight)

                    var imgData = self.ctx.getImageData(0, 0, self.canvas.offsetWidth, self.canvas.offsetHeight);
                    self.imgArr.push(imgData)
                    self.imgDeleteArr = []
                    self.showDraftIcon()
                    break;
                case 'draft-huifu': //恢复
                    if (self.imgDeleteArr.length > 0) {
                        var popData = self.imgDeleteArr.pop();
                        self.imgArr.push(popData)
                        self.ctx.putImageData(popData, 0, 0)
                    }
                    self.showDraftIcon()
                    break;
                case 'draft-chexiao': //撤销
                    if (self.imgArr.length > 1) {
                        var popData = self.imgArr.pop();
                        self.imgDeleteArr.push(popData)
                        self.ctx.putImageData(self.imgArr[self.imgArr.length - 1], 0, 0)
                    }
                    self.showDraftIcon()
                    break;
            }
        });
    },
    showDraftIcon(){
        $api.css($api.byId("draft-chexiao"), this.imgArr.length > 1 ? 'color:white' : 'color: #bbb');
        $api.css($api.byId("draft-huifu"), this.imgDeleteArr.length > 0 ? 'color:white' : 'color: #bbb');
    }
}