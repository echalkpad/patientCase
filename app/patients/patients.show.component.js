'use strict';

angular.
  module('patientsShow').
  component('patientsShow', {
    templateUrl: 'patients/patients.show.template.html',
    controller: ['$http', '$scope', 'ngDialog', 'ngProgressFactory', function patientsShow($http, $scope, ngDialog, ngProgressFactory) {
      var self = this;
      $scope.progressbar = ngProgressFactory.createInstance();

      self.medicationVisible = false;
      self.generalDisposalVisible = false;
      self.surgicalTreatmentVisible = false;
      self.diagnosticInformationVisible = false;
      self.diseaseHistoryVisible = false;
      self.vitalSignVisible = false;
      self.laboratoryVisible = false;

      var medicationsCollection = null;
      var medicationsList = {};

      var WINDOW_WIDTH = document.body.clientWidth;
      var globalVar = {
        horizontalDistance: 60,
        leftTitleWidth: 170,
        timeOffsetPercentage: 0,
        startTime: '',
        endTime: '',
        timeUnit: 'month',
        showRuler: self.showRuler,
        startPosition: ''
      };
      self.timeUnit = [{
        text: '月',
        value: 'month'
      },{
        text: '日',
        value: 'day'
      },{
        text: '时',
        value: 'hour'
      }];
      self.currentTimeUnit=self.timeUnit[0].value;

      self.settingDialog = function () {
        ngDialog.open({
            template: `<p><a href="/#!/examine-result-config" ng-click="$ctrl.closeThisDialog()">检验结果展现配置</a></p>
              <a href="/#!/examine-target-config" ng-click="$ctrl.closeThisDialog()"><p>检验指标趋势展现配置</a></p>
              <a href="/#!/sign-display-config" ng-click="$ctrl.closeThisDialog()"><p>体征展现配置</a></p>
              <a href="/#!/sign-examine-partial-config" ng-click="$ctrl.closeThisDialog()"><p>体征测量部位标示符</a></p>
              <a href="http://www.baidu.com" ng-click="$ctrl.closeThisDialog()"><p>治疗药物检测配置</a></p>
              <a href="http://www.baidu.com" ng-click="$ctrl.closeThisDialog()"><p>疾病测配置</a></p>
              <a href="http://www.baidu.com" ng-click="$ctrl.closeThisDialog()"><p>全局展现模式配置</a></p>
              `,
            plain: true,
            scope: $scope
        });
      };

      self.closeThisDialog = function(){
        ngDialog.close();
      }

      self.expandDiseaseHistory = function(){
        console.info("run expand disease history hello");
      }

      self.medicationToggle = function(){
        self.medicationVisible = !self.medicationVisible;
      }

      self.generalDisposalToggle = function(){
        self.generalDisposalVisible = !self.generalDisposalVisible;
      }

      self.surgicalTreatmentToggle = function(){
        self.surgicalTreatmentVisible = !self.surgicalTreatmentVisible;
      }

      self.vitalSignToggle = function(){
        self.vitalSignVisible = !self.vitalSignVisible;
      }
      self.laboratoryToggle = function(){
        self.laboratoryVisible = !self.laboratoryVisible;
      }
      self.diagnosticInformationToggle = function(){
        self.diagnosticInformationVisible = !self.diagnosticInformationVisible;
      }
      self.diseaseHistoryToggle = function(){
        self.diseaseHistoryVisible = !self.diseaseHistoryVisible;
      }

      function getCrossBrowserElement(mouseEvent){
        var result = {
          x: 0,
          y: 0,
          relativeX: 0,
          relativeY: 0,
          currentDomId: ""
        };

        if (!mouseEvent){
          mouseEvent = window.event;
        }

        if (mouseEvent.pageX || mouseEvent.pageY){
          result.x = mouseEvent.pageX;
          result.y = mouseEvent.pageY;
        }
        else if (mouseEvent.clientX || mouseEvent.clientY){
          result.x = mouseEvent.clientX + document.body.scrollLeft +
            document.documentElement.scrollLeft;
          result.y = mouseEvent.clientY + document.body.scrollTop +
            document.documentElement.scrollTop;
        }

        result.relativeX = result.x;
        result.relativeY = result.y;

        if (mouseEvent.target){
          var offEl = mouseEvent.target;
          var offX = 0;
          var offY = 0;
          if (typeof(offEl.offsetParent) != "undefined"){
            while (offEl){
              offX += offEl.offsetLeft;
              offY += offEl.offsetTop;
              offEl = offEl.offsetParent;
            }
          }
          else{
            offX = offEl.x;
            offY = offEl.y;
          }

          result.relativeX -= offX;
          result.relativeY -= offY;
        }
        result.currentDomId = mouseEvent.target.id;

        return result;
      }

      function getMouseEventResult(mouseEvent, mouseEventDesc)
      {
        var coords = getCrossBrowserElement(mouseEvent);
        $scope.currentPosition = "鼠标当前的坐标："+coords.x+", "+coords.y;
        $scope.currentElementCoord = "当前坐标为("+coords.relativeX+"，"+coords.relativeY+")";
      }

      self.onMouseMove = function(event){
        getMouseEventResult(event, "Mouse move");
        var currentElement = getCrossBrowserElement(event);
        if (self.showRuler&&144<currentElement.x) {
          showTimeRuler(currentElement);
        }
        if (globalVar.startTime&&self.timeIndicatorMoveing) {
          drawTimeLineIndicator(currentElement);
        }
        isSpecialElement(currentElement);
      }

      self.onTimeIndicatorMouseDown = function(event){
        self.timeIndicatorMoveing = true;
      }

      self.onTimeIndicatorMouseUp = function(event){
        self.timeIndicatorMoveing = false;
      }

      self.timeUnitChange = function(timeUnit){
        globalVar.timeUnit = timeUnit;
        globalVar.timeOffsetPercentage = 0;
        drawTimeLineIndicator();
        startDraw();
      }

      self.onConfirmButtonClicked = function(){
        globalVar.startTime = self.startTime.split('-')[0]+'-'+self.startTime.split('-')[1]+'-'+1;
        globalVar.endTime = self.endTime.split('-')[0]+'-'+self.endTime.split('-')[1]+'-'+1;
        $scope.progressbar.start();
        var config = {
          params: {
            startDate: self.startTime.replace(/-/g, "/"),
            endDate: self.endTime.replace(/-/g, "/"),
            mrNo: '000000413016'
          },
          headers : {
            'Accept' : 'application/json'
          }
        };
        //暂时硬编码数据
        onLoadMedicationsSuccess(data);
        //$http.get('http://192.168.0.14:8080/chsp/medications', config).then(onLoadMedicationsSuccess, onLoadMedicationsFailure);
      }

      function showTimeRuler(element){
        var elementx = element.x;
        drawTimeLineBg();

        var canvasContext = document.getElementById('time-line-canvas-bg').getContext('2d');
        canvasContext.beginPath();
        canvasContext.strokeStyle = "#f00";
        canvasContext.moveTo(element.x, 0);
        canvasContext.lineTo(element.x, 600);
        canvasContext.stroke();

        drawTimeLine({
          canvasContext: 'time-line-canvas'
        });

        var timeLineCanvasContext = document.getElementById('time-line-canvas').getContext('2d');
        timeLineCanvasContext.beginPath();
        timeLineCanvasContext.strokeStyle = "#f00";
        timeLineCanvasContext.moveTo(element.x-144, 0);
        timeLineCanvasContext.lineTo(element.x-144, 20);
        timeLineCanvasContext.stroke();
      }

      function onLoadMedicationsSuccess(event){
        $scope.progressbar.complete();
        medicationsCollection = event.data;
        var maxLineBar = (WINDOW_WIDTH - globalVar.leftTitleWidth)/globalVar.horizontalDistance;

        if(maxLineBar>getTotalMonth(self.startTime, self.endTime)){
          self.currentTimeUnit=self.timeUnit[1].value;
        }
        if (maxLineBar>getTotalDay(self.startTime, self.endTime)){
          self.currentTimeUnit=self.timeUnit[2].value;
        }
        if (self.currentTimeUnit!=self.timeUnit[0].value) {
          globalVar.startTime = self.startTime;
          globalVar.endTime = self.endTime;
        }

        globalVar.timeOffsetPercentage = 0;
        startDraw();
      }

      function onLoadMedicationsFailure(event){
        $scope.progressbar.complete();
        alert("-----error: "+JSON.stringify(event));
      }

      function log(message){
        console.info(message);
      }

      function isSpecialElement(element){
        if ('mediacationContentCanvas'==element.currentDomId) {
          var timeLineLength = getTotalDay(globalVar.startTime, globalVar.endTime)*globalVar.horizontalDistance;
          var totalOffsetDistance = timeLineLength-(WINDOW_WIDTH-globalVar.leftTitleWidth);

          var offsetDistance = globalVar.timeOffsetPercentage*totalOffsetDistance;
          var absoluteX = offsetDistance+element.relativeX;

          var totalTime = (new Date(globalVar.endTime)) - (new Date(globalVar.startTime));
          var specialPoint = (absoluteX*totalTime)/timeLineLength+(new Date(globalVar.endTime)).getTime();
          if (1457742240000<(new Date(specialPoint)).getTime()&&1458033120000>(new Date(specialPoint)).getTime()){
            //alert("-------a special day");
          }
        }
      }

      function drawTimeLineIndicator(mousePoint){
        if(mousePoint&&((mousePoint.x-globalVar.leftTitleWidth)<0||(mousePoint.x>WINDOW_WIDTH-20))){
          return;
        }

        var timeIndicatorContextWidth = WINDOW_WIDTH - globalVar.leftTitleWidth;
        var timeIndicatorContext = document.getElementById('time-indicator').getContext('2d');
        timeIndicatorContext.canvas.width = timeIndicatorContextWidth;

        timeIndicatorContext.clearRect(0,0,(WINDOW_WIDTH-globalVar.leftTitleWidth),100);
        timeIndicatorContext.fillStyle = brgba("#55A7FB",0.9);

        var shouldSlid = false;
        if (globalVar.startTime){
          if('month'==self.currentTimeUnit&&timeIndicatorContextWidth<differMonth(globalVar.startTime, globalVar.endTime)*globalVar.horizontalDistance){
            shouldSlid = true;
          }
          if ('day'==self.currentTimeUnit&&timeIndicatorContextWidth<differDay(globalVar.startTime, globalVar.endTime)*globalVar.horizontalDistance){
            shouldSlid = true;
          }
          if ('hour'==self.currentTimeUnit&&timeIndicatorContextWidth<differHour(globalVar.startTime, globalVar.endTime)*globalVar.horizontalDistance){
            shouldSlid = true;
          }
        }
        if (shouldSlid&&mousePoint) {
          var timeOffsetPercentage = (mousePoint.x - globalVar.leftTitleWidth)/((WINDOW_WIDTH - globalVar.leftTitleWidth)-40);
          $scope.timePersent = "进度比例为："+timeOffsetPercentage;
          globalVar.timeOffsetPercentage = timeOffsetPercentage;
          timeIndicatorContext.fillRect((mousePoint.x-globalVar.leftTitleWidth), 0, 30, 20);
          startDraw();
        }else{
          timeIndicatorContext.fillRect(0,0,30,20);
        }
      }

      function startDraw(){
        drawTimeLine({
          canvasContext: 'time-line-canvas'
        });
        drawTimeLineBg();
        drawContent();
      }

      function getTotalMonth(startTime, endTime){
        var startYear = parseInt(startTime.split('-')[0]),
          startMonth = parseInt(startTime.split('-')[1]),
          endYear = parseInt(endTime.split('-')[0]),
          endMonth = parseInt(endTime.split('-')[1]);

        return endYear*12+endMonth-startYear*12-startMonth;
      }

      function getTotalDay(startTime, endTime){
        var dateArray, startDate, endDate, totalDay;

        dateArray = startTime.split("-");
        startDate = new Date(dateArray[0]+ '-' + dateArray[1] + '-' + dateArray[2]);

        dateArray = endTime.split("-");
        endDate = new Date(dateArray[0] + '-' + dateArray[1] + '-' + dateArray[2]);
        totalDay = parseInt(Math.abs(startDate-endDate)/1000/60/60/24);
        return totalDay;
      }

      function getTotalHour(startTime,  endTime){
        return 24*getTotalDay(startTime,  endTime);
      }

      function addDate(date,days){
        var d = new Date(date);
        d.setDate(d.getDate()+days);
        var m = d.getMonth()+1;
        return d.getFullYear()+'-'+m+'-'+d.getDate();
      }

      function differMonth(startTime, endTime){
        var startTotalMonth = parseInt(startTime.split('-')[0]*12)+parseInt(startTime.split('-')[1]);
        var endTotalMonth = parseInt(endTime.split('-')[0])*12+parseInt(endTime.split('-')[1]);
        return (endTotalMonth-startTotalMonth);
      }

      function differDay(startTime, endTime){
        return ((new Date(endTime))-(new Date(startTime)))/1000/3600/24;
      }

      function differHour(startTime, endTime){
        return ((new Date(endTime))-(new Date(startTime)))/1000/3600;
      }

      function brgba(hex, opacity) {
        if( ! /#?\d+/g.test(hex) ) return hex;
        var h = hex.charAt(0) == "#" ? hex.substring(1) : hex,
            r = parseInt(h.substring(0,2),16),
            g = parseInt(h.substring(2,4),16),
            b = parseInt(h.substring(4,6),16),
            a = opacity;
        return "rgba(" + r + "," + g + "," + b + "," + a + ")";
      }

      function drawItemContentGrid(options){
        var offsetLineBar = getOffsetLineBar();
        var canvasContext = document.getElementById(options.canvasContext).getContext('2d');
        var perLineHeight = options.perLineHeight||30;
        var itemLineLength = (WINDOW_WIDTH-globalVar.leftTitleWidth-20);

        canvasContext.canvas.height = options.totalItem*perLineHeight;
        canvasContext.canvas.width = itemLineLength;
        canvasContext.clearRect(0,0,(options.totalItem*perLineHeight),itemLineLength);

        for (var i = 0; i < options.totalItem; i++) {
          canvasContext.beginPath();
          canvasContext.strokeStyle = "#000";
          canvasContext.moveTo(0, perLineHeight*i);
          canvasContext.lineTo(itemLineLength, perLineHeight*i);
          canvasContext.stroke();
        }

        var totalVerticalLine = parseInt(itemLineLength/globalVar.horizontalDistance);
        var horizontalDistance = globalVar.horizontalDistance;
        var lineHeight = options.totalItem*perLineHeight;

        var startTime,
          startTimeMillisecond,
          endTimeMillisecond;

        if ("month"== globalVar.timeUnit){
          var newYear = parseInt(globalVar.startTime.split('-')[0])+parseInt((parseInt(globalVar.startTime.split('-')[1])+offsetLineBar)/12);
          var newMonth = parseInt((parseInt(globalVar.startTime.split('-')[1])+offsetLineBar)%12);
          newMonth = newMonth==0 ? 12 : newMonth;
          var canvasStartTime = newYear+'-'+newMonth+'-'+1;
          startTimeMillisecond = (new Date(canvasStartTime)).getTime();

          var moreTime = ((new Date(globalVar.endTime)) - (new Date(globalVar.startTime)))*(globalVar.startPosition)/(differMonth(globalVar.startTime, globalVar.endTime)*globalVar.horizontalDistance);
          startTimeMillisecond -= moreTime;
          endTimeMillisecond = (new Date(canvasStartTime)).getTime()+((new Date(globalVar.endTime))-(new Date(globalVar.startTime)))*(WINDOW_WIDTH-globalVar.leftTitleWidth)/(differMonth(globalVar.startTime, globalVar.endTime)*globalVar.horizontalDistance);
        }
        if ("day"==globalVar.timeUnit){
          startTime = addDate(globalVar.startTime, offsetLineBar);
          startTimeMillisecond = (new Date(startTime)).getTime();
          endTimeMillisecond = (new Date(addDate(startTime, totalVerticalLine))).getTime();
        }
        if ("hour"==globalVar.timeUnit){
          startTimeMillisecond = (new Date(globalVar.startTime)).getTime()+offsetLineBar*3600*1000;
          endTimeMillisecond = (new Date(globalVar.startTime)).getTime()+(totalVerticalLine+offsetLineBar)*3600*1000;
        }

        var contentLength = WINDOW_WIDTH-globalVar.leftTitleWidth-globalVar.startPosition;
        for (var i = 0; i < medicationsCollection.length; i++) {
          for (var j = 0; j < medicationsCollection[i].drugs.length; j++) {
            var m = 1;
            for(var key in medicationsList){
              if (key==medicationsCollection[i].drugs[j].drugCode) {
                break;
              }
              m++;
            }
            var pointY = m*40-20;
            var startDateMillisecond = (new Date(medicationsCollection[i].drugs[j].startDate)).getTime();
            var endDateMillisecond = medicationsCollection[i].drugs[j].endDate&&(new Date(medicationsCollection[i].drugs[j].endDate)).getTime();
            if (endDateMillisecond&&(startTimeMillisecond<startDateMillisecond&&endTimeMillisecond>startDateMillisecond)){
              var startPointX = contentLength/((endTimeMillisecond-startTimeMillisecond)/(startDateMillisecond-startTimeMillisecond));
              var endPointX = contentLength/((endTimeMillisecond-startTimeMillisecond)/(endDateMillisecond-startTimeMillisecond));
              drawLine({
                canvasContext: 'mediacationContentCanvas',
                startPointX: startPointX,
                startPointY: pointY,
                endPointX: endPointX,
                endPointY: pointY,
                lineDistanceToBottom: 5
              });
            }
            for (var k = 0; k < medicationsCollection[i].drugs[j].mars.length; k++) {
              var execTime = medicationsCollection[i].drugs[j].mars[k].execTime;
              var execTimeMillisecond = (new Date(execTime)).getTime();
              if (startTimeMillisecond<execTimeMillisecond&&endTimeMillisecond>execTimeMillisecond){
                var pointX = contentLength/((endTimeMillisecond-startTimeMillisecond)/(execTimeMillisecond-startTimeMillisecond));

                drawRectanglePoint({
                  canvasContext: 'mediacationContentCanvas',
                  centerPointX: pointX,
                  centerPointY: pointY,
                  rectangleLength: 10
                });
              }
            }
          }
        }
      }

      function drawItemTitle(options){
        var canvasContext = document.getElementById(options.canvasContext).getContext('2d');
        var perLineHeight = options.perLineHeight||30;
        var itemLineLength = options.itemLineLength||100;

        canvasContext.canvas.height = options.items.length*perLineHeight;
        canvasContext.canvas.width = itemLineLength;

        for (var i = 0; i < options.items.length; i++) {
          canvasContext.beginPath();
          canvasContext.strokeStyle = options.lineColor||'#000';
          canvasContext.moveTo(0, perLineHeight*i);
          canvasContext.lineTo(itemLineLength, perLineHeight*i);
          canvasContext.stroke();

          canvasContext.beginPath();
          canvasContext.strokeStyle = '#D1D1D1';
          canvasContext.lineWidth = 2;
          canvasContext.moveTo(itemLineLength, perLineHeight*i);
          canvasContext.lineTo(itemLineLength, perLineHeight*(i+1)-3);
          canvasContext.stroke();

          canvasContext.font = options.textFont||"16px Courier New";
          canvasContext.fillStyle = options.textColor||"gray";

          canvasContext.textAlign="start";
          var fontStartPosition = 5;
          canvasContext.fillText(options.items[i].itemTitle, fontStartPosition, perLineHeight*(i+1)-perLineHeight*0.3);
        }
      }

      function getTotalLineBar(){
        var totalLineBar = 0;

        if ('month'==globalVar.timeUnit) {
          totalLineBar = getTotalMonth(globalVar.startTime, globalVar.endTime);
        }
        if ('day'==globalVar.timeUnit) {
          totalLineBar = getTotalDay(globalVar.startTime, globalVar.endTime);
        }
        if ('hour'==globalVar.timeUnit) {
          totalLineBar = getTotalHour(globalVar.startTime, globalVar.endTime);
        }

        return totalLineBar+1;
      }

      function getTimeLineLength(){
        return (getTotalLineBar()-1)*globalVar.horizontalDistance;
      }

      function contentCanvasLength(){
        return (WINDOW_WIDTH - globalVar.leftTitleWidth);
      }

      function getOffsetLineBar(){
        var offsetLineBar = 0;
        var offsetDistance = getOffsetDistance();

        while((offsetDistance-(globalVar.horizontalDistance*offsetLineBar))>0){
          offsetLineBar++;
        }

        return offsetLineBar;
      }

      function getOffsetDistance(){
        return (getTimeLineLength() - contentCanvasLength())*globalVar.timeOffsetPercentage;
      }

      function getTotalTimeLine(){
        return parseInt((WINDOW_WIDTH - globalVar.leftTitleWidth)/globalVar.horizontalDistance)+1;
      }

      function drawTimeLineBg(){
        var totalTimeLine = getTotalTimeLine();
        var timeLineBgCanvas = document.getElementById("time-line-canvas-bg").getContext('2d');
        timeLineBgCanvas.canvas.width = (WINDOW_WIDTH-30);
        timeLineBgCanvas.clearRect(0, 0, WINDOW_WIDTH-30, 1000);

        for (var i = 0; i < totalTimeLine; i++) {
          timeLineBgCanvas.beginPath();
          timeLineBgCanvas.strokeStyle = '#D1D1D1';
          timeLineBgCanvas.moveTo(144+globalVar.startPosition+globalVar.horizontalDistance*i, 0);
          timeLineBgCanvas.lineTo(144+globalVar.startPosition+globalVar.horizontalDistance*i, 900);
          timeLineBgCanvas.stroke();
        }
      }

      function drawTimeLine(options){
        var canvasContext = document.getElementById(options.canvasContext).getContext('2d');
        var canvasLength = WINDOW_WIDTH - globalVar.leftTitleWidth;
        canvasContext.clearRect(0, 0, canvasLength, 20);
        canvasContext.canvas.width = canvasLength;

        var totalLineBar = getTotalLineBar();
        var offsetLineBar = getOffsetLineBar();
        var totalTimeLine = getTotalTimeLine();

        var startPosition = globalVar.horizontalDistance*offsetLineBar - getOffsetDistance();
        globalVar.startPosition = startPosition;

        for (var i = 0; i < totalTimeLine; i++) {
          canvasContext.beginPath();
          canvasContext.strokeStyle = options.lineColor||'#D1D1D1';
          canvasContext.moveTo(startPosition+i*globalVar.horizontalDistance, 0);
          canvasContext.lineTo(startPosition+i*globalVar.horizontalDistance, 15);
          canvasContext.stroke();
        }

        var hashOptions = {
          totalLineBar: totalLineBar,
          totalTimeLine: totalTimeLine,
          canvasContext: options.canvasContext
        };

        if ('month'==globalVar.timeUnit) {
          drawTimeLineByMonth(hashOptions);
        }
        if ('day' ==globalVar.timeUnit) {
          drawTimeLineByDay(hashOptions);
        }
        if ('hour'==globalVar.timeUnit) {
          drawTimeLineByHour(hashOptions);
        }
      }

      function drawContent(){
        updateContentCanvas();
        //绘生命体征部分
        return;
        vitalSign.initialize({
          startTime: globalVar.startTime,
          endTime: globalVar.endTime,
          timeUnit: globalVar.timeUnit,
          horizontalDistance: globalVar.horizontalDistance,
          timeOffsetPercentage: globalVar.timeOffsetPercentage,
          leftTitleWidth: globalVar.leftTitleWidth
        });
      }

      function updateContentCanvas(options){
        for (var i = 0; i < medicationsCollection.length; i++) {
          for (var j = 0; j < medicationsCollection[i].drugs.length; j++) {
            medicationsList[medicationsCollection[i].drugs[j].drugCode] = medicationsCollection[i].drugs[j].goodsDesc||medicationsCollection[i].drugs[j].drugDesc;
          }
        }
        var drugCollection = [];
        for(var key in medicationsList){
          drugCollection.push({
            itemCode: key,
            itemTitle: medicationsList[key]
          });
        }

        drawItemTitle({
          canvasContext: 'medicationTitleCanvas',
          perLineHeight: 40,
          itemLineLength: 140,
          lineColor: "#f00",
          textFont: '16px Courier New',
          textColor: 'gray',
          items: drugCollection
        });

        drawItemContentGrid({
          canvasContext: 'mediacationContentCanvas',
          perLineHeight: 40,
          totalItem: drugCollection.length,
          drugCollection: drugCollection,
          medicationsCollection: medicationsCollection
        });
      }

      function drawTimeLineByMonth(options){
        var canvasContext = document.getElementById(options.canvasContext).getContext('2d');
        var startTime = globalVar.startTime.split('-'),
            startYear = parseInt(startTime[0]),
            startMonth = parseInt(startTime[1]),
            startDay = parseInt(startTime[2]),

            endTime = globalVar.endTime.split('-'),
            endYear = parseInt(endTime[0]),
            endMonth = parseInt(endTime[1]),
            endDay = parseInt(endTime[2]);

        var offsetLineBar = getOffsetLineBar();
        startYear = startYear + parseInt((startMonth+offsetLineBar-1)/12);
        startMonth =parseInt((startMonth+offsetLineBar)%12);
        var firstYear = startYear;
        for (var i = 0; i < options.totalTimeLine; i++) {
          var currentTime = "";
          var currentYear = startYear+parseInt((startMonth+i)/12);
          if ((currentYear==firstYear)&&(i!=0)) {
            currentYear += 1;
          }
          var currentMonth = (parseInt((startMonth+i)%12))<10 ? '0'+(parseInt((startMonth+i)%12)) : (parseInt((startMonth+i)%12));
          currentMonth = parseInt(currentMonth)==0 ? 12 : currentMonth;
          currentTime = currentMonth+'月';
          ((parseInt((startMonth+i)%12))==1)&&(currentTime = currentYear+'年'+currentMonth+'月');
          (0==i)&&(currentTime = currentYear+'年');

          canvasContext.textAlign="start";

          if(0==i){
            canvasContext.fillText(currentTime, globalVar.startPosition+i*globalVar.horizontalDistance, 24);
          }else{
            canvasContext.fillText(currentTime, globalVar.startPosition+i*globalVar.horizontalDistance-10, 24);
          }
        }
      }

      function drawTimeLineByDay(options){
        var canvasContext = document.getElementById(options.canvasContext).getContext('2d');

        var offsetLineBar = getOffsetLineBar();
        var startTime = addDate(globalVar.startTime, offsetLineBar),
            startYear = parseInt(startTime[0]),
            startMonth = parseInt(startTime[1]),
            startDay = parseInt(startTime[2]);

        for (var i = 0; i < options.totalTimeLine; i++) {
          var currentTime = "",
            currentYear = addDate(startTime, i).split('-')[0],
            currentMonth = parseInt(addDate(startTime, i).split('-')[1]),
            currentDay = addDate(startTime, i).split('-')[2];

            currentMonth = parseInt(currentMonth/10)==0 ? "0"+currentMonth : currentMonth;
            currentDay = parseInt(currentDay/10)==0 ? "0"+currentDay : currentDay;

          1!=currentDay&&(currentTime=currentDay+"日");
          1==currentDay&&(currentTime=currentMonth+"月"+currentDay+"日");
          0==i&&(currentTime = currentYear+"年"+currentMonth+"月"+currentDay+"日");

          canvasContext.textAlign="start";
          if(0==i){
            canvasContext.fillText(currentTime, globalVar.startPosition+i*globalVar.horizontalDistance-30, 24);
          }else{
            canvasContext.fillText(currentTime, globalVar.startPosition+i*globalVar.horizontalDistance-10, 24);
          }
        }
      }

      function drawTimeLineByHour(options){
        var canvasContext = document.getElementById(options.canvasContext).getContext('2d');
        var offsetLineBar = getOffsetLineBar();

        var startTime = addDate(globalVar.startTime, parseInt(offsetLineBar/24)),
            startYear = parseInt(startTime[0]),
            startMonth = parseInt(startTime[1]),
            startDay = parseInt(startTime[2]),
            startHour = offsetLineBar%24;

        for (var i = 0; i < options.totalTimeLine; i++) {
          var currentTime = "",
            currentYear = addDate(startTime, parseInt(i/24)).split('-')[0]%100,
            currentMonth = parseInt(addDate(startTime, parseInt(i/24)).split('-')[1]),
            currentDay = addDate(startTime, parseInt(i/24)).split('-')[2],
            currentHour = (startHour+i)%24;

          currentMonth = parseInt(currentMonth/10)==0 ? "0"+currentMonth : currentMonth;
          currentDay = parseInt(currentDay/10)==0 ? "0"+currentDay : currentDay;
          currentHour = parseInt(currentHour/10)==0 ? "0"+currentHour : currentHour;

          0!=currentHour&&(currentTime = currentHour+"时");
          0==currentHour&&(currentTime = currentDay+"日"+currentHour+"时");
          0==i&&(currentTime = currentYear+"年"+currentMonth+"月"+currentDay+"日"+currentHour+"时");

          canvasContext.textAlign="start";
          if(0==i){
            canvasContext.fillText(currentTime, globalVar.startPosition+i*globalVar.horizontalDistance-40, 24);
          }else{
            canvasContext.fillText(currentTime, globalVar.startPosition+i*globalVar.horizontalDistance-10, 24);
          }
        }
      }

      function drawRectanglePoint(options){
        var canvasContext = document.getElementById(options.canvasContext).getContext('2d');

        canvasContext.fillStyle=options.fillStyle||"#000000";
        canvasContext.strokeStyle=options.strokeStyle||"#000000";
        canvasContext.linewidth=options.linewidth||1;
        canvasContext.fillRect(options.centerPointX-parseInt(options.rectangleLength/2), options.centerPointY-parseInt(options.rectangleLength/2), options.rectangleLength, options.rectangleLength);
        canvasContext.strokeRect(options.centerPointX-parseInt(options.rectangleLength/2), options.centerPointY-parseInt(options.rectangleLength/2), options.rectangleLength, options.rectangleLength);
      }

      function drawCirclePoint(options){
        var canvasContext = configCanvas(options);

        canvasContext.beginPath();
        canvasContext.arc(options.centerPointX, options.centerPointY, options.radius, 0, Math.PI*2, true);
        canvasContext.closePath();
        canvasContext.fill();
        canvasContext.stroke();
        drawMinus(options);
      }

      function drawPlusSymbol(options){
        var canvasContext = configCanvas(options);
        canvasContext.moveTo(options.centerPointX-options.radius, options.centerPointY);
        canvasContext.lineTo(options.centerPointX+options.radius, options.centerPointY);

        canvasContext.moveTo(options.centerPointX, options.centerPointY-options.radius);
        canvasContext.lineTo(options.centerPointX, options.centerPointY+options.radius);
        canvasContext.stroke();
      }

      function drawMinus(options){
        var canvasContext = configCanvas(options);
        canvasContext.moveTo(options.centerPointX-options.radius, options.centerPointY);
        canvasContext.lineTo(options.centerPointX+options.radius, options.centerPointY);
        canvasContext.stroke();
      }

      function configCanvas(options){
        var canvasContext = document.getElementById(options.canvasContext).getContext('2d');

        options.fillStyle&&(canvasContext.fillStyle=options.fillStyle);
        options.strokeStyle&&(canvasContext.strokeStyle=options.strokeStyle);
        canvasContext.lineWidth=options.lineWidth||1;
        return canvasContext;
      }

      function drawLine(options){
        var canvasContext = configCanvas(options);
        canvasContext.moveTo(options.startPointX, options.startPointY);
        canvasContext.lineTo(options.startPointX+options.lineDistanceToBottom, options.startPointY-options.lineDistanceToBottom);
        canvasContext.lineTo(options.endPointX-options.lineDistanceToBottom, options.endPointY-options.lineDistanceToBottom);
        canvasContext.lineTo(options.endPointX, options.endPointY);
        canvasContext.stroke();
      }

      function initialize(){
        drawTimeLineIndicator();
      }
      initialize();
    }
  ]});
