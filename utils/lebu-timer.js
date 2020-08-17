var time = "00:00:00"; 
var timer_id = 0;
let ms = 0, s = 0, m = 0, h = 0;

function timer(){   //定义计时函数
  ms = ms + 50;         //毫秒
  if(ms >= 1000){
      ms = 0;
      s = s +1;         //秒
  }
  if(s>=60){
      s=0;
      m=m+1;        //分钟
  }
  if(m>=60){
      m=0;
      h=h+1;        //小时
  }
  time = toDub(h)+":"+toDub(m)+":"+toDub(s);
}

function toDub(n){  //补0操作
  if(n<10){
      return "0"+n;
  }
  else {
      return ""+n;
  }
}

function start(){
  timer_id = setInterval(function(){timer()}, 50);
}

function end(){
  clearInterval(timer_id);
}

function reset(){
  time = "00:00:00";
  ms = 0, s = 0, m = 0, h = 0;
  timer_id = 0;
}

function getTime(){
  return time;
}

module.exports = {
  start: start,
  end: end,
  reset: reset,
  getTime: getTime
}