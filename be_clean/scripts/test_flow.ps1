# Register, login, list jobs, apply to first job, list my applications
try {
  Write-Output "Registering testuser..."
  $reg = @{ email = 'student@test.local'; password = 'studentpass'; name = 'Student' } | ConvertTo-Json
  $r = Invoke-RestMethod -Method POST -Uri 'http://localhost:8081/api/auth/register' -Body $reg -ContentType 'application/json'
  Write-Output "Register response: " ($r | ConvertTo-Json)
} catch {
  Write-Output "Register failed or user exists: $_"
}

# Login
try {
  Write-Output "Logging in..."
  $login = @{ email = 'student@test.local'; password = 'studentpass' } | ConvertTo-Json
  $res = Invoke-RestMethod -Method POST -Uri 'http://localhost:8081/api/auth/login' -Body $login -ContentType 'application/json'
  $token = $res.token
  Write-Output "Got token: $($token.Substring(0,20))..."
} catch {
  Write-Error "Login failed: $_"
  exit 1
}

# List jobs
try {
  Write-Output "Listing jobs..."
  $jobs = Invoke-RestMethod -Uri 'http://localhost:8081/api/jobs?page=1&pageSize=5' -Headers @{ Authorization = "Bearer $token" }
  $jobs | ConvertTo-Json -Depth 3 | Write-Output
} catch {
  Write-Error "List jobs failed: $_"
}

# Pick first job id
$jobId = $jobs.data[0].id
Write-Output "Applying to job id: $jobId"

# Apply
try {
  $applyBody = @{ jobId = $jobId; resumeUrl = 'https://example.com/resume.pdf' } | ConvertTo-Json
  $ap = Invoke-RestMethod -Method POST -Uri 'http://localhost:8081/api/applications' -Headers @{ Authorization = "Bearer $token" } -Body $applyBody -ContentType 'application/json'
  Write-Output "Apply result: " ($ap | ConvertTo-Json -Depth 3)
} catch {
  Write-Error "Apply failed: $_"
}

# List my applications
try {
  $my = Invoke-RestMethod -Uri 'http://localhost:8081/api/applications/my' -Headers @{ Authorization = "Bearer $token" }
  Write-Output "My applications: " ($my | ConvertTo-Json -Depth 4)
} catch {
  Write-Error "List my apps failed: $_"
}
