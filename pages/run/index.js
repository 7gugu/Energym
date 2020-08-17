// pages/run/index.js
import timer from "../../utils/lebu-timer";
import lebu from "../../utils/lebu-core";
Page({

  /**
   * 页面的初始数据
   */
  data: {
    _msg: '反编译的人,我是你爹,NMSL',
    screenHeight: 0,
    polyline: [{
      points: [],
      color: "#07c160",
      width: 2
    }],
    latitude: 0,
    longitude: 0,
    altitude_data: [],
    time_data: "00:00:00",
    kcal_data: "0.00",
    speed_data: "0'00\"",
    distance_data: "0.00",
    motion_status: 0,
    time_id: 0,
    points_time: parseInt(Date.now() / 1000),
    km_speed_data: [],
    km_distance_data: 0,
    runType: 0,
  },
  tabSelect(e) {
    this.setData({
      runType: e.currentTarget.dataset.id,
    })
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    this.initRun();
    if (this.data.runType == 0) {
      let sub_obj = "polyline[" + 0 + "].points"
      wx.onLocationChange((result) => {
        //let ex_steps = result.steps;//获取定位步数
        //lebu.setSteps(ex_steps);
        let points = this.data.polyline[0].points;
        //检测距离
        if (this.data.polyline[0].points.length == 0 || this.checkDistance(result.latitude, result.longitude, parseInt(Date.now() / 1000))) {
          points.push({
            longitude: result.longitude,
            latitude: result.latitude
          });
          this.setData({
            [sub_obj]: points,
            longitude: result.longitude,
            latitude: result.latitude,
          });
        }
      })
    }
  },
  initRun() {
    let sex = wx.getStorageSync('sex');
    let weight = wx.getStorageSync('weight');
    let height = wx.getStorageSync('height');
    if (sex) {
      //男性
      weight = 60;
      height = 172;
    } else {
      //女性
      weight = 52;
      height = 166;
    }
    lebu.setWeight(weight);
    lebu.setHeight(height);
    let that = this;
    if (this.data.runType == 0) {
      wx.getLocation({
        altitude: true,
        success(res) {

          that.setData({
            latitude: res.latitude,
            longitude: res.longitude,
            altitude: res.altitude,
          })

          setTimeout(function () {
            let obj = wx.createMapContext('myMap')
            obj.moveToLocation();
          }, 1000);
        },
        fail() {
          that.checkLocation();
        }
      });
    }
  },
  startRun() {
    let that = this;
    this.vibrateFunc(1);
    wx.showModal({
      title: '提示',
      content: '将手机放置在裤袋当中或抓着手机摆臂跑步,可以获得更加精准的数据统计哦!',
      showCancel: false
    })
    if (this.data.runType == 0) {
      wx.startLocationUpdateBackground({
        success: (res) => {


        },
        fail: (res) => {
          console.log(res)
        }
      });
    }



    wx.startAccelerometer({
      interval: 'normal',
      success() {
        timer.start();
        that.setData({
          motion_status: 1,
        });
      }
    })
    this.data.time_id = setInterval(function () {
      let time_data = timer.getTime();
      that.setData({
        time_data: time_data,
      });
    }, 500);
    wx.onAccelerometerChange(res => {
      let run_data = lebu.run(res, this.data.time_data);

      that.setData({
        distance_data: run_data.distance,
        kcal_data: run_data.kcal,
        speed_data: run_data.speed,
      });
      if (run_data.distance - that.data.km_distance_data >= 1) {
        let km_speed_obj = that.data.km_speed_data;
        km_speed_obj.push(run_data.speed);
        let altitude_obj = that.data.altitude_data;
        altitude_obj.push(that.data.altitude);
        that.setData({
          km_distance_data: run_data.distance,
          km_speed_data: km_speed_obj,
          altitude_data: altitude_obj
        });
      }
    });
  },
  pauseRun() {
    this.vibrateFunc(1)
    let that = this;
    timer.end();
    if (this.data.runType == 0) {
      wx.stopLocationUpdate({
        complete: (res) => {

        },
      });
    }
    wx.stopAccelerometer({
      complete: (res) => {
        that.setData({
          motion_status: 2
        });
      },
    })
  },
  reRun() {
    this.vibrateFunc(1)
    let that = this;
    if (this.data.runType == 0) {
      wx.startLocationUpdate({
        success: (res) => {


          // wx.startAccelerometer({
          //   interval: 'normal'
          // })
          // wx.onAccelerometerChange(res => {
          //   let run_data = lebu.run(res, this.data.time_data);
          //   that.setData({
          //     distance_data: run_data.distance,
          //     kcal_data: run_data.kcal,
          //     speed_data: run_data.speed,
          //   });
          //   if(run_data.distance - that.data.km_distance_data >= 1){
          //     let obj = that.data.km_speed_data;
          //     obj.push(run_data.speed);
          //     that.setData({
          //       km_distance_data: run_data.distance,
          //       km_speed_data: obj,
          //     });
          //   }
          // });
        },
        fail: (res) => {
          console.log(res)
        }
      });
    }
    wx.startAccelerometer({
      interval: 'normal',
      success() {
        that.setData({
          motion_status: 1,
        });
        timer.start();
      }
    })
    wx.onAccelerometerChange(res => {
      let run_data = lebu.run(res, this.data.time_data);
      that.setData({
        distance_data: run_data.distance,
        kcal_data: run_data.kcal,
        speed_data: run_data.speed,
      });
      if (run_data.distance - that.data.km_distance_data >= 1) {
        let obj = that.data.km_speed_data;
        obj.push(run_data.speed);
        that.setData({
          km_distance_data: run_data.distance,
          km_speed_data: obj,
        });
      }
    });

  },
  stopRun() {
    this.vibrateFunc(2)
    let that = this;
    timer.end();
    timer.reset();
    if (this.data.runType == 0) {
      wx.stopLocationUpdate({
        complete: (res) => {

        },
      });
    }
    wx.stopAccelerometer({
      complete: (res) => {
        that.setData({
          motion_status: 2
        });
      },
    });
    if (this.data.distance_data == 0) {
      wx.showModal({
        title: '未检测到任何移动',
        content: '继续运动还是舍弃这条记录?',
        cancelText: '舍弃',
        confirmText: '继续',
        success(res) {
          if (res.confirm) {
            that.reRun();
          } else {
            wx.switchTab({
              url: '../index/index',
            })
          }
        }
      })
    } else if (this.data.distance_data < 0.1) {
      wx.showModal({
        title: '移动距离太短',
        content: '继续运动还是舍弃这条记录?',
        cancelText: '舍弃',
        confirmText: '继续',
        success(res) {
          if (res.confirm) {
            that.reRun();
          } else {
            wx.switchTab({
              url: '../index/index',
            })
          }
        }
      });
    } else {
      lebu.reset();
      clearInterval(this.data.time_id);
      let id = parseInt(Date.now() / 1000)
      wx.setStorageSync('RunInfo-' + id, JSON.stringify({
        time_data: this.data.time_data,
        speed_data: this.data.speed_data,
        kcal_data: this.data.kcal_data,
        distance_data: this.data.distance_data,
        km_speed_data: this.data.km_speed_data,
        points_data: this.data.polyline[0].points,
        altitude_data: this.data.altitude_data,
        altitude: this.data.altitude,
        runType: this.data.runType
      }));
      wx.redirectTo({
        url: './statement?id=' + id,
      })
    }
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
  /**
   * 生命周期函数--监听页面初次渲染完成
   */
  onReady: function () {
    this.setScreenHeight();
  },
  //设定地图高度为全屏幕高度 
  setScreenHeight() {
    let that = this;
    wx.getSystemInfo({
      success: (res) => {
        that.setData({
          screenHeight: (res.screenHeight * 0.901) + "px"
        })
      },
    })
  },
  //检测是否开启后台定位,并引导用户开启
  checkLocation() {
    if (this.data.runType == 1) return;
    wx.getSetting({
      success(res) {
        let ulb = res.authSetting["scope.userLocationBackground"];

        //console.log(res.authSetting)
        if (ulb == false || ulb == undefined || res.authSetting["scope.userLocation"] == false) {
          wx.showModal({
            title: "提示",
            content: "请先设置位置信息为\"使用小程序期间和离开小程序后\",才可运行跑步模块",
            success(res) {
              if (res.confirm) {
                wx.openSetting({})
              } else {
                wx.switchTab({
                  url: '../index/index',
                })
              }
            }
          })
        }
      }
    })
  },
  checkDistance(lat2, lng2, cur_time) {
    let obj = this.data.polyline[0].points[this.data.polyline[0].points.length - 1];
    // console.log(this.data.polyline[0].points);
    let lat1 = obj.latitude;
    let lng1 = obj.longitude;
    // 调用 return的距离单位为m
    let radLat1 = lat1 * Math.PI / 180.0;
    let radLat2 = lat2 * Math.PI / 180.0;
    let a = radLat1 - radLat2;
    let b = lng1 * Math.PI / 180.0 - lng2 * Math.PI / 180.0;
    let s = 2 * Math.asin(Math.sqrt(Math.pow(Math.sin(a / 2), 2) +
      Math.cos(radLat1) * Math.cos(radLat2) * Math.pow(Math.sin(b / 2), 2)));
    s = s * 6378.137; // EARTH_RADIUS;
    s = Math.round(s * 10000) / 10; //m

    let time_differece = cur_time - this.data.points_time; //秒
    this.data.points_time = cur_time;
    if (time_differece <= 0) {
      return false;
    }

    let cal_distance = (lebu.getStride() / 100) * time_differece; //cm => m
    if ((s <= cal_distance && s > 0) || (s <= this.data.distance_data && this.data.distance > 0) || (s < 35 && s > 0)) {
      return true;
    } else {
      return false;
    }

  },
  /**
   * 生命周期函数--监听页面显示
   */
  onShow: function () {
    this.checkLocation();
  },

  /**
   * 生命周期函数--监听页面卸载
   */
  onUnload: function () {
    wx.setNavigationBarTitle({
      title: '跑步记录',
    })
    wx.stopLocationUpdate({
      complete: (res) => {},
    })
  },
  onUnload() {
    let that = this;
    //时间计数器重置
    timer.end();
    timer.reset();
    //定位停止
    if (this.data.runType == 0) {
      wx.stopLocationUpdate({
        complete: (res) => {

        },
      });
    }
    //加速度传感器停止监测
    wx.stopAccelerometer({
      complete: (res) => {
        that.setData({
          motion_status: 2
        });
      },
    });
    //跑步模块重置
    lebu.reset();
  }
})