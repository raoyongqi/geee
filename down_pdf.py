import requests  # Import the requests library

# PDF file URL
url = "https://lpdaac.usgs.gov/documents/101/MCD12_User_Guide_V6.pdf"

# Save the file path
output_path = "MCD12_User_Guide_V6.pdf"

# Send HTTP request and download the file
response = requests.get(url)

# Check if the request was successful (HTTP status code 200)
if response.status_code == 200:
    # Save the file if request is successful
    with open(output_path, 'wb') as file:
        file.write(response.content)
    print(f"File successfully downloaded and saved as {output_path}")
else:
    print(f"Download failed with HTTP status code: {response.status_code}")
