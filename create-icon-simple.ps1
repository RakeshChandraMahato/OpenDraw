# Simple PowerShell script to create .ico from PNG
Add-Type -AssemblyName System.Drawing

$sourcePng = "D:\Desktop\Websites\OpenDraw\tauri-app\public\android-chrome-512x512.png"
$outputIco = "D:\Desktop\Websites\OpenDraw\tauri-app\src-tauri\icons\icon.ico"

# Load source image
$img = [System.Drawing.Image]::FromFile($sourcePng)

# Create sizes
$sizes = @(256, 128, 64, 48, 32, 16)
$ms = New-Object System.IO.MemoryStream

# Create icon stream
$iconStream = New-Object System.IO.FileStream($outputIco, [System.IO.FileMode]::Create)
$writer = New-Object System.IO.BinaryWriter($iconStream)

# Write ICO header
$writer.Write([UInt16]0)  # Reserved
$writer.Write([UInt16]1)  # Type: ICO
$writer.Write([UInt16]$sizes.Count)  # Number of images

$images = @()
$offset = 6 + (16 * $sizes.Count)

# Prepare all images
foreach ($size in $sizes) {
    $bmp = New-Object System.Drawing.Bitmap($size, $size)
    $g = [System.Drawing.Graphics]::FromImage($bmp)
    $g.InterpolationMode = [System.Drawing.Drawing2D.InterpolationMode]::HighQualityBicubic
    $g.SmoothingMode = [System.Drawing.Drawing2D.SmoothingMode]::HighQuality
    $g.PixelOffsetMode = [System.Drawing.Drawing2D.PixelOffsetMode]::HighQuality
    $g.DrawImage($img, 0, 0, $size, $size)
    $g.Dispose()
    
    $imgMs = New-Object System.IO.MemoryStream
    $bmp.Save($imgMs, [System.Drawing.Imaging.ImageFormat]::Png)
    $imgBytes = $imgMs.ToArray()
    
    $images += @{
        Width = $size
        Height = $size
        Data = $imgBytes
        Size = $imgBytes.Length
    }
    
    $imgMs.Dispose()
    $bmp.Dispose()
}

# Write directory entries
foreach ($image in $images) {
    $width = if ($image.Width -eq 256) { 0 } else { $image.Width }
    $height = if ($image.Height -eq 256) { 0 } else { $image.Height }
    
    $writer.Write([Byte]$width)
    $writer.Write([Byte]$height)
    $writer.Write([Byte]0)  # Color count
    $writer.Write([Byte]0)  # Reserved
    $writer.Write([UInt16]1)  # Color planes
    $writer.Write([UInt16]32)  # Bits per pixel
    $writer.Write([UInt32]$image.Size)  # Image size
    $writer.Write([UInt32]$offset)  # Offset
    
    $offset += $image.Size
}

# Write image data
foreach ($image in $images) {
    $writer.Write($image.Data)
}

$writer.Close()
$iconStream.Close()
$img.Dispose()

$fileInfo = Get-Item $outputIco
Write-Host "Icon created: $outputIco"
Write-Host "File size: $($fileInfo.Length) bytes"
