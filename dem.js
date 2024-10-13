// 加载点数据集 (CSV 文件的路径已经替换为你的 CSV 资产路径)
var pointsTable = ee.FeatureCollection('projects/fluid-cosmos-435610-a6/assets/climate_data');



// 加载 SRTM 数字高程模型 (DEM) 数据集，并裁剪到甘肃省区域
var dem = ee.Image('USGS/SRTMGL1_003')

var aspect = ee.Terrain.aspect(dem);
 var slope = ee.Terrain.slope(dem);

// 定义函数：从点数据中提取经纬度并获取 DEM 高程值
var extractElevation = function(feature) {
  // 提取经纬度，创建点几何
  var point = ee.Geometry.Point([feature.get('lon'), feature.get('lat')]);
   var elevation = dem.sample(point, 30).first().get('elevation');
   var my_aspect = aspect.sample(point, 30).first().get('aspect');
      var my_slope = slope.sample(point, 30).first().get('slope');

      var properties = {
    site: feature.get('site'),
    lon: feature.get('lon'),
    lat: feature.get('lat'),
        elevation:elevation,
        aspect:my_aspect,
        slope:my_slope
      };
  // 从 DEM 中提取该点的高程值
 
  
  // 将高程值添加到原始 feature 中
  // 创建更新后的 Feature 并返回
  return ee.Feature(point).set(properties);
};

// 应用函数到 FeatureCollection，提取高程值
var pointsWithElevation = pointsTable.map(extractElevation);

// 打印带有高程值的点数据
print('Points with Elevation', pointsWithElevation);

