# ============================================================
#  seo-inject.ps1
#  Afegeix OG, Twitter Card, Schema.org Article, canonical i
#  hreflang a cada entrada de /entrades/*.html
#  Actualitza també el sitemap.xml amb les entrades que falten
# ============================================================

$repoRoot  = "C:\Users\Usuario\Documents\GitHub\webgourmets"
$jsonPath  = "$repoRoot\data\blog-posts.json"
$entrades  = "$repoRoot\entrades"
$sitemapPath = "$repoRoot\sitemap.xml"
$baseUrl   = "https://www.gourmetsdetarragona.com"

# Llegim el JSON
$posts = Get-Content $jsonPath -Raw | ConvertFrom-Json

$ok    = 0
$skip  = 0
$noMatch = 0

foreach ($file in Get-ChildItem $entrades -Filter "*.html") {
    $slug = [System.IO.Path]::GetFileNameWithoutExtension($file.Name)

    # Busquem el post al JSON
    $post = $posts | Where-Object { $_.slug -eq $slug } | Select-Object -First 1
    if (-not $post) {
        Write-Host "  [NO JSON] $slug" -ForegroundColor Yellow
        $noMatch++
        continue
    }

    $html = Get-Content $file.FullName -Raw -Encoding UTF8

    # Si ja té OG, saltem
    if ($html -match 'property="og:title"') {
        Write-Host "  [OK-JA]   $slug" -ForegroundColor DarkGray
        $skip++
        continue
    }

    # Dades del post
    $title_es  = $post.titol_es
    $title_ca  = $post.titol_ca
    $desc_es   = $post.resum_es
    $desc_ca   = $post.resum_ca
    $imgRel    = $post.img   # "assets/img/brumma/01_..."
    $imgAbs    = if ($imgRel) { "$baseUrl/$imgRel" } else { "$baseUrl/assets/img/og-default.jpg" }
    $postUrl   = "$baseUrl/entrades/$slug.html"
    $dateISO   = $post.data  # "2026-07-05"

    # Categoria per al Schema
    $cat = switch ($post.categoria) {
        "cronica"  { "Crónica gastronómica" }
        "previa"   { "Previa" }
        "cultura"  { "Cultura gastronómica" }
        "territori" { "Territori i producte" }
        "vi"       { "Vins i caves" }
        default    { "Gastronomia" }
    }

    $seoBlock = @"

<!-- ═══════ SEO: OG + Twitter + Schema ═══════ -->
<link rel="canonical" href="$postUrl">
<link rel="alternate" hreflang="es" href="$postUrl">
<link rel="alternate" hreflang="ca" href="$postUrl">
<link rel="alternate" hreflang="x-default" href="$postUrl">

<meta property="og:type"        content="article">
<meta property="og:url"         content="$postUrl">
<meta property="og:site_name"   content="Gourmets de Tarragona">
<meta property="og:title"       content="$title_es">
<meta property="og:description" content="$desc_es">
<meta property="og:image"       content="$imgAbs">
<meta property="og:image:width" content="1200">
<meta property="og:image:alt"   content="$title_es — Gourmets de Tarragona">
<meta property="og:locale"      content="es_ES">
<meta property="og:locale:alternate" content="ca_ES">
<meta property="article:published_time" content="${dateISO}T10:00:00+02:00">
<meta property="article:author" content="Gourmets de Tarragona">
<meta property="article:section" content="$cat">

<meta name="twitter:card"        content="summary_large_image">
<meta name="twitter:title"       content="$title_es">
<meta name="twitter:description" content="$desc_es">
<meta name="twitter:image"       content="$imgAbs">
<meta name="twitter:site"        content="@GourmetsdeTA">

<script type="application/ld+json">
{
  "@context": "https://schema.org",
  "@type": "Article",
  "headline": "$title_es",
  "description": "$desc_es",
  "image": "$imgAbs",
  "datePublished": "${dateISO}T10:00:00+02:00",
  "dateModified":  "${dateISO}T10:00:00+02:00",
  "author": {
    "@type": "Organization",
    "name": "Gourmets de Tarragona",
    "url": "$baseUrl"
  },
  "publisher": {
    "@type": "Organization",
    "name": "Gourmets de Tarragona",
    "logo": {
      "@type": "ImageObject",
      "url": "$baseUrl/assets/img/favicon-512.png"
    }
  },
  "mainEntityOfPage": {
    "@type": "WebPage",
    "@id": "$postUrl"
  },
  "inLanguage": ["es", "ca"],
  "articleSection": "$cat"
}
</script>
<!-- ═══════ /SEO ═══════ -->
"@

    # Inserim just abans de </head>
    $newHtml = $html -replace '(?i)</head>', "$seoBlock`n</head>"

    # Guardem amb UTF-8 sense BOM
    $utf8NoBom = New-Object System.Text.UTF8Encoding($false)
    [System.IO.File]::WriteAllText($file.FullName, $newHtml, $utf8NoBom)

    Write-Host "  [OK]      $slug" -ForegroundColor Green
    $ok++
}

Write-Host ""
Write-Host "Entrades actualitzades: $ok  |  Ja tenien SEO: $skip  |  Sense JSON: $noMatch" -ForegroundColor Cyan

# ============================================================
#  SITEMAP — afegim les entrades que no hi siguin
# ============================================================
Write-Host ""
Write-Host "Actualitzant sitemap.xml..." -ForegroundColor Cyan

$sitemap    = Get-Content $sitemapPath -Raw -Encoding UTF8
$today      = (Get-Date).ToString("yyyy-MM-dd")
$newEntries = ""

foreach ($post in $posts) {
    $slug    = $post.slug
    $postUrl = "$baseUrl/entrades/$slug.html"
    $dateISO = $post.data

    if ($sitemap -notmatch [regex]::Escape($postUrl)) {
        $pri = if ($post.categoria -eq "cronica") { "0.9" } elseif ($post.categoria -eq "previa") { "0.8" } else { "0.7" }
        $newEntries += @"

  <url>
    <loc>$postUrl</loc>
    <lastmod>$dateISO</lastmod>
    <changefreq>monthly</changefreq>
    <priority>$pri</priority>
    <xhtml:link rel="alternate" hreflang="es" href="$postUrl"/>
    <xhtml:link rel="alternate" hreflang="ca" href="$postUrl"/>
    <xhtml:link rel="alternate" hreflang="x-default" href="$postUrl"/>
  </url>
"@
        Write-Host "  [SITEMAP+] $slug" -ForegroundColor Green
    }
}

if ($newEntries -ne "") {
    $sitemap = $sitemap -replace '</urlset>', "$newEntries`n</urlset>"
    $utf8NoBom = New-Object System.Text.UTF8Encoding($false)
    [System.IO.File]::WriteAllText($sitemapPath, $sitemap, $utf8NoBom)
    Write-Host "  Sitemap actualitzat." -ForegroundColor Green
} else {
    Write-Host "  Sitemap ja estava al dia." -ForegroundColor DarkGray
}

Write-Host ""
Write-Host "Tot llest!" -ForegroundColor Cyan
