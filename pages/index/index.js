//index.js
import uCharts from '../../utils/u-charts.min.js';
//获取应用实例
const app = getApp()

Page({
  data: {
    _msg: '反编译的人,我是你爹,NMSL',
    distance_target: wx.getStorageSync('distance'),
    kcal_target: wx.getStorageSync('kcal'),
    series: []
  },
  toRun() {
    this.vibrateFunc(1);
    wx.navigateTo({
      url: '../run/index'
    })
  },
  toHistory() {
    this.vibrateFunc(1);
    wx.navigateTo({
      url: '../history/index'
    })
  },
  onShow(){
    
    if(wx.getStorageInfoSync().keys.length == 0){
      wx.navigateTo({
        url: '../login/index',
      })
    }

    let end_date = Date.now();
    let start_date = (Date.now() - (new Date().getDay() + 1) * 86400000);

    let distance_target = parseInt(wx.getStorageSync('distance'), );
    if(isNaN(distance_target))distance_target = 0;
    let kcal_target = parseInt(wx.getStorageSync('kcal'));
    if(isNaN(kcal_target))kcal_target = 0;
    let cur_distance = 0;
    let cur_kcal = 0;

    let storage_key = wx.getStorageInfoSync();
    storage_key = storage_key.keys;
    let runinfo_key = [];
    for (let i = 0; i < storage_key.length; i++) {
      let key = storage_key[i].split("-");
      if (key[0] == "RunInfo") {
        console.log(start_date/1000)
        console.log(key);
        console.log(end_date/1000);
        if(key[1]/1000<=end_date&&key[1]>=start_date/1000)
        runinfo_key.push(key[1]);
      }
    }

    for (let i = 0; i < runinfo_key.length; i++) {
      let temp = JSON.parse(wx.getStorageSync("RunInfo-" + runinfo_key[i]));
      cur_distance = cur_distance + parseFloat(temp.distance_data);
      cur_kcal = cur_kcal + parseFloat(temp.kcal_data);
    }
    cur_distance = cur_distance.toFixed(2);
    if(isNaN(cur_distance))cur_distance = 0;
    cur_kcal = cur_kcal.toFixed(2);
    if(isNaN(cur_kcal))cur_kcal = 0;


    let global_target = (parseFloat(cur_kcal) + parseFloat(cur_distance)) / (kcal_target + distance_target);
    if(isNaN(global_target))global_target = 1;
    global_target = global_target.toFixed(2);
    if(global_target >1){
      global_target = 1;
    }

    let prog_distance = cur_distance / distance_target * 100;
    prog_distance = parseInt(prog_distance);
    let prog_kcal = cur_kcal / kcal_target * 100;
    prog_kcal = parseInt(prog_kcal);

    let sort_data = runinfo_key.sort().reverse();

    if(prog_distance > 100){
      prog_distance = 100;
    }

    if(prog_kcal > 100){
      prog_kcal = 100;
    }

    let series = [{
      "color": "#2fc25b",
      "data": global_target,
      "index": 0,
      "legendShape": "circle",
      "name": "正确率",
      "pointShape": "circle",
      "show": true,
      "type": "arcbar"
    }]


    let runinfo_data = [];
    if (sort_data.length > 0) {
      runinfo_data = [JSON.parse(wx.getStorageSync('RunInfo-' + sort_data[0]))];
      let now = new Date(parseInt(sort_data[0]) * 1000);
      let month = now.getMonth() + 1;
      let date = now.getDate();
      let hour = (now.getHours() < 10)?"0"+now.getHours():now.getHours();
      let minute = (now.getMinutes() < 10)? "0"+now.getMinutes():now.getMinutes();
      let day = now.getDay(); //获取存储当前日期
      let weekday = ["日", "一", "二", "三", "四", "五", "六"];
      runinfo_data[0]["time_format"] = month + "月" + date + "日 " + hour + ":" + minute + " 周" + weekday[day];
      runinfo_data[0]["id"] = sort_data[0];
    }
    // console.log(runinfo_data);
    this.setData({
      distance_target: distance_target,
      kcal_target: kcal_target,
      cur_distance: cur_distance,
      cur_kcal: cur_kcal,
      prog_distance: prog_distance,
      prog_kcal: prog_kcal,
      runinfo_data: runinfo_data
    });

    this.showArcbar("canvasArcbar", series)
  },
  onLoad: function () {
    


    

  },
  showArcbar(canvasId, chartData) {
    // console.log(chartData)
    new uCharts({
      $this: this,
      canvasId: canvasId,
      type: 'arcbar',
      fontSize: 11,
      legend: {
        show: false
      },
      background: '#FFFFFF',
      pixelRatio: 1,
      series: chartData,
      animation: true,
      width: 300,
      height: 200,
      dataLabel: true,
      title: {
        name: Math.round(chartData[0].data * 100) + '%',
        color: chartData.color,
        fontSize: 25
      },
      subtitle: {
        name: "完成进度",
        color: '#666666',
        fontSize: 15
      },
      extra: {
        arcbar: {
          type: 'default',
          width: 10
        }
      }
    });
  },
  toDetail(e) {
    this.vibrateFunc(1);
    let id = e.currentTarget.dataset.id
    // console.log(e);
    wx.navigateTo({
      url: '../history/detail?id=' + id,
    })
  },
  vibrateFunc(mode) {
    if(wx.getStorageSync('vibrate')){
      if(mode == 1){
        wx.vibrateShort({
          complete: (res) => {},
        })
      }

      if(mode == 2){
        wx.vibrateLong({
          complete: (res) => {},
        })
      }
    }
  },
  tips(e){
    this.vibrateFunc(1);
    let type = e.currentTarget.dataset.type;
    switch(type){
      case "kcal":
        wx.showModal({
          title: '提示',
          content: '此进度条表示本周卡路里目标的完成进度,每周一自动归零',
          showCancel: false,
        })
        break
      case "distance":
        wx.showModal({
          title: '提示',
          content: '此进度条表示本周里程目标的完成进度,每周一自动归零',
          showCancel: false,
        })
        break
    }
  }
})