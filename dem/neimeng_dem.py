import json
import numpy as np
import rasterio
from rasterio.mask import mask
import geopandas as gpd
import cartopy.crs as ccrs
import matplotlib.pyplot as plt
from matplotlib.colors import LinearSegmentedColormap

# 从本地读取 JSON 文件
json_path = '内蒙古自治区.json'  # 替换为你的本地 GeoJSON 文件路径
with open(json_path, 'r', encoding='utf-8') as f:
    geojson_data = json.load(f)

# 将 GeoJSON 转换为 shapely 对象
features = geojson_data['features']
geometry = [feature['geometry'] for feature in features]

# 读取 TIFF 文件并使用 GeoJSON 裁剪
tif_path = 'tif/Neimeng_dem.tif'  # 你的高程数据文件
with rasterio.open(tif_path) as src:

    # 使用 GeoJSON 裁剪数据,使用filled false
    out_image, out_transform = mask(src, geometry, crop=True ,filled=False)

# 创建渐变色表
terrain_colors = [(0, 'blue'), (0.25, 'green'), (0.5, 'brown'), (1, 'white')]
terrain_cmap = LinearSegmentedColormap.from_list('terrain_custom', terrain_colors)

# 绘图
fig = plt.figure(figsize=(10, 8))
ax = plt.axes(projection=ccrs.PlateCarree())

# 计算仿射变换矩阵和坐标
bounds = [out_transform * (0, 0), out_transform * (out_image.shape[2], out_image.shape[1])]
extent = [bounds[0][0], bounds[1][0], bounds[1][1], bounds[0][1]]
import numpy.ma as ma  # 导入用于处理掩蔽数组的模块
print("是否存在 NaN 值:", np.isnan(ma.masked_invalid(out_image[0])).any())
# 绘制裁剪后的数据


img = ax.imshow(
    ma.masked_invalid(out_image[0]),  # 只绘制第一个波段
    cmap=terrain_cmap,
    extent=extent,  # 使用计算的范围
    transform=ccrs.PlateCarree(),
    interpolation='none'
)

# 填充白色背景
ax.set_facecolor('white')

# 绘制 GeoJSON 区域轮廓
gdf = gpd.GeoDataFrame.from_features(features)
gdf.boundary.plot(ax=ax, edgecolor='black', linewidth=1.5, transform=ccrs.PlateCarree())

# 添加颜色条
cbar = plt.colorbar(img, ax=ax, fraction=0.036, pad=0.04)
cbar.set_label('Elevation (m)')

# 设置标题并显示结果
plt.title('Clipped Elevation Data with Terrain-like Gradient')
plt.show()
