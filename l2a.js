// Define the Sichuan boundary
var sichuanBoundary = ee.Geometry.Polygon([
    [[101.0, 29.5],   // Left bottom
     [106.5, 29.5],   // Right bottom
     [106.5, 33.0],   // Right top
     [101.0, 33.0],   // Left top
     [101.0, 29.5]]   // Close the polygon
  ]);
  
  
  // Define the time range for Sentinel-2 imagery
  var startDate = '2023-01-01';
  var endDate = '2023-12-31';
  
  // Filter the Sentinel-2 L2A ImageCollection for the specified date range and region
  var sentinel2Collection = ee.ImageCollection('COPERNICUS/S2')
    .filterDate(startDate, endDate)
    .filterBounds(sichuanBoundary)
    .filter(ee.Filter.lt('CLOUDY_PIXEL_PERCENTAGE', 20)); // Adjust the cloud cover percentage as needed
  
  // Select the first image from the collection
  var sentinel2Image = sentinel2Collection.first();
  
  // Add the Sentinel-2 image to the map
  Map.addLayer(sentinel2Image, {bands: ['B4', 'B3', 'B2'], max: 3000}, 'Sentinel-2 L2A RGB');
  