Add-Type -AssemblyName System.Drawing
$sizes = @(16, 48, 128)
$iconsDir = Join-Path $PSScriptRoot "icons"
if (-not (Test-Path $iconsDir)) {
    New-Item -ItemType Directory -Path $iconsDir | Out-Null
}

foreach ($size in $sizes) {
    $bmp = New-Object System.Drawing.Bitmap($size, $size)
    $g = [System.Drawing.Graphics]::FromImage($bmp)
    $g.Clear([System.Drawing.Color]::Transparent)
    
    # Enable anti-aliasing
    $g.SmoothingMode = [System.Drawing.Drawing2D.SmoothingMode]::AntiAlias
    $g.TextRenderingHint = [System.Drawing.Text.TextRenderingHint]::AntiAlias
    
    # Draw a gradient or solid circular background
    # Let's use a nice modern Reddit orange/red color: #FF4500 (RGB: 255, 69, 0)
    $brush = New-Object System.Drawing.SolidBrush([System.Drawing.Color]::FromArgb(255, 255, 69, 0))
    $g.FillEllipse($brush, 0, 0, $size, $size)
    
    # Draw a white letter "R" inside the circle
    $fontFamily = New-Object System.Drawing.FontFamily("Arial")
    # FontSize should be relative to size
    $fontSize = [float]($size * 0.4)
    $font = New-Object System.Drawing.Font($fontFamily, $fontSize, [System.Drawing.FontStyle]::Bold)
    $textBrush = New-Object System.Drawing.SolidBrush([System.Drawing.Color]::White)
    
    $text = "R"
    $textSize = $g.MeasureString($text, $font)
    $x = ($size - $textSize.Width) / 2
    $y = ($size - $textSize.Height) / 2
    
    $g.DrawString($text, $font, $textBrush, $x, $y)
    
    $outputPath = Join-Path $iconsDir "icon-$size.png"
    $bmp.Save($outputPath, [System.Drawing.Imaging.ImageFormat]::Png)
    
    $g.Dispose()
    $bmp.Dispose()
    Write-Host "Generated $outputPath"
}
