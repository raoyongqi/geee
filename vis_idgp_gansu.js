// 定义感兴趣区域 (ROI)
var roi = ee.Geometry.Polygon([
    [[92, 32], [109, 32], [109, 43], [92, 43], [92, 32]]
  ]);
  
  // 加载 MODIS MCD12Q1 数据集 (2020年)
  var landCover = ee.Image('MODIS/006/MCD12Q1/2020_01_01');
  
  // 选择土地覆盖分类方案 (IGBP 分类)
  var landCoverClass = landCover.select('LC_Type1');
  
  // 裁剪土地覆盖图像到感兴趣区域
  var landCoverClip = landCoverClass.clip(roi);
  
  // 可视化参数设置
  var landCoverVis = {
    min: 0,
    max: 17,  // MODIS IGBP 分类包含 17 类
    palette: [
      'aec3d4', // 水体
      '66c2a5', // 林地
      'd1f4c6', // 草地
      'fdd0a2', // 旱地
      'ff6961', // 沙漠
      'c5b0d5', // 雪/冰
      'f2d0a1', // 灌木丛
      '92b2c7', // 人造区域
      'ffff99', // 农田
      'f8d5b8', // 混合森林
      'ffd966', // 温带森林
      '66ff66', // 热带森林
      'ffb3e6', // 红树林
      'ffcc00', // 草原
      'ff0000', // 城市
      '993333', // 沼泽
      '999999'  // 其他
    ]
  };
  
  // 将土地覆盖数据可视化到地图上
  Map.centerObject(roi, 6);  // 将视图中心设置为 ROI 区域并设置缩放级别
  Map.addLayer(landCoverClip, landCoverVis, 'Land Cover');
  
  // 为图层添加图例（标签）
  var legend = ui.Panel({
    style: {
      position: 'top-right',
      padding: '8px'
    }
  });
  
  var legendTitle = ui.Label('Land Cover Types');
  legend.add(legendTitle);
  
  // 创建图例条目
  var categories = [
    {name: 'Water', color: 'aec3d4'},
    {name: 'Forest', color: '66c2a5'},
    {name: 'Grassland', color: 'd1f4c6'},
    {name: 'Cropland', color: 'fdd0a2'},
    {name: 'Desert', color: 'ff6961'},
    {name: 'Snow/Ice', color: 'c5b0d5'},
    {name: 'Shrubland', color: 'f2d0a1'},
    {name: 'Urban', color: '92b2c7'},
    {name: 'Wetland', color: 'ffb3e6'},
    {name: 'Others', color: '999999'}
  ];
  
  // 为每个类别添加图例条目
  categories.forEach(function(item) {
    var colorBox = ui.Label({
      style: {
        backgroundColor: item.color,
        padding: '8px',
        margin: '2px'
      }
    });
  
    var description = ui.Label(item.name, {
      margin: '2px'
    });
  
    var entry = ui.Panel({
      widgets: [colorBox, description],
      layout: ui.Panel.Layout.Flow('horizontal')
    });
  
    legend.add(entry);
  });
  
  // 将图例添加到地图
  Map.add(legend);
  