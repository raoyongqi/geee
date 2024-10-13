var pointsTable = ee.FeatureCollection('projects/fluid-cosmos-435610-a6/assets/climate_data');
// 获取 Landsat 8 数据集，过滤云量小于100%且时间为2014年的影像
var l8 = ee.ImageCollection('LANDSAT/LC08/C02/T1_TOA')
  .filterMetadata('CLOUD_COVER', 'less_than', 30) // 过滤云量
  .filterDate('2023-01-01', '2023-12-31') // 过滤时间范围
  .median(); // 取中位数合成

// 选择红光波段（B4）和近红外波段（B5）
var nir = l8.select('B5');
var red = l8.select('B4');

// 计算NDVI
var ndvi = nir.subtract(red).divide(nir.add(red)).rename('NDVI');
// 选择红光波段（B4）、近红外波段（B5）和蓝光波段（B2）


// 计算EVI2
var evi = nir.subtract(red)
    .divide(nir.add(red.multiply(2.4)).add(1))
    .multiply(2.5)
    .rename('EVI');
var extractVeg = function(feature) {
  // 提取经纬度，创建点几何
  var point = ee.Geometry.Point([feature.get('lon'), feature.get('lat')]);
  var my_ndvi = ndvi.sample(point, 30).first().get('NDVI');
  var my_evi = evi.sample(point, 30).first().get('EVI');

      var properties = {
    site: feature.get('site'),
    lon: feature.get('lon'),
    lat: feature.get('lat'),
        ndvi:my_ndvi,
        evi:my_evi,
      };
  // 创建更新后的 Feature 并返回
  return ee.Feature(point).set(properties);
};
var pointsWithVeg = pointsTable.map(extractVeg);

// 打印带有高程值的点数据
print('Points with veg ', pointsWithVeg);
