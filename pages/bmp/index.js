// pages/bmp/index.js
const sampleBuffer = []; //亮度集合
const bpms = [];

var graphCanvas;
var graphContext;
var listner;
var intervalId;

Page({

  /**
   * 页面的初始数据
   */
  data: {
    bpm: 0,
    spo2: 0,
    startBtn: true,
    stopBtn: false,
    time: 30,
  },
  // 重置亮度数组
  resetBuffer() {
    sampleBuffer.length = 0;
  },
  // 计算平均亮度数据
  averageBrightness(frame) {
    // 获取单帧RGBA数据
    const pixelData = new Uint8Array(frame.data);
    let sum = 0;

    // 获取红绿通道的强度值
    for (let i = 0; i < pixelData.length; i += 4) {
      sum = sum + pixelData[i] + pixelData[i + 1];
    }

    // 计算平均光强(由于只取得其中两路的光强数据，因此只计算两路光强数据的个数)
    const avg = sum / (pixelData.length * 0.5);

    // 返回亮度值(0~1)
    return avg / 255;
  },
  // 分析数据
  analyzeData(samples) {
    // 获取帧平均亮度(计算基线)
    const average = samples.map((sample) => sample.value).reduce((a, c) => a + c) / samples.length;

    // 搜索数组中的极大值与极小值
    // 用于图像绘制
    let min = samples[0].value;
    let max = samples[0].value;
    samples.forEach((sample) => {
      if (sample.value > max) {
        max = sample.value;
      }
      if (sample.value < min) {
        min = sample.value;
      }
    });

    // 计算波动范围，0.002~0.02为最佳值
    const range = max - min;

    // 计算波峰个数
    const crossings = this.getAverageCrossings(samples, average);
    return {
      average,
      min,
      max,
      range,
      crossings,
    };
  },
  // 过滤波峰数据
  getAverageCrossings(samples, average) {
    // 遍历数组中的亮度值，计算跃出基线的次数，即为波峰数
    const crossingsSamples = [];
    let previousSample = samples[0]; // 将数组指针指向第一个元素(防止死循环)

    samples.forEach(function (currentSample) {
      // 如果是跃出，则记为一个波峰
      if (
        currentSample.value < average &&
        previousSample.value > average
      ) {
        crossingsSamples.push(currentSample);
      }
      previousSample = currentSample;
    });

    return crossingsSamples;
  },
  // 计算BPM
  calculateBpm(samples) {
    if (samples.length < 2) {
      return;
    }
    // 计算第一个波峰到最后一个波峰之间的平均耗时
    const averageInterval =
      (samples[samples.length - 1].time - samples[0].time) /
      (samples.length - 1);

    // 计算60s内有多少个波峰
    return 60000 / averageInterval;
  },
  // 检测摄像头是否覆盖
  checkCover(frame) {
    let data = new Uint8Array(frame.data).filter((x, i) => {
      return (i + 1) / 4 != 0
    });
    return Math.round(data.reduce((a, c) => a + c) / data.length) < 130;
  },
  // 处理帧亮度
  processFrame() {
    const context = wx.createCameraContext();
    listner = context.onCameraFrame((frame) => {

      const cover = this.checkCover(frame);
      if (cover) {
        // 从摄像头获取一帧
        const value = this.averageBrightness(frame);
        const time = Date.now();
        sampleBuffer.push({
          value,
          time
        });
        // 摄像头 60 FPS 每次只处理5s的数据 
        if (sampleBuffer.length > 300) {
          sampleBuffer.shift();
        }

        // 分析数据
        const dataStats = this.analyzeData(sampleBuffer);
        this.calSpo2(dataStats);
        // 计算BPM()
        const bpm = this.calculateBpm(dataStats.crossings);

        if (bpm) {
          if (bpm >= 50 ) {
            this.setData({
              bpm: Math.round(bpm)
            });
          }
        }
        this.drawGraph(dataStats);
      }
    });
    listner.start();
  },
  calSpo2(data){
    let ac = data.max - data.min;
    let dc = 1 - ac / 2;
    let spo2 = 100-ac/dc*100;
    if(spo2>50){
      this.setData({
        spo2: Math.round(spo2)
      });
    }
  },
  // 绘制心率图
  drawGraph(dataStats) {

    // 计算缩放比例
    const xScaling = graphCanvas.width / 300;

    // 计算图像偏移量，使其图像从右往左移动
    const xOffset = (300 - sampleBuffer.length) * xScaling;

    graphContext.lineWidth = 6;
    graphContext.strokeStyle = "#f76";
    graphContext.lineCap = "round";
    graphContext.lineJoin = "round";

    graphContext.clearRect(0, 0, graphCanvas.width, graphCanvas.height);
    graphContext.beginPath();

    // 防止图像被裁切，计算可绘制的最大高度(高度 - 上边的宽度 - 下边的宽度)
    const maxHeight = graphCanvas.height - graphContext.lineWidth * 2;
    let previousY = 0;
    sampleBuffer.forEach((sample, i) => {
      const x = xScaling * i + xOffset;

      let y = graphContext.lineWidth;

      if (sample.value !== 0) {
        y =
          (maxHeight * (sample.value - dataStats.min)) /
          (dataStats.max - dataStats.min) +
          graphContext.lineWidth;
      }

      if (y != previousY) {
        graphContext.lineTo(x, y);
      }

      previousY = y;
    });

    graphContext.stroke();
  },

  onShow: function () {
    let query = wx.createSelectorQuery()
    query.select('#heartRate').fields({
        node: true,
        size: true
      })
      .exec((res) => {
        graphCanvas = res[0].node
        graphContext = graphCanvas.getContext('2d')

        const dpr = wx.getSystemInfoSync().pixelRatio
        graphCanvas.width = res[0].width * dpr
        graphCanvas.height = res[0].height * dpr
        graphContext.scale(1, 1)
      })

      this.processFrame();
  },
  onUnload() {
    listner.stop();
    this.resetBuffer();
  }




})