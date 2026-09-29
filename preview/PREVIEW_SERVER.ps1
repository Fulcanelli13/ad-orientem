param([int]$Port = 8765)

$previewDir = Split-Path -Parent $MyInvocation.MyCommand.Path
$root = [IO.Path]::GetFullPath((Split-Path -Parent $previewDir))
$listener = [System.Net.Sockets.TcpListener]::new([Net.IPAddress]::Loopback, $Port)

try {
    $listener.Start()
} catch {
    Write-Host "Could not start the Ad Orientem preview server on port $Port." -ForegroundColor Red
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

function Send-Response($stream, [int]$status, [string]$reason, [byte[]]$body, [string]$contentType) {
    if ($null -eq $body) { $body = [byte[]]@() }
    $nl = [Environment]::NewLine
    $headers = "HTTP/1.1 $status $reason" + $nl +
               "Content-Type: $contentType" + $nl +
               "Content-Length: $($body.Length)" + $nl +
               "Cache-Control: no-store" + $nl +
               "Connection: close" + $nl + $nl
    $head = [Text.Encoding]::ASCII.GetBytes($headers)
    $stream.Write($head, 0, $head.Length)
    if ($body.Length -gt 0) { $stream.Write($body, 0, $body.Length) }
    $stream.Flush()
}

try {
    while ($true) {
        $client = $listener.AcceptTcpClient()
        $reader = $null
        $stream = $null
        try {
            $stream = $client.GetStream()
            $reader = New-Object IO.StreamReader($stream, [Text.Encoding]::ASCII, $false, 4096, $true)
            $requestLine = $reader.ReadLine()

            if ([string]::IsNullOrWhiteSpace($requestLine)) {
                Send-Response $stream 400 "Bad Request" ([Text.Encoding]::UTF8.GetBytes("Bad Request")) "text/plain; charset=utf-8"
                continue
            }

            while ($true) {
                $line = $reader.ReadLine()
                if ([string]::IsNullOrEmpty($line)) { break }
            }

            $parts = $requestLine.Split(' ')
            if ($parts.Length -lt 2 -or $parts[0] -ne "GET") {
                Send-Response $stream 405 "Method Not Allowed" ([Text.Encoding]::UTF8.GetBytes("Method Not Allowed")) "text/plain; charset=utf-8"
                continue
            }

            $rawPath = ($parts[1] -split '\\?')[0]
            $relative = [Uri]::UnescapeDataString($rawPath.TrimStart('/'))
            if ([string]::IsNullOrWhiteSpace($relative)) { $relative = "index.html" }

            $candidate = [IO.Path]::GetFullPath((Join-Path $root $relative))
            if (-not $candidate.StartsWith($root, [StringComparison]::OrdinalIgnoreCase)) {
                Send-Response $stream 403 "Forbidden" ([Text.Encoding]::UTF8.GetBytes("Forbidden")) "text/plain; charset=utf-8"
                continue
            }

            if (-not (Test-Path -LiteralPath $candidate -PathType Leaf)) {
                Send-Response $stream 404 "Not Found" ([Text.Encoding]::UTF8.GetBytes("Not Found")) "text/plain; charset=utf-8"
                continue
            }

            $body = [IO.File]::ReadAllBytes($candidate)
            $ext = [IO.Path]::GetExtension($candidate).ToLowerInvariant()
            $contentType = if ($mime.ContainsKey($ext)) { $mime[$ext] } else { "application/octet-stream" }
            Send-Response $stream 200 "OK" $body $contentType
        }
        catch {
            try { Send-Response $stream 500 "Internal Server Error" ([Text.Encoding]::UTF8.GetBytes($_.Exception.Message)) "text/plain; charset=utf-8" } catch {}
        }
        finally {
            try { if ($reader) { $reader.Dispose() } } catch {}
            try { if ($stream) { $stream.Dispose() } } catch {}
            try { $client.Close() } catch {}
        }
    }
}
finally {
    $listener.Stop()
}
