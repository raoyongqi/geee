import rasterio
import matplotlib.pyplot as plt
import json
import numpy as np
from rasterio.mask import mask
import geopandas as gpd
import cartopy.crs as ccrs

# Load the GeoJSON data for Gansu province
json_path = '内蒙古自治区.json'  # Replace with your local GeoJSON file path
with open(json_path, 'r', encoding='utf-8') as f:
    geojson_data = json.load(f)

# Extract geometry from the GeoJSON features
features = geojson_data['features']
geometry = [feature['geometry'] for feature in features]

# Read the slope data
slope_file = 'aspect/neimeng_aspect.tif'  # Replace with your local slope data file path

with rasterio.open(slope_file) as src:
    # Mask the slope data with the geometry of Gansu province
    out_image, out_transform = mask(src, geometry, crop=True, filled=False)
    
    # Get the bounds and transform for the masked area
    bounds = src.bounds
    transform = src.transform

# Calculate the extent of the masked image
bounds = [out_transform * (0, 0), out_transform * (out_image.shape[2], out_image.shape[1])]
extent = [bounds[0][0], bounds[1][0], bounds[1][1], bounds[0][1]]

# Set up the plot using Cartopy for map projection
fig, ax = plt.subplots(figsize=(10, 10), subplot_kw={'projection': ccrs.PlateCarree()})
ax.set_title('Slope Map of Gansu Province')

# Display the slope data
img = ax.imshow(
    out_image[0],  # Only display the first band (slope)
    cmap='RdYlBu',
    extent=extent,  # Use the calculated extent
    transform=ccrs.PlateCarree(),
    interpolation='none'
)

# Add a colorbar to show the slope values
plt.colorbar(img, ax=ax, orientation='vertical', label='Slope (degrees)')

# Show the map
plt.show()
