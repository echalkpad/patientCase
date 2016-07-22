var vitalSign = {
  function1: function(){
    console.info("--------function1");
  },

  initialize: function(options){
    //console.log(options);
    var params = {
      _s:options.startTime+" 00:00:00",
      _e:options.endTime+" 00:00:00",
      _u:options.timeUnit,
      _swidth:1200,
      //initPixel:options.leftTitleWidth,
      initPixel:140,
      equalsPixel:options.horizontalDistance,
      percentPixel:options.timeOffsetPercentage
    }
    dt=dt==null?new DateTime():dt;
    dt.init(params);
    initLaboratoryData(laboratoryData);
    initVistalSignData(vitalSignData);


  }
}
var dt=null;//时间
var dotMap=new Map();
var cacheMap=new Map();
/**
*休征
**/
var initVistalSignDataFlag = false;
var vitalSignObj = {};
//数据处理
function initVistalSignData(data){
  if(initVistalSignDataFlag){
    twoDraw(vitalSignObj);
    return;
  }
  var obj = vitalSignObj;
  for(var i = 0; i < data.length; i++){
    var caseNo = data[i].caseNo;
    var vitalSigns = data[i].vitalSigns;
    for(var j = 0; j < vitalSigns.length; j++){
      var measures = vitalSigns[j].measures;
      var measureCode = vitalSigns[j].measureCode;
      var vitalConfig = vitalSigns[j].vitalConfig;
      var shapDraw="a";
      var shapReDraw="c";
      if(constant.shape[measureCode]){
        shapDraw=constant.shape[measureCode].draw||"a";
        shapReDraw=constant.shape[measureCode].reDraw||"c";
      }
      var pconfig = {
        titleName:vitalConfig.measureName,
        isTrend:vitalConfig.isTrend,
        method:vitalConfig.measureMethod,
        maxValue:vitalConfig.maxinumValue,
        minValue:vitalConfig.mininumValue,
        scaleValue:vitalConfig.scaleValue,
        normalHigh:vitalConfig.normalHigh,
        normalLow:vitalConfig.normalLow,
        lineColor:vitalConfig.lineColor||"#000000",
        shapDraw:shapDraw,
        shapReDraw:shapReDraw
      }
      if(obj[measureCode]){
        Array.prototype.push.apply(obj[measureCode].measures, measures);
      } else {
        obj[measureCode] = new VitalSignCoordinateSystem({_code:measureCode,_items:measures,_config:vitalConfig,_pconfig:pconfig,dt:dt});
      }
    }
  }
  initVistalSignDataFlag=true;
  drawDot({obj:obj,resultName:"measureResult",pid:"vitalSign"});//描点
}
//二次画
function twoDraw(obj){
  for(var key in obj){
    obj[key].dt=dt;
    obj[key].drawSlide();
  }
}
//描点及参数处理
function drawDot(options){
  var obj = options.obj||{};
  var resultName = options.resultName||"";
  var pid = options.pid||"";
  var addCanvas = function(id){
    var canvas = cele("canvas");
    canvas.setAttribute("id",id);
    if($$(pid)) {
        $$(pid).appendChild(canvas);
        var ctx = canvas.getContext("2d");
        cacheMap.put("canvas_"+id,canvas);
        cacheMap.put("ctx_"+id,ctx);
    }
  }
  for(var key in obj){
    //对没有最大值和最小值的做处理
    if(obj[key]._pconfig.method==="1"&&(obj[key]._pconfig.maxValue===""||obj[key]._pconfig.minValue==="")){
      var regex = /^[0-9]+[.]?[0-9]*$/g;
      if(!regex.test(obj[key]._items[0][resultName])){
        obj[key]._pconfig.method="2";
      } else {
        var items = obj[key]._items;
        var maxValue=items[0][resultName],minValue=items[0][resultName];
        var items = obj[key]._items;
        for(var i = 1; i < items.length; i++){
          if(maxValue<items[i][resultName]){
            maxValue=items[i][resultName];
          }
          if(minValue>items[i][resultName]){
            minValue=items[i][resultName];
          }
        }
        if(obj[key]._pconfig.normalLow!==""){
          minValue=minValue>obj[key]._pconfig.normalLow?obj[key]._pconfig.normalLow:maxValue;
        }
        if(obj[key]._pconfig.normalHigh!==""){
          maxValue=parseFloat(maxValue)+parseFloat(obj[key]._pconfig.normalHigh);
        }
        obj[key]._pconfig.maxValue=parseFloat(maxValue)+parseFloat(maxValue)*0.5;
        obj[key]._pconfig.minValue=parseFloat(minValue)-parseFloat(minValue)*0.5;
      }
    }
    //创建canvas元素
    addCanvas(key);
    //参数初始化
    obj[key].init();
    //初使化描点与事件绑定
    if($$(key)){
      obj[key].draw();
      $$(key).addEventListener("mousemove", function(e){
        var x = e.offsetX?e.offsetX:e.layerX;
        var y = e.offsetY?e.offsetY:e.layerY;
        //console.log("坐标：[" + x + "," + y + "]");
        obj[this.id].reDraw(x, y);
      });
    }
  }
}
var laboratoryObj = {};
var initLaboratoryDataFlag=false;
/**
*检验报告
**/
//数据处理
function initLaboratoryData(data){
  if(initLaboratoryDataFlag){
    twoDraw(laboratoryObj);
    return;
  }
  var obj = laboratoryObj;
  for(var i = 0; i < data.length; i++){
    var caseNo = data[i].caseNo;
    var laboratories = data[i].laboratories;
    for(var j = 0; j < laboratories.length; j++){
      var testitems = laboratories[j].testitems;
      var testitemCode = laboratories[j].testitemCode;
      var labConfig = laboratories[j].labConfig;
      var shapDraw="a";
      var shapReDraw="c";
      if(constant.shape[testitemCode]){
        shapDraw=constant.shape[testitemCode].draw||"a";
        shapReDraw=constant.shape[testitemCode].reDraw||"c";
      }
      var pconfig = {
        titleName:labConfig.testName,
        isTrend:labConfig.isTrend,
        method:labConfig.testMethod,
        maxValue:labConfig.maxinumValue,
        minValue:labConfig.mininumValue,
        scaleValue:labConfig.scaleValue,
        normalHigh:labConfig.normalHigh,
        normalLow:labConfig.normalLow,
        lineColor:labConfig.lineColor||"#000000",
        shapDraw:shapDraw,
        shapReDraw:shapReDraw
      }
      if(obj[testitemCode]){
        Array.prototype.push.apply(obj[testitemCode].testitems, testitems);
      } else {
        //pconfig={"最大值","最小值","刻度值","正常最大值","正常最小值","趋势图展现","方法","名称,"线颜色","图标","重绘图标"}
        obj[testitemCode] = new LaboratoryCoordinateSystem({_code:testitemCode,_items:testitems,_config:labConfig,_pconfig:pconfig,dt:dt});
        console.log("testitemCode:"+testitemCode);
      }
    }
  }
  initLaboratoryDataFlag=true;
  drawDot({obj:obj,resultName:"testResult",pid:"laboratory"});//描点
}
//层数据显示标志
var data_show_flag=true;
/**
*寄生继承
**/
function object(o){
  function F(){}
  F.prototype = o;
  return new F();
}
function inheritPrototype(p, c){
  var f = object(p.prototype);
  f.constructor = c;
  c.prototype = f;
}
/*=================定义Map开始==================
    用法 :  baseMap.put("key", value);
		 baseMap.remove("key");
		 var array = map.keySet();
	 	 for(var i in array) {
			alert("key:(" + array[i] +") value: ("+map.get(array[i])+")");
		 }
=================================================*/
	function Map(){
		this.container = new Object();
	}

	Map.prototype.put = function(key, value){
		this.container[key] = value;
	}

	Map.prototype.get = function(key){
		return this.container[key];
	}

	Map.prototype.keySet = function() {
		var keyset = new Array();
		var count = 0;
		for (var key in this.container) {
			// 跳过object的extend函数
			if (key == 'extend') {
				continue;
			}
			keyset[count] = key;
			count++;
		}
		return keyset;
	}

	Map.prototype.size = function() {
	var count = 0;
	for (var key in this.container) {
		// 跳过object的extend函数
		if (key == 'extend'){
			continue;
		}
			count++;
		}
		return count;
	}

	Map.prototype.remove = function(key) {
	   delete this.container[key];
	}
	/*===============定义Map结束=============*/
/**
*随机生成颜色
**/
var colors = [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 'a', 'b', 'c', 'd', 'f'];
function getColor(){
  var temp = "#";
  for(var i = 0; i < 6; i++){
    var index = parseInt(Math.random() * 14);
    temp += colors[index];
  }
  return temp;
};
/**
*扩展CanvasRenderingContext2D的clearArc方法
**/
CanvasRenderingContext2D.prototype.clear = function() {
  this.save();
  this.globalCompositeOperation = 'destination-out';
  this.fillStyle = 'black';
  this.fill();
  this.restore();
};
CanvasRenderingContext2D.prototype.clearArc = function(x, y, radius, startAngle, endAngle, anticlockwise) {
  this.beginPath();
  this.arc(x, y, radius, startAngle, endAngle, anticlockwise);
  this.clear();
};
/**
*点坐标
**/
function Point(x, y){
  this.x = x;
  this.y = y;
}
/**
*线坐标类 sp:起始点;ep:结束点;options:参数选项
**/
function Line(sp, ep, options){
  this.sp = sp;
  this.ep = ep;
  this._width = options._width || 2;
  this._strokeStyle = options._strokeStyle || "#000000";
}
Line.prototype.draw = function(ctx){
  //alert("["+this.sp.x +","+ this.sp.y + "]" + "["+this.ep.x +","+ this.ep.y+"]");
  ctx.save();
  ctx.lineWidth=this._width;
  ctx.strokeStyle=this._strokeStyle;
  ctx.beginPath();
  ctx.moveTo(this.sp.x,this.sp.y);
  ctx.lineTo(this.ep.x,this.ep.y);
  ctx.stroke();
  ctx.restore();
}
/**
*交叉线
**/
function CrossLine(oneL,twoL,x,y){
  this.oneL = oneL;
  this.twoL = twoL;
  this.x = x;
  this.y = y;
  this.r = 6;
}
CrossLine.prototype.draw = function(ctx){
  this.calcuCoordinate();
  this.oneL.draw(ctx);
  this.twoL.draw(ctx);
}
CrossLine.prototype.calcuCoordinate = function(){
  var p1 = new Point(this.x-this._length/2,this.y+this._length/2);
  var p2 = new Point(this.x+this._length/2,this.y-this._length/2);
  var p3 = new Point(this.x+this._length/2,this.y+this._length/2);
  var p4 = new Point(this.x-this._length/2,this.y-this._length/2);
  this.oneL.sp=p1;
  this.oneL.ep=p2;
  this.twoL.sp=p3;
  this.twoL.ep=p4;
}
function getCrossLine(x, y, options){
  var _length = options._length || 8
  var _strokeStyle = options._strokeStyle || "#000000";
  var p1 = new Point(x-_length/2,y+_length/2);
  var p2 = new Point(x+_length/2,y-_length/2);
  var line1 = new Line(p1,p2,{_width:2,_strokeStyle:_strokeStyle});
  var p3 = new Point(x+_length/2,y+_length/2);
  var p4 = new Point(x-_length/2,y-_length/2);
  var line2 = new Line(p3,p4,{_width:2,_strokeStyle:_strokeStyle});
  var crossLine = new CrossLine(line1,line2,x,y);
  crossLine._length=_length;
  crossLine._strokeStyle=_strokeStyle;
  return crossLine;
}
/**
*区域坐标类
**/
var Area = function(x, y){
  this.x = x;
  this.y = y;
}
/**
*圆坐标类
**/
/*****************/
function Circle(x, y, r, options){
  this.x = x;
  this.y = y;
  this.r = r;
  this._fillStyle=options._fillStyle || "#000000";
  this._strokeStyle=options._strokeStyle || "#000000";
  //console.log(this._fillStyle+" "+this._strokeStyle);
}
Circle.prototype.draw=function(ctx){
  ctx.save();
  ctx.fillStyle=this._fillStyle;
  ctx.strokeStyle=this._strokeStyle;
  ctx.beginPath();
  ctx.arc(this.x,this.y,this.r,0,2*Math.PI);
  ctx.fill();
  ctx.restore();
};
/*****************/
function BlackCircle(x, y, r,options){
  Circle.call(this, x, y, r,options);
}
inheritPrototype(Circle, BlackCircle);
BlackCircle.prototype.draw=function(ctx){
  ctx.save();
  ctx.fillStyle=this._fillStyle;
  ctx.strokeStyle=this._strokeStyle;
  ctx.beginPath();
  ctx.arc(this.x,this.y,this.r,0,2*Math.PI);
  ctx.fill();
  ctx.restore();
};
/*****************/
function ConcentricBlackCircle(x, y, r, options){
  Circle.call(this, x, y, r, options);
}
inheritPrototype(Circle, ConcentricBlackCircle);
ConcentricBlackCircle.prototype.draw=function(ctx){
  ctx.save();
  ctx.fillStyle=this._fillStyle;
  ctx.strokeStyle=this._strokeStyle;
  ctx.beginPath();
  ctx.arc(this.x,this.y,this.r,0,2*Math.PI);
  ctx.stroke();
  ctx.beginPath();
  ctx.arc(this.x,this.y,this.r/2,0,2*Math.PI);
  ctx.fill();
  ctx.restore();
};
/**
*矩形
**/
function Rectangle(x,y,options){
  this.x = x;
  this.y = y;
  this._fillStyle = options._fillStyle || "#ffffff";
  this._strokeStyle = options._strokeStyle || "#000000";
  this._alpha = options._alpha || 1;
  this._lineWidth=options._lineWidth || 1;
  this._data = options._data || [];
  this._width = options._width || 250;
}
Rectangle.prototype.draw=function(ctx){
  //console.log(this.data);
  var height = this._data.length*(constant.font.fontSize+this._lineWidth*2);
  var rectX = this.x+this._width>1024?this.x-this._width:this.x;
  var rectY = height+this.y>0?this.y-height:this.y;
  ctx.save();
  ctx.globalCompositeOperation="source-over";
  ctx.lineWidth=this._lineWidth;
  ctx.fillStyle=this._fillStyle;
  ctx.strokeStyle=this._strokeStyle;
  ctx.globalAlpha=this._alpha;
  ctx.beginPath();
  ctx.fillRect(rectX, rectY, this._width, height);
  ctx.strokeRect(rectX, rectY, this._width, height);
  ctx.restore();
  ctx.save();
  ctx.font=constant.font.fontSize+"px "+constant.font.fontStyle;
  for(var i = 0; i < this._data.length; i++){
    ctx.fillText(this._data[i], rectX, rectY+(i+1)*(constant.font.fontSize+this._lineWidth));
  }
  ctx.restore();
}
/**
*画布参数
*An = A1+(n-1)*d，画布按照等差数例进行绘制
*注：initValue:可以指定；equalsValue:可以指定；
*    number:可以指定；initPixel=0,其它值无意义；
*    equalsPixel:可以指定：title:画布标题
**/
var CanvasParameters = function(options){
  this.initValue = options.initValue || 0;
  this.equalsValue = options.equalsValue || 0;
  this.number = options.number || 0;
  this.initPixel = options.initPixel || 0;
  this.equalsPixel = options.equalsPixel || 0;
  this.title = options.title || "";
}
/**
*常量
**/
var constant = {
  "font":{
    fontSize:14,
    fontStyle:"楷体"
  },
  "admType":{
    O:"门诊",
    E:"急诊",
    I:"住院",
    H:"健康检查"
  },
  "siteCode":{
    1:"耳温",
    2:"口温",
    3:"肛温",
    4:"腋温",
    5:"颞温"
  },
  "shape":{
    BH:{
      draw:"a",
      reDraw:"c"
    },
    BW:{
      draw:"a",
      reDraw:"c"
    },
    TPR01:{
      draw:"b",
      reDraw:"c"
    },
    TPR02:{
      draw:"a",
      reDraw:"c"
    },
    TPR03:{
      draw:"a",
      reDraw:"c"
    }
  }
};
/**
*自定义方法$$
**/
function $$(id){
  return document.getElementById(id);
}
/**
*类封装
*dt:时间对象，data:数据，cp:画布参数
**/
function CoordinateSystem(options){
  this._code = options._code;//代码
  this._items = options._items;//数据
  this._config = options._config;//配置
  this._pconfig = options._pconfig;//公共配置
  this.dt = options.dt;//时间
  this.cid = options.cid;
}
/**
*画布参数
*An = A1+(n-1)*d，画布按照等差数例进行绘制
*注：initValue:可以指定；equalsValue:可以指定；
*    number:可以指定；initPixel=0,其它值无意义；
*    equalsPixel:可以指定：title:画布标题
**/
CoordinateSystem.prototype.initCanvasParams=function(){
  if(!this.cp){
    //var initValue=0,equalsValue=0,number=0,initPixel=0,equalsPixel=40,title=this._config.titleName||"";
    var minValue=this._pconfig.minValue||0;
    minValue=isNaN(parseFloat(minValue))?0:parseFloat(minValue);
    //alert(minValue+","+typeof minValue);
    var maxValue=this._pconfig.maxValue||0;
    maxValue=isNaN(parseFloat(maxValue))?0:parseFloat(maxValue);
    var scaleValue=this._pconfig.scaleValue||0;
    scaleValue=isNaN(parseFloat(scaleValue))?0:parseFloat(scaleValue);
    //console.log(typeof minValue+","+typeof maxValue+","+typeof scaleValue);
    var initValue=minValue;
    var equalsValue=scaleValue;
    var number=equalsValue!=0?Math.ceil((maxValue-minValue)/equalsValue):this._pconfig.method==="1"?5:1;
    equalsValue=equalsValue!=0?equalsValue:(maxValue-minValue)/number;
    //console.log("initValue:"+initValue+","+"equalsValue:"+equalsValue+","+"number:"+number);
    var title=this._pconfig.titleName||"";
    var params={
      initValue:initValue,
      equalsValue:equalsValue,
      number:number,
      initPixel:0,
      equalsPixel:40,
      title:title
    };
    this.cp = new CanvasParameters(params);
    //console.log(this.cp.title);
    //console.log(this.cp);
  }
}
/**
*插入排序
**/
function insertSort(array, data){
  var i;
  for(i=0; i<array.length; i++){
    if(data<=array[i]){
      array.splice(i, 0, data);
      return i;
    }
  }
  array.push(data);
  return i;
}
CoordinateSystem.prototype.initData=function(){
}
CoordinateSystem.prototype.initCanvas=function(){
  //this.initCanvasParams();
  //var canvas = $$(this._code);
  var canvas = cacheMap.get("canvas_"+this._code);
  var cp = this.cp;
  var dt = this.dt;
  canvas.height = cp.initPixel+cp.number*cp.equalsPixel;
  canvas.width = dt._swidth;
  //console.log(initPixel+number*equalsPixel);
  //var ctx = canvas.getContext("2d");
  var ctx = cacheMap.get("ctx_"+this._code);
  ctx.save();
  ctx.translate(0, canvas.height);
  ctx.font = constant.font.fontSize+"px "+constant.font.fontStyle;
  ctx.beginPath();
  for(var i = 0; i < cp.number; i++){
      //console.log("a["+(i)+"]=" + (initPixel+i*equalsPixel));
      ctx.moveTo(0, -(cp.initPixel+i*cp.equalsPixel));
      ctx.lineTo(canvas.width, -(cp.initPixel+i*cp.equalsPixel));
      if(this._pconfig.method==="1"){
        var text = cp.initValue+i*cp.equalsValue;
        if(text-parseInt(text)>0){
          text=text.toFixed(3);
        }
        ctx.fillText(text, 0, -(cp.initPixel+i*cp.equalsPixel));
      }
  }
  ctx.fillText(cp.title, 0, -(cp.initPixel+cp.number*cp.equalsPixel)+constant.font.fontSize);
  ctx.stroke();
  ctx.restore();
}
CoordinateSystem.prototype.calcuCoordinate=function(){
  //this.initData();
  var ordinates = new Array();
  //算法一：
  /*for(var i = 0; i < this.pulses.length; i++){
    var c = new Circle_1(i*120+120/2, this.pulses[i]-this.cp.initValue+this.cp.initPixel, 6);
    ordinates.push(c);
  }*/
  //算法二：
  for(var i = 0; i < this._data.length; i++){
    var t = this._data[i];
    var integer = parseInt(t);
    var decimal = t-integer;
    var x = 0,y = 0;
    var currentDate = this._date[i];
    var date = new Date(currentDate);
    var year = date.getFullYear();
    var month = date.getMonth();
    var day = date.getDate();
    var hours = date.getHours();
    var minutes = date.getMinutes();
    var seconds = date.getSeconds();
    var cDays = parseInt(this.dt.calcuDays(this.dt._s,currentDate))-1;
    var cHours = cDays*24;
    var cMonths = parseInt(this.dt.calcuMonths(this.dt._s,currentDate))-1;
    var cYears = parseInt(this.dt.calcuYears(this.dt._s,currentDate))-1;
    //天数*像素+像素/24/60/60*秒数
    switch (this.dt._u) {
      case "hour":
        x = this.dt.equalsPixel*cHours+this.dt.equalsPixel/60/60*(date.getHours()*60*60+minutes*60+seconds)-this.dt.percentPixel*this.dt._awidth+this.dt.initPixel;
        //console.log(currentDate+"["+"day:"+day+","+"hours:"+hours+","+"minutes:"+minutes+","+"seconds:"+seconds+"]"+" "+x);
        break;
      case "day":
        x = this.dt.equalsPixel*cDays+this.dt.equalsPixel/24/60/60*(hours*60*60+minutes*60+seconds)-this.dt.percentPixel*this.dt._awidth+this.dt.initPixel;
        //console.log(currentDate+"["+"day:"+day+","+"hours:"+hours+","+"minutes:"+minutes+","+"seconds:"+seconds+"]"+" "+x);
        break;
      case "month":
        var maxDay = new Date(year,month+1,0).getDate();
        x = this.dt.equalsPixel*cMonths+this.dt.equalsPixel/maxDay/24/60/60*(day*24*60*60+hours*60*60+minutes*60+seconds)-this.dt.percentPixel*this.dt._awidth+this.dt.initPixel;
        //console.log(currentDate+"["+"month:"+month+","+"day:"+day+","+"hours:"+hours+","+"minutes:"+minutes+","+"seconds:"+seconds+"]"+" "+x);
        break;
      case "year":
        x = this.dt.equalsPixel*cYears+this.dt.equalsPixel/12/30/24/60/60*(month*30*24*60*60+day*24*60*60+hours*60*60+minutes*60+seconds)-this.dt.percentPixel*this.dt._awidth+this.dt.initPixel;
        //console.log(currentDate+"["+"year:"+year+","+"month:"+month+","+"day:"+day+","+"hours:"+hours+","+"minutes:"+minutes+","+"seconds:"+seconds+"]"+" "+x);
        break;
      default:
        break;
    }
    if(this._pconfig.method==="1"){
      y = ((integer-this.cp.initValue)*this.cp.equalsPixel+decimal*this.cp.equalsPixel)/this.cp.equalsValue+this.cp.initPixel;
    } else {
      y = this.cp.equalsPixel/2;
    }
    x=parseInt(x);
    y=parseInt(y);
    console.log("[x="+x + ",y=" + y+"]"+"[v="+t+"]"+"[percentPixel="+this.dt.percentPixel+"]"+"[awidth="+this.dt._awidth+"]");
    var fillStyle="#000000",strokeStyle="#000000";
    if(this._pconfig.normalHigh!==""&&
       this._pconfig.normalLow!==""&&
       (parseFloat(this._data[i])>parseFloat(this._pconfig.normalHigh)||
       parseFloat(this._data[i])<parseFloat(this._pconfig.normalLow))){
      fillStyle="#008B00";
      strokeStyle="#008B00";
      //console.log("[fillStyle:"+fillStyle+","+"strokeStyle:"+strokeStyle+"]"+"[normalHigh:"+this._config.normalHigh+","+"normalLow:"+this._config.normalLow+"]"+"[data:"+this._data[i]+"]");
    }
    var params = {
      _fillStyle:fillStyle,
      _strokeStyle:strokeStyle,
      _length:8
    }
    //console.log(params);
    var o;
    switch(this._pconfig.shapDraw){
      case "a":
        o = new BlackCircle(x, -y, 6, params);
        break;
      case "b":
        o = getCrossLine(x,-y,params);
        break;
      case "c":
        o = new ConcentricBlackCircle(x, -y, 6, params);
        break;
      default:
        o = new BlackCircle(x, -y, 6, params);
        break;
    }
    o._x = o.x;
    o._y = o.y;
    //console.log(this._code+":"+"key_"+o.x+(-o.y));
    dotMap.put(this._code,new Map("key_"+parseInt(o.x)+parseInt(o.y),new Area(o.x, o.y)));
    ordinates.push(o);
  }
  this.ordinates = ordinates;
  console.log(dotMap);
}
CoordinateSystem.prototype.init=function(){
  this.initCanvasParams();//初始画布参数
  this.initCanvas();//初始画布
  this.initData();//初始数据
  this.calcuCoordinate();//计算坐标
}
CoordinateSystem.prototype.draw=function(){
  //this.initCanvas(id);
  //this.calcuCoordinate();
  //var canvas = $$(id);
  var canvas = cacheMap.get("canvas_"+this._code);
  //var ctx = canvas.getContext("2d");
  var ctx = cacheMap.get("ctx_"+this._code);
  ctx.save();
  ctx.translate(0, canvas.height);
  var p1,p2 = this.ordinates.length>0?new Point(this.ordinates[0].x,this.ordinates[0].y):null;
  for(var i = 0; i < this.ordinates.length; i++){
    var o = this.ordinates[i];
    p1 = p2;
    p2 = new Point(o.x, o.y);
    o.draw(ctx);
    //console.log(o);
    if(this._pconfig.isTrend==="Y"){
      var lineColor = this._pconfig.lineColor||"#000000";
      lineColor = lineColor!==""?lineColor:"#000000";
      new Line(p1, p2, {_width:1, _color:lineColor}).draw(ctx);
    }
  }
  ctx.restore();
}
CoordinateSystem.prototype.drawSlide=function(){
  //var canvas = $$(id);
  var canvas = cacheMap.get("canvas_"+this._code);
  //var ctx = canvas.getContext("2d");
  var ctx = cacheMap.get("ctx_"+this._code);
  ctx.clearRect(0,0,canvas.width,canvas.height);
  this.initCanvas();
  ctx.save();
  ctx.translate(0, canvas.height);
  var p1,p2 = this.ordinates.length>0?new Point(this.ordinates[0]._x-this.dt.percentPixel*this.dt._awidth,this.ordinates[0].y):null;
  for(var i = 0; i < this.ordinates.length; i++){
    var o = this.ordinates[i];
    //console.log(this.dt.percentPixel*this.dt._awidth);
    o.x = o._x-this.dt.percentPixel*this.dt._awidth;
    o.draw(ctx);
    if(this._pconfig.isTrend==="Y" && i!==0){
      p1 = p2;
      p2 = new Point(o.x, o.y);
      var lineColor = this._pconfig.lineColor||"#000000";
      lineColor = lineColor!==""?lineColor:"#000000";
      new Line(p1, p2, {_width:1, _color:lineColor}).draw(ctx);
    }
  }
  ctx.restore();
}
var drawCount=0;//是否已经画过
var lastDot = null;//指向要画的点
var lastIndex=-1;//存放索引
var lastCkey=null;//是否在该canvas里
CoordinateSystem.prototype.reDraw = function(x,y){
  var canvas = cacheMap.get("canvas_"+this._code);
  var ctx = cacheMap.get("ctx_"+this._code);
  if(lastDot!=null && drawCount==0){
      if(lastCkey==this._code){
        console.log("调用lastDot......");
        ctx.save();
        ctx.translate(0, canvas.height);
        ctx.clearArc(lastDot.x, lastDot.y, lastDot.r+1, 0, 2*Math.PI, false);
        lastDot.draw(ctx);
        ctx.restore();
        drawCount=1;
        dataDivRemove(this._code+"_show"+lastIndex);
      }
  }
  var length = this.ordinates.length;
  var flag = false;
  for(var i = 0; i < length; i++){
    var o = this.ordinates[i];
    var ab = Math.sqrt(Math.pow((o.x-x),2)+Math.pow((o.y+canvas.height-y),2));
    //console.log("ab:"+ab+" " + "o.r:"+o.r);
    if(ab < o.r){
      flag = true;
      break;
    }
  }
  if(!flag) {
    return;
  }
  console.log("调用....................");
  ctx.clearRect(0,0,canvas.width,canvas.height);
  this.initCanvas();
  ctx.save();
  ctx.translate(0, canvas.height);
  var p1,p2 = this.ordinates.length>0?new Point(this.ordinates[0].x,this.ordinates[0].y):null;
  for(var i = 0; i < this.ordinates.length; i++){
    var o = this.ordinates[i];
    p1 = p2;
    p2 = new Point(o.x, o.y);
    ctx.beginPath();
    ctx.arc(o.x, o.y, o.r, 0, 2*Math.PI);
    if(ctx.isPointInPath(x, y)){
      var fillStyle="#000000",strokeStyle="#000000";
      if(this._pconfig.normalHigh!==""&&
         this._pconfig.normalLow!==""&&
         (parseFloat(this._data[i])>parseFloat(this._pconfig.normalHigh)||
         parseFloat(this._data[i])<parseFloat(this._pconfig.normalLow))){
        fillStyle="#008B00";
        strokeStyle="#008B00";
        //console.log("[fillStyle:"+fillStyle+","+"strokeStyle:"+strokeStyle+"]"+"[normalHigh:"+this.vitalConfig.normalHigh+","+"normalLow:"+this.vitalConfig.normalLow+"]"+"[data:"+this.data[i]+"]");
      }
      var params = {
        _fillStyle:fillStyle,
        _strokeStyle:strokeStyle
      }
      switch(this._pconfig.shapReDraw){
        case "a":
          new BlackCircle(o.x,o.y,o.r,params).draw(ctx);
          break;
        case "b":
          getCrossLine(o.x,o.y,8).draw(ctx);
          break;
        case "c":
          new ConcentricBlackCircle(o.x,o.y,o.r,params).draw(ctx);
          break;
        default:
          new ConcentricBlackCircle(o.x,o.y,o.r,params).draw(ctx);
          break;
      }
      //new Rectangle(o.x,o.y,{_data:this._text[i],_alpha:0.8}).draw(ctx);
      var options = {};
      options.canvas=canvas;
      options.id=this._code+"_show"+i;
      options.x=o.x;
      options.y=o.y;
      options.data=this._text[i];
      dataDivShow(options);
      drawCount=0;
      lastDot = o;
      lastIndex=i;
      lastCkey=this._code;
    }else{
      ctx.save();
      ctx.globalCompositeOperation="destination-over";
      o.draw(ctx);
      ctx.restore();
      dataDivRemove(this._code+"_show"+i);
    }
    if(this._pconfig.isTrend==="Y"){
      ctx.save();
      ctx.globalCompositeOperation="destination-over";
      var lineColor = this._pconfig.lineColor||"#000000";
      lineColor = lineColor!==""?lineColor:"#000000";
      new Line(p1, p2, {_width:1,_color:lineColor}).draw(ctx);
      ctx.restore();
    }
  }
  ctx.restore();
};
/**
*数据层显示
**/
function dataDivShow(options){
  console.log("dataDivShow:"+options.id);
  var canvas = options.canvas;
  var id = options.id;
  var data = options.data||[];
  var x = options.x||0;
  var y = options.y||0;
  var pid = options.pid;
  var data_show = $$("data_show");
  var getEleTop = function(ele){
    var top=getTop(canvas)+(canvas.height+y)-ele.offsetHeight-canvas.parentNode.scrollTop-data_show.scrollTop;
    top=top<ele.offsetHeight?top+ele.offsetHeight:top;
    return top;
  }
  var getEleLeft = function(ele){
    var left=getLeft(canvas)+x-canvas.parentNode.scrollLeft-data_show.scrollLeft;
    left=left+ele.offsetWidth>canvas.width?left-ele.offsetWidth:left;
    return left;
  }
  if(!$$(id)){
    var ele = cele("div");
    ele.setAttribute("id",id);
    var str = "";
    for(var i = 0; i < data.length; i++){
      str+=data[i]+"</br>";
    }
    ele.innerHTML=str;
    var style = "position:absolute;border:solid 1px #000000;background-color:#ffffff;opacity:0.7;font-size:14px;font-family:'楷体';";
    ele.style.cssText=style;
    document.body.appendChild(ele);
    ele.style.top=getEleTop(ele)+"px";
    ele.style.left=getEleLeft(ele)+"px";
    ele.addEventListener("mouseenter",function(e){
      data_show_flag=false;
    });
    ele.addEventListener("mouseout",function(e){
      //document.body.removeChild(this);
      $$(id).style.display="none";
      data_show_flag=true;
    });
  }else{
    var ele = $$(id);
    ele.style.top=getEleTop(ele)+"px";
    ele.style.left=getEleLeft(ele)+"px";
    ele.style.display="block";
  }
}
/**
*数据层移除
**/
function dataDivRemove(id){
  if($$(id)){
    if(data_show_flag){
      //document.body.removeChild($$(id));
      $$(id).style.display="none";
    }
  }
}
//获取元素的纵坐标（相对于窗口）
function getTop(e){
  var offset=e.offsetTop;
  if(e.offsetParent!=null) offset+=getTop(e.offsetParent);
  return offset;
}
//获取元素的横坐标（相对于窗口）
function getLeft(e){
  var offset=e.offsetLeft;
  if(e.offsetParent!=null) offset+=getLeft(e.offsetParent);
  return offset;
}

/**
*体征
**/
function VitalSignCoordinateSystem(options){
  CoordinateSystem.call(this,options);
}
inheritPrototype(CoordinateSystem, VitalSignCoordinateSystem);
VitalSignCoordinateSystem.prototype.initData=function(){
  if(!this._data){
    var data=[];
    var date=[];
    var text=[];
    for(var i = 0; i < this._items.length; i++){
      var measure=this._items[i];
      //data.push(measure.measureResult);
      var time = measure.recordTime!==""?measure.recordTime.replace(":","")+"00":measure.measureTime;
      var index = insertSort(date,measure.measureDate+" "+time.substring(0,2)+":"+time.substring(2,4)+":"+time.substring(4,6));
      //date.push(measure.measureDate+" "+time.substring(0,2)+":"+time.substring(2,4)+":"+time.substring(4,6));
      data.splice(index,0,measure.measureResult)
      var temp = [];
      temp.push("就医类型:"+constant.admType[measure.admType]);
      temp.push("测量时间:"+new Date(measure.measureDate+" "+
                                    measure.measureTime.substring(0,2)+":"+
                                    measure.measureTime.substring(2,4)+":"+
                                    measure.measureTime.substring(4,6)).Format("yyyy年MM月dd日 hh:mm"));
      if(measure.recordTime !==""){
        temp.push("实际测量时间:"+measure.recordTime);
      }
      if(this._config.uniSymbol !== ""){
        temp.push("测量部位:"+this._config.uniSymbol.split(":")[1]);
      }
      temp.push("测量结果:"+measure.measureResult+" "+this._config.measureUnit);
      //text.push(temp);
      text.splice(index,0,temp);
    }
    this._data = data;
    this._date = date;
    this._text = text;
    //console.log(this.data);
    //console.log(this.date);
  }
}
/**
*检验报告
**/
function LaboratoryCoordinateSystem(options){
  CoordinateSystem.call(this,options);
}
inheritPrototype(CoordinateSystem, LaboratoryCoordinateSystem);
LaboratoryCoordinateSystem.prototype.initData=function(){
  if(!this._data){
    var data=[];
    var date=[];
    var text=[];
    for(var i = 0; i < this._items.length; i++){
      var testitem=this._items[i];
      //data.push(measure.measureResult);
      var time = testitem.orderTime;
      var index = insertSort(date,time);
      //date.push(measure.measureDate+" "+time.substring(0,2)+":"+time.substring(2,4)+":"+time.substring(4,6));
      data.splice(index,0,testitem.testResult);
      var temp = [];
      temp.push("就医类型:"+constant.admType[testitem.admType]);
      temp.push("开单时间:"+new Date(testitem.orderTime).Format("yyyy年MM月dd日 hh:mm:ss"));
      temp.push("签收时间:"+new Date(testitem.receiveTime).Format("yyyy年MM月dd日 hh:mm:ss"));
      temp.push("发报告时间:"+new Date(testitem.reportTime).Format("yyyy年MM月dd日 hh:mm:ss"));
      temp.push("测量结果:"+testitem.testResult+" "+this._config.testUnit);
      //text.push(temp);
      text.splice(index,0,temp);
    }
    this._data = data;
    this._date = date;
    this._text = text;
    //console.log(data);
    //console.log(date);
  }
}
/**
* 日期时间类
*_s:开始台日期；_e:结束日期；_u:单位(年、月、日)；initPixel:初使像素；equalsPixel:等差像素；percentPixel:偏移像素
**/
var DateTime = function(){
  this.initParameters = function(options){
    this._s = options._s;
    this._e = options._e;
    this._u = options._u;
    this._swidth = options._swidth;
    this.initPixel = options.initPixel || 0;
    this.equalsPixel = options.equalsPixel;
    this.percentPixel = options.percentPixel;
  }
  this.init = function(options){
    this.initParameters(options);
    var number=0,_height=5000;
    switch (this._u) {
      case "year":
        number = this.calcuYears(this._s,this._e);
        break;
      case "month":
        number = this.calcuMonths(this._s,this._e);
        break;
      case "day":
        number = this.calcuDays(this._s,this._e);
        break;
      case "hour":
        number = this.calcuDays(this._s,this._e) * 24;
        break;
      default:
        number = this.calcuDays(this._s,this._e);
        break;
    }
    this._awidth = this.initPixel+number*this.equalsPixel;
    this._height = _height;
  };
  //计算小时数
  this.calcuHours = function(s, e){
    var time = Math.abs(new Date(e)-new Date(s));
    var millisecond = time%(24*60*60*1000);
    return millisecond/60/60/1000;
  }
  //计算天数
  this.calcuDays = function(s, e){
    return Math.abs(new Date(e)-new Date(s))/1000/60/60/24 + 1;
  };
  //得到下一天
  this.getNextDay = function(d){
    return new Date(d.valueOf()+24*60*60*1000);
  };
  //计算月数
  this.calcuMonths = function(s, e){
    var sArray = new Date(s).Format("yyyy-MM-dd").split("-");
    var eArray = new Date(e).Format("yyyy-MM-dd").split("-");
    return Math.abs(parseInt(eArray[0])-parseInt(sArray[0]))*12+Math.abs(parseInt(eArray[1])-parseInt(sArray[1])) + 1;
  };
  //得到下一个月
  this.getNextMonth = function(d) {
    var dArray = d.Format("yyyy-MM-dd").split('-');
    var year = dArray[0]; //获取当前日期的年份
    var month = dArray[1]; //获取当前日期的月份
    var day = dArray[2]; //获取当前日期的日
    month = parseInt(month)+1;
    if(month > 12){
      year = parseInt(year)+1;
      month = 1;
    }
    var day2 = new Date(year,month-1,0).getDate();
    day = day2<day?day2:day;
    return new Date(year,month-1,day);
  };
  //计算年数
  this.calcuYears = function(s, e){
    var sArray = new Date(s).Format("yyyy-MM-dd").split("-");
    var eArray = new Date(e).Format("yyyy-MM-dd").split("-");
    return Math.abs(parseInt(eArray[0])-parseInt(sArray[0])) + 1;
  };
  //得到一下年
  this.getNextYear = function(d){
    var dArray = d.Format("yyyy-MM-dd").split('-');
    var year = dArray[0]; //获取当前日期的年份
    var month = dArray[1]; //获取当前日期的月份
    var day = dArray[2]; //获取当前日期的日
    return new Date(parseInt(year)+1,parseInt(month)-1,parseInt(day));
  }
}
/*var heightArr = new Array();
heightArr.push(new Point());*/
// 对Date的扩展，将 Date 转化为指定格式的String
// 月(M)、日(d)、小时(h)、分(m)、秒(s)、季度(q) 可以用 1-2 个占位符，
// 年(y)可以用 1-4 个占位符，毫秒(S)只能用 1 个占位符(是 1-3 位的数字)
// 例子：
// (new Date()).Format("yyyy-MM-dd hh:mm:ss.S") ==> 2006-07-02 08:09:04.423
// (new Date()).Format("yyyy-M-d h:m:s.S")      ==> 2006-7-2 8:9:4.18
Date.prototype.Format = function(fmt) {
  var o = {
    "M+" : this.getMonth()+1,                 //月份
    "d+" : this.getDate(),                    //日
    "h+" : this.getHours(),                   //小时
    "m+" : this.getMinutes(),                 //分
    "s+" : this.getSeconds(),                 //秒
    "q+" : Math.floor((this.getMonth()+3)/3), //季度
    "S"  : this.getMilliseconds()             //毫秒
  };
  if(/(y+)/.test(fmt))
    fmt=fmt.replace(RegExp.$1, (this.getFullYear()+"").substr(4 - RegExp.$1.length));
  for(var k in o)
    if(new RegExp("("+ k +")").test(fmt))
  fmt = fmt.replace(RegExp.$1, (RegExp.$1.length==1) ? (o[k]) : (("00"+ o[k]).substr((""+ o[k]).length)));
  return fmt;
};

/**
创建元素
**/
function cele(eleName){
  return document.createElement(eleName);
}
