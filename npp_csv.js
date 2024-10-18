// 1. 读取上传的点数据 (CSV 文件已经被上传为 FeatureCollection)
var pointsTable = ee.FeatureCollection('projects/fluid-cosmos-435610-a6/assets/climate_data');

// 2. 加载 MODIS 数据集，选择需要的波段
var modisDataset = ee.ImageCollection("MODIS/061/MOD17A3HGF")
  .select(['Npp', 'Gpp', 'Npp_QC'])
  .filterDate('2023-01-01', '2023-12-31');  // 过滤年份为 2023 年

// 3. 计算 2023 年的平均值
var nppMean = modisDataset.select('Npp').mean();
var gppMean = modisDataset.select('Gpp').mean();
var NppQC = modisDataset.select('Npp_QC').mean();

// 4. 加载生物质碳密度数据集（如果是 ImageCollection）
var biomassDataset = ee.ImageCollection('NASA/ORNL/biomass_carbon_density/v1')
  .select(['bgb', 'agb']);  // 过滤年份为 2023 年;
  // var point1 = ee.Geometry.Point([pointsTable.first().get('lon'), pointsTable.first().get('lat')]);
var agbMean = biomassDataset.select('agb').mean()
var bgbMean = biomassDataset.select('bgb').mean()

  // var nppValue1 = biomassMean.sample(point1,500).first();
  // print(nppValue1.get('Npp'))
// 5. 使用 .sample() 提取每个点的所有波段值
var sampledData = pointsTable.map(function(feature) {
  var point = ee.Geometry.Point([feature.get('lon'), feature.get('lat')]);

  // 提取每个波段的值
  var nppValue = nppMean.sample(point, 500).first();
  var gppValue = gppMean.sample(point, 500).first();
  var NppQCValue = NppQC.sample(point, 500).first();

  // 提取生物质碳密度值
  var agbValue = agbMean.sample(point, 500).first(); // 取平均值
  var bgbValue = bgbMean.sample(point, 500).first(); // 取平均值

  // 使用 ee.Algorithms.If 处理可能为空的情况
  var nppVal = ee.Algorithms.If(nppValue, nppValue.get('Npp'), null);
  var gppVal = ee.Algorithms.If(gppValue, gppValue.get('Gpp'), null);
  var NppQCVal = ee.Algorithms.If(NppQCValue, NppQCValue.get('Npp_QC'), null);
  var bgbVal = ee.Algorithms.If(bgbValue, bgbValue.get('bgb'), null);
  var agbVal = ee.Algorithms.If(agbValue, agbValue.get('agb'), null);

  // 设置提取的属性
  var properties = {
    site: feature.get('site'),
    lon: feature.get('lon'),
    lat: feature.get('lat'),
    npp: nppVal,
    gpp: gppVal,
    npp_qc: NppQCVal,
    agb: agbVal,
    bgb: bgbVal// 添加生物质碳密度值
  };

  // 创建新属性，包括站点、经度、纬度和所有波段值
  return ee.Feature(point).set(properties);
});

// 6. 打印结果到控制台
print('Points with all MODIS bands and biomass data:', sampledData);
