$users = @(
  @{ email = 'alice@example.com'; password = 'password123' },
  @{ email = 'bob@company.com'; password = 'password123' }
)

foreach ($u in $users) {
  try {
    $body = $u | ConvertTo-Json
    $res = Invoke-RestMethod -Method POST -Uri 'http://localhost:8081/api/auth/login' -Body $body -ContentType 'application/json' -ErrorAction Stop
    Write-Output "SUCCESS: $($u.email) -> token: $($res.token.Substring(0,20))..."
  } catch {
    Write-Output "FAIL: $($u.email) -> $($_.Exception.Response.StatusCode.Value__  2>&1)"
  }
}
