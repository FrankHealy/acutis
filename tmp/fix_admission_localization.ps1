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

function Get-ScalarCommandResult([System.Data.SqlClient.SqlConnection]$Connection, [string]$Sql) {
    $cmd = $Connection.CreateCommand()
    $cmd.CommandText = $Sql
    return $cmd.ExecuteScalar()
}

$connection = [System.Data.SqlClient.SqlConnection]::new('Server=DESKTOP-J7RG4UL;Database=Acutis_CuanMhuire_IE_Dev;Integrated Security=True;TrustServerCertificate=True')
$connection.Open()
try {
    Upsert-TextResource $connection 'admission.detox.form.title' 'Resident Case Screening and Admission Assessment' '????? ??? ?????? ???????'
    Upsert-TextResource $connection 'admission.alcohol.form.title' 'Resident Case Screening and Admission Assessment' '????? ??? ?????? ???????'
    Upsert-TextResource $connection 'admission.field.injection_sites.label' 'Injection Site Body Diagram' '???? ????? ????? ??? ?????'
    Upsert-TextResource $connection 'admission.field.injection_sites.help' 'Mark the main body areas used for injection.' '??? ????? ????? ???????? ??? ???? ?????.'

    $cmd = $connection.CreateCommand()
    $cmd.CommandText = "SELECT TOP 1 TitleKey, DescriptionKey, SchemaJson, UiJson, RulesJson, Version FROM FormDefinition WHERE Code='admission_alcohol' AND Version=5"
    $reader = $cmd.ExecuteReader()
    if (-not $reader.Read()) { throw 'Archived admission_alcohol v5 not found.' }
    $titleKey = [string]$reader['TitleKey']
    $descriptionKey = [string]$reader['DescriptionKey']
    $schemaJson = [string]$reader['SchemaJson']
    $uiJson = [string]$reader['UiJson']
    $rulesJson = [string]$reader['RulesJson']
    $sourceVersion = [int]$reader['Version']
    $reader.Close()

    $ui = $uiJson | ConvertFrom-Json
    foreach ($property in $ui.labelKeys.PSObject.Properties) {
        $property.Value = "admission.field.$($property.Name).label"
    }
    foreach ($property in $ui.helpKeys.PSObject.Properties) {
        $property.Value = "admission.field.$($property.Name).help"
    }
    for ($i = 0; $i -lt $ui.sections.Count; $i++) {
        $ui.sections[$i].titleKey = ('admission.alcohol.section.{0}.title' -f ($i + 1).ToString('00'))
        if ($ui.sections[$i].groups) {
            for ($g = 0; $g -lt $ui.sections[$i].groups.Count; $g++) {
                if ($ui.sections[$i].groups[$g].titleKey -or $ui.sections[$i].groups[$g].title) {
                    $ui.sections[$i].groups[$g].titleKey = ('admission.alcohol.section.{0}.group.{1}.title' -f ($i + 1).ToString('00'), ($g + 1).ToString('00'))
                    $ui.sections[$i].groups[$g].title = $null
                }
            }
        }
    }
    foreach ($fieldProperty in $ui.selectOptions.PSObject.Properties) {
        foreach ($option in $fieldProperty.Value) {
            $option.label = "admission.option.$($fieldProperty.Name).$($option.value)"
        }
    }

    $rules = @($rulesJson | ConvertFrom-Json)

    $payload = [ordered]@{
        formCode = 'admission_alcohol'
        sourceVersion = $sourceVersion
        form = [ordered]@{
            titleKey = 'admission.alcohol.form.title'
            descriptionKey = 'admission.alcohol.form.description'
            schemaJson = $schemaJson
            uiJson = ($ui | ConvertTo-Json -Depth 60 -Compress)
            rulesJson = ($rules | ConvertTo-Json -Depth 60 -Compress)
            makeActive = $true
        }
    }
    $payload | ConvertTo-Json -Depth 80 | Set-Content c:\Acutis\tmp\admission_alcohol_restore.json
    $response = Invoke-RestMethod -Method Post -Uri 'http://localhost:5009/api/configuration/EditAdmissionForm' -ContentType 'application/json' -InFile c:\Acutis\tmp\admission_alcohol_restore.json
    $response | ConvertTo-Json -Compress
}
finally {
    $connection.Close()
}
