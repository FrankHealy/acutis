$ErrorActionPreference = 'Stop'
Add-Type -AssemblyName System.Data

function Upsert-TextResource {
    param(
        [System.Data.SqlClient.SqlConnection]$Connection,
        [string]$Key,
        [string]$DefaultText,
        [string]$ArabicText
    )

    $cmd = $Connection.CreateCommand()
    $cmd.CommandText = @"
IF EXISTS (SELECT 1 FROM TextResource WHERE [Key] = @key)
    UPDATE TextResource SET DefaultText = @defaultText WHERE [Key] = @key;
ELSE
    INSERT INTO TextResource ([Key], DefaultText) VALUES (@key, @defaultText);

IF EXISTS (SELECT 1 FROM TextTranslation WHERE [Key] = @key AND Locale = N'ar')
    UPDATE TextTranslation SET [Text] = @arabicText WHERE [Key] = @key AND Locale = N'ar';
ELSE
    INSERT INTO TextTranslation ([Id], [Key], [Locale], [Text]) VALUES (NEWID(), @key, N'ar', @arabicText);
"@
    [void]$cmd.Parameters.AddWithValue('@key', $Key)
    [void]$cmd.Parameters.AddWithValue('@defaultText', $DefaultText)
    [void]$cmd.Parameters.AddWithValue('@arabicText', $ArabicText)
    [void]$cmd.ExecuteNonQuery()
}

function Lookup-Arabic($translations, [string]$oldKey, [string]$defaultText) {
    $prop = $translations.PSObject.Properties[$oldKey]
    if ($null -ne $prop -and -not [string]::IsNullOrWhiteSpace([string]$prop.Value) -and [string]$prop.Value -ne $oldKey) {
        return [string]$prop.Value
    }
    return $defaultText
}

$connection = [System.Data.SqlClient.SqlConnection]::new('Server=DESKTOP-J7RG4UL;Database=Acutis_CuanMhuire_IE_Dev;Integrated Security=True;TrustServerCertificate=True')
$connection.Open()
try {
    $formCode = 'admission_detox'
    $en = Invoke-RestMethod -UseBasicParsing "http://localhost:5009/api/screening/GetActiveForm?locale=en-IE&subjectType=admission&formCode=$formCode"
    $ar = Invoke-RestMethod -UseBasicParsing "http://localhost:5009/api/screening/GetActiveForm?locale=ar&subjectType=admission&formCode=$formCode"
    $form = $en.form
    Upsert-TextResource -Connection $connection -Key 'admission.detox.form.title' -DefaultText $form.titleKey -ArabicText (Lookup-Arabic $ar.translations $form.titleKey $form.titleKey)
    Upsert-TextResource -Connection $connection -Key 'admission.field.service_user_full_name.label' -DefaultText $form.ui.labelKeys.service_user_full_name -ArabicText (Lookup-Arabic $ar.translations $form.ui.labelKeys.service_user_full_name $form.ui.labelKeys.service_user_full_name)
    $form.titleKey = 'admission.detox.form.title'
    $form.ui.labelKeys.service_user_full_name = 'admission.field.service_user_full_name.label'
    $payload = [ordered]@{
        formCode = $formCode
        sourceVersion = [int]$form.version
        form = [ordered]@{
            titleKey = [string]$form.titleKey
            descriptionKey = [string]$form.descriptionKey
            schemaJson = ($form.schema | ConvertTo-Json -Depth 40 -Compress)
            uiJson = ($form.ui | ConvertTo-Json -Depth 40 -Compress)
            rulesJson = ($form.rules | ConvertTo-Json -Depth 40 -Compress)
            makeActive = $true
        }
    }
    $path = 'c:\Acutis\tmp\one-form-test.json'
    $payload | ConvertTo-Json -Depth 60 | Set-Content $path
    Write-Host "POSTING $path"
    $response = Invoke-RestMethod -Method Post -Uri 'http://localhost:5009/api/configuration/EditAdmissionForm' -ContentType 'application/json' -InFile $path
    $response | ConvertTo-Json -Depth 10
}
finally {
    $connection.Close()
}
