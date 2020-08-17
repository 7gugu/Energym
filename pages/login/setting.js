// pages/login/setting.js
Page({

  /**
   * 页面的初始数据
   */
  data: {
    steps: "1",
    sex: true,
    weight_index: 0,
    weight_picker: [],
    height_index: 0,
    height_picker: [],
    distance_picker: [],
    distance_index: 0,
    kcal_picker: [],
    kcal_index: 0,
  },
  weightSetting(e) {
    if (this.data.vibrate) {
      wx.vibrateShort({})
    }
    this.setData({
      weight_index: e.detail.value
    })
  },
  heightSetting(e) {
    if (this.data.vibrate) {
      wx.vibrateShort({})
    }
    this.setData({
      height_index: e.detail.value
    })
  },
  distanceSetting(e) {
    if (this.data.vibrate) {
      wx.vibrateShort({})
    }
    this.setData({
      distance_index: e.detail.value
    })
  },
  kcalSetting(e) {
    if (this.data.vibrate) {
      wx.vibrateShort({})
    }
    this.setData({
      kcal_index: e.detail.value
    })
  },
  settingMenu() {
    this.vibrateFunc(1);
    wx.openSetting({})
  },
  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    let weight = [],
      height = [],
      distance = [],
      kcal = [];
    for (let i = 20; i <= 200; i++) {
      weight.push(i);
    }
    for (let i = 130; i <= 220; i++) {
      height.push(i);
    }
    for (let i = 1; i <= 500; i++) {
      distance.push(i);
    }
    for (let i = 1, j = 0; i <= 50; j = i * 100, i++) {
      kcal.push(j);
    }

    this.setData({
      weight_picker: weight,
      height_picker: height,
      distance_picker: distance,
      kcal_picker: kcal,
    });
    wx.setNavigationBarTitle({
      title: '设定计划[1/3]',
    })

  },
  changeSex(e) {
    this.vibrateFunc(1);
    this.setData({
      sex: (e.currentTarget.dataset.sex == "true") ? true : false,
    });
  },
  next(e) {
    this.vibrateFunc(1);
    if (e.currentTarget.dataset.steps == 4) {
      wx.setStorageSync('weight', this.data.weight_picker[this.data.weight_index]);
      wx.setStorageSync('height', this.data.height_picker[this.data.height_index]);
      wx.setStorageSync('distance', this.data.distance_picker[this.data.distance_index]);
      wx.setStorageSync('kcal', this.data.kcal_picker[this.data.kcal_index]);
      wx.setStorageSync('sex', this.data.sex)
      wx.switchTab({
        url: '../index/index',
      })
    }
    this.setData({
      steps: e.currentTarget.dataset.steps
    });
    if (this.data.steps == "1") {
      wx.setNavigationBarTitle({
        title: '设定计划[1/3]',
      })
    } else if (this.data.steps == "2") {
      wx.setNavigationBarTitle({
        title: '设定计划[2/3]',
      })
    } else if (this.data.steps == "3") {
      wx.setNavigationBarTitle({
        title: '设定计划[3/3]',
      })
    }
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