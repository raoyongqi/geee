import matplotlib.pyplot as plt
import numpy as np
from matplotlib.colors import LinearSegmentedColormap

# 定义自定义渐变色
colors = [(1, 0.647, 0), (1, 1, 0), (0, 1, 0)]  # 从橙色 -> 黄色 -> 绿色
n_bins = 100  # 定义渐变的平滑度
cmap_name = 'orange_yellow_green'
custom_cmap = LinearSegmentedColormap.from_list(cmap_name, colors, N=n_bins)

# 创建一个简单的 2D 数据
data = np.random.rand(10, 10)

# 使用自定义渐变色图
plt.imshow(data, cmap=custom_cmap)
plt.colorbar()
plt.show()
