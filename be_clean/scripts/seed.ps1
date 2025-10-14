param(
    [string]$DatabaseUrl
)

if ($DatabaseUrl) {
    Write-Host "Using DATABASE_URL=$DatabaseUrl"
    $env:DATABASE_URL = $DatabaseUrl
} else {
    Write-Host "No DATABASE_URL provided. Using environment or sqlite fallback."
}

Write-Host "Running Go seed script..."
go run scripts/seed_all.go
if ($LASTEXITCODE -ne 0) {
    Write-Error "Seed script failed with exit code $LASTEXITCODE"
    exit $LASTEXITCODE
}

Write-Host "Seed script completed."
