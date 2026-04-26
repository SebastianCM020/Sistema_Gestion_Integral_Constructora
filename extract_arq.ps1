Add-Type -AssemblyName 'WindowsBase'

function Get-DocxFullText($filePath) {
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
            # Get paragraphs with line breaks
            $paras = $xml.SelectNodes('//*[local-name()="p"]')
            foreach ($p in $paras) {
                $runs = $p.SelectNodes('.//*[local-name()="t"]')
                $line = ($runs | ForEach-Object { $_.InnerText }) -join ''
                if ($line.Trim() -ne '') { $allText += $line + "`n" }
            }
        }
        $pkg.Close()
        return $allText
    } catch {
        return "ERROR: $_"
    }
}

$base = "C:\Users\Hp\Desktop\Sistema_Gestion_Integral_Constructora\docs"
$text = Get-DocxFullText "$base\Arquitectura V1.docx"
Write-Host $text
