// pages/setting/index.js
Page({

  /**
   * 页面的初始数据
   */
  data: {
    sex_picker: ["男", "女"],
    sex_index: 0,
    weight_index: 0,
    weight_picker: [],
    height_index: 0,
    height_picker: [],
    distance_picker: [],
    distance_index: 0,
    kcal_picker: [],
    kcal_index: 0,
    keepScreenOn: false,
    vibrate: false,
    sex: false,//false是女性,true是男性
  },
  keepScreenOnSwitch() {
    if (this.data.vibrate) {
      wx.vibrateShort({})
    }
    this.setData({
      keepScreenOn: !this.data.keepScreenOn
    });
    wx.setKeepScreenOn({
      keepScreenOn: this.data.keepScreenOn
    });
  },
  vibrateSwitch() {
    if (!this.data.vibrate) {
      wx.vibrateShort({})
    }
    this.setData({
      vibrate: !this.data.vibrate
    });
  },
  sexSetting(e) {
    if (this.data.vibrate) {
      wx.vibrateShort({})
    }
    this.setData({
      sex_index: e.detail.value
    })
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
  distanceSetting(e){
    if (this.data.vibrate) {
      wx.vibrateShort({})
    }
    this.setData({
      distance_index: e.detail.value
    })
  },
  kcalSetting(e){
    if (this.data.vibrate) {
      wx.vibrateShort({})
    }
    this.setData({
      kcal_index: e.detail.value
    })
  },
  clearStorage(){
    if (this.data.vibrate) {
      wx.vibrateShort({})
    }
    wx.showModal({
      title: '提示',
      content: '确定要清空数据?清空后将无法撤回!',
      success(res){
        if(res.confirm){
          wx.clearStorage({
            complete: (res) => {
              wx.showToast({
                title: '清空成功',
                icon: 'success'
              })
            },
          })
        }else{
          wx.showToast({
            title: '取消清空'
          })
        }
      }
    })
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    wx.setNavigationBarTitle({
      title: '程序设置',
    })
    let weight = [],height = [], distance = [], kcal = [];
    for (let i = 20; i <= 200; i++) {
      weight.push(i);
    }
    for (let i = 130; i <= 220; i++) {
      height.push(i);
    }
    for (let i = 1; i <= 500; i++) {
      distance.push(i);
    }
    for (let i = 1,j=0; i <= 50; j = i*100, i++) {
      kcal.push(j);
    }
    wx.setNavigationBarTitle({
      title: '我',
    })
    let weight_index = weight.indexOf(wx.getStorageSync('weight'));
    let height_index = height.indexOf(wx.getStorageSync('height'));
    let distance_index = distance.indexOf(wx.getStorageSync('distance'));
    let kcal_index = kcal.indexOf(wx.getStorageSync('kcal'));
    if (weight_index < 0) weight_index = 0;
    if (height_index < 0) height_index = 0;
    if (distance_index < 0) distance_index = 4;
    if (kcal_index < 0) kcal_index = 0;
    this.setData({
      weight_picker: weight,
      height_picker: height,
      distance_picker: distance,
      kcal_picker: kcal,
      weight_index: weight_index,
      height_index: height_index,
      distance_index: distance_index,
      kcal_index: kcal_index,
      sex_index: (wx.getStorageSync('sex'))?0:1,
      vibrate: wx.getStorageSync('vibrate'),
      keepScreenOn: wx.getStorageSync('keepScreenOn')
    });
  },
  settingMenu() {
    wx.openSetting({})
  },
  /**
   * 生命周期函数--监听页面初次渲染完成
   */
  onReady: function () {
  },

  /**
   * 生命周期函数--监听页面显示
   */
  onShow: function () {

  },

  /**
   * 生命周期函数--监听页面隐藏
   */
  onHide: function () {

  },

  /**
   * 生命周期函数--监听页面卸载
   */
  onUnload: function () {
    wx.setStorageSync('weight', this.data.weight_picker[this.data.weight_index]);
    wx.setStorageSync('height', this.data.height_picker[this.data.height_index]);
    wx.setStorageSync('distance', this.data.distance_picker[this.data.distance_index]);
    wx.setStorageSync('kcal', this.data.kcal_picker[this.data.kcal_index]);
    wx.setStorageSync('vibrate', this.data.vibrate);
    wx.setStorageSync('keepScreenOn', this.data.keepScreenOn);
    wx.setStorageSync('sex', (this.data.sex_index == 0)? true:false)
  },

  /** 
   * 页面相关事件处理函数--监听用户下拉动作
   */
  onPullDownRefresh: function () {

  },

  /**
   * 页面上拉触底事件的处理函数
   */
  onReachBottom: function () {

  },

  /**
   * 用户点击右上角分享
   */
  onShareAppMessage: function () {

  }
})