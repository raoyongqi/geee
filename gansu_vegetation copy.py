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

import rasterio
import geopandas as gpd
import numpy as np
import matplotlib.pyplot as plt
import cartopy.crs as ccrs
from mpl_toolkits.axes_grid1.inset_locator import inset_axes
import geopandas as gpd
import numpy as np
import matplotlib.pyplot as plt
import cartopy.crs as ccrs
from mpl_toolkits.axes_grid1.inset_locator import inset_axes

def plot_data(ax, out_image, out_transform, title, features, cmap, colorbar_label, vmin, vmax, padding=0.05):
    # 直接使用提供的 out_transform（无需使用 rasterio 读取文件）
    bounds = [out_transform * (0, 0), out_transform * (out_image.shape[2], out_image.shape[1])]
    extent = [bounds[0][0], bounds[1][0], bounds[1][1], bounds[0][1]]

    # 将GeoJSON数据转换为与tif相同的CRS
    gdf = gpd.GeoDataFrame.from_features(features)

    # 增加额外的空白区域（例如在左右、上下各加padding的比例）
    lon_padding = (bounds[1][0] - bounds[0][0]) * padding
    lat_padding = (bounds[0][1] - bounds[1][1]) * padding
    extent = [extent[0] - lon_padding, extent[1] + lon_padding, extent[2] - lat_padding, extent[3] + lat_padding]

    # 绘制数据，并设置颜色范围 vmin 和 vmax
    img = ax.imshow(
        np.ma.masked_invalid(out_image[0]),  # 只绘制第一个波段
        cmap=cmap,
        extent=extent,
        transform=ccrs.PlateCarree(),
        interpolation='none',
        vmin=vmin,  # 设置最小值
        vmax=vmax   # 设置最大值
    )

    # 填充白色背景
    ax.set_facecolor('white')

    # 绘制 GeoJSON 区域轮廓
    gdf.boundary.plot(ax=ax, edgecolor='black', linewidth=1.5, transform=ccrs.PlateCarree())

    # 设置标题
    ax.set_title(title)

    # 在图像内部创建 inset_axes 用于颜色条
    cax = inset_axes(ax,
                     width="5%",  # 宽度
                     height="50%",  # 高度
                     loc='lower left',  # 颜色条位置
                     borderpad=4)  # 边框填充距离

    # 添加颜色条
    cbar = plt.colorbar(img, cax=cax, ticklocation='left')
    cbar.set_label(colorbar_label)
    cbar.set_ticks([-1, 1])  # 设置刻度位置为 -1 和 1
    cbar.set_ticklabels(['-1', '1'])  # 设置刻度标签为 -1 和 1
    # 设置颜色条的样式
    cbar.ax.tick_params(width=0)  # 去掉刻度线
# 使用示例
# 需要提供 out_image、out_transform、features、cmap 等信
json_path = '内蒙古自治区.json'  # 替换为你的本地 GeoJSON 文件路径
with open(json_path, 'r', encoding='utf-8') as f:
    geojson_data = json.load(f)

# 将 GeoJSON 转换为 shapely 对象
features = geojson_data['features']
geometry = [feature['geometry'] for feature in features]

# 读取并裁剪第一个 TIFF 文件（Elevation 数据）
import rasterio
from rasterio.mask import mask
from rasterio.warp import reproject, Resampling
import geopandas as gpd
from shapely.geometry import mapping
import numpy as np

# 读取并裁剪第一个 TIFF 文件（EVI 数据）
tif_path_elev = 'evi/EVI_gansu_2023.tif'  # Elevation 文件路径
with rasterio.open(tif_path_elev) as src_elev:
    # 使用 mask 函数对数据进行裁剪
    out_image_evi, out_transform_evi = mask(src_elev, geometry, crop=True, filled=False)
    
    # 获取原始 CRS 和元数据
    src_crs = src_elev.crs
    print("Original CRS:", src_crs)  # 打印原始 CRS，应该是 EPSG:3857
    
    # 进行 CRS 转换：从 EPSG:3857 转换为 EPSG:4326
    if src_crs != 'EPSG:4326':
        # 输出数据的形状
        height, width = out_image_evi.shape[1], out_image_evi.shape[2]
        
        # 创建一个目标仿射变换和新的 CRS
        new_transform, new_width, new_height = rasterio.warp.calculate_default_transform(
            src_crs, 'EPSG:4326', width, height, *src_elev.bounds)
        
        # 创建输出数组
        out_image_evi_reprojected = np.empty((out_image_evi.shape[0], new_height, new_width), dtype=np.float32)
        
        # 进行重投影
        reproject(
            out_image_evi,
            out_image_evi_reprojected,
            src_transform=out_transform_evi,
            src_crs=src_crs,
            dst_transform=new_transform,
            dst_crs='EPSG:4326',
            resampling=Resampling.nearest)
        
        # 更新 transform 和 shape
        out_transform_evi = new_transform
        out_image_evi = out_image_evi_reprojected

# 读取并裁剪第二个 TIFF 文件（NDVI 数据）
tif_path_ndvi = 'nvdi/NDVI_neimeng_2023.tif'  # NDVI 文件路径
with rasterio.open(tif_path_ndvi) as src_ndvi:
    out_image_ndvi, out_transform_ndvi = mask(src_ndvi, geometry, crop=True, filled=False)
    
    # 获取原始 CRS 和元数据
    src_crs = src_ndvi.crs
    print("Original CRS:", src_crs)  # 打印原始 CRS，应该是 EPSG:3857
    
    # 进行 CRS 转换：从 EPSG:3857 转换为 EPSG:4326
    if src_crs != 'EPSG:4326':
        # 输出数据的形状
        height, width = out_image_ndvi.shape[1], out_image_ndvi.shape[2]
        
        # 创建一个目标仿射变换和新的 CRS
        new_transform, new_width, new_height = rasterio.warp.calculate_default_transform(
            src_crs, 'EPSG:4326', width, height, *src_ndvi.bounds)
        
        # 创建输出数组
        out_image_ndvi_reprojected = np.empty((out_image_ndvi.shape[0], new_height, new_width), dtype=np.float32)
        
        # 进行重投影
        reproject(
            out_image_ndvi,
            out_image_ndvi_reprojected,
            src_transform=out_transform_ndvi,
            src_crs=src_crs,
            dst_transform=new_transform,
            dst_crs='EPSG:4326',
            resampling=Resampling.nearest)
        
        # 更新 transform 和 shape
        out_transform_ndvi = new_transform
        out_image_ndvi = out_image_ndvi_reprojected
# 创建绘图
fig, axs = plt.subplots(1, 2, figsize=(16, 8), subplot_kw={'projection': ccrs.PlateCarree()})


# EVI: 白色到红色，范围 -1 到 1
plot_data(axs[0], out_image_evi, out_transform_evi, 'EVI', features, cmap=evi_cmap, colorbar_label='EVI', vmin=-1, vmax=1)

# NDVI: 橙色到绿色，范围 -1 到 1
plot_data(axs[1], out_image_ndvi, out_transform_ndvi, 'NDVI', features, cmap=custom_cmap, colorbar_label='NDVI', vmin=-1, vmax=1)


# 显示图像
plt.tight_layout()
plt.show()
