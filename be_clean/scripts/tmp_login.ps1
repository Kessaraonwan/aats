$body = @{ email = 'alice@example.com'; password = 'password123' } | ConvertTo-Json
$res = Invoke-RestMethod -Method POST -Uri 'http://localhost:8081/api/auth/login' -Body $body -ContentType 'application/json'
$res | ConvertTo-Json
Write-Output "---TOKEN---"
$res.token
