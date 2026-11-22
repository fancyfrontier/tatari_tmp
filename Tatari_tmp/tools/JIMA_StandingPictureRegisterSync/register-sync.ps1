param([string]$ProjectRoot = "", [switch]$NoDialog)

# JIMA Standing Picture bulk registration and plugin rename v1.6.0; Windows PowerShell 5.1+.
# No persistent backup is created. Existing event references are never edited.
Set-StrictMode -Version 2.0
$ErrorActionPreference = "Stop"

function Get-JimaProperty($Object, [string]$Name) {
    if ($null -eq $Object) { return $null }
    $property = $Object.PSObject.Properties[$Name]
    if ($null -eq $property) { return $null }
    return ,$property.Value
}

function Read-JimaText([string]$Path) {
    $bytes = [IO.File]::ReadAllBytes($Path)
    $utf8 = [Text.UTF8Encoding]::new($false, $true)
    return [pscustomobject]@{ Path = $Path; Bytes = $bytes; Text = $utf8.GetString($bytes) }
}

function Get-JimaConfig([string]$Text) {
    $match = [regex]::Match($Text, '\b(?:var|let|const)\s+\$plugins\s*=\s*(\[[\s\S]*\])\s*;?\s*$')
    if (!$match.Success) { throw "js/plugins.js 格式無法辨識，未修改清單。" }
    $json = $match.Groups[1]
    # Group before collecting: Windows PowerShell 5.1 emits a JSON array as one pipeline object.
    $plugins = @((ConvertFrom-Json -InputObject $json.Value))
    $entries = @($plugins | Where-Object { (Get-JimaProperty $_ 'name') -cin @('Jima_StandingPicture', 'LL_StandingPicture') })
    if ($entries.Count -eq 0) { throw "js/plugins.js 中找不到 Jima_StandingPicture 或舊 LL_StandingPicture 設定。請確認執行的是正確專案根目錄的 CMD，並已在 MZ 加入插件後儲存。" }
    if ($entries.Count -gt 1) { throw "js/plugins.js 中有 $($entries.Count) 筆新舊立繪插件設定。請先只保留一筆，避免同時啟用兩個版本。" }
    $parameters = Get-JimaProperty $entries[0] 'parameters'
    if ($parameters -isnot [pscustomobject]) { throw "Jima_StandingPicture 的 parameters 格式錯誤。" }
    return [pscustomobject]@{ Plugins = [object[]]$plugins; Parameters = $parameters; Entry = $entries[0];
        Start = $json.Index; Length = $json.Length }
}

function Get-JimaRows($Parameters) {
    $value = Get-JimaProperty $Parameters 'sPictures'
    if ($null -eq $value -or $value -ceq '') { return ,([object[]]@()) }
    if ($value -is [string]) {
        if ($value.TrimStart()[0] -ne '[') { throw "立繪個別樣式必須是清單。" }
        $value = @((ConvertFrom-Json -InputObject $value))
    }
    if ($value -isnot [array]) { throw "立繪個別樣式格式錯誤，未修改清單。" }
    return ,([object[]]$value)
}

function Get-JimaImageId($Value) {
    if ($null -eq $Value -or $Value -ceq '') { return '' }
    if ($Value -isnot [string]) { throw "立繪圖片名稱必須是文字。" }
    $name = $Value
    if ($name.StartsWith('jima-image:')) {
        $name = $name.Substring(11)
        if ($name -match '%(?![0-9A-Fa-f]{2})') { throw "立繪圖片名稱的編碼錯誤。" }
        $name = [Uri]::UnescapeDataString($name)
    }
    $name = $name.Replace('\', '/')
    if ($name.StartsWith('img/pictures/')) { $name = $name.Substring(13) }
    if ($name -match '[\x00-\x1f\x7f:]' -or $name.StartsWith('/')) { throw "立繪圖片路徑無效：$Value" }
    $parts = $name.Split('/')
    foreach ($part in $parts) {
        if ($part -ceq '' -or $part -ceq '.' -or $part -ceq '..') { throw "立繪圖片路徑無效：$Value" }
    }
    # MZ stores an extensionless stem; do not remove another .png from this field.
    return $parts[$parts.Length - 1]
}

function Get-JimaDefaults([string]$Source) {
    $match = [regex]::Match($Source, '/\*~struct~sPictures:\r?\n([\s\S]*?)\*/')
    if (!$match.Success) { throw "找不到立繪預設參數，請先覆蓋本包 v1.4.0 插件。" }
    $defaults = [ordered]@{}
    $field = $null
    foreach ($line in ($match.Groups[1].Value -split '\r?\n')) {
        if ($line -match '^\s*\*\s+@param\s+(\w+)\s*$') {
            $field = $Matches[1]; $defaults[$field] = ''
        } elseif ($null -ne $field -and $line -match '^\s*\*\s+@default(?:[ \t](.*))?$') {
            $defaults[$field] = if ($null -eq $Matches[1]) { '' } else { $Matches[1] }
        }
    }
    if (!$defaults.Contains('imageName') -or !$defaults.Contains('useGlobalScale') -or
        $defaults['useGlobalScale'] -cne 'true') { throw "請先覆蓋本包 v1.4.0 插件後再執行。" }
    return $defaults
}

function Get-JimaInventory([string]$Root) {
    $directory = Join-Path $Root 'img/pictures/jima_tool'
    if (!(Test-Path -LiteralPath $directory -PathType Container)) { throw "找不到圖片目錄：$directory；未修改登錄清單。" }
    $files = @(Get-ChildItem -LiteralPath $directory -File -Force | Where-Object { $_.Extension -ieq '.png' } | Sort-Object Name)
    if ($files.Count -eq 0) { throw "img/pictures/jima_tool 沒有 PNG 圖片；已停止，不會刪除既有登錄清單。" }
    $names = [Collections.Generic.List[string]]::new()
    $signature = [Collections.Generic.List[string]]::new()
    foreach ($file in $files) {
        $id = $file.BaseName
        if ($id -ceq '' -or (Get-JimaImageId $id) -cne $id) { throw "圖片檔名無效：$($file.Name)" }
        $names.Add($id)
        $signature.Add(($file.Name + '|' + $file.Length + '|' + $file.LastWriteTimeUtc.Ticks))
    }
    return [pscustomobject]@{ Names = $names.ToArray(); Signature = ($signature.ToArray() -join "`n") }
}

function New-JimaPlan([object[]]$RawRows, [string[]]$FileNames, $Defaults) {
    $available = [Collections.Generic.HashSet[string]]::new([StringComparer]::Ordinal)
    foreach ($id in $FileNames) {
        if (!$available.Add($id)) { throw "圖片檔名重複：$id；未修改清單。" }
    }
    $seen = [Collections.Generic.HashSet[string]]::new([StringComparer]::Ordinal)
    $rows = [Collections.Generic.List[object]]::new()
    $ids = [Collections.Generic.List[string]]::new()
    $added = [Collections.Generic.List[string]]::new()
    $removed = [Collections.Generic.List[string]]::new()
    $kept = 0; $changed = $false
    foreach ($raw in $RawRows) {
        if ($null -eq $raw -or $raw -ceq '') { $changed = $true; continue }
        $row = $raw
        if ($row -is [string]) { $row = ConvertFrom-Json -InputObject $row }
        if ($null -eq $row -or $row -isnot [pscustomobject]) { throw "立繪個別樣式包含無效項目，未修改清單。" }
        $id = Get-JimaImageId (Get-JimaProperty $row 'imageName')
        if ($id -ceq '') { $changed = $true; continue }
        if (!$seen.Add($id)) { throw "立繪檔名重複登錄：$id；請先在 MZ 保留一筆。" }
        if ($available.Contains($id)) {
            # Keep the complete original string/object, including unknown fields.
            $rows.Add($raw); $ids.Add($id); $kept++
        } else {
            $removed.Add($id); $changed = $true
        }
    }
    foreach ($id in $FileNames) {
        if ($seen.Contains($id)) { continue }
        $row = [ordered]@{}
        foreach ($key in $Defaults.Keys) { $row[$key] = $Defaults[$key] }
        $row['imageName'] = 'jima_tool/' + $id
        $rows.Add((ConvertTo-Json -InputObject $row -Depth 100 -Compress))
        $ids.Add($id); $added.Add($id); $changed = $true
    }
    return [pscustomobject]@{ Rows = $rows.ToArray(); Ids = $ids.ToArray(); Added = $added.ToArray();
        Removed = $removed.ToArray(); Kept = $kept; Changed = $changed }
}

function Update-JimaOptions([string]$Source, [string[]]$Ids) {
    $pattern = '(?m)^ \* @jimaPictureOptionsBegin\r?\n[\s\S]*?^ \* @jimaPictureOptionsEnd(?=\r?$)'
    $optionBlocks = [regex]::Matches($Source, $pattern).Count
    if ($optionBlocks -ne 2 -and $optionBlocks -ne 4) { throw "插件下拉選項標記不完整，未修改任何檔案。" }
    $newline = if ($Source.Contains("`r`n")) { "`r`n" } else { "`n" }
    $lines = [Collections.Generic.List[string]]::new()
    $lines.Add(' * @jimaPictureOptionsBegin')
    $lines.Add(' * @option （維持此位置目前圖片；首次請選立繪）')
    $lines.Add(' * @value jima-keep-current')
    foreach ($id in $Ids) {
        $encoded = [Uri]::EscapeDataString($id)
        foreach ($entry in @(@('%21', '!'), @('%27', "'"), @('%28', '('), @('%29', ')'), @('%2A', '*'))) {
            $encoded = $encoded.Replace($entry[0], $entry[1])
        }
        $lines.Add(' * @option ' + $id.Replace('*/', '*／'))
        $lines.Add(' * @value jima-id:' + $encoded)
    }
    $lines.Add(' * @jimaPictureOptionsEnd')
    $replacement = $lines.ToArray() -join $newline
    $callback = { param($match) return $replacement }.GetNewClosure()
    return [regex]::Replace($Source, $pattern, [Text.RegularExpressions.MatchEvaluator]$callback)
}

function Test-JimaBytes([byte[]]$Left, [byte[]]$Right) {
    if ($Left.Length -ne $Right.Length) { return $false }
    for ($i = 0; $i -lt $Left.Length; $i++) { if ($Left[$i] -ne $Right[$i]) { return $false } }
    return $true
}

function New-JimaTemporaryFile([string]$Path, [byte[]]$Bytes) {
    $temporary = $Path + '.jima-register-' + [Guid]::NewGuid().ToString('N') + '.tmp'
    try {
        $stream = [IO.File]::Open($temporary, [IO.FileMode]::CreateNew, [IO.FileAccess]::Write, [IO.FileShare]::None)
        try { $stream.Write($Bytes, 0, $Bytes.Length); $stream.Flush($true) } finally { $stream.Dispose() }
        return $temporary
    } catch { if ([IO.File]::Exists($temporary)) { [IO.File]::Delete($temporary) }; throw }
}

function Invoke-JimaCommit([object[]]$Items, [scriptblock]$Guard, [scriptblock]$ReplaceAction = {
    param($Temporary, $Destination) [IO.File]::Replace($Temporary, $Destination, [NullString]::Value)
}) {
    $staged = [Collections.Generic.List[object]]::new()
    $committed = [Collections.Generic.List[object]]::new()
    try {
        foreach ($item in $Items) {
            $staged.Add([pscustomobject]@{ Item = $item; Temporary = (New-JimaTemporaryFile $item.Path $item.After) })
        }
        & $Guard
        foreach ($stage in $staged) {
            $item = $stage.Item
            if (!(Test-JimaBytes ([IO.File]::ReadAllBytes($item.Path)) $item.Before)) {
                throw "檔案於同步期間被其他程式修改，已停止：$($item.Path)"
            }
            & $ReplaceAction $stage.Temporary $item.Path
            $committed.Add($item)
        }
    } catch {
        $originalError = $_
        $rollbackErrors = [Collections.Generic.List[string]]::new()
        for ($i = $committed.Count - 1; $i -ge 0; $i--) {
            $item = $committed[$i]
            try {
                if (!(Test-JimaBytes ([IO.File]::ReadAllBytes($item.Path)) $item.After)) {
                    throw "檔案已被外部修改，未覆蓋該外部修改：$($item.Path)"
                }
                $temporary = New-JimaTemporaryFile $item.Path $item.Before
                try { [IO.File]::Replace($temporary, $item.Path, [NullString]::Value) }
                finally { if ([IO.File]::Exists($temporary)) { [IO.File]::Delete($temporary) } }
            } catch { $rollbackErrors.Add($_.Exception.Message) }
        }
        if ($rollbackErrors.Count -gt 0) { throw ($originalError.Exception.Message + "`n回復未完成：" + ($rollbackErrors -join "`n")) }
        throw $originalError
    } finally {
        foreach ($stage in $staged) { if ([IO.File]::Exists($stage.Temporary)) { [IO.File]::Delete($stage.Temporary) } }
    }
}

function Get-JimaEventFiles([string]$Root) {
    $directory = Join-Path $Root 'data'
    if (!(Test-Path -LiteralPath $directory -PathType Container)) { return ,([object[]]@()) }
    return ,([object[]]@(Get-ChildItem -LiteralPath $directory -File -Force | Where-Object {
        $_.Name -match '^(Map\d+|CommonEvents|Troops)\.json$'
    } | Sort-Object Name))
}

function Get-JimaCommandCount($Node, [string]$Name) {
    $count = 0
    if ($Node -is [array]) {
        foreach ($item in $Node) { $count += Get-JimaCommandCount $item $Name }
    } elseif ($Node -is [pscustomobject]) {
        $code = Get-JimaProperty $Node 'code'
        $arguments = Get-JimaProperty $Node 'parameters'
        if ($code -eq 357 -and $arguments -is [array] -and $arguments.Count -ge 1 -and $arguments[0] -ceq $Name) { $count++ }
        foreach ($property in $Node.PSObject.Properties) { $count += Get-JimaCommandCount $property.Value $Name }
    }
    return $count
}

function Get-JimaEventRenamePlan([string]$Root) {
    $files = Get-JimaEventFiles $Root
    $documents = [Collections.Generic.List[object]]::new()
    $items = [Collections.Generic.List[object]]::new()
    $count = 0
    # MZ writes code/indent/parameters in this order. Validate parsed command
    # counts before/after replacing only this one JSON string value, so every
    # unrelated byte (text, IDs, scripts, whitespace and number formatting) stays.
    $pattern = '(\{\s*"code"\s*:\s*357\s*,\s*(?:"indent"\s*:\s*\d+\s*,\s*)?"parameters"\s*:\s*\[\s*)"LL_StandingPicture"(?=\s*[,\]])'
    foreach ($file in $files) {
        $document = Read-JimaText $file.FullName
        $documents.Add($document)
        $json = ConvertFrom-Json -InputObject $document.Text.TrimStart([char]0xFEFF)
        $beforeCount = Get-JimaCommandCount $json 'LL_StandingPicture'
        if ($beforeCount -eq 0) { continue }
        $existing = Get-JimaCommandCount $json 'Jima_StandingPicture'
        $matches = [regex]::Matches($document.Text, $pattern)
        if ($matches.Count -ne $beforeCount) { throw "事件格式無法安全更名，未改寫任何檔案：$($file.Name)" }
        $changed = [regex]::Replace($document.Text, $pattern, '${1}"Jima_StandingPicture"')
        $after = ConvertFrom-Json -InputObject $changed.TrimStart([char]0xFEFF)
        if ((Get-JimaCommandCount $after 'LL_StandingPicture') -ne 0 -or
            (Get-JimaCommandCount $after 'Jima_StandingPicture') -ne ($existing + $beforeCount)) {
            throw "事件更名驗證失敗，未改寫任何檔案：$($file.Name)"
        }
        $items.Add([pscustomobject]@{Path=$document.Path; Before=$document.Bytes; After=[Text.Encoding]::UTF8.GetBytes($changed)})
        $count += $beforeCount
    }
    return [pscustomobject]@{Documents=$documents.ToArray(); Items=$items.ToArray(); Count=$count;
        Files=([string[]]@($files | ForEach-Object { $_.Name }) -join "`n")}
}

function Assert-JimaEventPlanUnchanged([string]$Root, $Plan) {
    $files = Get-JimaEventFiles $Root
    $names = [string[]]@($files | ForEach-Object { $_.Name }) -join "`n"
    if ($names -cne $Plan.Files) { throw '事件檔案清單於同步期間發生變更，已停止；請重新執行。' }
    foreach ($document in $Plan.Documents) {
        if (!(Test-JimaBytes ([IO.File]::ReadAllBytes($document.Path)) $document.Bytes)) {
            throw "事件檔案於同步期間被其他程式修改，已停止且未覆蓋：$($document.Path)"
        }
    }
}

function Invoke-JimaRegistration([string]$Root, [scriptblock]$BeforeCommit = {}) {
    $rootPath = [IO.Path]::GetFullPath($Root)
    if ($env:OS -eq 'Windows_NT' -and @(Get-Process -Name 'RPGMZ' -ErrorAction SilentlyContinue).Count -gt 0) {
        throw "請先儲存並關閉 RPG Maker MZ，避免編輯器把舊清單寫回後再執行。"
    }
    $hash = [Security.Cryptography.SHA256]::Create()
    try { $key = [BitConverter]::ToString($hash.ComputeHash([Text.Encoding]::UTF8.GetBytes($rootPath.ToUpperInvariant()))).Replace('-', '') }
    finally { $hash.Dispose() }
    $mutex = [Threading.Mutex]::new($false, ('JIMA_StandingPictureRegister_' + $key))
    $locked = $false
    try {
        try { $locked = $mutex.WaitOne(0) } catch [Threading.AbandonedMutexException] { $locked = $true }
        if (!$locked) { throw "這個專案已有批次登錄程式正在執行，請稍後再試。" }
        $inventory = Get-JimaInventory $rootPath
        $config = Read-JimaText (Join-Path $rootPath 'js/plugins.js')
        $plugin = Read-JimaText (Join-Path $rootPath 'js/plugins/Jima_StandingPicture.js')
        $settings = Get-JimaConfig $config.Text
        $rows = Get-JimaRows $settings.Parameters
        $plan = New-JimaPlan $rows $inventory.Names (Get-JimaDefaults $plugin.Text)
        if ($plugin.Text -notmatch 'const pluginName = "Jima_StandingPicture";') { throw '請先覆蓋 Jima_StandingPicture.js 後再執行。' }
        $rename = $settings.Entry.name -ceq 'LL_StandingPicture'
        if ($rename) { $settings.Entry.name = 'Jima_StandingPicture' }
        $eventPlan = Get-JimaEventRenamePlan $rootPath
        $configText = $config.Text
        if ($plan.Changed -or $rename) {
            if ($plan.Changed) {
                $rowsJson = ConvertTo-Json -InputObject ([object[]]$plan.Rows) -Depth 100 -Compress
                $settings.Parameters | Add-Member -MemberType NoteProperty -Name sPictures -Value $rowsJson -Force
            }
            $pluginsJson = ConvertTo-Json -InputObject ([object[]]$settings.Plugins) -Depth 100 -Compress
            $configText = $config.Text.Substring(0, $settings.Start) + $pluginsJson + $config.Text.Substring($settings.Start + $settings.Length)
            $check = Get-JimaConfig $configText
            if ((Get-JimaRows $check.Parameters).Count -ne $plan.Rows.Count) { throw "輸出清單驗證失敗，未改寫檔案。" }
        }
        $pluginText = Update-JimaOptions $plugin.Text $plan.Ids
        $items = [Collections.Generic.List[object]]::new()
        foreach ($pair in @(@($config, $configText), @($plugin, $pluginText))) {
            $before = $pair[0]; $after = [Text.Encoding]::UTF8.GetBytes($pair[1])
            if (!(Test-JimaBytes $before.Bytes $after)) {
                $items.Add([pscustomobject]@{ Path = $before.Path; Before = $before.Bytes; After = $after })
            }
        }
        foreach ($item in $eventPlan.Items) { $items.Add($item) }
        if ($items.Count -gt 0) {
            & $BeforeCommit
            $guard = {
                Assert-JimaEventPlanUnchanged $rootPath $eventPlan
                if (!(Test-JimaBytes ([IO.File]::ReadAllBytes($config.Path)) $config.Bytes) -or
                    !(Test-JimaBytes ([IO.File]::ReadAllBytes($plugin.Path)) $plugin.Bytes)) {
                    throw "設定或插件於同步期間被其他程式修改，已停止且未覆蓋。"
                }
                if ((Get-JimaInventory $rootPath).Signature -cne $inventory.Signature) {
                    throw "圖片目錄於同步期間發生變更，已停止；請重新執行。"
                }
            }.GetNewClosure()
            Invoke-JimaCommit $items.ToArray() $guard
        }
        return [pscustomobject]@{ Added = $plan.Added; Removed = $plan.Removed; Kept = $plan.Kept;
            Total = $plan.Rows.Count; Changed = ($items.Count -gt 0); Renamed = $rename; RenamedCommands = $eventPlan.Count }
    } finally { if ($locked) { $mutex.ReleaseMutex() }; $mutex.Dispose() }
}

if ($MyInvocation.InvocationName -ne '.') {
    try {
        if ($ProjectRoot -eq '') { $ProjectRoot = Join-Path $PSScriptRoot '../..' }
        $result = Invoke-JimaRegistration $ProjectRoot
        Write-Host ('完成：新增 {0}、保留 {1}、移除 {2}，共 {3} 筆。' -f $result.Added.Count, $result.Kept, $result.Removed.Count, $result.Total) -ForegroundColor Green
        foreach ($id in $result.Added) { Write-Host ('  新增：' + $id) }
        foreach ($id in $result.Removed) { Write-Host ('  移除：' + $id) }
        if (!$result.Changed) { Write-Host '清單與下拉選項已一致，沒有改寫檔案。' }
        if ($result.Renamed) { Write-Host '插件已更名為 Jima_StandingPicture，原本參數已保留。' }
        if ($result.RenamedCommands -gt 0) { Write-Host ('已更新 {0} 個事件的插件呼叫名稱；立繪 ID 與台詞不變。' -f $result.RenamedCommands) }
        Write-Host '事件下拉選項已更新。請重新開啟 MZ 專案。' 
        Write-Host '未建立備份；只更新舊插件呼叫名稱，不更改圖片 ID。'
        exit 0
    } catch {
        $message = $_.Exception.Message
        Write-Host ('批次登錄失敗：' + $message) -ForegroundColor Red
        if (!$NoDialog -and $env:OS -eq 'Windows_NT') {
            try {
                Add-Type -AssemblyName System.Windows.Forms
                [void][Windows.Forms.MessageBox]::Show($message, 'JIMA 立繪批次登錄失敗', 'OK', 'Error')
            } catch { }
        }
        exit 1
    }
}
