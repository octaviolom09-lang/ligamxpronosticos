# setup.ps1 — genera js/config.js a partir de la variable de entorno APIFOOTBALL_KEY
# Uso:
#   $env:APIFOOTBALL_KEY = "tu_api_key"
#   .\setup.ps1

$key = $env:APIFOOTBALL_KEY

if (-not $key) {
    Write-Error "La variable de entorno APIFOOTBALL_KEY no esta definida."
    Write-Host "Ejemplo: `$env:APIFOOTBALL_KEY = 'tu_api_key'; .\setup.ps1"
    exit 1
}

$template = Get-Content "$PSScriptRoot\js\config.template.js" -Raw
$output   = $template -replace "__APIFOOTBALL_KEY__", $key
$output | Set-Content "$PSScriptRoot\js\config.js" -NoNewline

Write-Host "config.js generado correctamente."
