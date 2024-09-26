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
  
  // 创建一个空的对象用于存储唯一的 footprints
  var uniqueFootprints = {};
  
  // 提取图像的 footprint 并添加到对象
  sentinelCollection.evaluate(function(collection) {
    collection.features.forEach(function(feature) {
      var footprint = feature.properties['system:footprint'];
  
      // 使用字符串化的方式来检查唯一性
      var footprintString = JSON.stringify(footprint);
      
      // 添加到对象中以确保唯一性
      uniqueFootprints[footprintString] = footprint;
    });
  
    // 打印所有唯一的 footprints
    Object.keys(uniqueFootprints).forEach(function(key) {
      print('Unique Footprint:', ee.Geometry(uniqueFootprints[key]));
    });
  });
  