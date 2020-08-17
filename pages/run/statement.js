// pages/run/statement.js
Page({

  /**
   * 页面的初始数据
   */
  data: {
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
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    wx.setNavigationBarTitle({
      title: '运动结算',
    })
    let run_data = JSON.parse(wx.getStorageSync('RunInfo-' + options.id));
    let time_data = run_data.time_data;
    let distance_data = run_data.distance_data;
    let kcal_data = run_data.kcal_data;
    let points_data = run_data.points_data;

    let run_type = run_data.runType;

    let time_split = time_data.split(":");
    let hours = time_split[0];
    let minutes = time_split[1];
    let seconds = time_split[2];

    let speed_data = (parseFloat(hours) * 60.0 + parseFloat(minutes) + parseFloat(seconds) / 60.0) / distance_data;
    let min_speed = Math.floor(speed_data);
    let sec_speed = Math.floor((speed_data - min_speed) * 60.0);
    speed_data = min_speed + "'" + sec_speed + "\"";
    let sub_obj = "polyline[" + 0 + "].points"
    this.setData({
      id: options.id,
      time_data: time_data,
      distance_data: distance_data,
      speed_data: speed_data,
      kcal_data: kcal_data,
      [sub_obj]: points_data,
      runType: run_type
    });
    let that = this;
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
  },

  /**
   * 生命周期函数--监听页面初次渲染完成
   */
  onReady: function () {

  },
  toDetail() {
    this.vibrateFunc(1);
    let id = this.data.id;
    wx.navigateTo({
      url: '../history/detail?id=' + id,
    })
  },
  toShare() {
    this.vibrateFunc(1)
    let id = this.data.id;
    wx.navigateTo({
      url: '../share/index?id='+id,
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
})