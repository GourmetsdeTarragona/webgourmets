# ============================================================
#  newsletter-cta-inject.ps1 v2
# ============================================================

$repoRoot  = "C:\Users\Usuario\Documents\GitHub\webgourmets"
$entrades  = "$repoRoot\entrades"
$ctaFile   = "$repoRoot\_cta-block.html"

$ctaBlock  = Get-Content $ctaFile -Raw -Encoding UTF8

$ok   = 0
$skip = 0

foreach ($file in Get-ChildItem $entrades -Filter "*.html") {
    $html = Get-Content $file.FullName -Raw -Encoding UTF8

    # Si ja te el HTML del CTA inserit, saltem
    if ($html -match '<!-- ═══════ CTA NEWSLETTER') {
        Write-Host "  [JA]  $($file.Name)" -ForegroundColor DarkGray
        $skip++
        continue
    }

    # Inserim CTA just abans de <div class="e-tambe"> o de </main>
    if ($html -match '<div class="e-tambe"') {
        $html = $html -replace '(<div class="e-tambe")', "$ctaBlock`n`$1"
    } elseif ($html -match '</main>') {
        $html = $html -replace '(</main>)', "$ctaBlock`n`$1"
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
