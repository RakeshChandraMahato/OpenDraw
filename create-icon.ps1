# PowerShell script to create a high-quality .ico file from PNG
Add-Type -AssemblyName System.Drawing

$sourcePng = "D:\Desktop\Websites\OpenDraw\tauri-app\public\android-chrome-512x512.png"
$outputIco = "D:\Desktop\Websites\OpenDraw\tauri-app\src-tauri\icons\icon.ico"

# Load the source image
$sourceImage = [System.Drawing.Image]::FromFile($sourcePng)

# Create icon with multiple sizes
$sizes = @(256, 128, 64, 48, 32, 16)
$icon = New-Object System.Drawing.Icon($sourcePng, 256, 256)

# Create a memory stream for the icon
$memoryStream = New-Object System.IO.MemoryStream

# Create bitmap for each size and save
$bitmaps = @()
foreach ($size in $sizes) {
    $bitmap = New-Object System.Drawing.Bitmap($size, $size)
    $graphics = [System.Drawing.Graphics]::FromImage($bitmap)
    $graphics.InterpolationMode = [System.Drawing.Drawing2D.InterpolationMode]::HighQualityBicubic
    $graphics.DrawImage($sourceImage, 0, 0, $size, $size)
    $graphics.Dispose()
    $bitmaps += $bitmap
}

# Save as .ico
$fileStream = [System.IO.File]::Create($outputIco)
$iconWriter = New-Object System.IO.BinaryWriter($fileStream)

# ICO header
$iconWriter.Write([uint16]0)  # Reserved
$iconWriter.Write([uint16]1)  # Type (1 = ICO)
$iconWriter.Write([uint16]$bitmaps.Count)  # Number of images

$offset = 6 + ($bitmaps.Count * 16)

foreach ($bitmap in $bitmaps) {
    $ms = New-Object System.IO.MemoryStream
    $bitmap.Save($ms, [System.Drawing.Imaging.ImageFormat]::Png)
    $imageData = $ms.ToArray()
    
    # ICONDIRENTRY
    $iconWriter.Write([byte]$bitmap.Width)
    $iconWriter.Write([byte]$bitmap.Height)
    $iconWriter.Write([byte]0)  # Color palette
    $iconWriter.Write([byte]0)  # Reserved
    $iconWriter.Write([uint16]1)  # Color planes
    $iconWriter.Write([uint16]32)  # Bits per pixel
    $iconWriter.Write([uint32]$imageData.Length)  # Size of image data
    $iconWriter.Write([uint32]$offset)  # Offset to image data
    
    $offset += $imageData.Length
    $ms.Dispose()
}

# Write image data
foreach ($bitmap in $bitmaps) {
    $ms = New-Object System.IO.MemoryStream
    $bitmap.Save($ms, [System.Drawing.Imaging.ImageFormat]::Png)
    $imageData = $ms.ToArray()
    $iconWriter.Write($imageData)
    $ms.Dispose()
    $bitmap.Dispose()
}

$iconWriter.Close()
$fileStream.Close()
$sourceImage.Dispose()

Write-Host "High-quality icon created successfully at: $outputIco"
$iconInfo = Get-Item $outputIco
Write-Host "Icon file size: $($iconInfo.Length) bytes"
