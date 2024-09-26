// 自定义边界：多边形覆盖四川省的一部分
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
     .filter(ee.Filter.lt('CLOUDY_PIXEL_PERCENTAGE', 10))  // 仅选择云量小于10%的图像
     .median();  // 对图像集合进行中值合成
  
  // 裁剪图像到自定义边界
  var sentinelClipped = sentinelCollection.clip(x);
  
  // 设置可视化参数
  var visParams = {
    bands: ['B4', 'B3', 'B2'],  // 使用红、绿、蓝波段进行显示（自然颜色）
    min: 0,
    max: 3000,
    gamma: 1.4
  };
  
  // 将图像添加到地图中
  Map.centerObject(x, 7);  // 将地图视角设为自定义边界
  Map.addLayer(sentinelClipped, visParams, 'Sentinel-2 L2A (Custom Region)');
  