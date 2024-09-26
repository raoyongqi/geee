// 自定义边界
var x = ee.Geometry.Polygon(
    [
      [[101.0, 29.5],   // 左下角
       [106.5, 29.5],   // 右下角
       [106.5, 33.0],   // 右上角
       [101.0, 33.0],   // 左上角
       [101.0, 29.5]]   // 回到左下角以闭合多边形
    ], 
    null, false
  );
  
  // 加载 Sentinel-2 L2A 图像集合，过滤时间和云量
  var sentinelCollection = ee.ImageCollection('COPERNICUS/S2_SR')
     .filterDate('2020-01-01', '2020-10-31')  // 选择时间段
     .filterBounds(x)  // 过滤自定义边界内的图像
     .filter(ee.Filter.lt('CLOUDY_PIXEL_PERCENTAGE', 10));  // 仅选择云量小于10%的图像
  
  // 获取影像的边界并去重
  var distinctGeometries = sentinelCollection.distinct(['system:footprint']);
  
  // 统计相同空间边界的图像数量
  var boundaryCount = distinctGeometries.size();
  
  // 打印结果
  print('相同空间边界的图像数量:', boundaryCount);
  
