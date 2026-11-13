param([string]$OutputPath = '.tmp/releases/the-world-in-a-suitcase-html5.zip')

$ErrorActionPreference = 'Stop'
Add-Type -AssemblyName System.IO.Compression
Add-Type -AssemblyName System.IO.Compression.FileSystem
$projectRoot = Split-Path $PSScriptRoot -Parent
$buildRoot = Join-Path $projectRoot 'dist'
if (!(Test-Path (Join-Path $buildRoot 'index.html'))) { throw 'Run npm run build first.' }
$output = [System.IO.Path]::GetFullPath((Join-Path $projectRoot $OutputPath))
if ($output.StartsWith($buildRoot + [System.IO.Path]::DirectorySeparatorChar)) { throw 'ZIP must be outside dist.' }
[System.IO.Directory]::CreateDirectory((Split-Path $output -Parent)) | Out-Null
# CreateNew avoids silently overwriting a previous release.
$stream = [System.IO.File]::Open($output, 'CreateNew', 'Write')
$archive = [System.IO.Compression.ZipArchive]::new($stream, 'Create')
try {
    foreach ($file in Get-ChildItem -LiteralPath $buildRoot -File -Recurse) {
        # ZIP paths are URLs: always use /, including when packaged on Windows.
        $entryName = $file.FullName.Substring($buildRoot.Length + 1).Replace('\', '/')
        [System.IO.Compression.ZipFileExtensions]::CreateEntryFromFile(
            $archive, $file.FullName, $entryName, 'Optimal') | Out-Null
    }
} finally {
    $archive.Dispose()
    $stream.Dispose()
}
$check = [System.IO.Compression.ZipFile]::OpenRead($output)
try {
    if (!$check.GetEntry('index.html')) { throw 'Missing root index.html.' }
    if (@($check.Entries | Where-Object { $_.FullName.Contains('\') }).Count) { throw 'Invalid ZIP paths.' }
    Write-Output "Validated $($check.Entries.Count) files: $output"
} finally { $check.Dispose() }
