# JIMA preview v0.4.0 - Windows PowerShell 5.1 / .NET Framework.
$ErrorActionPreference = 'Stop'
$bridge = $null
try {
    $projectRoot = [IO.Path]::GetFullPath((Join-Path $PSScriptRoot '..\..'))
    Write-Host 'JIMA 立繪預覽：正在啟動已登錄清單與滑鼠同步預覽…' -ForegroundColor Cyan
    $assemblyNames = @('System', 'System.Core', 'System.Web.Extensions', 'UIAutomationClient', 'UIAutomationTypes', 'WindowsBase', 'Accessibility')
    $references = foreach ($assemblyName in $assemblyNames) {
        $assembly = [Reflection.Assembly]::LoadWithPartialName($assemblyName)
        if ($null -eq $assembly) { throw "找不到 Windows 元件：$assemblyName" }
        $assembly.Location
    }
    Add-Type -Path (Join-Path $PSScriptRoot 'preview-sync.cs') -ReferencedAssemblies $references
    $bridge = New-Object -TypeName JimaStandingPreview.PreviewBridge -ArgumentList $projectRoot
    $bridge.Start()
    $previewUrl = $bridge.Url
    $programFiles86 = [Environment]::GetEnvironmentVariable('ProgramFiles(x86)')
    $candidates = @(
        "$programFiles86\Microsoft\Edge\Application\msedge.exe",
        "$env:ProgramFiles\Microsoft\Edge\Application\msedge.exe",
        "$env:LOCALAPPDATA\Microsoft\Edge\Application\msedge.exe",
        "$env:ProgramFiles\Google\Chrome\Application\chrome.exe",
        "$programFiles86\Google\Chrome\Application\chrome.exe",
        "$env:LOCALAPPDATA\Google\Chrome\Application\chrome.exe"
    )
    $browser = $candidates | Where-Object { Test-Path -LiteralPath $_ } | Select-Object -First 1
    if ($browser) { Start-Process -FilePath $browser -ArgumentList $previewUrl }
    else { Start-Process $previewUrl }
    Write-Host ''
    Write-Host '1. 在新開啟的預覽頁按「浮動置頂」。'
    Write-Host '2. 按「綁定 MZ（8 秒）」，切回 MZ 並打開已登錄立繪下拉選單。'
    Write-Host '3. 倒數結束時，把滑鼠留在選單的 ID 上；之後滑過其他 ID 即可測試。'
    Write-Host ''
    Write-Host '此視窗可以最小化；保持開啟才能跟隨滑鼠，並讀取已儲存的登錄清單。'
    Write-Host '結束同步：關閉此視窗，或按 Ctrl+C。'
    while ($true) { Start-Sleep -Seconds 1 }
}
catch {
    Write-Host ''
    Write-Host ('啟動失敗：' + $_.Exception.Message) -ForegroundColor Red
    Write-Host '請保留錯誤畫面回報。手動預覽可開啟 tools/JIMA_StandingPicturePreview/index.html。'
    [void](Read-Host '按 Enter 結束')
    exit 1
}
finally {
    if ($null -ne $bridge) { $bridge.Dispose() }
}
