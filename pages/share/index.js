// pages/share/index.js
const app = getApp()
var greycolor = '#969696';
var maincolor = '#fff';
Page({

  /**
   * 页面的初始数据
   */
  data: {
    qtsheXcxCode: "../../icon/qrcode.png",
    shareImagePath: "../../icon",
    qtsheBackground: "../../icon/bg.png",
    timeStamp: 0,
    run_data: null,
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    wx.setNavigationBarTitle({
      title: '运动分享',
    })
    this.data.id = options.id;
    let run_data = JSON.parse(wx.getStorageSync('RunInfo-' + options.id));
    this.data.run_data = run_data;
    let timeStamp = new Date(options.id * 1000);
    this.data.month = timeStamp.getMonth() + 1;
    this.data.date = timeStamp.getDate();
    this.data.hour = timeStamp.getHours();
    this.data.minute = (timeStamp.getMinutes() < 10) ? "0" + timeStamp.getMinutes() : timeStamp.getMinutes();

    this.createNewImg();
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



  setTitle() {

  },
  setlocate(cotext) {
    context.drawImage(path, 295, 507, 80, 80)
  },
  //将小程序码绘制到固定位置
  setQrcode(context) {
    let path = this.data.qtsheXcxCode //小程序码
    context.drawImage(path, 205, 20, 80, 80)
  },
  //将canvas转换为图片保存到本地，然后将图片路径传给image图片的src
  createNewImg() {
    let context = wx.createCanvasContext('mycanvas')
    let path = this.data.qtsheBackground
    let that = this
    context.drawImage(path, 0, 0, 300, 300) //以iPhone 6尺寸大小为标准绘制图片
    that.setQrcode(context)

    context.setTextAlign('left');
    context.font = 'bolder 25px sans-serif';
    context.setFillStyle(maincolor);
    context.fillText("活力健身房", 10, 35);
    context.font = 'bolder 15px sans-serif';
    context.fillText("2020", 10, 160);

    context.fillText(this.data.run_data.kcal_data, 10, 220);
    context.fillText(this.data.run_data.distance_data, 120, 220);
    context.fillText(this.data.run_data.speed_data, 10, 260);
    context.fillText(this.data.run_data.time_data, 120, 260);

    context.font = 'bolder 10px sans-serif';
    context.setFillStyle(greycolor);
    context.fillText(this.data.month + "月" + this.data.date + "日 " + this.data.hour + ":" + this.data.minute, 10, 175);
    context.fillText("卡路里(千卡)", 10, 235);
    context.fillText("里程(千米)", 120, 235);
    context.fillText("配速(分/公里)", 10, 275);
    context.fillText("时间", 120, 275);

    // that.setAvatarUrl(context)
    //绘制图片
    context.rect(20, 20, 150, 100);
    context.draw()
    context.save()
    //将生成好的图片保存到本地，需要延迟一会，绘制期间耗时
    setTimeout(() => {
      wx.canvasToTempFilePath({
        canvasId: 'mycanvas',
        success: function (res) {
          wx.hideLoading()
          that.setData({
            shareImagePath: res.tempFilePath
          })
        },
        fail: function (res) {
          console.log(res.errMsg)
        }
      }, this)
    }, 2000)
  },
  savePhoto() {

    this.vibrateFunc(1);
    var that = this

    wx.getSetting({
      success(res) {
        let wpa = res.authSetting["scope.writePhotosAlbum"];

        // console.log(res.authSetting)
        if (wpa == false || wpa == undefined) {
          wx.showModal({
            title: "提示",
            content: "保存照片功能,需要您的相册访问授权,请先授权再使用该功能。",
            confirmText: "授权",
            cancelText: "取消",
            success(res) {
              if (res.confirm) {
                wx.openSetting({})
              } else {
                return;
              }
            }
          })
        } else {
          wx.showLoading({
            title: '正在保存...',
            mask: true
          })
          setTimeout(() => {
            wx.saveImageToPhotosAlbum({
              filePath: that.data.shareImagePath,
              success(res) {
                wx.showToast({
                  title: '保存成功',
                  icon: 'none'
                })
                setTimeout(() => {
                  wx.hideLoading()
                  that.setData({
                    isPhotoModel: false,
                    isCanvas: false
                  })
                }, 1000)
              },
              fail() {
                wx.showToast({
                  title: '保存失败，请刷新页面重试',
                  icon: 'none'
                })
                setTimeout(() => {
                  wx.hideLoading()
                  that.setData({
                    isPhotoModel: false,
                    isCanvas: false
                  })
                }, 1000)
              }
            })
          }, 2500)
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