# ============================================================
# reinstall-deps.ps1
# Sincroniza node_modules dentro de los contenedores Docker
# con el package.json del host.
#
# USO:
#   .\reinstall-deps.ps1              → instala en ambos contenedores
#   .\reinstall-deps.ps1 -Service frontend
#   .\reinstall-deps.ps1 -Service backend
#
# CUÁNDO USARLO:
#   Después de agregar una nueva dependencia al package.json
#   sin reconstruir la imagen Docker con --build.
# ============================================================

param(
  [ValidateSet('frontend', 'backend', 'both')]
  [string]$Service = 'both'
)

function Install-Deps {
  param([string]$ContainerName)
  Write-Host "`n[ICARO] Instalando dependencias en '$ContainerName'..." -ForegroundColor Cyan
  docker exec $ContainerName npm install
  if ($LASTEXITCODE -eq 0) {
    Write-Host "[ICARO] ✅ '$ContainerName' actualizado correctamente." -ForegroundColor Green
  } else {
    Write-Host "[ICARO] ❌ Error instalando en '$ContainerName'." -ForegroundColor Red
  }
}

if ($Service -eq 'frontend' -or $Service -eq 'both') {
  Install-Deps -ContainerName 'icaro_frontend'
}

if ($Service -eq 'backend' -or $Service -eq 'both') {
  Install-Deps -ContainerName 'icaro_backend'
}

Write-Host "`n[ICARO] Listo. Recarga el navegador para ver los cambios." -ForegroundColor Yellow
