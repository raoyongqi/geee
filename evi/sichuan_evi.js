// 定义包含甘肃省的经纬度方框（ROI）
var roi = ee.Geometry.Polygon([

    [
    [97.5, 25.5],   // 左下角
    [108.5, 25.5],  // 右下角
    [108.5, 34],  // 右上角
    [97.5, 34],   // 左上角
    [97.5, 25.5]    // 回到左下角
   ]
   
   ]);
   
   // 获取 Landsat 8 数据集，过滤云量小于30%且时间为2023年的影像
   var l8 = ee.ImageCollection('LANDSAT/LC08/C02/T1_TOA')
     .filterMetadata('CLOUD_COVER', 'less_than', 30) // 过滤云量
     .filterDate('2023-01-01', '2023-12-31') // 过滤时间范围
     .filterBounds(roi) // 过滤感兴趣区域
     .median(); // 取中位数合成
   
   // 选择红光波段（B4）、近红外波段（B5）和蓝光波段（B2）
   // 选择红光波段（B4）和近红外波段（B5）
   var nir = l8.select('B5');
   var red = l8.select('B4');
   
   // 计算EVI2
   var evi = nir.subtract(red)
       .divide(nir.add(red.multiply(2.4)).add(1))
       .multiply(2.5)
       .rename('EVI');
   // 打印EVI的结果，检查值是否在 -1 到 1 之间
   // print('EVI:', evi);
   // 将EVI结果添加到地图中
   Map.centerObject(roi, 6); // 将视角定位到感兴趣区域
   Map.addLayer(evi, {min: -1, max: 1,  palette: ['blue', 'purple', 'red']}, 'EVI');
   Export.image.toDrive({
     image: evi,
     description: 'EVI_sichuan_2023',
     scale: 300,  // 设置影像分辨率
     region: roi,  // 导出区域为甘肃省的经纬度范围
     fileFormat: 'GeoTIFF',  // 导出的文件格式
     folder: 'GEE_EVI_Exports'  // 存储到Google Drive中的文件夹
   });