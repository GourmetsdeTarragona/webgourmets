# ============================================================
#  newsletter-cta-inject.ps1
#  Insereix el bloc CTA newsletter a totes les entrades
# ============================================================

$repoRoot  = "C:\Users\Usuario\Documents\GitHub\webgourmets"
$entrades  = "$repoRoot\entrades"
$ctaFile   = "$repoRoot\_cta-block.html"
$cssFile   = "$repoRoot\_cta-styles.css"

$ctaBlock  = Get-Content $ctaFile  -Raw -Encoding UTF8
$cssInline = "<style>`n" + (Get-Content $cssFile -Raw -Encoding UTF8) + "`n</style>"

$ok   = 0
$skip = 0

foreach ($file in Get-ChildItem $entrades -Filter "*.html") {
    $html = Get-Content $file.FullName -Raw -Encoding UTF8

    if ($html -match 'e-nl-cta') {
        Write-Host "  [JA]  $($file.Name)" -ForegroundColor DarkGray
        $skip++
        continue
    }

    # Afegim CSS just abans de </head>
    $html = $html -replace '(?i)</head>', "$cssInline`n</head>"

    # Inserim CTA just abans de la seccio "e-tambe" o de </main>
    if ($html -match 'class="e-tambe"') {
        $html = $html -replace '(?s)(<section[^>]+class="e-tambe")', "$ctaBlock`n`$1"
    } elseif ($html -match '</main>') {
        $html = $html -replace '(?i)(</main>)', "$ctaBlock`n`$1"
    } else {
        Write-Host "  [?]   $($file.Name) sense punt d'insercio" -ForegroundColor Yellow
        continue
    }

    $utf8NoBom = New-Object System.Text.UTF8Encoding($false)
    [System.IO.File]::WriteAllText($file.FullName, $html, $utf8NoBom)
    Write-Host "  [OK]  $($file.Name)" -ForegroundColor Green
    $ok++
}

Write-Host ""
Write-Host "Injectades: $ok  |  Ja tenien CTA: $skip" -ForegroundColor Cyan
