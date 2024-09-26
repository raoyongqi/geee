var sichuanBoundary = ee.Geometry.Polygon([
    [[101.0, 29.5],   // 左下角
     [106.5, 29.5],   // 右下角
     [106.5, 33.0],   // 右上角
     [101.0, 33.0],   // 左上角
     [101.0, 29.5]]   // 回到左下角以闭合多边形
  ]);
Map.addLayer(sichuanBoundary, {color: 'red'}, 'Sichuan Boundary');
Map.centerObject(sichuanBoundary, 7);  // Adjust the zoom level as necessary
