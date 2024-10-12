// 加载 CSV 文件 (假设你已经将 CSV 文件上传到你的资产)
var pointsTable = ee.FeatureCollection('projects/fluid-cosmos-435610-a6/assets/climate_data'); // 替换为你的路径

// 加载 WorldClim 数据集
var tempDataset = ee.ImageCollection('WORLDCLIM/V1/MONTHLY');

// 定义提取气候数据的函数
var extractClimateData = function(feature) {
  var point = ee.Geometry.Point([feature.get('lon'), feature.get('lat')]);
  
  var properties = {
    site: feature.get('site'),  // 保持 'site' 属性
    lon: feature.get('lon'),
    lat: feature.get('lat')
  };

  // 遍历1到12月份，提取每个月的数据
  for (var month = 1; month <= 12; month++) {
    var monthStr = month < 10 ? '0' + month : '' + month;  // 将月份格式化为两位数
    
    // 筛选该月份的 WorldClim 数据
    var monthlyData = tempDataset.filter(ee.Filter.eq('system:index', monthStr)).first();
    
    // 使用 sample 方法从图像中提取样本数据
    var monthlyDatasample = monthlyData.sample(point, 30).first();  // 30 是采样分辨率（可以根据需要调整）
    
    // 提取气候数据
    var prec = monthlyDatasample.get('prec');  // 提取降水量
    var tavg = monthlyDatasample.get('tavg');  // 提取平均温度
    var tmin = monthlyDatasample.get('tmin');  // 提取最低温度
    var tmax = monthlyDatasample.get('tmax');  // 提取最高温度
    
    // 将气候数据添加到属性中
    properties['prec_' + monthStr] = prec;
    properties['tavg_' + monthStr] = tavg;
    properties['tmin_' + monthStr] = tmin;
    properties['tmax_' + monthStr] = tmax;
  }
  
  // 创建更新后的 Feature，包含所有月份的数据
  return ee.Feature(point).set(properties);
};

// 对每个点应用函数提取1-12月份的气候数据
var results = pointsTable.map(extractClimateData);

// 打印结果，确保提取的数据包含所有的气候变量
print('Extracted Climate Data:', results);
