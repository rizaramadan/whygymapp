# Perform login and extract the token
$response = Invoke-RestMethod -Uri "http://localhost:3000/auth/login" -Method Post -Body '{"username": "johnny", "password": "changeme"}' -Headers @{"Content-Type"="application/json"}
Write-Output "Login Response: $response"


# Extract the token
$token = $response.access_token

# Use the token in the next request
$adminResponse = Invoke-RestMethod -Uri "http://localhost:3000/auth/find-all-admin" -Headers @{"Authorization"="Bearer $token"}
Write-Output "Admin Response: $adminResponse"
