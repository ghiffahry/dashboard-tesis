# build.ps1: orkestrator build dashboard EDA (pengganti orkestrator Go).
# kenapa PowerShell bukan Go: pipeline jalan berurutan 6 skrip Python +
# hash SHA-256 + tulis JSON; tak butuh konkurensi/kompilasi, skrip 20-60 baris cukup (spesifikasi 4.3, prompting 8).
# kenapa berhenti di gagal pertama: cegah tahap lanjut baca artefak basi/korup (contoh Moran di atas join salah).
# kenapa alat/ tak disalin ke data/ atau aset/: binary/source alat hanya build-time, tak ikut deploy Pages.
# Interpreter dicari dari launcher py, PATH, lalu instalasi Python pengguna.
$ErrorActionPreference = "Stop"
Set-Location $PSScriptRoot

# Temukan Python yang memiliki pustaka untuk olah data spasial.
# DASHBOARD_PYTHON_EXE dapat dipakai bila pengguna ingin memilih interpreter tertentu.
$pythonLauncher = $null
$pythonExe = $env:DASHBOARD_PYTHON_EXE
$cekPustaka = "import geopandas, libpysal, esda, pandas, numpy"

if (-not [string]::IsNullOrWhiteSpace($pythonExe)) {
  if (-not (Test-Path -LiteralPath $pythonExe -PathType Leaf)) {
    throw "DASHBOARD_PYTHON_EXE tidak ditemukan: $pythonExe"
  }
  & $pythonExe -c $cekPustaka
  if ($LASTEXITCODE -ne 0) { throw "Python pada DASHBOARD_PYTHON_EXE belum memiliki pustaka dari requirements-build.txt." }
} else {
  $pyCommand = Get-Command py.exe -ErrorAction SilentlyContinue
  if ($pyCommand) {
    & $pyCommand.Source -3 -c $cekPustaka 2>$null
    if ($LASTEXITCODE -eq 0) { $pythonLauncher = $pyCommand.Source }
  }

  if (-not $pythonLauncher) {
    $candidates = @()
    $pythonCommand = Get-Command python.exe -ErrorAction SilentlyContinue
    if ($pythonCommand) { $candidates += $pythonCommand.Source }
    $pythonFolder = Join-Path $env:LOCALAPPDATA "Programs/Python"
    if (Test-Path -LiteralPath $pythonFolder) {
      $candidates += Get-ChildItem -LiteralPath $pythonFolder -Filter python.exe -File -Recurse -ErrorAction SilentlyContinue |
        Sort-Object FullName -Descending | ForEach-Object FullName
    }
    foreach ($candidate in $candidates) {
      & $candidate -c $cekPustaka 2>$null
      if ($LASTEXITCODE -eq 0) { $pythonExe = $candidate; break }
    }
  }
}
if (-not $pythonLauncher -and -not $pythonExe) {
  throw "Python dengan pandas, geopandas, libpysal, esda, dan numpy tidak ditemukan. Pasang requirements-build.txt atau atur DASHBOARD_PYTHON_EXE."
}

# Daftar tahap berurutan (nama logis + path skrip).
$tahapList = @(
  @{ Nama = "siapkan_data"; Skrip = "skrip/01_siapkan_data.py" },
  @{ Nama = "konversi_peta"; Skrip = "skrip/02_konversi_peta.py" },
  @{ Nama = "hitung_spasial"; Skrip = "skrip/03_hitung_spasial.py" },
  @{ Nama = "scatter_moran"; Skrip = "skrip/03b_hitung_scatter_moran.py" },
  @{ Nama = "ringkas_series"; Skrip = "skrip/04_ringkas_series.py" },
  @{ Nama = "optimalkan_geojson"; Skrip = "skrip/05_optimalkan_geojson.py" }
)

# Jalan berurutan; stderr skrip mengalir apa adanya (penuh) ke konsol.
foreach ($tahap in $tahapList) {
  $labelPython = if ($pythonLauncher) { "py -3" } else { $pythonExe }
  Write-Host (">> tahap: {0} ({1} {2})" -f $tahap.Nama, $labelPython, $tahap.Skrip)
  if ($pythonLauncher) { & $pythonLauncher -3 $tahap.Skrip } else { & $pythonExe $tahap.Skrip }
  $kode = $LASTEXITCODE
  if ($kode -ne 0) {
    # Pesan penyebut tahap wajib untuk CI (bagian 16 prompting): exit bukan 0 hentikan deploy.
    Write-Host ("tahap gagal: {0} ({1}), exit={2}. Lihat stderr penuh di atas." -f $tahap.Nama, $tahap.Skrip, $kode)
    exit $kode
  }
  Write-Host ("<< selesai: {0}" -f $tahap.Nama)
  if ($tahap.Nama -eq "konversi_peta") {
    # Gerbang join: mismatch berarti Moran pakai bobot salah; hentikan sebelum 03.
    $jalurJoin = Join-Path $PSScriptRoot "data/validasi-join.json"
    $hasilJoin = Get-Content $jalurJoin -Raw | ConvertFrom-Json
    if ($hasilJoin.hanya_di_tabel.Count -gt 0 -or $hasilJoin.hanya_di_spasial.Count -gt 0) {
      Write-Host ("join mismatch: hanya_di_tabel=[{0}] hanya_di_spasial=[{1}]" -f ($hasilJoin.hanya_di_tabel -join ", "), ($hasilJoin.hanya_di_spasial -join ", "))
      exit 1
    }
  }
}

# Versi: git describe bila repo tersedia, else dev-<stempel UTC>.
$versi = $null
try {
  $calon = (git -C $PSScriptRoot describe --tags --always 2>$null).Trim()
  if (-not [string]::IsNullOrWhiteSpace($calon)) { $versi = $calon }
  else { throw "git describe kosong" }
} catch {
  $stempelFallback = (Get-Date).ToUniversalTime().ToString("yyyyMMdd-HHmmss")
  $versi = "dev-$stempelFallback"
}
# Tanggal build UTC ISO8601 (akhiri Z).
$tanggalBuild = (Get-Date).ToUniversalTime().ToString("yyyy-MM-ddTHH:mm:ssZ")

# Hash tiap berkas di data/ dan aset/; kecualikan build-info.json (hindari referensi-diri).
$dirData = Join-Path $PSScriptRoot "data"
$dirAset = Join-Path $PSScriptRoot "aset"
$berkasList = Get-ChildItem -Path $dirData, $dirAset -File -Recurse |
  Where-Object { $_.Name -ne "build-info.json" } |
  Sort-Object FullName
$petaHash = @{}
foreach ($berkas in $berkasList) {
  # Kunci relatif ke folder pin, garis miring Unix agar stabil lintas OS.
  # kenapa Substring bukan GetRelativePath: kompatibel Windows PowerShell 5.1 + pwsh 7.
  $relatif = $berkas.FullName.Substring($PSScriptRoot.Length + 1).Replace("\", "/")
  $hash = (Get-FileHash -Path $berkas.FullName -Algorithm SHA256).Hash.ToLower()
  $petaHash[$relatif] = "sha256:$hash"
}
# Kunci terurut deterministik (insertion order = abjad).
$hashTerurut = [ordered]@{}
foreach ($kunci in ($petaHash.Keys | Sort-Object)) { $hashTerurut[$kunci] = $petaHash[$kunci] }
$infoBuild = [ordered]@{
  versi = $versi
  tanggal_build = $tanggalBuild
  hash_aset = $hashTerurut
}
$jsonKeluar = ($infoBuild | ConvertTo-Json -Depth 5) + "`n"
$jalurInfo = Join-Path $dirData "build-info.json"
# kenapa WriteAllText UTF8 tanpa BOM: kompatibel PS 5.1 + pwsh 7, byte deterministik.
$pengodean = New-Object System.Text.UTF8Encoding $false
[System.IO.File]::WriteAllText($jalurInfo, $jsonKeluar, $pengodean)
Write-Host ("build-info.json ditulis: versi={0} tanggal={1} aset={2}" -f $versi, $tanggalBuild, $berkasList.Count)
$labelPython = if ($pythonLauncher) { "py -3" } else { $pythonExe }
Write-Host ("Membangun artifact GitHub Pages dengan {0} build_site.py" -f $labelPython)
if ($pythonLauncher) { & $pythonLauncher -3 build_site.py } else { & $pythonExe build_site.py }
if ($LASTEXITCODE -ne 0) {
  Write-Host ("Build artifact gagal, exit={0}." -f $LASTEXITCODE)
  exit $LASTEXITCODE
}


