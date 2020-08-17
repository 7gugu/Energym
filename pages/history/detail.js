import uCharts from '../../utils/u-charts.min';
var _self;
var canvaLineA = null;
var canvaLineB = null;
Page({
  data: {
    cWidth: 0,
    cHeight: 0,
    polyline: [{
      points: [],
      color: "#07c160",
      width: 2
    }],
    latitude: 0,
    longitude: 0,
    time_data: "00:00",
    distance_data: "0.00",
    speed_data: "0'00\"",
    kcal_data: "0.00",
    runType: 0,
  },
  onLoad: function (options) {
    wx.setNavigationBarTitle({
      title: '运动详情',
    })
    _self = this;
    this.cWidth = wx.getSystemInfoSync().windowWidth;
    this.cHeight = 504 * (wx.getSystemInfoSync().windowWidth / 750)
    if (JSON.stringify(options) == "{}") {
      wx.showModal({
        title: '提示',
        content: '参数传递错误',
        showCancel: false,
        success(res) {
          if (res.confirm) {
            wx.redirectTo({
              url: './index',
            })
          }
        }
      })
    }
    this.data.id = options.id;
    let run_data = JSON.parse(wx.getStorageSync('RunInfo-' + options.id));
    let time_data = run_data.time_data;
    let distance_data = run_data.distance_data;
    let kcal_data = run_data.kcal_data;
    let points_data = run_data.points_data;
    let km_speed_data = run_data.km_speed_data;
    let altitude = run_data.altitude;
    let altitude_data = run_data.altitude_data;
    let km_series = [],
      km_categories = [];
    let altitude_series = [],
      altitude_categories = [];

    let run_type = run_data.runType;
    if(isNaN(run_type))run_type = 0;
    if(points_data.length > 0){
      this.setData({
        longitude: points_data[points_data.length - 1].longitude,
        latitude: points_data[points_data.length - 1].latitude
      });
    }
    console.log(points_data[points_data.length - 1]);

    let time_split = time_data.split(":");
    let hours = time_split[0];
    let minutes = time_split[1];
    let seconds = time_split[2];

    let speed_data = (parseFloat(hours) * 60.0 + parseFloat(minutes) + parseFloat(seconds) / 60.0) / distance_data;
    let min_speed = Math.floor(speed_data);
    let sec_speed = Math.floor((speed_data - min_speed) * 60.0);
    speed_data = min_speed + "'" + sec_speed + "\"";
    let sub_obj = "polyline[" + 0 + "].points";
    this.setData({
      id: options.id,
      time_data: time_data,
      distance_data: distance_data,
      speed_data: speed_data,
      kcal_data: kcal_data,
      [sub_obj]: points_data,
      km_speed_data: [],
      altitude_data: [],
      runType: run_type
    });

    for (let i = 0; i < km_speed_data.length; i++) {
      let temp = km_speed_data[i];
      temp = temp.replace("'", ".");
      temp = temp.replace("\"", "");
      temp = parseFloat(temp);
      km_series.push(temp);
      km_categories.push((i + 1) + "Km");
    }
    if (km_speed_data.length == 0) {
      km_categories.push("<1Km");
    } else {
      km_categories.push("<" + (km_speed_data.length + 1) + "Km");
    }
    let temp = speed_data;
    temp = temp.replace("'", ".");
    temp = temp.replace("\"", "");
    temp = parseFloat(temp);
    km_series.push(temp);

    km_categories.push("");
    km_categories.push("");

    for (let i = 0; i < altitude_data.length; i++) {
      let temp = altitude_data[i];
      temp = parseFloat(temp);
      altitude_series.push(temp.toFixed(2));
      altitude_categories.push((i + 1) + "Km");
    }
    if (altitude_data.length == 0) {
      altitude_categories.push("<1Km");
    } else {
      altitude_categories.push("<" + (altitude_data.length + 1) + "Km");
    }
    temp = altitude;
    temp = parseFloat(temp);
    altitude_series.push(temp.toFixed(2));

    altitude_categories.push("");
    altitude_categories.push("");

    let that = this;
    //无数据定位点时才定位到自身
    if (points_data.length == 0) {
      wx.getLocation({
        success(res) {
          that.setData({
              latitude: res.latitude,
              longitude: res.longitude
            }),
            setTimeout(function () {
              let obj = wx.createMapContext('myMap')
              obj.moveToLocation();
            }, 2000);
        }
      })
    }


    let chartData = {
      categories: km_categories,
      series: km_series
    };
    _self.showLineA("canvasLineA", chartData);
    chartData = {
      categories: altitude_categories,
      series: altitude_series
    };
    _self.showLineB("canvasLineB", chartData);
  },


  showLineA(canvasId, chartData) {
    canvaLineA = new uCharts({
      $this: _self,
      canvasId: canvasId,
      type: 'line',
      fontSize: 11,
      legend: true,
      dataLabel: true,
      dataPointShape: true,
      background: '#FFFFFF',
      colors: ["#f37b1d"],
      pixelRatio: 1,
      categories: chartData.categories,
      series: [{
        "data": chartData.series,
        "name": "配速"
      }],
      animation: true,
      enableScroll: true, //开启图表拖拽功能
      xAxis: {
        disableGrid: false,
        type: 'grid',
        gridType: 'dash',
        itemCount: 5, //可以直接看到的数据个数//后期直接写chardata.length+1
        scrollShow: true,
        scrollAlign: 'left',
      },
      yAxis: {
        disabled: false,
        gridType: 'dash',
        splitNumber: 5,
        min: 0,
        max: 15,
      },
      width: _self.cWidth,
      height: _self.cHeight,
      extra: {
        line: {
          type: 'straight'
        }
      },
    });

  },
  touchLineA(e) {
    canvaLineA.scrollStart(e);
  },
  moveLineA(e) {
    canvaLineA.scroll(e);
  },
  touchEndLineA(e) {
    canvaLineA.scrollEnd(e);
    //下面是toolTip事件，如果滚动后不需要显示，可不填写
    canvaLineA.showToolTip(e, {
      format: function (item, category) {
        return category + ' ' + item.name + ':' + item.data + "分/公里"
      }
    });
  },
  showLineB(canvasId, chartData) {
    console.log(chartData);
    canvaLineB = new uCharts({
      $this: _self,
      canvasId: canvasId,
      type: 'line',
      fontSize: 11,
      legend: true,
      dataLabel: true,
      dataPointShape: true,
      background: '#FFFFFF',
      colors: ["#1cbbb4"],
      pixelRatio: 1,
      categories: chartData.categories,
      series: [{
        "data": chartData.series,
        "name": "海拔"
      }],
      animation: true,
      enableScroll: true, //开启图表拖拽功能
      xAxis: {
        disableGrid: false,
        type: 'grid',
        gridType: 'dash',
        itemCount: 5, //可以直接看到的数据个数//后期直接写chardata.length+1
        scrollShow: true,
        scrollAlign: 'left',
      },
      yAxis: {
        disabled: false,
        gridType: 'dash',
        splitNumber: 5,
        min: 0,
        max: 15,
      },
      width: _self.cWidth,
      height: _self.cHeight,
      extra: {
        line: {
          type: 'straight'
        }
      },
    });

  },
  touchLineB(e) {
    canvaLineB.scrollStart(e);
  },
  moveLineB(e) {
    canvaLineB.scroll(e);
  },
  touchEndLineB(e) {
    canvaLineB.scrollEnd(e);
    //下面是toolTip事件，如果滚动后不需要显示，可不填写
    canvaLineB.showToolTip(e, {
      format: function (item, category) {
        return category + ' ' + item.name + ':' + item.data + "米"
      }
    });
  },
  toShare() {
    this.vibrateFunc(1);
    let id = this.data.id;
    wx.navigateTo({
      url: '../share/index?id=' + id,
    })
  },
  delHistory() {
    this.vibrateFunc(1);
    let id = this.data.id
    wx.showModal({
      title: '提示',
      content: '确定要删除这条记录吗?',
      success(res) {
        if (res.confirm) {
          wx.removeStorage({
            key: 'RunInfo-' + id,
            success(res) {
              wx.showModal({
                title: '提示',
                content: '删除成功',
                showCancel: false,
                success() {
                  wx.navigateBack({
                    delta: 1
                  })
                }
              })
            },
            fail() {
              wx.showModal({
                title: '提示',
                content: '删除失败',
                showCancel: false
              })
            }
          })
          // console.log(wx.getStorageSync('RunInfo-' + id));
        }
      }
    })
  },
  vibrateFunc(mode) {
    if (wx.getStorageSync('vibrate')) {
      if (mode == 1) {
        wx.vibrateShort({
          complete: (res) => {},
        })
      }

      if (mode == 2) {
        wx.vibrateLong({
          complete: (res) => {},
        })
      }
    }
  },
})