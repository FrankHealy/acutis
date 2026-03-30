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
    $forms = @('admission_detox','admission_alcohol')
    foreach ($formCode in $forms) {
        Write-Host "Processing $formCode"
        $en = Invoke-RestMethod -UseBasicParsing "http://localhost:5009/api/screening/GetActiveForm?locale=en-IE&subjectType=admission&formCode=$formCode"
        $ar = Invoke-RestMethod -UseBasicParsing "http://localhost:5009/api/screening/GetActiveForm?locale=ar&subjectType=admission&formCode=$formCode"
        $form = $en.form
        $suffix = $formCode.Replace('admission_', '')

        $newFormTitleKey = "admission.$suffix.form.title"
        Upsert-TextResource -Connection $connection -Key $newFormTitleKey -DefaultText $form.titleKey -ArabicText (Lookup-Arabic $ar.translations $form.titleKey $form.titleKey)
        $form.titleKey = $newFormTitleKey

        if ($form.descriptionKey) {
            $newDescriptionKey = "admission.$suffix.form.description"
            Upsert-TextResource -Connection $connection -Key $newDescriptionKey -DefaultText $form.descriptionKey -ArabicText (Lookup-Arabic $ar.translations $form.descriptionKey $form.descriptionKey)
            $form.descriptionKey = $newDescriptionKey
        }

        for ($sectionIndex = 0; $sectionIndex -lt $form.ui.sections.Count; $sectionIndex++) {
            $section = $form.ui.sections[$sectionIndex]
            $oldSectionTitle = [string]$section.titleKey
            $newSectionKey = "admission.$suffix.section.{0}.title" -f ($sectionIndex + 1).ToString('00')
            Upsert-TextResource -Connection $connection -Key $newSectionKey -DefaultText $oldSectionTitle -ArabicText (Lookup-Arabic $ar.translations $oldSectionTitle $oldSectionTitle)
            $section.titleKey = $newSectionKey

            if ($section.groups) {
                for ($groupIndex = 0; $groupIndex -lt $section.groups.Count; $groupIndex++) {
                    $group = $section.groups[$groupIndex]
                    $oldGroupTitle = if ($group.titleKey) { [string]$group.titleKey } else { [string]$group.title }
                    if (-not [string]::IsNullOrWhiteSpace($oldGroupTitle)) {
                        $newGroupKey = "admission.$suffix.section.{0}.group.{1}.title" -f ($sectionIndex + 1).ToString('00'), ($groupIndex + 1).ToString('00')
                        Upsert-TextResource -Connection $connection -Key $newGroupKey -DefaultText $oldGroupTitle -ArabicText (Lookup-Arabic $ar.translations $oldGroupTitle $oldGroupTitle)
                        $group.titleKey = $newGroupKey
                        $group.title = $null
                    }
                }
            }
        }

        $newLabelKeys = [ordered]@{}
        foreach ($property in $form.ui.labelKeys.PSObject.Properties) {
            $fieldKey = $property.Name
            $oldLabel = [string]$property.Value
            $newLabelKey = "admission.field.$fieldKey.label"
            Upsert-TextResource -Connection $connection -Key $newLabelKey -DefaultText $oldLabel -ArabicText (Lookup-Arabic $ar.translations $oldLabel $oldLabel)
            $newLabelKeys[$fieldKey] = $newLabelKey
        }
        $form.ui.labelKeys = [pscustomobject]$newLabelKeys

        $newHelpKeys = [ordered]@{}
        foreach ($property in $form.ui.helpKeys.PSObject.Properties) {
            $fieldKey = $property.Name
            $oldHelp = [string]$property.Value
            $newHelpKey = "admission.field.$fieldKey.help"
            Upsert-TextResource -Connection $connection -Key $newHelpKey -DefaultText $oldHelp -ArabicText (Lookup-Arabic $ar.translations $oldHelp $oldHelp)
            $newHelpKeys[$fieldKey] = $newHelpKey
        }
        $form.ui.helpKeys = [pscustomobject]$newHelpKeys

        $newSelectOptions = [ordered]@{}
        foreach ($fieldProperty in $form.ui.selectOptions.PSObject.Properties) {
            $fieldKey = $fieldProperty.Name
            $options = @()
            foreach ($option in $fieldProperty.Value) {
                $oldLabel = [string]$option.label
                $newOptionKey = "admission.option.$fieldKey.$([string]$option.value)"
                Upsert-TextResource -Connection $connection -Key $newOptionKey -DefaultText $oldLabel -ArabicText (Lookup-Arabic $ar.translations $oldLabel $oldLabel)
                $options += [pscustomobject]@{ value = [string]$option.value; label = $newOptionKey }
            }
            $newSelectOptions[$fieldKey] = $options
        }
        $form.ui.selectOptions = [pscustomobject]$newSelectOptions

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

        $jsonPath = "c:\Acutis\tmp\$formCode-localized.json"
        $payload | ConvertTo-Json -Depth 60 | Set-Content $jsonPath
        $response = Invoke-RestMethod -Method Post -Uri 'http://localhost:5009/api/configuration/EditAdmissionForm' -ContentType 'application/json' -InFile $jsonPath
        Write-Host ($response | ConvertTo-Json -Compress)
    }

    $frontendKeys = @(
        @{ Key = 'admission.page.header'; Default = '{unitName} Admission'; Arabic = '{unitName} ??????' },
        @{ Key = 'admission.generated_form'; Default = 'Unit-scoped generated form: {formCode} v{version}'; Arabic = '??????? ??????? ???????: {formCode} ??????? {version}' },
        @{ Key = 'admission.configure_activate'; Default = 'Configure or activate {formCode} in the forms generator.'; Arabic = '?? ?????? ?? ????? {formCode} ?? ???? ???????.' },
        @{ Key = 'admission.photo.alt'; Default = 'Captured resident'; Arabic = '???? ?????? ????????' },
        @{ Key = 'admission.error.start_camera_preview'; Default = 'Unable to start camera preview.'; Arabic = '???? ??? ?????? ????????.' },
        @{ Key = 'admission.error.access_camera'; Default = 'Unable to access camera.'; Arabic = '???? ?????? ??? ????????.' },
        @{ Key = 'admission.body_map.clear'; Default = 'Clear marks'; Arabic = '??? ????????' },
        @{ Key = 'admission.body_map.instruction'; Default = 'Click the body to add injection marks.'; Arabic = '???? ??? ???? ????? ?????? ?????? ?????.' },
        @{ Key = 'admission.body_map.stored_coordinates'; Default = 'Stored coordinates'; Arabic = '?????????? ????????' },
        @{ Key = 'admission.body_map.mark'; Default = 'Mark'; Arabic = '?????' }
    )

    foreach ($item in $frontendKeys) {
        Upsert-TextResource -Connection $connection -Key $item.Key -DefaultText $item.Default -ArabicText $item.Arabic
    }
}
finally {
    $connection.Close()
}
