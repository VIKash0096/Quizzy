param(
  [string]$Root = "c:\Users\pandi\OneDrive\Desktop\quiz-Generator--main\src",
  [switch]$WhatIf
)

Write-Host "Scanning files under: $Root"

# target files to update (JSX/JS/TS files)
$files = Get-ChildItem -Path $Root -Recurse -Include *.js,*.jsx,*.ts,*.tsx -File

foreach ($file in $files) {
  $text = Get-Content -Raw -Path $file.FullName

  # Match quoted relative import paths like './Foo', "../Bar", './dir/Foo' (not already with an extension)
  $pattern = "(['""])(\.\.?\/[^'""\)]+?)(['""])"

  $newText = [regex]::Replace($text, $pattern, {
    param($m)
    $quote = $m.Groups[1].Value
    $rel = $m.Groups[2].Value

    # skip if already has an extension
    if ($rel -match "\.[a-zA-Z0-9]+$") { return $m.Value }

    # Resolve candidate path relative to current file
    $parent = Split-Path -Parent $file.FullName
    $relPath = $rel -replace '/', '\'
    $candidate = Join-Path $parent ($relPath + '.jsx')

    if (Test-Path $candidate) {
      return "$quote$rel.jsx$quote"
    }

    # If the import targets a directory that contains index.jsx, update to ./dir/index.jsx
    $candidateDir = Join-Path $parent $relPath
    $candidateIndex = Join-Path $candidateDir 'index.jsx'
    if (Test-Path $candidateIndex) {
      # normalize forward slashes in import path
      $normalized = $rel.TrimEnd('/') + '/index.jsx'
      return "$quote$normalized$quote"
    }

    # otherwise leave unchanged
    return $m.Value
  })

  # Write file only if text changed
  if ($newText -ne $text) {
    if ($WhatIf) {
      Write-Host "Would update: $($file.FullName)"
    } else {
      Set-Content -Path $file.FullName -Value $newText -Encoding utf8
      Write-Host "Updated: $($file.FullName)"
    }
  }
}

Write-Host "Done."