# ============================================================
#  popup-inject.ps1
#  Insereix el popup de newsletter a totes les entrades
# ============================================================

$repoRoot   = "C:\Users\Usuario\Documents\GitHub\webgourmets"
$entrades   = "$repoRoot\entrades"
$popupHtml  = Get-Content "$repoRoot\_popup-block.html"  -Raw -Encoding UTF8
$popupCss   = "<style>`n" + (Get-Content "$repoRoot\_popup-styles.css" -Raw -Encoding UTF8) + "`n</style>"
$popupJs    = "<script>`n" + (Get-Content "$repoRoot\_popup-script.js"  -Raw -Encoding UTF8) + "`n</script>"

$ok   = 0
$skip = 0

foreach ($file in Get-ChildItem $entrades -Filter "*.html") {
    $html = Get-Content $file.FullName -Raw -Encoding UTF8

    if ($html -match 'nl-popup') {
        Write-Host "  [JA]  $($file.Name)" -ForegroundColor DarkGray
        $skip++
        continue
    }

    # CSS abans de </head>
    $html = $html -replace '(?i)(</head>)', "$popupCss`n`$1"

    # HTML del popup just abans de </body>
    $html = $html -replace '(?i)(</body>)', "$popupHtml`n`$1"

    # JS just abans de </body> (despres del popup HTML)
    $html = $html -replace '(?i)(</body>)', "$popupJs`n`$1"

    $utf8NoBom = New-Object System.Text.UTF8Encoding($false)
    [System.IO.File]::WriteAllText($file.FullName, $html, $utf8NoBom)
    Write-Host "  [OK]  $($file.Name)" -ForegroundColor Green
    $ok++
}

Write-Host ""
Write-Host "Injectades: $ok  |  Ja tenien popup: $skip" -ForegroundColor Cyan
