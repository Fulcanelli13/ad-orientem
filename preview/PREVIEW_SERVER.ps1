param([int]$Port = 8765)

$root = Split-Path -Parent $MyInvocation.MyCommand.Path
$listener = New-Object System.Net.HttpListener
$listener.Prefixes.Add("http://127.0.0.1:$Port/")
try {
    $listener.Start()
} catch {
    Write-Host "Could not start the preview server on port $Port." -ForegroundColor Red
    Write-Host $_.Exception.Message
    Read-Host "Press Enter to close"
    exit 1
}

Write-Host "Ad Orientem preview server" -ForegroundColor Green
Write-Host "Serving: $root"
Write-Host "URL: http://127.0.0.1:$Port/index.html"
Write-Host "Close this window when you finish testing."

$mime = @{
    ".html"="text/html; charset=utf-8"; ".js"="text/javascript; charset=utf-8";
    ".css"="text/css; charset=utf-8"; ".json"="application/json; charset=utf-8";
    ".png"="image/png"; ".jpg"="image/jpeg"; ".jpeg"="image/jpeg";
    ".svg"="image/svg+xml"; ".webmanifest"="application/manifest+json";
    ".ico"="image/x-icon"; ".txt"="text/plain; charset=utf-8"
}

while ($listener.IsListening) {
    try {
        $ctx = $listener.GetContext()
        $relative = [Uri]::UnescapeDataString($ctx.Request.Url.AbsolutePath.TrimStart('/'))
        if ([string]::IsNullOrWhiteSpace($relative)) { $relative = "index.html" }
        $candidate = [IO.Path]::GetFullPath((Join-Path $root $relative))
        if (-not $candidate.StartsWith([IO.Path]::GetFullPath($root), [StringComparison]::OrdinalIgnoreCase)) {
            $ctx.Response.StatusCode = 403
            $ctx.Response.Close()
            continue
        }
        if (-not (Test-Path -LiteralPath $candidate -PathType Leaf)) {
            $ctx.Response.StatusCode = 404
            $ctx.Response.Close()
            continue
        }
        $bytes = [IO.File]::ReadAllBytes($candidate)
        $ext = [IO.Path]::GetExtension($candidate).ToLowerInvariant()
        if ($mime.ContainsKey($ext)) { $ctx.Response.ContentType = $mime[$ext] }
        $ctx.Response.Headers["Cache-Control"] = "no-store"
        $ctx.Response.ContentLength64 = $bytes.Length
        $ctx.Response.OutputStream.Write($bytes,0,$bytes.Length)
        $ctx.Response.OutputStream.Close()
    } catch {
        try { $ctx.Response.StatusCode = 500; $ctx.Response.Close() } catch {}
    }
}
