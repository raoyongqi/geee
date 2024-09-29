import geopandas as gpd
import matplotlib.pyplot as plt
import cartopy.crs as ccrs

# 读取 footprint GeoJSON 文件
footprint_data = gpd.read_file('SichuanNumer.geojson')

# 读取四川省的 GeoJSON 文件
sichuan_boundary = gpd.read_file('四川省.json')

# 创建一个新的图形
fig, ax = plt.subplots(figsize=(10, 10), subplot_kw={'projection': ccrs.PlateCarree()})

# 添加海岸线
ax.coastlines()

footprint_data['count'] = footprint_data['count'].astype(float)  # 确保 count 是 float 类型
footprint_data.plot(ax=ax, column='count', cmap='viridis', legend=True, 
                    edgecolor='black', alpha=0.1, linewidth=0.5, 
                    facecolor='blue')  # 填充颜色为蓝色

sichuan_boundary.plot(ax=ax, color='none', edgecolor='red', linewidth=2)

# 添加图例和标题
plt.title('Footprint Count and Sichuan Province Boundary')

# 设置经纬度范围（可选）
# ax.set_extent([min_longitude, max_longitude, min_latitude, max_latitude])  # 根据需要调整范围

# 显示图形
plt.show()
