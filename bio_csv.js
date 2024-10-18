// 加载 CSV 文件 (假设你已经将 CSV 文件上传到你的资产)
var pointsTable = ee.FeatureCollection('projects/fluid-cosmos-435610-a6/assets/climate_data'); // 替换为你的路径

// 加载 WorldClim 数据
var dataset = ee.Image('WORLDCLIM/V1/BIO');
var srtm = ee.Image('USGS/SRTMGL1_003');
var terrain = ee.Terrain.products(srtm);  // 包括高程、坡度、坡向等
var tempDataset = ee.ImageCollection('WORLDCLIM/V1/MONTHLY');
// SoilGrids 250m 数据
var clay = ee.Image("projects/soilgrids-isric/clay_mean");         // Clay (%)
var sand = ee.Image("projects/soilgrids-isric/sand_mean");         // Sand (%)
var silt = ee.Image("projects/soilgrids-isric/silt_mean");         // Silt (%)
var bdod = ee.Image("projects/soilgrids-isric/bdod_mean");         // Bulk density (kg/dm³)
var cec = ee.Image("projects/soilgrids-isric/cec_mean");           // Cation Exchange Capacity (cmol(c)/kg)
var cfvo = ee.Image("projects/soilgrids-isric/cfvo_mean");         // Coarse fragments (% vol)
var nitrogen = ee.Image("projects/soilgrids-isric/nitrogen_mean"); // Total nitrogen (g/kg)
var phh2o = ee.Image("projects/soilgrids-isric/phh2o_mean");       // pH (water)
var soc = ee.Image("projects/soilgrids-isric/soc_mean");           // Soil Organic Carbon (g/kg)
var ocd = ee.Image("projects/soilgrids-isric/ocd_mean");           // Organic Carbon Density (kg/m³)
var ocs = ee.Image("projects/soilgrids-isric/ocs_mean");           // Organic Carbon Stocks (kg/m²)

// 选择0-5cm深度的土壤数据
var clay_0_5cm = clay.select('clay_0-5cm_mean');
var sand_0_5cm = sand.select('sand_0-5cm_mean');
var silt_0_5cm = silt.select('silt_0-5cm_mean');
var bdod_0_5cm = bdod.select('bdod_0-5cm_mean');
var cec_0_5cm = cec.select('cec_0-5cm_mean');
var cfvo_0_5cm = cfvo.select('cfvo_0-5cm_mean');
var nitrogen_0_5cm = nitrogen.select('nitrogen_0-5cm_mean');
var phh2o_0_5cm = phh2o.select('phh2o_0-5cm_mean');
var soc_0_5cm = soc.select('soc_0-5cm_mean');
var ocd_0_5cm = ocd.select('ocd_0-5cm_mean');
var ocs_0_5cm = ocs.select('ocs_0-30cm_mean');
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


// 定义提取气候和地形数据的函数
var extractClimateData = function(feature) {
  var point = ee.Geometry.Point([feature.get('lon'), feature.get('lat')]);
  
  // 创建存储站点信息的属性对象

  
  // 提取各个土壤属性的数据
  var clayValue = clay_0_5cm.sample(point, 250).first();
  var sandValue = sand_0_5cm.sample(point, 250).first();
  var siltValue = silt_0_5cm.sample(point, 250).first();
  var bdodValue = bdod_0_5cm.sample(point, 250).first();
  var cecValue = cec_0_5cm.sample(point, 250).first();
  var cfvoValue = cfvo_0_5cm.sample(point, 250).first();
  var nitrogenValue = nitrogen_0_5cm.sample(point, 250).first();
  var phh2oValue = phh2o_0_5cm.sample(point, 250).first();
  var socValue = soc_0_5cm.sample(point, 250).first();
  var ocdValue = ocd_0_5cm.sample(point, 250).first();
  var ocsValue = ocs_0_5cm.sample(point, 250).first();
  
  // 处理无效数据的情况
  var clayVal = ee.Algorithms.If(clayValue, clayValue.get('clay_0-5cm_mean'), null);
  var sandVal = ee.Algorithms.If(sandValue, sandValue.get('sand_0-5cm_mean'), null);
  var siltVal = ee.Algorithms.If(siltValue, siltValue.get('silt_0-5cm_mean'), null);
  var bdodVal = ee.Algorithms.If(bdodValue, bdodValue.get('bdod_0-5cm_mean'), null);
  var cecVal = ee.Algorithms.If(cecValue, cecValue.get('cec_0-5cm_mean'), null);
  var cfvoVal = ee.Algorithms.If(cfvoValue, cfvoValue.get('cfvo_0-5cm_mean'), null);
  var nitrogenVal = ee.Algorithms.If(nitrogenValue, nitrogenValue.get('nitrogen_0-5cm_mean'), null);
  var phh2oVal = ee.Algorithms.If(phh2oValue, phh2oValue.get('phh2o_0-5cm_mean'), null);
  var socVal = ee.Algorithms.If(socValue, socValue.get('soc_0-5cm_mean'), null);
  var ocdVal = ee.Algorithms.If(ocdValue, ocdValue.get('ocd_0-5cm_mean'), null);
  var ocsVal = ee.Algorithms.If(ocsValue, ocsValue.get('ocs_0-30cm_mean'), null);
  
  
    var my_ndvi = ndvi.sample(point, 30).first().get('NDVI');
  var my_evi = evi.sample(point, 30).first().get('EVI');

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
  // 提取气候数据
    var properties = {
    site: feature.get('site'),
    lon: feature.get('lon'),
    lat: feature.get('lat'),
        clay_0_5cm: clayVal,
    sand_0_5cm: sandVal,
    silt_0_5cm: siltVal,
    bdod_0_5cm: bdodVal,
    cec_0_5cm: cecVal,
    cfvo_0_5cm: cfvoVal,
    nitrogen_0_5cm: nitrogenVal,
    phh2o_0_5cm: phh2oVal,
    soc_0_5cm: socVal,
    ocd_0_5cm: ocdVal,
    ocs_0_5cm: ocsVal,
            ndvi:my_ndvi,
        evi:my_evi,
        npp: nppVal,
    gpp: gppVal,
    npp_qc: NppQCVal,
    agb: agbVal,
    bgb: bgbVal// 添加生物质碳密度值
  };
  var climateData = dataset.sample(point, 30).first();
  var bioBands = ['bio01', 'bio02', 'bio03', 'bio04', 'bio05', 'bio06', 'bio07', 'bio08', 'bio09', 'bio10', 
                  'bio11', 'bio12', 'bio13', 'bio14', 'bio15', 'bio16', 'bio17', 'bio18', 'bio19'];
  
  // 动态提取气候变量并添加到属性对象中
  bioBands.forEach(function(band) {
    properties[band] = climateData.get(band);
  });
  
  // 提取 SRTM 高程数据、坡度和坡向
  var terrainData = terrain.sample(point, 30).first();
  properties.elevation = terrainData.get('elevation');
  properties.slope = terrainData.get('slope');
  properties.aspect = terrainData.get('aspect');
    for (var month = 1; month <= 12; month++) {
    var monthStr = month < 10 ? '0' + month : '' + month;  // 将月份格式化为两位数
    
    // 筛选该月份的 WorldClim 数据
    var monthlyData = tempDataset.filter(ee.Filter.eq('system:index', monthStr)).first();
    
    // 使用 sample 方法从图像中提取样本数据
    var monthlyDatasample = monthlyData.sample(point, 30).first();  // 30 是采样分辨率（可以根据需要调整）
    
    // 提取气候数据
    var prec = monthlyDatasample.get('prec');  // 提取降水量
    var tavg = monthlyDatasample.get('tavg');  // 提取平均温度
    var tmin = monthlyDatasample.get('tmin');  // 提取最低温度
    var tmax = monthlyDatasample.get('tmax');  // 提取最高温度
    
    // 将气候数据添加到属性中
    properties['prec_' + monthStr] = prec;
    properties['tavg_' + monthStr] = tavg;
    properties['tmin_' + monthStr] = tmin;
    properties['tmax_' + monthStr] = tmax;
  }
  
  // 创建更新后的 Feature 并返回
  return ee.Feature(point).set(properties);
};

// 对每个点应用函数提取气候数据和地形数据
var results = pointsTable.map(extractClimateData);

// 打印结果，确保提取的数据包含所有的气候变量和地形信息
print('Extracted Climate Data and Elevation, Slope, Aspect:', results);

Export.table.toDrive({
  collection: results,
  description: 'results_Export',
  fileFormat: 'CSV',
  folder: 'csvExport',  // Folder in Google Drive

});