// 加载 CSV 文件 (假设你已经将 CSV 文件上传到你的资产)
var pointsTable = ee.FeatureCollection('projects/fluid-cosmos-435610-a6/assets/climate_data'); // 替换为你的路径

// 加载 WorldClim 数据
var dataset = ee.Image('WORLDCLIM/V1/BIO');
var srtm = ee.Image('USGS/SRTMGL1_003');
var terrain = ee.Terrain.products(srtm);  // 包括高程、坡度、坡向等
var tempDataset = ee.ImageCollection('WORLDCLIM/V1/MONTHLY');

// 定义提取气候和地形数据的函数
var extractClimateData = function(feature) {
  var point = ee.Geometry.Point([feature.get('lon'), feature.get('lat')]);
  
  // 创建存储站点信息的属性对象
  var properties = {
    site: feature.get('site'),
    lon: feature.get('lon'),
    lat: feature.get('lat')
  };

  // 提取气候数据
  var climateData = dataset.sample(point, 30).first();
  var bioBands = ['bio01', 'bio02', 'bio03', 'bio04', 'bio05', 'bio06', 'bio07', 'bio08', 'bio09', 'bio10', 
                  'bio11', 'bio12', 'bio13', 'bio14', 'bio15', 'bio16', 'bio17', 'bio18', 'bio19'];
  
  // 动态提取气候变量并添加到属性对象中
  bioBands.forEach(function(band) {
    properties[band] = climateData.get(band);
  });
  
  // 提取 SRTM 高程数据、坡度和坡向
  var terrainData = terrain.sample(point, 30).first();
  properties.elevation = terrainData.get('elevation');
  properties.slope = terrainData.get('slope');
  properties.aspect = terrainData.get('aspect');
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
  
  // 创建更新后的 Feature 并返回
  return ee.Feature(point).set(properties);
};

// 对每个点应用函数提取气候数据和地形数据
var results = pointsTable.map(extractClimateData);

// 打印结果，确保提取的数据包含所有的气候变量和地形信息
print('Extracted Climate Data and Elevation, Slope, Aspect:', results);
