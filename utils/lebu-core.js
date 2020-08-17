//Powered By 7gugu

//轴向样本空间
var arr_x = new Array(), arr_y = new Array(), arr_z = new Array();
//临界阈值
const ACTIVE_PRECISION = 1;
//活跃轴体ID
var active_axis = 0;
//动态阈值计算
var peak_x_new_max=0, peak_y_new_max=0, peak_z_new_max=0;
var peak_x_new_min=0, peak_y_new_min=0, peak_z_new_min=0;
var peak_x_old_max=0, peak_y_old_max=0, peak_z_old_max=0;
var peak_x_old_min=0, peak_y_old_min=0, peak_z_old_min=0;
var peak_limit = 50,cur_limit = 0;
		
//动态轴向样本
var old_sample_x=0, old_sample_y=0, old_sample_z=0;
var new_sample_x=0, new_sample_y=0, new_sample_z=0;
var dynamic_precision=0.5;//动态精度 

//跑步步数
var steps = 0;
var old_steps = 0;
var old_time = 0;

var stride = 0;
var height = 0;
var weight = 0;
var kcal = 0;
//运动里程(公里)
var distance = 0;
var desc = "";
var speed = 0;

//初级滤波,使得样本更加平滑
function filter_calculate(acceleration){
  let x = 0, y = 0, z = 0;
    arr_x.push(acceleration.x);
    arr_y.push(acceleration.y);
    arr_z.push(acceleration.z);
    if(arr_x.length>=3&&arr_y.length>=3&&arr_z.length>=3){
      for(var i=0;i<arr_x.length;i++){
        x = x + arr_x[i];
      }
      for(var i=0;i<arr_y.length;i++){
        y = y + arr_y[i];
      }
      for(var i=0;i<arr_z.length;i++){
        z = z + arr_z[i];
      }
      arr_x = new Array();
      arr_y = new Array();
      arr_z = new Array();
    }
    x = x/3;
    y = y/3;
    z = z/3;
}

//动态阈值更新
function peakUpdate(acceleration){
  let cur_x = acceleration.x;
  let cur_y = acceleration.y;
  let cur_z = acceleration.z;
  cur_limit++;
  if(cur_limit > peak_limit){
    peak_x_old_max = peak_x_new_max;
    peak_y_old_max = peak_y_new_max;
    peak_z_old_max = peak_z_new_max;
    cur_limit = 0;
    peak_x_new_max=0;
    peak_y_new_max=0;
    peak_z_new_max=0;
    peak_x_new_min=0;
    peak_y_new_min=0;
    peak_z_new_min=0;
  }
  peak_x_new_max = Math.max(peak_x_new_max, cur_x);
  peak_y_new_max = Math.max(peak_y_new_max, cur_y);
  peak_z_new_max = Math.max(peak_z_new_max, cur_z);
  peak_x_new_min = Math.min(peak_x_new_min, cur_x);
  peak_y_new_min = Math.min(peak_y_new_min, cur_y);
  peak_z_new_min = Math.min(peak_z_new_min, cur_z);
  
}

//去除高频噪声
function slidUpdate(acceleration){
  let cur_x = acceleration.x;
  let cur_y = acceleration.y;
  let cur_z = acceleration.z;
  
  if(Math.abs(cur_x - new_sample_x) > dynamic_precision){
    old_sample_x = new_sample_x;
    new_sample_x = cur_x;
  }else{
    old_sample_x = new_sample_x;
  }
  
  if(Math.abs(cur_y - new_sample_y) > dynamic_precision){
    old_sample_y = new_sample_y;
    new_sample_y = cur_y;
  }else{
    old_sample_y = new_sample_y;
  }
  
  if(Math.abs(cur_z - new_sample_z) > dynamic_precision){
    old_sample_z = new_sample_z;
    new_sample_z = cur_z;
  }else{
    old_sample_z = new_sample_z;
  }

}

//判断当前最活跃轴
function is_most_active(){
  let max_x = peak_x_new_max, max_y = peak_y_new_max, max_z = peak_z_new_max;
  let min_x = peak_x_new_min, min_y = peak_y_new_min, min_z = peak_z_new_min
  let res = 0 ;//哪个轴都不活跃,静止状态
  let x_change = Math.abs((max_x - min_x));
  let y_change = Math.abs((max_y - min_y));
  let z_change = Math.abs((max_z - min_z));
  if (x_change > y_change && x_change > z_change && x_change >= ACTIVE_PRECISION) {
    res = 1;//x轴最活跃
  } else if (y_change > x_change && y_change > z_change && y_change >= ACTIVE_PRECISION) {
    res = 2;//y轴最活跃
  } else if (z_change > x_change && z_change > y_change && z_change >= ACTIVE_PRECISION) {
    res = 3;//z轴最活跃
  }
  active_axis = res;
}

//判断是否运动
function judge(){
  if(active_axis == 1){
    let threshold_x = ((peak_x_old_max + peak_x_old_min)/2);
    if (Math.abs(old_sample_x) > threshold_x && Math.abs(new_sample_x) < threshold_x) {
      steps++;
    }
  }else if(active_axis == 2){
    let threshold_y = (peak_y_old_max + peak_y_old_min) / 2;
    if (Math.abs(old_sample_y) > threshold_y && Math.abs(new_sample_y) < threshold_y) {
      steps++;
    }
  }else if(active_axis == 3){
    let threshold_z = (peak_z_old_max + peak_z_old_min) / 2;
    if (Math.abs(old_sample_z) > threshold_z && Math.abs(new_sample_z) < threshold_z) {
      steps++;
    }
  }
}

//计算跨距
function calStride(){
  stride = height * 0.4 ;
}

//计算卡路里
function CalMotionCalories(){
  if(weight > 0){
    kcal = weight * distance * 1.036;
    kcal = kcal.toFixed(2);
  }
}

//计算配速
function calSpeed(totalTime){
  let time_split = totalTime.split(":");
  let hours = time_split[0];
  let minutes = time_split[1];
  let seconds = time_split[2];
  let template = "0'00\"";
  
  if(distance > 0 && hours.length > 0 && minutes.length > 0 && seconds.length > 0){
    let temp_speed = parseFloat(hours) * 60.0 + parseFloat(minutes) + parseFloat(seconds) / 60.0;
    temp_speed = temp_speed / parseFloat(distance);
    let min_speed = Math.floor(temp_speed);
    let sec_speed = Math.floor((temp_speed - min_speed) * 60.0);
    speed = min_speed + "'" + sec_speed + "\"";
  }else{
    speed = template;
  }
}

//计算运动距离
function calDistance(){
  if(stride > 0){
    let temp_distance = steps * parseInt(stride);
    distance = (temp_distance/100/1000).toFixed(2);//厘米转公里
  }
}

//输出对象的数据
function param_output(){
  console.log({
    active_axis: active_axis,
    old_sample_x: old_sample_x,
    old_sample_y: old_sample_y,
    old_sample_z: old_sample_z,
    threshold_x: ((peak_x_old_max + peak_x_old_min)/2),
    threshold_y: ((peak_y_old_max + peak_y_old_min)/2),
    threshold_z: ((peak_z_old_max + peak_z_old_min)/2),
    new_sample_x: new_sample_x,
    new_sample_y: new_sample_y,
    new_sample_z: new_sample_z,
    kcal: kcal,
    steps: steps,
    speed: speed,
    stride: stride
  });
}

function setHeight(h){
  height = h;
}

function setWeight(w){
  weight = w;
}

function getStride(){
  return stride;
}

function reset(){
  height = 0;
  weight = 0;
  stride = 0;
  kcal = 0;
  distance = 0;
  speed = 0;
  steps = 0;
}

function run(res, totalTime){
  calStride();//计算跨距
  if(stride == 0){
    desc = "跨距为0";
  }
  filter_calculate(res);
  peakUpdate(res);
  slidUpdate(res);
  is_most_active();
  judge();//计算步数
  if(weight == 0){
    desc = "体重为0";
  }

  if(height == 0){
    desc = "身高为0";
  }
  calDistance();//计算累计里程
  CalMotionCalories();//计算累计卡路里
  calSpeed(totalTime);//计算配速
  return {
    steps: steps,
    distance: distance,
    speed: speed,
    kcal: kcal,
    height: height,
    weight: weight,
    desc: desc
  };
}

function setSteps(ex_steps){
  let output_step = 0;
  if(ex_steps > steps * 2){
    output_step = (ex_steps * 0.5 + steps)/2;
  }else if(ex_steps > steps){
    output_step = (ex_steps + steps)/2;
  }

  steps = output_step;
}

module.exports = {
  param_output: param_output,
  run: run,
  setSteps: setSteps,
  setHeight: setHeight,
  setWeight: setWeight,
  getStride: getStride,
  reset: reset
}