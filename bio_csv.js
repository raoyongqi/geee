// 加载 CSV 文件 (假设你已经将 CSV 文件上传到你的资产)
var pointsTable = ee.FeatureCollection('projects/fluid-cosmos-435610-a6/assets/climate_data'); // 替换为你的路径

// 加载 WorldClim 数据
var dataset = ee.Image('WORLDCLIM/V1/BIO');
var tempDataset = ee.ImageCollection('WORLDCLIM/V1/MONTHLY');
var januaryData = tempDataset.filter(ee.Filter.eq('system:index', '01'));
print(januaryData)
// 加载 SRTM 数据
var srtm = ee.Image('USGS/SRTMGL1_003');
var slope = ee.Terrain.slope(srtm);  // 计算坡度
var aspect = ee.Terrain.aspect(srtm);  // 计算坡向

// 定义提取气候数据和地形数据的函数
var extractClimateData = function(feature) {
  var point = ee.Geometry.Point([feature.get('lon'), feature.get('lat')]);

  // 提取 WorldClim 数据
  var climateData = dataset.sample(point, 30).first();  // 提取点周围的样本数据
  
  // 提取 SRTM 高程数据、坡度和坡向
  var elevation = srtm.sample(point, 30).first();  // 高程数据
  var slopeValue = slope.sample(point, 30).first();  // 坡度
  var aspectValue = aspect.sample(point, 30).first();  // 坡向
  
  // 硬编码指定要提取的所有 bands
  var bio01 = climateData.get('bio01');
  var bio02 = climateData.get('bio02');
  var bio03 = climateData.get('bio03');
  var bio04 = climateData.get('bio04');
  var bio05 = climateData.get('bio05');
  var bio06 = climateData.get('bio06');
  var bio07 = climateData.get('bio07');
  var bio08 = climateData.get('bio08');
  var bio09 = climateData.get('bio09');
  var bio10 = climateData.get('bio10');
  var bio11 = climateData.get('bio11');
  var bio12 = climateData.get('bio12');
  var bio13 = climateData.get('bio13');
  var bio14 = climateData.get('bio14');
  var bio15 = climateData.get('bio15');
  var bio16 = climateData.get('bio16');
  var bio17 = climateData.get('bio17');
  var bio18 = climateData.get('bio18');
  var bio19 = climateData.get('bio19');

  // 创建更新后的 Feature
  var updatedFeature = ee.Feature(point).set({
    site: feature.get('site'),  // 保持 'site' 属性
    lon: feature.get('lon'),
    lat: feature.get('lat'),
    elevation: elevation.get('elevation'),  // 添加高程数据
    slope: slopeValue.get('slope'),  // 添加坡度数据
    aspect: aspectValue.get('aspect'),  // 添加坡向数据
    bio01: bio01,  // 添加 bio01 的值
    bio02: bio02,  // 添加 bio02 的值
    bio03: bio03,  // 添加 bio03 的值
    bio04: bio04,  // 添加 bio04 的值
    bio05: bio05,  // 添加 bio05 的值
    bio06: bio06,  // 添加 bio06 的值
    bio07: bio07,  // 添加 bio07 的值
    bio08: bio08,  // 添加 bio08 的值
    bio09: bio09,  // 添加 bio09 的值
    bio10: bio10,  // 添加 bio10 的值
    bio11: bio11,  // 添加 bio11 的值
    bio12: bio12,  // 添加 bio12 的值
    bio13: bio13,  // 添加 bio13 的值
    bio14: bio14,  // 添加 bio14 的值
    bio15: bio15,  // 添加 bio15 的值
    bio16: bio16,  // 添加 bio16 的值
    bio17: bio17,  // 添加 bio17 的值
    bio18: bio18,  // 添加 bio18 的值
    bio19: bio19   // 添加 bio19 的值
  });

  return updatedFeature;
};

// 对每个点应用函数提取气候数据和地形数据
var results = pointsTable.map(extractClimateData);

// 打印结果，确保提取的数据包含所有的气候变量和地形信息
print('Extracted Climate Data and Elevation, Slope, Aspect:', results);
