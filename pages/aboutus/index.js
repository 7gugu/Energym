// pages/aboutus/index.js
Page({

  /**
   * 页面的初始数据
   */
  data: {

  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    wx.setNavigationBarTitle({
      title: '关于',
    })
  },
  copy(e) {
    let type = e.currentTarget.dataset.type;
    let data;
    switch (type) {
      case 'email':
        data = "gz7gugu@qq.com";
        break;
      case 'blog':
        data = "https://www.7gugu.com";
        break;
      case 'gitee':
        data = "https://gitee.com/7gugu/energy_gym";
        break;
      default:
        data = "gz7gugu@qq.com"
    }
    wx.setClipboardData({
      data: data,
    })
  }
})