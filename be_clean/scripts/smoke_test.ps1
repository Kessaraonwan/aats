param(
    [string]$BaseUrl = 'http://localhost:8081'
)

Write-Output "Smoke test: Checking $BaseUrl/health"
try {
    $h = Invoke-RestMethod -Method GET -Uri "$BaseUrl/health" -ErrorAction Stop
    Write-Output "Health: " ($h | ConvertTo-Json -Compress)
} catch {
    Write-Error "Health check failed: $_"
    exit 1
}

Write-Output "Listing jobs (first page)"
try {
    $jobs = Invoke-RestMethod -Method GET -Uri "$BaseUrl/api/jobs?page=1&pageSize=5" -ErrorAction Stop
    Write-Output "Jobs: " ($jobs | ConvertTo-Json -Depth 3)
} catch {
    Write-Error "Jobs listing failed: $_"
    exit 1
}

Write-Output "Smoke test passed"
