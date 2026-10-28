<#
.SYNOPSIS
    Converte os vídeos das turmas para MP4 otimizado para a web.

.DESCRIPTION
    Para cada arquivo em assets/videos/originais, gera:
      - assets/videos/<nome>.mp4  H.264 + AAC, até 720p, com "faststart"
                                  (o vídeo começa a tocar antes de baixar inteiro)
      - assets/img/<nome>.jpg     capa 640x360 extraída do próprio vídeo

    Requer o FFmpeg instalado (winget install Gyan.FFmpeg).

.EXAMPLE
    .\scripts\otimizar-videos.ps1
    .\scripts\otimizar-videos.ps1 -Qualidade 26   # arquivos menores
#>
param(
    # CRF do H.264: menor = mais qualidade e arquivo maior (faixa útil: 20 a 28)
    [ValidateRange(18, 32)]
    [int]$Qualidade = 23,

    # Altura máxima do vídeo final
    [ValidateSet(480, 720, 1080)]
    [int]$Altura = 720
)

$ErrorActionPreference = 'Stop'

if (-not (Get-Command ffmpeg -ErrorAction SilentlyContinue)) {
    Write-Error 'FFmpeg não encontrado. Instale com: winget install Gyan.FFmpeg'
}

$raiz = Split-Path -Parent $PSScriptRoot
$origem = Join-Path $raiz 'assets\videos\originais'
$destinoVideos = Join-Path $raiz 'assets\videos'
$destinoCapas = Join-Path $raiz 'assets\img'

New-Item -ItemType Directory -Force $origem, $destinoCapas | Out-Null

$arquivos = Get-ChildItem $origem -File | Where-Object { $_.Extension -match '^\.(mp4|mov|m4v|mkv|avi|webm)$' }
if (-not $arquivos) {
    Write-Host "Coloque os vídeos originais em: $origem" -ForegroundColor Yellow
    exit 0
}

foreach ($arquivo in $arquivos) {
    $nome = $arquivo.BaseName
    $saida = Join-Path $destinoVideos "$nome.mp4"
    $capa = Join-Path $destinoCapas "$nome.jpg"

    Write-Host "→ $($arquivo.Name)" -ForegroundColor Cyan

    # -2 mantém a proporção com largura par; min() evita ampliar vídeos pequenos
    & ffmpeg -hide_banner -loglevel error -y -i $arquivo.FullName `
        -vf "scale=-2:'min($Altura,ih)'" `
        -c:v libx264 -preset slow -crf $Qualidade -profile:v high -pix_fmt yuv420p `
        -c:a aac -b:a 128k -ac 2 `
        -movflags +faststart `
        $saida
    if ($LASTEXITCODE -ne 0) { Write-Warning "Falha ao converter $($arquivo.Name)"; continue }

    & ffmpeg -hide_banner -loglevel error -y -ss 3 -i $saida -frames:v 1 `
        -vf 'scale=640:360:force_original_aspect_ratio=increase,crop=640:360' -q:v 4 `
        $capa

    $mb = [math]::Round((Get-Item $saida).Length / 1MB, 1)
    Write-Host "  ok: assets/videos/$nome.mp4 ($mb MB) + assets/img/$nome.jpg" -ForegroundColor Green
}

Write-Host "`nAgora preencha 'arquivoLocal' (e, se quiser, 'capa') em assets/js/config/videos.js." -ForegroundColor Yellow
