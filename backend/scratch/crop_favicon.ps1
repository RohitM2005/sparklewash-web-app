# Copy favicon to backup
Copy-Item "c:\sparklefinal\frontend\public\favicon.png" "c:\sparklefinal\frontend\public\favicon_backup.png" -Force

Add-Type -AssemblyName System.Drawing

$sourcePath = "c:\sparklefinal\frontend\public\favicon_backup.png"
$outputPath = "c:\sparklefinal\frontend\public\favicon.png"

$bmp = New-Object System.Drawing.Bitmap($sourcePath)

$minX = $bmp.Width
$maxX = 0
$minY = $bmp.Height
$maxY = 0

# Scan pixels for non-transparent ones
for ($y = 0; $y -lt $bmp.Height; $y++) {
    for ($x = 0; $x -lt $bmp.Width; $x++) {
        $pixel = $bmp.GetPixel($x, $y)
        if ($pixel.A -gt 5) { # alpha is non-zero
            if ($x -lt $minX) { $minX = $x }
            if ($x -gt $maxX) { $maxX = $x }
            if ($y -lt $minY) { $minY = $y }
            if ($y -gt $maxY) { $maxY = $y }
        }
    }
}

$width = $maxX - $minX + 1
$height = $maxY - $minY + 1

# Calculate bounding square with small padding
$padding = 10
$size = [System.Math]::Max($width, $height) + ($padding * 2)

$centerX = $minX + ($width / 2)
$centerY = $minY + ($height / 2)

$newMinX = [System.Math]::Max(0, [System.Math]::Round($centerX - ($size / 2)))
$newMinY = [System.Math]::Max(0, [System.Math]::Round($centerY - ($size / 2)))

# Bounding box limits
if ($newMinX + $size -gt $bmp.Width) { $size = $bmp.Width - $newMinX }
if ($newMinY + $size -gt $bmp.Height) { $size = $bmp.Height - $newMinY }

$croppedBmp = New-Object System.Drawing.Bitmap($size, $size)
$g = [System.Drawing.Graphics]::FromImage($croppedBmp)
$g.InterpolationMode = [System.Drawing.Drawing2D.InterpolationMode]::HighQualityBicubic
$g.Clear([System.Drawing.Color]::Transparent)

$srcRect = New-Object System.Drawing.Rectangle($newMinX, $newMinY, $size, $size)
$destRect = New-Object System.Drawing.Rectangle(0, 0, $size, $size)

$g.DrawImage($bmp, $destRect, $srcRect, [System.Drawing.GraphicsUnit]::Pixel)

$bmp.Dispose()
$g.Dispose()

# Save the newly cropped PNG
$croppedBmp.Save($outputPath, [System.Drawing.Imaging.ImageFormat]::Png)
$croppedBmp.Dispose()

Write-Output "SUCCESS: Favicon tightly cropped and saved!"
