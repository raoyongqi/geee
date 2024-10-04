// 定义包含甘肃省的经纬度方框（ROI）
var roi = ee.Geometry.Polygon([
    [[89, 31], [89, 40], [105, 40], [105, 31]]
  ]);
  
  // 获取 Landsat 8 数据集，过滤云量小于100%且时间为2014年的影像
  var l8 = ee.ImageCollection('LANDSAT/LC08/C02/T1_TOA')
    .filterMetadata('CLOUD_COVER', 'less_than', 100) // 过滤云量
    .filterDate('2014-01-01', '2014-12-31') // 过滤时间范围
    .filterBounds(roi) // 过滤感兴趣区域
    .median(); // 取中位数合成
  
  // 选择红光波段（B4）和近红外波段（B5）
  var nir = l8.select('B5');
  var red = l8.select('B4');
  
  // 计算NDVI
  var ndvi = nir.subtract(red).divide(nir.add(red)).rename('NDVI');
  
  // 将NDVI结果添加到地图中
  Map.centerObject(roi, 6); // 将视角定位到感兴趣区域
  Map.addLayer(ndvi, {min: -1, max: 1, palette: ['blue', 'purple', 'red']}, 'NDVI');
  