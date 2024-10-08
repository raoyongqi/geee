# 获取bilibili 必刷

$response = Invoke-WebRequest -Uri 'https://api.bilibili.com/x/web-interface/popular/precious' -Method Get

# 将内容保存到本地文件中
$response.Content | Out-File -FilePath "C:\Users\r\Desktop\bilibili_response.json"
