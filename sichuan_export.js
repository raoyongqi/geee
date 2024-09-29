// 自定义边界
var x = ee.Geometry.Polygon(
  [
[
[97.5, 25.5],   // 左下角
[108.5, 25.5],  // 右下角
[108.5, 34.5],  // 右上角
[97.5, 34.5],   // 左上角
[97.5, 25.5]    // 回到左下角
]
  ], 
  null, false
);

// 加载 Sentinel-2 L2A 图像集合，过滤时间和云量
var sentinelCollection = ee.ImageCollection('COPERNICUS/S2_SR')
   .filterDate('2020-01-01', '2020-10-31')  // 选择时间段
   .filterBounds(x)  // 过滤自定义边界内的图像
   .filter(ee.Filter.lt('CLOUDY_PIXEL_PERCENTAGE', 10));  // 仅选择云量小于10%的图像

// 获取图像集合的大小
var collectionSize = sentinelCollection.size();

// 创建一个空对象用于存储唯一的 footprints
var uniqueFootprints = {};

// 第一个循环：提取并保存唯一的 footprints
sentinelCollection.evaluate(function(collection) {
  collection.features.forEach(function(feature) {
    var footprint = feature.properties['system:footprint'];

    // 使用字符串化的方式来检查唯一性
    var footprintString = JSON.stringify(footprint);
    
    // 如果 footprint 尚未保存，则添加到 uniqueFootprints 对象中
    if (!uniqueFootprints[footprintString]) {
      uniqueFootprints[footprintString] = footprint;
    }
  });

  // 第二个循环：统计每个 footprint 出现的次数
  var footprintCount = {};

  collection.features.forEach(function(feature) {
    var footprint = feature.properties['system:footprint'];

    // 使用字符串化的方式来检查唯一性
    var footprintString = JSON.stringify(footprint);

    // 如果 footprint 已经存在于对象中，计数加1；否则初始化为1
    if (footprintCount[footprintString]) {
      footprintCount[footprintString].count++;
    } else {
      footprintCount[footprintString] = {
        geometry: footprint,
        count: 1
      };
    }
  });

  // 验证：将所有 counts 加起来
  var totalFootprintCount = 0;
  Object.keys(footprintCount).forEach(function(key) {
    totalFootprintCount += footprintCount[key].count;
  });

  // 打印验证结果
  print('Total Footprint Count:', totalFootprintCount);
  collectionSize.getInfo(function(value) {
      // value 是转换后的数字
  print('Total Sentinel-2 Images:', value);
  if ( value === totalFootprintCount) {
    print('Validation Passed: Counts match.');
  } else {
    print('Validation Failed: Counts do not match.');
  }
  });
  // 检查是否相等
  var features = Object.keys(footprintCount).map(function(key) {
    var footprintData = footprintCount[key];
    return ee.Feature(ee.Geometry(footprintData.geometry), {count: footprintData.count});
});

// 创建 FeatureCollection
var footprintFeatureCollection = ee.FeatureCollection(features);

// 导出为 GeoJSON
Export.table.toDrive({
    collection: footprintFeatureCollection,
    description: 'SichuanNumer',
    fileFormat: 'GeoJSON'
});
});
