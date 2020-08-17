// pages/bmi/index.js
Page({

  /**
   * 页面的初始数据
   */
  data: {
    bmi: 0,
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    wx.setNavigationBarTitle({
      title: 'BMI计算',
    })
  },

  calBMI(){
    //BMI = 体重(公斤) / 身高^2(米^2)
    let weight = wx.getStorageSync('weight');
    let height = wx.getStorageSync('height')/100;
    
    let bmi = weight / Math.pow(height, 2);
    bmi = bmi.toFixed(1);
    this.setData({
      bmi: bmi
    });
  },

  /**
   * 生命周期函数--监听页面显示
   */
  onShow: function () {
    this.calBMI();
  },
})