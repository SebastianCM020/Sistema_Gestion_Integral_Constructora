Add-Type -AssemblyName 'WindowsBase'

function Get-DocxText($filePath) {
    try {
        $pkg = [System.IO.Packaging.Package]::Open($filePath, [System.IO.FileMode]::Open, [System.IO.FileAccess]::Read)
        $parts = $pkg.GetParts() | Where-Object { $_.ContentType -like '*document.main*' }
        $allText = ''
        foreach ($part in $parts) {
            $stream = $part.GetStream()
            $reader = New-Object System.IO.StreamReader($stream)
            $content = $reader.ReadToEnd()
            $reader.Close(); $stream.Close()
            $xml = [xml]$content
            $nodes = $xml.SelectNodes('//*[local-name()="t"]')
            $allText += ($nodes | ForEach-Object { $_.InnerText }) -join ' '
        }
        $pkg.Close()
        return $allText
    } catch {
        return "ERROR: $_"
    }
}

$base = "C:\Users\Hp\Desktop\Sistema_Gestion_Integral_Constructora"

Write-Host "=== PLAN DE PRUEBAS - PARTE 2 ===" -ForegroundColor Cyan
$t1 = Get-DocxText "$base\Plan_Pruebas_Verificacion_Validacion_Integracion_ICARO.docx"
Write-Host $t1.Substring([Math]::Min(6000, $t1.Length), [Math]::Min(8000, $t1.Length - [Math]::Min(6000, $t1.Length)))

Write-Host "`n=== INFORME EJECUCION - PARTE 2 ===" -ForegroundColor Cyan
$t2 = Get-DocxText "$base\Informe_Ejecucion_Plan_Pruebas_Verificacion_Validacion_Integracion_ICARO_v3.docx"
$start2 = [Math]::Min(6000, $t2.Length)
Write-Host $t2.Substring($start2, [Math]::Min(8000, $t2.Length - $start2))
