const REPOSITORY='EMN90909/Noqeri'
const safeRef=value=>/^[0-9A-Za-z._/-]+$/.test(value)&&!value.includes('..')&&!value.startsWith('/')

export function sourceArchiveUrl(ref='main'){
  if(!safeRef(ref))throw new Error('invalid Noqeri source ref')
  return `https://github.com/${REPOSITORY}/archive/refs/heads/${ref}.tar.gz`
}

export function shellInstaller(origin,ref='main'){
  sourceArchiveUrl(ref)
  return `#!/usr/bin/env sh
set -eu
REF="\${NOQERI_REF:-${ref}}"
DEST="\${NOQERI_HOME:-\$HOME/.noqeri/src}"
TMP="\${TMPDIR:-/tmp}/noqeri-source-$$"
ARCHIVE="$TMP/noqeri.tar.gz"
mkdir -p "$TMP" "$DEST"
cleanup(){ rm -rf "$TMP"; }
trap cleanup EXIT INT TERM
URL="https://github.com/${REPOSITORY}/archive/refs/heads/$REF.tar.gz"
if command -v curl >/dev/null 2>&1; then curl -fL --retry 3 "$URL" -o "$ARCHIVE"
elif command -v wget >/dev/null 2>&1; then wget -O "$ARCHIVE" "$URL"
else echo "Noqeri source installer needs curl or wget" >&2; exit 2
fi
rm -rf "$DEST/.incoming"; mkdir -p "$DEST/.incoming"
tar -xzf "$ARCHIVE" -C "$DEST/.incoming" --strip-components=1
rm -rf "$DEST/current"; mv "$DEST/.incoming" "$DEST/current"
printf '%s\\n' "Noqeri source installed at $DEST/current"
printf '%s\\n' "Build with the stage-0/stage-1 instructions in $DEST/current/Doc/SELF_HOSTING.md"
`
}

export function powershellInstaller(origin,ref='main'){
  sourceArchiveUrl(ref)
  return `$ErrorActionPreference = 'Stop'
$Ref = if ($env:NOQERI_REF) { $env:NOQERI_REF } else { '${ref}' }
$Root = if ($env:NOQERI_HOME) { $env:NOQERI_HOME } else { Join-Path $HOME '.noqeri\\src' }
$Current = Join-Path $Root 'current'
$Temp = Join-Path ([System.IO.Path]::GetTempPath()) ('noqeri-source-' + [guid]::NewGuid())
$Archive = Join-Path $Temp 'noqeri.zip'
New-Item -ItemType Directory -Force -Path $Temp,$Root | Out-Null
try {
  $Url = "https://github.com/${REPOSITORY}/archive/refs/heads/$Ref.zip"
  Invoke-WebRequest -UseBasicParsing -Uri $Url -OutFile $Archive
  $Expanded = Join-Path $Temp 'expanded'
  Expand-Archive -Path $Archive -DestinationPath $Expanded -Force
  $Source = Get-ChildItem -Path $Expanded -Directory | Select-Object -First 1
  if (Test-Path $Current) { Remove-Item -Recurse -Force $Current }
  Move-Item $Source.FullName $Current
  Write-Host "Noqeri source installed at $Current"
  Write-Host "Build using Doc/SELF_HOSTING.md"
} finally { Remove-Item -Recurse -Force $Temp -ErrorAction SilentlyContinue }
`
}

export function sourceInfo(origin,ref='main'){
  return {repository:REPOSITORY,ref,archive:sourceArchiveUrl(ref),install:{posix:`${origin}/get/noqeri`,powershell:`${origin}/get/noqeri.ps1`}}
}
