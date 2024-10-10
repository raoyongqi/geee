import json
import numpy as np
import rasterio
from rasterio.mask import mask
import geopandas as gpd
import cartopy.crs as ccrs
import matplotlib.pyplot as plt
from matplotlib.colors import LinearSegmentedColormap
import numpy.ma as ma  # 用于处理掩蔽数组

# 修正后的渐变色表，确保范围从 0 到 1
ndbi_colors = [(0, 'white'), (0.5, 'pink'), (1, 'red')]
colors = [(1, 0.647, 0), (1, 1, 0), (0, 1, 0)]  # 从橙色 -> 黄色 -> 绿色
n_bins = 100  # 定义渐变的平滑度
cmap_name = 'orange_yellow_green'
custom_cmap = LinearSegmentedColormap.from_list(cmap_name, colors, N=n_bins)

evi_cmap = LinearSegmentedColormap.from_list('ndbi_custom', ndbi_colors)


import matplotlib.pyplot as plt
from mpl_toolkits.axes_grid1.inset_locator import inset_axes
def plot_data(ax, out_image, out_transform, title, features, cmap, colorbar_label, vmin, vmax):
    # 使用提供的 out_transform 计算图像的原始经纬度范围
    bounds = [out_transform * (0, 0), out_transform * (out_image.shape[2], out_image.shape[1])]
    
    # 计算原始的经纬度范围
    lon_min, lon_max = bounds[0][0], bounds[1][0]
    lat_min, lat_max = bounds[1][1], bounds[0][1]
    
    # 手动增加经纬度的范围（例如增加5%）
    extra_lon = (lon_max - lon_min) * 0.05  # 增加5%的经度范围
    extra_lat = (lat_max - lat_min) * 0.05  # 增加5%的纬度范围

    # 使用 imshow 绘制 TIFF 数据，自动使用 out_transform 的坐标系统
    img = ax.imshow(
        np.ma.masked_invalid(out_image[0]),  # 只绘制第一个波段
        cmap=cmap,
        transform=ccrs.PlateCarree(),
        interpolation='none',
        vmin=vmin,  # 设置最小值
        vmax=vmax,   # 设置最大值
        extent=[lon_min, lon_max, lat_min, lat_max]  # 显示的经纬度范围
    )

    # 填充白色背景
    ax.set_facecolor('white')

    # 将 GeoJSON 数据转换为与 TIFF 相同的 CRS
    gdf = gpd.GeoDataFrame.from_features(features)

    # 绘制 GeoJSON 区域轮廓
    gdf.boundary.plot(ax=ax, edgecolor='black', linewidth=1.5, transform=ccrs.PlateCarree())

    # 设置地图的经纬度范围（扩展原始范围）
    ax.set_extent([lon_min - extra_lon, lon_max + extra_lon, lat_min - extra_lat, lat_max + extra_lat], 
                  crs=ccrs.PlateCarree())

    # 设置标题
    ax.set_title(title)

    # 创建颜色条
    cax = inset_axes(ax,
                     width="3%",  # 宽度
                     height="20%",  # 高度
                     loc='lower left',  # 颜色条位置
                     borderpad=4)  # 边框填充距离

    # 添加颜色条
    cbar = plt.colorbar(img, cax=cax, ticklocation='left')
    cbar.set_label(colorbar_label)
    cbar.set_ticks([-1, 1])  # 设置刻度位置为 -1 和 1
    cbar.set_ticklabels(['-1', '1'])  # 设置刻度标签为 -1 和 1
    cbar.ax.tick_params(width=0)  # 去掉刻度线
    cbar.set_label('')  # 删除颜色条的标题

json_path = '四川省.json'  # 替换为你的本地 GeoJSON 文件路径
import os
base_name = os.path.splitext(json_path)[0]

print(base_name)
with open(json_path, 'r', encoding='utf-8') as f:
    geojson_data = json.load(f)

# 将 GeoJSON 转换为 shapely 对象
features = geojson_data['features']
geometry = [feature['geometry'] for feature in features]

# 读取并裁剪第一个 TIFF 文件（Elevation 数据）
tif_path_elev = 'evi/EVI_sichuan_2023.tif'  # Elevation 文件路径
with rasterio.open(tif_path_elev) as src_elev:
    out_image_evi, out_transform_evi = mask(src_elev, geometry, crop=True, filled=False)

# 读取并裁剪第二个 TIFF 文件（NDVI 数据）
tif_path_ndvi = 'nvdi/NDVI_Sichuan_2023.tif'  # NDVI 文件路径
with rasterio.open(tif_path_ndvi) as src_ndvi:
    out_image_ndvi, out_transform_ndvi = mask(src_ndvi, geometry, crop=True, filled=False)

# 创建绘图
fig, axs = plt.subplots(1, 2, figsize=(16, 8), subplot_kw={'projection': ccrs.PlateCarree()})


# EVI: 白色到红色，范围 -1 到 1
plot_data(axs[0], out_image_evi, out_transform_evi, 'EVI', features, cmap=evi_cmap, colorbar_label='EVI', vmin=-1, vmax=1)

# NDVI: 橙色到绿色，范围 -1 到 1
plot_data(axs[1], out_image_ndvi, out_transform_ndvi, 'NDVI', features, cmap=custom_cmap, colorbar_label='NDVI', vmin=-1, vmax=1)
tit = os.path.splitext(json_path)[0]+'NDVI'+ 'EVI'
plt.savefig(f"data/{tit}.png")


# 显示图像
plt.tight_layout()
plt.show()
