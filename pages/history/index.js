// pages/history/index.js
Page({

  /**
   * 页面的初始数据
   */
  data: {
    runinfo_data: [],
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onShow: function () {
    wx.setNavigationBarTitle({
      title: '历史记录',
    })
    let storage_key = wx.getStorageInfoSync();
    storage_key = storage_key.keys;
    let runinfo_key = [];
    for (let i = 0; i < storage_key.length; i++) {
      let key = storage_key[i].split("-");
      if (key[0] == "RunInfo") {
        runinfo_key.push(key[1]);
      }
    }
    runinfo_key = runinfo_key.sort().reverse();

    let runinfo_data = []
    for (let i = 0; i < runinfo_key.length; i++) {
      let temp = JSON.parse(wx.getStorageSync("RunInfo-" + runinfo_key[i]));
      temp["id"] = runinfo_key[i];
      let now = new Date(parseInt(runinfo_key[i]) * 1000);
      let month = now.getMonth() + 1;
      let date = now.getDate();
      let hour = (now.getHours() < 10)?"0"+now.getHours():now.getHours();
      let minute = (now.getMinutes() < 10)? "0"+now.getMinutes():now.getMinutes();
      let day = now.getDay(); //获取存储当前日期
      let weekday = ["日", "一", "二", "三", "四", "五", "六"];
      temp["time_format"] = month + "月" + date + "日 " + hour + ":" + minute + " 周" + weekday[day];
      runinfo_data.push(temp);
    }
    this.setData({
      runinfo_data: runinfo_data
    });
    //console.log(JSON.stringify(runinfo_data));
  },
  toDetail(e) {
    this.vibrateFunc(1);
    let id = e.currentTarget.dataset.id
    wx.navigateTo({
      url: './detail?id=' + id,
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