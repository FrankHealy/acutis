SET NOCOUNT ON;
IF EXISTS (SELECT 1 FROM TextTranslation WHERE [Key] = N'admission.detox.form.description' AND Locale = N'ar')
    UPDATE TextTranslation SET [Text] = N'????? ???? ????? ????? ?????? ????? ?? ????? HSE ???????? ???????? ??? ?? ??? ????? ??????? ???????? ?????? ??????? ??????? ?????? ???? ?????? ????? ?????.' WHERE [Key] = N'admission.detox.form.description' AND Locale = N'ar';
ELSE
    INSERT INTO TextTranslation (Id, [Key], Locale, [Text]) VALUES (NEWID(), N'admission.detox.form.description', N'ar', N'????? ???? ????? ????? ?????? ????? ?? ????? HSE ???????? ???????? ??? ?? ??? ????? ??????? ???????? ?????? ??????? ??????? ?????? ???? ?????? ????? ?????.');
IF EXISTS (SELECT 1 FROM TextTranslation WHERE [Key] = N'admission.detox.section.02.title' AND Locale = N'ar')
    UPDATE TextTranslation SET [Text] = N'دعم الأسرة والمجتمع' WHERE [Key] = N'admission.detox.section.02.title' AND Locale = N'ar';
ELSE
    INSERT INTO TextTranslation (Id, [Key], Locale, [Text]) VALUES (NEWID(), N'admission.detox.section.02.title', N'ar', N'دعم الأسرة والمجتمع');
IF EXISTS (SELECT 1 FROM TextTranslation WHERE [Key] = N'admission.detox.section.03.title' AND Locale = N'ar')
    UPDATE TextTranslation SET [Text] = N'السكن والتشرد' WHERE [Key] = N'admission.detox.section.03.title' AND Locale = N'ar';
ELSE
    INSERT INTO TextTranslation (Id, [Key], Locale, [Text]) VALUES (NEWID(), N'admission.detox.section.03.title', N'ar', N'السكن والتشرد');
IF EXISTS (SELECT 1 FROM TextTranslation WHERE [Key] = N'admission.detox.section.06.title' AND Locale = N'ar')
    UPDATE TextTranslation SET [Text] = N'تفاصيل استخدام الكحول' WHERE [Key] = N'admission.detox.section.06.title' AND Locale = N'ar';
ELSE
    INSERT INTO TextTranslation (Id, [Key], Locale, [Text]) VALUES (NEWID(), N'admission.detox.section.06.title', N'ar', N'تفاصيل استخدام الكحول');
IF EXISTS (SELECT 1 FROM TextTranslation WHERE [Key] = N'admission.detox.section.08.title' AND Locale = N'ar')
    UPDATE TextTranslation SET [Text] = N'الرفاهية الجنسية' WHERE [Key] = N'admission.detox.section.08.title' AND Locale = N'ar';
ELSE
    INSERT INTO TextTranslation (Id, [Key], Locale, [Text]) VALUES (NEWID(), N'admission.detox.section.08.title', N'ar', N'الرفاهية الجنسية');
IF EXISTS (SELECT 1 FROM TextTranslation WHERE [Key] = N'admission.detox.section.10.title' AND Locale = N'ar')
    UPDATE TextTranslation SET [Text] = N'العنف المنزلي / العدالة / الصحة والسلامة' WHERE [Key] = N'admission.detox.section.10.title' AND Locale = N'ar';
ELSE
    INSERT INTO TextTranslation (Id, [Key], Locale, [Text]) VALUES (NEWID(), N'admission.detox.section.10.title', N'ar', N'العنف المنزلي / العدالة / الصحة والسلامة');
IF EXISTS (SELECT 1 FROM TextTranslation WHERE [Key] = N'admission.detox.section.11.title' AND Locale = N'ar')
    UPDATE TextTranslation SET [Text] = N'مقياس السعادة' WHERE [Key] = N'admission.detox.section.11.title' AND Locale = N'ar';
ELSE
    INSERT INTO TextTranslation (Id, [Key], Locale, [Text]) VALUES (NEWID(), N'admission.detox.section.11.title', N'ar', N'مقياس السعادة');
IF EXISTS (SELECT 1 FROM TextTranslation WHERE [Key] = N'admission.field.accommodation_difficulties_details.label' AND Locale = N'ar')
    UPDATE TextTranslation SET [Text] = N'تفاصيل صعوبات الإقامة' WHERE [Key] = N'admission.field.accommodation_difficulties_details.label' AND Locale = N'ar';
ELSE
    INSERT INTO TextTranslation (Id, [Key], Locale, [Text]) VALUES (NEWID(), N'admission.field.accommodation_difficulties_details.label', N'ar', N'تفاصيل صعوبات الإقامة');
IF EXISTS (SELECT 1 FROM TextTranslation WHERE [Key] = N'admission.field.additional_comments_needed.label' AND Locale = N'ar')
    UPDATE TextTranslation SET [Text] = N'تعليقات إضافية مطلوبة' WHERE [Key] = N'admission.field.additional_comments_needed.label' AND Locale = N'ar';
ELSE
    INSERT INTO TextTranslation (Id, [Key], Locale, [Text]) VALUES (NEWID(), N'admission.field.additional_comments_needed.label', N'ar', N'تعليقات إضافية مطلوبة');
IF EXISTS (SELECT 1 FROM TextTranslation WHERE [Key] = N'admission.field.additional_consent_contacts.label' AND Locale = N'ar')
    UPDATE TextTranslation SET [Text] = N'جهات اتصال الموافقة الإضافية' WHERE [Key] = N'admission.field.additional_consent_contacts.label' AND Locale = N'ar';
ELSE
    INSERT INTO TextTranslation (Id, [Key], Locale, [Text]) VALUES (NEWID(), N'admission.field.additional_consent_contacts.label', N'ar', N'جهات اتصال الموافقة الإضافية');
IF EXISTS (SELECT 1 FROM TextTranslation WHERE [Key] = N'admission.field.adheres_to_medication.label' AND Locale = N'ar')
    UPDATE TextTranslation SET [Text] = N'يلتزم بالأدوية' WHERE [Key] = N'admission.field.adheres_to_medication.label' AND Locale = N'ar';
ELSE
    INSERT INTO TextTranslation (Id, [Key], Locale, [Text]) VALUES (NEWID(), N'admission.field.adheres_to_medication.label', N'ar', N'يلتزم بالأدوية');
IF EXISTS (SELECT 1 FROM TextTranslation WHERE [Key] = N'admission.field.age_first_injected.label' AND Locale = N'ar')
    UPDATE TextTranslation SET [Text] = N'????? ??? ??? ????? ??????' WHERE [Key] = N'admission.field.age_first_injected.label' AND Locale = N'ar';
ELSE
    INSERT INTO TextTranslation (Id, [Key], Locale, [Text]) VALUES (NEWID(), N'admission.field.age_first_injected.label', N'ar', N'????? ??? ??? ????? ??????');
IF EXISTS (SELECT 1 FROM TextTranslation WHERE [Key] = N'admission.field.age_first_opiate_substitution.label' AND Locale = N'ar')
    UPDATE TextTranslation SET [Text] = N'????? ??? ??? ???? ???? ???? ?????????' WHERE [Key] = N'admission.field.age_first_opiate_substitution.label' AND Locale = N'ar';
ELSE
    INSERT INTO TextTranslation (Id, [Key], Locale, [Text]) VALUES (NEWID(), N'admission.field.age_first_opiate_substitution.label', N'ar', N'????? ??? ??? ???? ???? ???? ?????????');
IF EXISTS (SELECT 1 FROM TextTranslation WHERE [Key] = N'admission.field.age_left_school_first_time.label' AND Locale = N'ar')
    UPDATE TextTranslation SET [Text] = N'العمر ترك المدرسة لأول مرة' WHERE [Key] = N'admission.field.age_left_school_first_time.label' AND Locale = N'ar';
ELSE
    INSERT INTO TextTranslation (Id, [Key], Locale, [Text]) VALUES (NEWID(), N'admission.field.age_left_school_first_time.label', N'ar', N'العمر ترك المدرسة لأول مرة');
IF EXISTS (SELECT 1 FROM TextTranslation WHERE [Key] = N'admission.field.alcohol_use_history_table.help' AND Locale = N'ar')
    UPDATE TextTranslation SET [Text] = N'??? ????? ??????? ???????? ??????? ?????? ?????? ??? ??? ??????? ???? ????????? ??? ??? ?? ????? ??????.' WHERE [Key] = N'admission.field.alcohol_use_history_table.help' AND Locale = N'ar';
ELSE
    INSERT INTO TextTranslation (Id, [Key], Locale, [Text]) VALUES (NEWID(), N'admission.field.alcohol_use_history_table.help', N'ar', N'??? ????? ??????? ???????? ??????? ?????? ?????? ??? ??? ??????? ???? ????????? ??? ??? ?? ????? ??????.');
IF EXISTS (SELECT 1 FROM TextTranslation WHERE [Key] = N'admission.field.alcohol_use_history_table.label' AND Locale = N'ar')
    UPDATE TextTranslation SET [Text] = N'التاريخ التفصيلي لاستخدام الكحول' WHERE [Key] = N'admission.field.alcohol_use_history_table.label' AND Locale = N'ar';
ELSE
    INSERT INTO TextTranslation (Id, [Key], Locale, [Text]) VALUES (NEWID(), N'admission.field.alcohol_use_history_table.label', N'ar', N'التاريخ التفصيلي لاستخدام الكحول');
IF EXISTS (SELECT 1 FROM TextTranslation WHERE [Key] = N'admission.field.amount_of_income.label' AND Locale = N'ar')
    UPDATE TextTranslation SET [Text] = N'مقدار الدخل' WHERE [Key] = N'admission.field.amount_of_income.label' AND Locale = N'ar';
ELSE
    INSERT INTO TextTranslation (Id, [Key], Locale, [Text]) VALUES (NEWID(), N'admission.field.amount_of_income.label', N'ar', N'مقدار الدخل');
IF EXISTS (SELECT 1 FROM TextTranslation WHERE [Key] = N'admission.field.assessment_checklist.label' AND Locale = N'ar')
    UPDATE TextTranslation SET [Text] = N'قائمة مراجعة التقييم' WHERE [Key] = N'admission.field.assessment_checklist.label' AND Locale = N'ar';
ELSE
    INSERT INTO TextTranslation (Id, [Key], Locale, [Text]) VALUES (NEWID(), N'admission.field.assessment_checklist.label', N'ar', N'قائمة مراجعة التقييم');
IF EXISTS (SELECT 1 FROM TextTranslation WHERE [Key] = N'admission.field.behaviour_impacting_treatment_plan.label' AND Locale = N'ar')
    UPDATE TextTranslation SET [Text] = N'قد يؤثر السلوك على خطة العلاج' WHERE [Key] = N'admission.field.behaviour_impacting_treatment_plan.label' AND Locale = N'ar';
ELSE
    INSERT INTO TextTranslation (Id, [Key], Locale, [Text]) VALUES (NEWID(), N'admission.field.behaviour_impacting_treatment_plan.label', N'ar', N'قد يؤثر السلوك على خطة العلاج');
IF EXISTS (SELECT 1 FROM TextTranslation WHERE [Key] = N'admission.field.can_access_medication.label' AND Locale = N'ar')
    UPDATE TextTranslation SET [Text] = N'يمكن الوصول إلى الدواء' WHERE [Key] = N'admission.field.can_access_medication.label' AND Locale = N'ar';
ELSE
    INSERT INTO TextTranslation (Id, [Key], Locale, [Text]) VALUES (NEWID(), N'admission.field.can_access_medication.label', N'ar', N'يمكن الوصول إلى الدواء');
IF EXISTS (SELECT 1 FROM TextTranslation WHERE [Key] = N'admission.field.community_welfare_deposit_details.label' AND Locale = N'ar')
    UPDATE TextTranslation SET [Text] = N'تفاصيل وديعة رعاية المجتمع' WHERE [Key] = N'admission.field.community_welfare_deposit_details.label' AND Locale = N'ar';
ELSE
    INSERT INTO TextTranslation (Id, [Key], Locale, [Text]) VALUES (NEWID(), N'admission.field.community_welfare_deposit_details.label', N'ar', N'تفاصيل وديعة رعاية المجتمع');
IF EXISTS (SELECT 1 FROM TextTranslation WHERE [Key] = N'admission.field.consent_explainer.help' AND Locale = N'ar')
    UPDATE TextTranslation SET [Text] = N'شرح الموافقة والسرية الذي يغطي الغرض والخصوصية وحدود السجل المشترك.' WHERE [Key] = N'admission.field.consent_explainer.help' AND Locale = N'ar';
ELSE
    INSERT INTO TextTranslation (Id, [Key], Locale, [Text]) VALUES (NEWID(), N'admission.field.consent_explainer.help', N'ar', N'شرح الموافقة والسرية الذي يغطي الغرض والخصوصية وحدود السجل المشترك.');
IF EXISTS (SELECT 1 FROM TextTranslation WHERE [Key] = N'admission.field.consent_explainer.label' AND Locale = N'ar')
    UPDATE TextTranslation SET [Text] = N'شرح الموافقة والسرية' WHERE [Key] = N'admission.field.consent_explainer.label' AND Locale = N'ar';
ELSE
    INSERT INTO TextTranslation (Id, [Key], Locale, [Text]) VALUES (NEWID(), N'admission.field.consent_explainer.label', N'ar', N'شرح الموافقة والسرية');
IF EXISTS (SELECT 1 FROM TextTranslation WHERE [Key] = N'admission.field.contact_permissions.label' AND Locale = N'ar')
    UPDATE TextTranslation SET [Text] = N'أذونات الاتصال' WHERE [Key] = N'admission.field.contact_permissions.label' AND Locale = N'ar';
ELSE
    INSERT INTO TextTranslation (Id, [Key], Locale, [Text]) VALUES (NEWID(), N'admission.field.contact_permissions.label', N'ar', N'أذونات الاتصال');
IF EXISTS (SELECT 1 FROM TextTranslation WHERE [Key] = N'admission.field.country_of_birth.label' AND Locale = N'ar')
    UPDATE TextTranslation SET [Text] = N'بلد الميلاد' WHERE [Key] = N'admission.field.country_of_birth.label' AND Locale = N'ar';
ELSE
    INSERT INTO TextTranslation (Id, [Key], Locale, [Text]) VALUES (NEWID(), N'admission.field.country_of_birth.label', N'ar', N'بلد الميلاد');
IF EXISTS (SELECT 1 FROM TextTranslation WHERE [Key] = N'admission.field.current_housing_situation.label' AND Locale = N'ar')
    UPDATE TextTranslation SET [Text] = N'وصف الوضع السكني الحالي' WHERE [Key] = N'admission.field.current_housing_situation.label' AND Locale = N'ar';
ELSE
    INSERT INTO TextTranslation (Id, [Key], Locale, [Text]) VALUES (NEWID(), N'admission.field.current_housing_situation.label', N'ar', N'وصف الوضع السكني الحالي');
IF EXISTS (SELECT 1 FROM TextTranslation WHERE [Key] = N'admission.field.current_or_recent_social_worker_involvement.label' AND Locale = N'ar')
    UPDATE TextTranslation SET [Text] = N'مشاركة الأخصائي الاجتماعي الحالية أو الأخيرة' WHERE [Key] = N'admission.field.current_or_recent_social_worker_involvement.label' AND Locale = N'ar';
ELSE
    INSERT INTO TextTranslation (Id, [Key], Locale, [Text]) VALUES (NEWID(), N'admission.field.current_or_recent_social_worker_involvement.label', N'ar', N'مشاركة الأخصائي الاجتماعي الحالية أو الأخيرة');
IF EXISTS (SELECT 1 FROM TextTranslation WHERE [Key] = N'admission.field.current_relationship_safety.label' AND Locale = N'ar')
    UPDATE TextTranslation SET [Text] = N'يشعر بالأمان في العلاقة الحالية' WHERE [Key] = N'admission.field.current_relationship_safety.label' AND Locale = N'ar';
ELSE
    INSERT INTO TextTranslation (Id, [Key], Locale, [Text]) VALUES (NEWID(), N'admission.field.current_relationship_safety.label', N'ar', N'يشعر بالأمان في العلاقة الحالية');
IF EXISTS (SELECT 1 FROM TextTranslation WHERE [Key] = N'admission.field.custodial_sentence_history.label' AND Locale = N'ar')
    UPDATE TextTranslation SET [Text] = N'تاريخ عقوبة الحبس' WHERE [Key] = N'admission.field.custodial_sentence_history.label' AND Locale = N'ar';
ELSE
    INSERT INTO TextTranslation (Id, [Key], Locale, [Text]) VALUES (NEWID(), N'admission.field.custodial_sentence_history.label', N'ar', N'تاريخ عقوبة الحبس');
IF EXISTS (SELECT 1 FROM TextTranslation WHERE [Key] = N'admission.field.domestic_violence_details.label' AND Locale = N'ar')
    UPDATE TextTranslation SET [Text] = N'تفاصيل العنف المنزلي' WHERE [Key] = N'admission.field.domestic_violence_details.label' AND Locale = N'ar';
ELSE
    INSERT INTO TextTranslation (Id, [Key], Locale, [Text]) VALUES (NEWID(), N'admission.field.domestic_violence_details.label', N'ar', N'تفاصيل العنف المنزلي');
IF EXISTS (SELECT 1 FROM TextTranslation WHERE [Key] = N'admission.field.drinking_problem_extent.label' AND Locale = N'ar')
    UPDATE TextTranslation SET [Text] = N'مدى مشكلة الشرب' WHERE [Key] = N'admission.field.drinking_problem_extent.label' AND Locale = N'ar';
ELSE
    INSERT INTO TextTranslation (Id, [Key], Locale, [Text]) VALUES (NEWID(), N'admission.field.drinking_problem_extent.label', N'ar', N'مدى مشكلة الشرب');
IF EXISTS (SELECT 1 FROM TextTranslation WHERE [Key] = N'admission.field.drug_use_history_table.help' AND Locale = N'ar')
    UPDATE TextTranslation SET [Text] = N'??? ????? ??????? ???????? ??????? ?????? ?????? ??? ??? ??????? ?????? ??? ??????? ??? ???? ???????.' WHERE [Key] = N'admission.field.drug_use_history_table.help' AND Locale = N'ar';
ELSE
    INSERT INTO TextTranslation (Id, [Key], Locale, [Text]) VALUES (NEWID(), N'admission.field.drug_use_history_table.help', N'ar', N'??? ????? ??????? ???????? ??????? ?????? ?????? ??? ??? ??????? ?????? ??? ??????? ??? ???? ???????.');
IF EXISTS (SELECT 1 FROM TextTranslation WHERE [Key] = N'admission.field.drug_use_history_table.label' AND Locale = N'ar')
    UPDATE TextTranslation SET [Text] = N'التاريخ التفصيلي لاستخدام المخدرات' WHERE [Key] = N'admission.field.drug_use_history_table.label' AND Locale = N'ar';
ELSE
    INSERT INTO TextTranslation (Id, [Key], Locale, [Text]) VALUES (NEWID(), N'admission.field.drug_use_history_table.label', N'ar', N'التاريخ التفصيلي لاستخدام المخدرات');
IF EXISTS (SELECT 1 FROM TextTranslation WHERE [Key] = N'admission.field.eating_disorder_history.label' AND Locale = N'ar')
    UPDATE TextTranslation SET [Text] = N'تاريخ اضطرابات الأكل' WHERE [Key] = N'admission.field.eating_disorder_history.label' AND Locale = N'ar';
ELSE
    INSERT INTO TextTranslation (Id, [Key], Locale, [Text]) VALUES (NEWID(), N'admission.field.eating_disorder_history.label', N'ar', N'تاريخ اضطرابات الأكل');
IF EXISTS (SELECT 1 FROM TextTranslation WHERE [Key] = N'admission.field.education_level.label' AND Locale = N'ar')
    UPDATE TextTranslation SET [Text] = N'مستوى التعليم' WHERE [Key] = N'admission.field.education_level.label' AND Locale = N'ar';
ELSE
    INSERT INTO TextTranslation (Id, [Key], Locale, [Text]) VALUES (NEWID(), N'admission.field.education_level.label', N'ar', N'مستوى التعليم');
IF EXISTS (SELECT 1 FROM TextTranslation WHERE [Key] = N'admission.field.emergency_contact_aware_current_problems.label' AND Locale = N'ar')
    UPDATE TextTranslation SET [Text] = N'جهة الاتصال في حالات الطوارئ على علم بالمشاكل الحالية' WHERE [Key] = N'admission.field.emergency_contact_aware_current_problems.label' AND Locale = N'ar';
ELSE
    INSERT INTO TextTranslation (Id, [Key], Locale, [Text]) VALUES (NEWID(), N'admission.field.emergency_contact_aware_current_problems.label', N'ar', N'جهة الاتصال في حالات الطوارئ على علم بالمشاكل الحالية');
IF EXISTS (SELECT 1 FROM TextTranslation WHERE [Key] = N'admission.field.emergency_contact_contact_details.label' AND Locale = N'ar')
    UPDATE TextTranslation SET [Text] = N'تفاصيل الاتصال في حالات الطوارئ' WHERE [Key] = N'admission.field.emergency_contact_contact_details.label' AND Locale = N'ar';
ELSE
    INSERT INTO TextTranslation (Id, [Key], Locale, [Text]) VALUES (NEWID(), N'admission.field.emergency_contact_contact_details.label', N'ar', N'تفاصيل الاتصال في حالات الطوارئ');
IF EXISTS (SELECT 1 FROM TextTranslation WHERE [Key] = N'admission.field.emergency_contact_name.label' AND Locale = N'ar')
    UPDATE TextTranslation SET [Text] = N'اسم جهة اتصال الطوارئ' WHERE [Key] = N'admission.field.emergency_contact_name.label' AND Locale = N'ar';
ELSE
    INSERT INTO TextTranslation (Id, [Key], Locale, [Text]) VALUES (NEWID(), N'admission.field.emergency_contact_name.label', N'ar', N'اسم جهة اتصال الطوارئ');
IF EXISTS (SELECT 1 FROM TextTranslation WHERE [Key] = N'admission.field.emergency_contact_relationship.label' AND Locale = N'ar')
    UPDATE TextTranslation SET [Text] = N'علاقة الاتصال في حالات الطوارئ' WHERE [Key] = N'admission.field.emergency_contact_relationship.label' AND Locale = N'ar';
ELSE
    INSERT INTO TextTranslation (Id, [Key], Locale, [Text]) VALUES (NEWID(), N'admission.field.emergency_contact_relationship.label', N'ar', N'علاقة الاتصال في حالات الطوارئ');
IF EXISTS (SELECT 1 FROM TextTranslation WHERE [Key] = N'admission.field.employment_status.label' AND Locale = N'ar')
    UPDATE TextTranslation SET [Text] = N'الحالة الوظيفية' WHERE [Key] = N'admission.field.employment_status.label' AND Locale = N'ar';
ELSE
    INSERT INTO TextTranslation (Id, [Key], Locale, [Text]) VALUES (NEWID(), N'admission.field.employment_status.label', N'ar', N'الحالة الوظيفية');
IF EXISTS (SELECT 1 FROM TextTranslation WHERE [Key] = N'admission.field.ethnicity.label' AND Locale = N'ar')
    UPDATE TextTranslation SET [Text] = N'عِرق' WHERE [Key] = N'admission.field.ethnicity.label' AND Locale = N'ar';
ELSE
    INSERT INTO TextTranslation (Id, [Key], Locale, [Text]) VALUES (NEWID(), N'admission.field.ethnicity.label', N'ar', N'عِرق');
IF EXISTS (SELECT 1 FROM TextTranslation WHERE [Key] = N'admission.field.ethnicity_description.label' AND Locale = N'ar')
    UPDATE TextTranslation SET [Text] = N'وصف العرق' WHERE [Key] = N'admission.field.ethnicity_description.label' AND Locale = N'ar';
ELSE
    INSERT INTO TextTranslation (Id, [Key], Locale, [Text]) VALUES (NEWID(), N'admission.field.ethnicity_description.label', N'ar', N'وصف العرق');
IF EXISTS (SELECT 1 FROM TextTranslation WHERE [Key] = N'admission.field.family_substance_use_history.label' AND Locale = N'ar')
    UPDATE TextTranslation SET [Text] = N'تاريخ استخدام المواد العائلية' WHERE [Key] = N'admission.field.family_substance_use_history.label' AND Locale = N'ar';
ELSE
    INSERT INTO TextTranslation (Id, [Key], Locale, [Text]) VALUES (NEWID(), N'admission.field.family_substance_use_history.label', N'ar', N'تاريخ استخدام المواد العائلية');
IF EXISTS (SELECT 1 FROM TextTranslation WHERE [Key] = N'admission.field.family_support_details.label' AND Locale = N'ar')
    UPDATE TextTranslation SET [Text] = N'تفاصيل دعم الأسرة' WHERE [Key] = N'admission.field.family_support_details.label' AND Locale = N'ar';
ELSE
    INSERT INTO TextTranslation (Id, [Key], Locale, [Text]) VALUES (NEWID(), N'admission.field.family_support_details.label', N'ar', N'تفاصيل دعم الأسرة');
IF EXISTS (SELECT 1 FROM TextTranslation WHERE [Key] = N'admission.field.gambling_history.label' AND Locale = N'ar')
    UPDATE TextTranslation SET [Text] = N'تاريخ القمار' WHERE [Key] = N'admission.field.gambling_history.label' AND Locale = N'ar';
ELSE
    INSERT INTO TextTranslation (Id, [Key], Locale, [Text]) VALUES (NEWID(), N'admission.field.gambling_history.label', N'ar', N'تاريخ القمار');
IF EXISTS (SELECT 1 FROM TextTranslation WHERE [Key] = N'admission.field.gender_identity.label' AND Locale = N'ar')
    UPDATE TextTranslation SET [Text] = N'الهوية الجنسية' WHERE [Key] = N'admission.field.gender_identity.label' AND Locale = N'ar';
ELSE
    INSERT INTO TextTranslation (Id, [Key], Locale, [Text]) VALUES (NEWID(), N'admission.field.gender_identity.label', N'ar', N'الهوية الجنسية');
IF EXISTS (SELECT 1 FROM TextTranslation WHERE [Key] = N'admission.field.gp_address.label' AND Locale = N'ar')
    UPDATE TextTranslation SET [Text] = N'عنوان الطبيب العام' WHERE [Key] = N'admission.field.gp_address.label' AND Locale = N'ar';
ELSE
    INSERT INTO TextTranslation (Id, [Key], Locale, [Text]) VALUES (NEWID(), N'admission.field.gp_address.label', N'ar', N'عنوان الطبيب العام');
IF EXISTS (SELECT 1 FROM TextTranslation WHERE [Key] = N'admission.field.gp_aware_of_use.label' AND Locale = N'ar')
    UPDATE TextTranslation SET [Text] = N'GP على علم بتعاطي الكحول / المخدرات' WHERE [Key] = N'admission.field.gp_aware_of_use.label' AND Locale = N'ar';
ELSE
    INSERT INTO TextTranslation (Id, [Key], Locale, [Text]) VALUES (NEWID(), N'admission.field.gp_aware_of_use.label', N'ar', N'GP على علم بتعاطي الكحول / المخدرات');
IF EXISTS (SELECT 1 FROM TextTranslation WHERE [Key] = N'admission.field.gp_mobile.label' AND Locale = N'ar')
    UPDATE TextTranslation SET [Text] = N'جي بي موبايل' WHERE [Key] = N'admission.field.gp_mobile.label' AND Locale = N'ar';
ELSE
    INSERT INTO TextTranslation (Id, [Key], Locale, [Text]) VALUES (NEWID(), N'admission.field.gp_mobile.label', N'ar', N'جي بي موبايل');
IF EXISTS (SELECT 1 FROM TextTranslation WHERE [Key] = N'admission.field.happiness_scale_matrix.help' AND Locale = N'ar')
    UPDATE TextTranslation SET [Text] = N'تشير الأرقام المنخفضة إلى انخفاض السعادة؛ الأرقام العالية تشير إلى سعادة أكبر.' WHERE [Key] = N'admission.field.happiness_scale_matrix.help' AND Locale = N'ar';
ELSE
    INSERT INTO TextTranslation (Id, [Key], Locale, [Text]) VALUES (NEWID(), N'admission.field.happiness_scale_matrix.help', N'ar', N'تشير الأرقام المنخفضة إلى انخفاض السعادة؛ الأرقام العالية تشير إلى سعادة أكبر.');
IF EXISTS (SELECT 1 FROM TextTranslation WHERE [Key] = N'admission.field.happiness_scale_matrix.label' AND Locale = N'ar')
    UPDATE TextTranslation SET [Text] = N'مصفوفة مقياس السعادة' WHERE [Key] = N'admission.field.happiness_scale_matrix.label' AND Locale = N'ar';
ELSE
    INSERT INTO TextTranslation (Id, [Key], Locale, [Text]) VALUES (NEWID(), N'admission.field.happiness_scale_matrix.label', N'ar', N'مصفوفة مقياس السعادة');
IF EXISTS (SELECT 1 FROM TextTranslation WHERE [Key] = N'admission.field.harm_reduction_advice_given.label' AND Locale = N'ar')
    UPDATE TextTranslation SET [Text] = N'تم تقديم نصيحة للحد من الضرر' WHERE [Key] = N'admission.field.harm_reduction_advice_given.label' AND Locale = N'ar';
ELSE
    INSERT INTO TextTranslation (Id, [Key], Locale, [Text]) VALUES (NEWID(), N'admission.field.harm_reduction_advice_given.label', N'ar', N'تم تقديم نصيحة للحد من الضرر');
IF EXISTS (SELECT 1 FROM TextTranslation WHERE [Key] = N'admission.field.has_solicitor.label' AND Locale = N'ar')
    UPDATE TextTranslation SET [Text] = N'لديه محام' WHERE [Key] = N'admission.field.has_solicitor.label' AND Locale = N'ar';
ELSE
    INSERT INTO TextTranslation (Id, [Key], Locale, [Text]) VALUES (NEWID(), N'admission.field.has_solicitor.label', N'ar', N'لديه محام');
IF EXISTS (SELECT 1 FROM TextTranslation WHERE [Key] = N'admission.field.health_and_safety_details.label' AND Locale = N'ar')
    UPDATE TextTranslation SET [Text] = N'تفاصيل الصحة والسلامة' WHERE [Key] = N'admission.field.health_and_safety_details.label' AND Locale = N'ar';
ELSE
    INSERT INTO TextTranslation (Id, [Key], Locale, [Text]) VALUES (NEWID(), N'admission.field.health_and_safety_details.label', N'ar', N'تفاصيل الصحة والسلامة');
IF EXISTS (SELECT 1 FROM TextTranslation WHERE [Key] = N'admission.field.history_of_abuse.label' AND Locale = N'ar')
    UPDATE TextTranslation SET [Text] = N'تاريخ الاعتداء الجسدي / العقلي / الجنسي' WHERE [Key] = N'admission.field.history_of_abuse.label' AND Locale = N'ar';
ELSE
    INSERT INTO TextTranslation (Id, [Key], Locale, [Text]) VALUES (NEWID(), N'admission.field.history_of_abuse.label', N'ar', N'تاريخ الاعتداء الجسدي / العقلي / الجنسي');
IF EXISTS (SELECT 1 FROM TextTranslation WHERE [Key] = N'admission.field.homeless_before_details.label' AND Locale = N'ar')
    UPDATE TextTranslation SET [Text] = N'بلا مأوى من قبل؟ إعطاء التفاصيل' WHERE [Key] = N'admission.field.homeless_before_details.label' AND Locale = N'ar';
ELSE
    INSERT INTO TextTranslation (Id, [Key], Locale, [Text]) VALUES (NEWID(), N'admission.field.homeless_before_details.label', N'ar', N'بلا مأوى من قبل؟ إعطاء التفاصيل');
IF EXISTS (SELECT 1 FROM TextTranslation WHERE [Key] = N'admission.field.homeless_service_medical_card_number.label' AND Locale = N'ar')
    UPDATE TextTranslation SET [Text] = N'رقم البطاقة الطبية لخدمة المشردين' WHERE [Key] = N'admission.field.homeless_service_medical_card_number.label' AND Locale = N'ar';
ELSE
    INSERT INTO TextTranslation (Id, [Key], Locale, [Text]) VALUES (NEWID(), N'admission.field.homeless_service_medical_card_number.label', N'ar', N'رقم البطاقة الطبية لخدمة المشردين');
IF EXISTS (SELECT 1 FROM TextTranslation WHERE [Key] = N'admission.field.homelessness_reasons.label' AND Locale = N'ar')
    UPDATE TextTranslation SET [Text] = N'الأسباب الرئيسية لتصبح بلا مأوى في هذه المناسبة' WHERE [Key] = N'admission.field.homelessness_reasons.label' AND Locale = N'ar';
ELSE
    INSERT INTO TextTranslation (Id, [Key], Locale, [Text]) VALUES (NEWID(), N'admission.field.homelessness_reasons.label', N'ar', N'الأسباب الرئيسية لتصبح بلا مأوى في هذه المناسبة');
IF EXISTS (SELECT 1 FROM TextTranslation WHERE [Key] = N'admission.field.iv_needles_disposed.label' AND Locale = N'ar')
    UPDATE TextTranslation SET [Text] = N'في حالة استخدام الإبر الوريدية، كيف يتم التخلص منها؟' WHERE [Key] = N'admission.field.iv_needles_disposed.label' AND Locale = N'ar';
ELSE
    INSERT INTO TextTranslation (Id, [Key], Locale, [Text]) VALUES (NEWID(), N'admission.field.iv_needles_disposed.label', N'ar', N'في حالة استخدام الإبر الوريدية، كيف يتم التخلص منها؟');
IF EXISTS (SELECT 1 FROM TextTranslation WHERE [Key] = N'admission.field.iv_needles_obtained.label' AND Locale = N'ar')
    UPDATE TextTranslation SET [Text] = N'في حالة استخدام الإبر الوريدية، كيف يتم الحصول عليها؟' WHERE [Key] = N'admission.field.iv_needles_obtained.label' AND Locale = N'ar';
ELSE
    INSERT INTO TextTranslation (Id, [Key], Locale, [Text]) VALUES (NEWID(), N'admission.field.iv_needles_obtained.label', N'ar', N'في حالة استخدام الإبر الوريدية، كيف يتم الحصول عليها؟');
IF EXISTS (SELECT 1 FROM TextTranslation WHERE [Key] = N'admission.field.justice_details.label' AND Locale = N'ar')
    UPDATE TextTranslation SET [Text] = N'تفاصيل العدالة' WHERE [Key] = N'admission.field.justice_details.label' AND Locale = N'ar';
ELSE
    INSERT INTO TextTranslation (Id, [Key], Locale, [Text]) VALUES (NEWID(), N'admission.field.justice_details.label', N'ar', N'تفاصيل العدالة');
IF EXISTS (SELECT 1 FROM TextTranslation WHERE [Key] = N'admission.field.key_work_other_service_details.label' AND Locale = N'ar')
    UPDATE TextTranslation SET [Text] = N'تفاصيل الخدمة الأخرى للعمل الرئيسي' WHERE [Key] = N'admission.field.key_work_other_service_details.label' AND Locale = N'ar';
ELSE
    INSERT INTO TextTranslation (Id, [Key], Locale, [Text]) VALUES (NEWID(), N'admission.field.key_work_other_service_details.label', N'ar', N'تفاصيل الخدمة الأخرى للعمل الرئيسي');
IF EXISTS (SELECT 1 FROM TextTranslation WHERE [Key] = N'admission.field.knows_barrier_access_points.label' AND Locale = N'ar')
    UPDATE TextTranslation SET [Text] = N'???? ????? ???? ????? ??????? ??????' WHERE [Key] = N'admission.field.knows_barrier_access_points.label' AND Locale = N'ar';
ELSE
    INSERT INTO TextTranslation (Id, [Key], Locale, [Text]) VALUES (NEWID(), N'admission.field.knows_barrier_access_points.label', N'ar', N'???? ????? ???? ????? ??????? ??????');
IF EXISTS (SELECT 1 FROM TextTranslation WHERE [Key] = N'admission.field.language_other_specify.label' AND Locale = N'ar')
    UPDATE TextTranslation SET [Text] = N'إذا كانت الإجابة بنعم، حدد اللغة' WHERE [Key] = N'admission.field.language_other_specify.label' AND Locale = N'ar';
ELSE
    INSERT INTO TextTranslation (Id, [Key], Locale, [Text]) VALUES (NEWID(), N'admission.field.language_other_specify.label', N'ar', N'إذا كانت الإجابة بنعم، حدد اللغة');
IF EXISTS (SELECT 1 FROM TextTranslation WHERE [Key] = N'admission.field.language_other_than_english_or_irish_at_home.label' AND Locale = N'ar')
    UPDATE TextTranslation SET [Text] = N'لغة أخرى غير الإنجليزية أو الأيرلندية في المنزل' WHERE [Key] = N'admission.field.language_other_than_english_or_irish_at_home.label' AND Locale = N'ar';
ELSE
    INSERT INTO TextTranslation (Id, [Key], Locale, [Text]) VALUES (NEWID(), N'admission.field.language_other_than_english_or_irish_at_home.label', N'ar', N'لغة أخرى غير الإنجليزية أو الأيرلندية في المنزل');
IF EXISTS (SELECT 1 FROM TextTranslation WHERE [Key] = N'admission.field.lived_independently.label' AND Locale = N'ar')
    UPDATE TextTranslation SET [Text] = N'عاشت بشكل مستقل من أي وقت مضى' WHERE [Key] = N'admission.field.lived_independently.label' AND Locale = N'ar';
ELSE
    INSERT INTO TextTranslation (Id, [Key], Locale, [Text]) VALUES (NEWID(), N'admission.field.lived_independently.label', N'ar', N'عاشت بشكل مستقل من أي وقت مضى');
IF EXISTS (SELECT 1 FROM TextTranslation WHERE [Key] = N'admission.field.living_where.label' AND Locale = N'ar')
    UPDATE TextTranslation SET [Text] = N'العيش أين' WHERE [Key] = N'admission.field.living_where.label' AND Locale = N'ar';
ELSE
    INSERT INTO TextTranslation (Id, [Key], Locale, [Text]) VALUES (NEWID(), N'admission.field.living_where.label', N'ar', N'العيش أين');
IF EXISTS (SELECT 1 FROM TextTranslation WHERE [Key] = N'admission.field.living_with.label' AND Locale = N'ar')
    UPDATE TextTranslation SET [Text] = N'العيش مع' WHERE [Key] = N'admission.field.living_with.label' AND Locale = N'ar';
ELSE
    INSERT INTO TextTranslation (Id, [Key], Locale, [Text]) VALUES (NEWID(), N'admission.field.living_with.label', N'ar', N'العيش مع');
IF EXISTS (SELECT 1 FROM TextTranslation WHERE [Key] = N'admission.field.living_with_people_using_substances.label' AND Locale = N'ar')
    UPDATE TextTranslation SET [Text] = N'العيش مع أشخاص يتعاطون المواد / المقامرة / أنواع الإدمان الأخرى' WHERE [Key] = N'admission.field.living_with_people_using_substances.label' AND Locale = N'ar';
ELSE
    INSERT INTO TextTranslation (Id, [Key], Locale, [Text]) VALUES (NEWID(), N'admission.field.living_with_people_using_substances.label', N'ar', N'العيش مع أشخاص يتعاطون المواد / المقامرة / أنواع الإدمان الأخرى');
IF EXISTS (SELECT 1 FROM TextTranslation WHERE [Key] = N'admission.field.local_authority_registration.label' AND Locale = N'ar')
    UPDATE TextTranslation SET [Text] = N'مسجل لدى السلطة المحلية؟ تحديد أي' WHERE [Key] = N'admission.field.local_authority_registration.label' AND Locale = N'ar';
ELSE
    INSERT INTO TextTranslation (Id, [Key], Locale, [Text]) VALUES (NEWID(), N'admission.field.local_authority_registration.label', N'ar', N'مسجل لدى السلطة المحلية؟ تحديد أي');
IF EXISTS (SELECT 1 FROM TextTranslation WHERE [Key] = N'admission.field.longest_abstinent_date.label' AND Locale = N'ar')
    UPDATE TextTranslation SET [Text] = N'تاريخ أطول فترة امتناع' WHERE [Key] = N'admission.field.longest_abstinent_date.label' AND Locale = N'ar';
ELSE
    INSERT INTO TextTranslation (Id, [Key], Locale, [Text]) VALUES (NEWID(), N'admission.field.longest_abstinent_date.label', N'ar', N'تاريخ أطول فترة امتناع');
IF EXISTS (SELECT 1 FROM TextTranslation WHERE [Key] = N'admission.field.loved_one_family_worried.label' AND Locale = N'ar')
    UPDATE TextTranslation SET [Text] = N'أحد أفراد أسرته أو الأسرة قلقة / مشبوهة' WHERE [Key] = N'admission.field.loved_one_family_worried.label' AND Locale = N'ar';
ELSE
    INSERT INTO TextTranslation (Id, [Key], Locale, [Text]) VALUES (NEWID(), N'admission.field.loved_one_family_worried.label', N'ar', N'أحد أفراد أسرته أو الأسرة قلقة / مشبوهة');
IF EXISTS (SELECT 1 FROM TextTranslation WHERE [Key] = N'admission.field.main_problem_drug_assessability.label' AND Locale = N'ar')
    UPDATE TextTranslation SET [Text] = N'????? ????? ?????? ???????? ??? ???????' WHERE [Key] = N'admission.field.main_problem_drug_assessability.label' AND Locale = N'ar';
ELSE
    INSERT INTO TextTranslation (Id, [Key], Locale, [Text]) VALUES (NEWID(), N'admission.field.main_problem_drug_assessability.label', N'ar', N'????? ????? ?????? ???????? ??? ???????');
IF EXISTS (SELECT 1 FROM TextTranslation WHERE [Key] = N'admission.field.medical_card_status_detailed.label' AND Locale = N'ar')
    UPDATE TextTranslation SET [Text] = N'حالة البطاقة الطبية' WHERE [Key] = N'admission.field.medical_card_status_detailed.label' AND Locale = N'ar';
ELSE
    INSERT INTO TextTranslation (Id, [Key], Locale, [Text]) VALUES (NEWID(), N'admission.field.medical_card_status_detailed.label', N'ar', N'حالة البطاقة الطبية');
IF EXISTS (SELECT 1 FROM TextTranslation WHERE [Key] = N'admission.field.medical_card_valid_until.label' AND Locale = N'ar')
    UPDATE TextTranslation SET [Text] = N'البطاقة الطبية صالحة حتى' WHERE [Key] = N'admission.field.medical_card_valid_until.label' AND Locale = N'ar';
ELSE
    INSERT INTO TextTranslation (Id, [Key], Locale, [Text]) VALUES (NEWID(), N'admission.field.medical_card_valid_until.label', N'ar', N'البطاقة الطبية صالحة حتى');
IF EXISTS (SELECT 1 FROM TextTranslation WHERE [Key] = N'admission.field.mental_health_consent_shared_record.label' AND Locale = N'ar')
    UPDATE TextTranslation SET [Text] = N'موافقة السجل المشترك للصحة العقلية' WHERE [Key] = N'admission.field.mental_health_consent_shared_record.label' AND Locale = N'ar';
ELSE
    INSERT INTO TextTranslation (Id, [Key], Locale, [Text]) VALUES (NEWID(), N'admission.field.mental_health_consent_shared_record.label', N'ar', N'موافقة السجل المشترك للصحة العقلية');
IF EXISTS (SELECT 1 FROM TextTranslation WHERE [Key] = N'admission.field.mobile_number.label' AND Locale = N'ar')
    UPDATE TextTranslation SET [Text] = N'رقم الهاتف المحمول' WHERE [Key] = N'admission.field.mobile_number.label' AND Locale = N'ar';
ELSE
    INSERT INTO TextTranslation (Id, [Key], Locale, [Text]) VALUES (NEWID(), N'admission.field.mobile_number.label', N'ar', N'رقم الهاتف المحمول');
IF EXISTS (SELECT 1 FROM TextTranslation WHERE [Key] = N'admission.field.most_recent_address.label' AND Locale = N'ar')
    UPDATE TextTranslation SET [Text] = N'أحدث عنوان' WHERE [Key] = N'admission.field.most_recent_address.label' AND Locale = N'ar';
ELSE
    INSERT INTO TextTranslation (Id, [Key], Locale, [Text]) VALUES (NEWID(), N'admission.field.most_recent_address.label', N'ar', N'أحدث عنوان');
IF EXISTS (SELECT 1 FROM TextTranslation WHERE [Key] = N'admission.field.national_screening_interest.label' AND Locale = N'ar')
    UPDATE TextTranslation SET [Text] = N'أرغب في الوصول إلى خدمة الفحص الوطنية' WHERE [Key] = N'admission.field.national_screening_interest.label' AND Locale = N'ar';
ELSE
    INSERT INTO TextTranslation (Id, [Key], Locale, [Text]) VALUES (NEWID(), N'admission.field.national_screening_interest.label', N'ar', N'أرغب في الوصول إلى خدمة الفحص الوطنية');
IF EXISTS (SELECT 1 FROM TextTranslation WHERE [Key] = N'admission.field.national_waiting_list_consent.label' AND Locale = N'ar')
    UPDATE TextTranslation SET [Text] = N'الموافقة على قائمة الانتظار الوطنية' WHERE [Key] = N'admission.field.national_waiting_list_consent.label' AND Locale = N'ar';
ELSE
    INSERT INTO TextTranslation (Id, [Key], Locale, [Text]) VALUES (NEWID(), N'admission.field.national_waiting_list_consent.label', N'ar', N'الموافقة على قائمة الانتظار الوطنية');
IF EXISTS (SELECT 1 FROM TextTranslation WHERE [Key] = N'admission.field.nationality.label' AND Locale = N'ar')
    UPDATE TextTranslation SET [Text] = N'جنسية' WHERE [Key] = N'admission.field.nationality.label' AND Locale = N'ar';
ELSE
    INSERT INTO TextTranslation (Id, [Key], Locale, [Text]) VALUES (NEWID(), N'admission.field.nationality.label', N'ar', N'جنسية');
IF EXISTS (SELECT 1 FROM TextTranslation WHERE [Key] = N'admission.field.next_of_kin_aware_current_problems.label' AND Locale = N'ar')
    UPDATE TextTranslation SET [Text] = N'أقرب الأقارب على علم بالمشاكل الحالية' WHERE [Key] = N'admission.field.next_of_kin_aware_current_problems.label' AND Locale = N'ar';
ELSE
    INSERT INTO TextTranslation (Id, [Key], Locale, [Text]) VALUES (NEWID(), N'admission.field.next_of_kin_aware_current_problems.label', N'ar', N'أقرب الأقارب على علم بالمشاكل الحالية');
IF EXISTS (SELECT 1 FROM TextTranslation WHERE [Key] = N'admission.field.next_of_kin_contact_details.label' AND Locale = N'ar')
    UPDATE TextTranslation SET [Text] = N'تفاصيل الاتصال بأقرب الأقارب' WHERE [Key] = N'admission.field.next_of_kin_contact_details.label' AND Locale = N'ar';
ELSE
    INSERT INTO TextTranslation (Id, [Key], Locale, [Text]) VALUES (NEWID(), N'admission.field.next_of_kin_contact_details.label', N'ar', N'تفاصيل الاتصال بأقرب الأقارب');
IF EXISTS (SELECT 1 FROM TextTranslation WHERE [Key] = N'admission.field.next_of_kin_details.label' AND Locale = N'ar')
    UPDATE TextTranslation SET [Text] = N'تفاصيل أقرباء' WHERE [Key] = N'admission.field.next_of_kin_details.label' AND Locale = N'ar';
ELSE
    INSERT INTO TextTranslation (Id, [Key], Locale, [Text]) VALUES (NEWID(), N'admission.field.next_of_kin_details.label', N'ar', N'تفاصيل أقرباء');
IF EXISTS (SELECT 1 FROM TextTranslation WHERE [Key] = N'admission.field.next_of_kin_name.label' AND Locale = N'ar')
    UPDATE TextTranslation SET [Text] = N'اسم الأقرباء' WHERE [Key] = N'admission.field.next_of_kin_name.label' AND Locale = N'ar';
ELSE
    INSERT INTO TextTranslation (Id, [Key], Locale, [Text]) VALUES (NEWID(), N'admission.field.next_of_kin_name.label', N'ar', N'اسم الأقرباء');
IF EXISTS (SELECT 1 FROM TextTranslation WHERE [Key] = N'admission.field.next_of_kin_relationship.label' AND Locale = N'ar')
    UPDATE TextTranslation SET [Text] = N'التالي من علاقة الأقارب' WHERE [Key] = N'admission.field.next_of_kin_relationship.label' AND Locale = N'ar';
ELSE
    INSERT INTO TextTranslation (Id, [Key], Locale, [Text]) VALUES (NEWID(), N'admission.field.next_of_kin_relationship.label', N'ar', N'التالي من علاقة الأقارب');
IF EXISTS (SELECT 1 FROM TextTranslation WHERE [Key] = N'admission.field.occupation.label' AND Locale = N'ar')
    UPDATE TextTranslation SET [Text] = N'إشغال' WHERE [Key] = N'admission.field.occupation.label' AND Locale = N'ar';
ELSE
    INSERT INTO TextTranslation (Id, [Key], Locale, [Text]) VALUES (NEWID(), N'admission.field.occupation.label', N'ar', N'إشغال');
IF EXISTS (SELECT 1 FROM TextTranslation WHERE [Key] = N'admission.field.other_harm_reduction_details.label' AND Locale = N'ar')
    UPDATE TextTranslation SET [Text] = N'تفاصيل أخرى للحد من الأضرار' WHERE [Key] = N'admission.field.other_harm_reduction_details.label' AND Locale = N'ar';
ELSE
    INSERT INTO TextTranslation (Id, [Key], Locale, [Text]) VALUES (NEWID(), N'admission.field.other_harm_reduction_details.label', N'ar', N'تفاصيل أخرى للحد من الأضرار');
IF EXISTS (SELECT 1 FROM TextTranslation WHERE [Key] = N'admission.field.pass_database_consent.label' AND Locale = N'ar')
    UPDATE TextTranslation SET [Text] = N'الموافقة على قاعدة بيانات PASS' WHERE [Key] = N'admission.field.pass_database_consent.label' AND Locale = N'ar';
ELSE
    INSERT INTO TextTranslation (Id, [Key], Locale, [Text]) VALUES (NEWID(), N'admission.field.pass_database_consent.label', N'ar', N'الموافقة على قاعدة بيانات PASS');
IF EXISTS (SELECT 1 FROM TextTranslation WHERE [Key] = N'admission.field.pending_court_cases.label' AND Locale = N'ar')
    UPDATE TextTranslation SET [Text] = N'قضايا المحكمة المعلقة' WHERE [Key] = N'admission.field.pending_court_cases.label' AND Locale = N'ar';
ELSE
    INSERT INTO TextTranslation (Id, [Key], Locale, [Text]) VALUES (NEWID(), N'admission.field.pending_court_cases.label', N'ar', N'قضايا المحكمة المعلقة');
IF EXISTS (SELECT 1 FROM TextTranslation WHERE [Key] = N'admission.field.physical_health_details.label' AND Locale = N'ar')
    UPDATE TextTranslation SET [Text] = N'تفاصيل الصحة البدنية' WHERE [Key] = N'admission.field.physical_health_details.label' AND Locale = N'ar';
ELSE
    INSERT INTO TextTranslation (Id, [Key], Locale, [Text]) VALUES (NEWID(), N'admission.field.physical_health_details.label', N'ar', N'تفاصيل الصحة البدنية');
IF EXISTS (SELECT 1 FROM TextTranslation WHERE [Key] = N'admission.field.preferred_language.label' AND Locale = N'ar')
    UPDATE TextTranslation SET [Text] = N'اللغة المفضلة للعمل بها' WHERE [Key] = N'admission.field.preferred_language.label' AND Locale = N'ar';
ELSE
    INSERT INTO TextTranslation (Id, [Key], Locale, [Text]) VALUES (NEWID(), N'admission.field.preferred_language.label', N'ar', N'اللغة المفضلة للعمل بها');
IF EXISTS (SELECT 1 FROM TextTranslation WHERE [Key] = N'admission.field.previous_methadone_maintenance.label' AND Locale = N'ar')
    UPDATE TextTranslation SET [Text] = N'صيانة الميثادون السابقة' WHERE [Key] = N'admission.field.previous_methadone_maintenance.label' AND Locale = N'ar';
ELSE
    INSERT INTO TextTranslation (Id, [Key], Locale, [Text]) VALUES (NEWID(), N'admission.field.previous_methadone_maintenance.label', N'ar', N'صيانة الميثادون السابقة');
IF EXISTS (SELECT 1 FROM TextTranslation WHERE [Key] = N'admission.field.probation_service_engagement.label' AND Locale = N'ar')
    UPDATE TextTranslation SET [Text] = N'تشارك في خدمات المراقبة' WHERE [Key] = N'admission.field.probation_service_engagement.label' AND Locale = N'ar';
ELSE
    INSERT INTO TextTranslation (Id, [Key], Locale, [Text]) VALUES (NEWID(), N'admission.field.probation_service_engagement.label', N'ar', N'تشارك في خدمات المراقبة');
IF EXISTS (SELECT 1 FROM TextTranslation WHERE [Key] = N'admission.field.referral_date.label' AND Locale = N'ar')
    UPDATE TextTranslation SET [Text] = N'تاريخ الإحالة' WHERE [Key] = N'admission.field.referral_date.label' AND Locale = N'ar';
ELSE
    INSERT INTO TextTranslation (Id, [Key], Locale, [Text]) VALUES (NEWID(), N'admission.field.referral_date.label', N'ar', N'تاريخ الإحالة');
IF EXISTS (SELECT 1 FROM TextTranslation WHERE [Key] = N'admission.field.referral_other_details.label' AND Locale = N'ar')
    UPDATE TextTranslation SET [Text] = N'في حالة تحديد أخرى، قم بإعطاء التفاصيل' WHERE [Key] = N'admission.field.referral_other_details.label' AND Locale = N'ar';
ELSE
    INSERT INTO TextTranslation (Id, [Key], Locale, [Text]) VALUES (NEWID(), N'admission.field.referral_other_details.label', N'ar', N'في حالة تحديد أخرى، قم بإعطاء التفاصيل');
IF EXISTS (SELECT 1 FROM TextTranslation WHERE [Key] = N'admission.field.referral_reason.label' AND Locale = N'ar')
    UPDATE TextTranslation SET [Text] = N'السبب الرئيسي للإحالة / الوصول إلى الخدمة' WHERE [Key] = N'admission.field.referral_reason.label' AND Locale = N'ar';
ELSE
    INSERT INTO TextTranslation (Id, [Key], Locale, [Text]) VALUES (NEWID(), N'admission.field.referral_reason.label', N'ar', N'السبب الرئيسي للإحالة / الوصول إلى الخدمة');
IF EXISTS (SELECT 1 FROM TextTranslation WHERE [Key] = N'admission.field.referral_reference_number.label' AND Locale = N'ar')
    UPDATE TextTranslation SET [Text] = N'الرقم المرجعي للإحالة' WHERE [Key] = N'admission.field.referral_reference_number.label' AND Locale = N'ar';
ELSE
    INSERT INTO TextTranslation (Id, [Key], Locale, [Text]) VALUES (NEWID(), N'admission.field.referral_reference_number.label', N'ar', N'الرقم المرجعي للإحالة');
IF EXISTS (SELECT 1 FROM TextTranslation WHERE [Key] = N'admission.field.rent_arrears_local_authority.label' AND Locale = N'ar')
    UPDATE TextTranslation SET [Text] = N'متأخرات الإيجار لدى السلطة المحلية' WHERE [Key] = N'admission.field.rent_arrears_local_authority.label' AND Locale = N'ar';
ELSE
    INSERT INTO TextTranslation (Id, [Key], Locale, [Text]) VALUES (NEWID(), N'admission.field.rent_arrears_local_authority.label', N'ar', N'متأخرات الإيجار لدى السلطة المحلية');
IF EXISTS (SELECT 1 FROM TextTranslation WHERE [Key] = N'admission.field.risk_behaviour_history.label' AND Locale = N'ar')
    UPDATE TextTranslation SET [Text] = N'تاريخ السلوك الخطر' WHERE [Key] = N'admission.field.risk_behaviour_history.label' AND Locale = N'ar';
ELSE
    INSERT INTO TextTranslation (Id, [Key], Locale, [Text]) VALUES (NEWID(), N'admission.field.risk_behaviour_history.label', N'ar', N'تاريخ السلوك الخطر');
IF EXISTS (SELECT 1 FROM TextTranslation WHERE [Key] = N'admission.field.self_defined_sexual_orientation.label' AND Locale = N'ar')
    UPDATE TextTranslation SET [Text] = N'التوجه الجنسي المحدد ذاتيا' WHERE [Key] = N'admission.field.self_defined_sexual_orientation.label' AND Locale = N'ar';
ELSE
    INSERT INTO TextTranslation (Id, [Key], Locale, [Text]) VALUES (NEWID(), N'admission.field.self_defined_sexual_orientation.label', N'ar', N'التوجه الجنسي المحدد ذاتيا');
IF EXISTS (SELECT 1 FROM TextTranslation WHERE [Key] = N'admission.field.self_help_support_group_attendance.label' AND Locale = N'ar')
    UPDATE TextTranslation SET [Text] = N'???? ??????? ????? ?????? ??? AA ?? NA ?? ?????' WHERE [Key] = N'admission.field.self_help_support_group_attendance.label' AND Locale = N'ar';
ELSE
    INSERT INTO TextTranslation (Id, [Key], Locale, [Text]) VALUES (NEWID(), N'admission.field.self_help_support_group_attendance.label', N'ar', N'???? ??????? ????? ?????? ??? AA ?? NA ?? ?????');
IF EXISTS (SELECT 1 FROM TextTranslation WHERE [Key] = N'admission.field.service_user_signature.label' AND Locale = N'ar')
    UPDATE TextTranslation SET [Text] = N'توقيع مستخدم الخدمة' WHERE [Key] = N'admission.field.service_user_signature.label' AND Locale = N'ar';
ELSE
    INSERT INTO TextTranslation (Id, [Key], Locale, [Text]) VALUES (NEWID(), N'admission.field.service_user_signature.label', N'ar', N'توقيع مستخدم الخدمة');
IF EXISTS (SELECT 1 FROM TextTranslation WHERE [Key] = N'admission.field.sexual_health_concerns.label' AND Locale = N'ar')
    UPDATE TextTranslation SET [Text] = N'مخاوف بشأن الصحة الجنسية والرفاهية' WHERE [Key] = N'admission.field.sexual_health_concerns.label' AND Locale = N'ar';
ELSE
    INSERT INTO TextTranslation (Id, [Key], Locale, [Text]) VALUES (NEWID(), N'admission.field.sexual_health_concerns.label', N'ar', N'مخاوف بشأن الصحة الجنسية والرفاهية');
IF EXISTS (SELECT 1 FROM TextTranslation WHERE [Key] = N'admission.field.sexual_wellbeing_details.label' AND Locale = N'ar')
    UPDATE TextTranslation SET [Text] = N'تفاصيل الرفاهية الجنسية' WHERE [Key] = N'admission.field.sexual_wellbeing_details.label' AND Locale = N'ar';
ELSE
    INSERT INTO TextTranslation (Id, [Key], Locale, [Text]) VALUES (NEWID(), N'admission.field.sexual_wellbeing_details.label', N'ar', N'تفاصيل الرفاهية الجنسية');
IF EXISTS (SELECT 1 FROM TextTranslation WHERE [Key] = N'admission.field.slept_rough_details.label' AND Locale = N'ar')
    UPDATE TextTranslation SET [Text] = N'ينام الخام؟ متى وإلى متى' WHERE [Key] = N'admission.field.slept_rough_details.label' AND Locale = N'ar';
ELSE
    INSERT INTO TextTranslation (Id, [Key], Locale, [Text]) VALUES (NEWID(), N'admission.field.slept_rough_details.label', N'ar', N'ينام الخام؟ متى وإلى متى');
IF EXISTS (SELECT 1 FROM TextTranslation WHERE [Key] = N'admission.field.social_worker_details.label' AND Locale = N'ar')
    UPDATE TextTranslation SET [Text] = N'تفاصيل الأخصائي الاجتماعي' WHERE [Key] = N'admission.field.social_worker_details.label' AND Locale = N'ar';
ELSE
    INSERT INTO TextTranslation (Id, [Key], Locale, [Text]) VALUES (NEWID(), N'admission.field.social_worker_details.label', N'ar', N'تفاصيل الأخصائي الاجتماعي');
IF EXISTS (SELECT 1 FROM TextTranslation WHERE [Key] = N'admission.field.source_of_income.label' AND Locale = N'ar')
    UPDATE TextTranslation SET [Text] = N'مصدر الدخل' WHERE [Key] = N'admission.field.source_of_income.label' AND Locale = N'ar';
ELSE
    INSERT INTO TextTranslation (Id, [Key], Locale, [Text]) VALUES (NEWID(), N'admission.field.source_of_income.label', N'ar', N'مصدر الدخل');
IF EXISTS (SELECT 1 FROM TextTranslation WHERE [Key] = N'admission.field.staff_signature.label' AND Locale = N'ar')
    UPDATE TextTranslation SET [Text] = N'توقيع الموظفين' WHERE [Key] = N'admission.field.staff_signature.label' AND Locale = N'ar';
ELSE
    INSERT INTO TextTranslation (Id, [Key], Locale, [Text]) VALUES (NEWID(), N'admission.field.staff_signature.label', N'ar', N'توقيع الموظفين');
IF EXISTS (SELECT 1 FROM TextTranslation WHERE [Key] = N'admission.field.state_care_under_18.label' AND Locale = N'ar')
    UPDATE TextTranslation SET [Text] = N'من أي وقت مضى في رعاية الدولة تحت سن 18 عامًا' WHERE [Key] = N'admission.field.state_care_under_18.label' AND Locale = N'ar';
ELSE
    INSERT INTO TextTranslation (Id, [Key], Locale, [Text]) VALUES (NEWID(), N'admission.field.state_care_under_18.label', N'ar', N'من أي وقت مضى في رعاية الدولة تحت سن 18 عامًا');
IF EXISTS (SELECT 1 FROM TextTranslation WHERE [Key] = N'admission.field.sti_screening_history.label' AND Locale = N'ar')
    UPDATE TextTranslation SET [Text] = N'تاريخ فحص/اختبار الأمراض المنقولة بالاتصال الجنسي' WHERE [Key] = N'admission.field.sti_screening_history.label' AND Locale = N'ar';
ELSE
    INSERT INTO TextTranslation (Id, [Key], Locale, [Text]) VALUES (NEWID(), N'admission.field.sti_screening_history.label', N'ar', N'تاريخ فحص/اختبار الأمراض المنقولة بالاتصال الجنسي');
IF EXISTS (SELECT 1 FROM TextTranslation WHERE [Key] = N'admission.field.substance_problem_overview.help' AND Locale = N'ar')
    UPDATE TextTranslation SET [Text] = N'التقط سياقًا أوسع لاستخدام المواد بما في ذلك تاريخ المقامرة واضطرابات الأكل حيثما كان ذلك مناسبًا.' WHERE [Key] = N'admission.field.substance_problem_overview.help' AND Locale = N'ar';
ELSE
    INSERT INTO TextTranslation (Id, [Key], Locale, [Text]) VALUES (NEWID(), N'admission.field.substance_problem_overview.help', N'ar', N'التقط سياقًا أوسع لاستخدام المواد بما في ذلك تاريخ المقامرة واضطرابات الأكل حيثما كان ذلك مناسبًا.');
IF EXISTS (SELECT 1 FROM TextTranslation WHERE [Key] = N'admission.field.substance_problem_overview.label' AND Locale = N'ar')
    UPDATE TextTranslation SET [Text] = N'استخدام المواد المخدرة / القمار / نظرة عامة على اضطرابات الأكل' WHERE [Key] = N'admission.field.substance_problem_overview.label' AND Locale = N'ar';
ELSE
    INSERT INTO TextTranslation (Id, [Key], Locale, [Text]) VALUES (NEWID(), N'admission.field.substance_problem_overview.label', N'ar', N'استخدام المواد المخدرة / القمار / نظرة عامة على اضطرابات الأكل');
IF EXISTS (SELECT 1 FROM TextTranslation WHERE [Key] = N'admission.field.supervised_alcohol_detox_count.label' AND Locale = N'ar')
    UPDATE TextTranslation SET [Text] = N'عدد السموم الكحولية السابق الخاضع للإشراف الطبي' WHERE [Key] = N'admission.field.supervised_alcohol_detox_count.label' AND Locale = N'ar';
ELSE
    INSERT INTO TextTranslation (Id, [Key], Locale, [Text]) VALUES (NEWID(), N'admission.field.supervised_alcohol_detox_count.label', N'ar', N'عدد السموم الكحولية السابق الخاضع للإشراف الطبي');
IF EXISTS (SELECT 1 FROM TextTranslation WHERE [Key] = N'admission.field.treatment_medication_details.label' AND Locale = N'ar')
    UPDATE TextTranslation SET [Text] = N'تفاصيل العلاج / الدواء' WHERE [Key] = N'admission.field.treatment_medication_details.label' AND Locale = N'ar';
ELSE
    INSERT INTO TextTranslation (Id, [Key], Locale, [Text]) VALUES (NEWID(), N'admission.field.treatment_medication_details.label', N'ar', N'تفاصيل العلاج / الدواء');
IF EXISTS (SELECT 1 FROM TextTranslation WHERE [Key] = N'admission.field.treatment_types.label' AND Locale = N'ar')
    UPDATE TextTranslation SET [Text] = N'نوع (أنواع) العلاج' WHERE [Key] = N'admission.field.treatment_types.label' AND Locale = N'ar';
ELSE
    INSERT INTO TextTranslation (Id, [Key], Locale, [Text]) VALUES (NEWID(), N'admission.field.treatment_types.label', N'ar', N'نوع (أنواع) العلاج');
IF EXISTS (SELECT 1 FROM TextTranslation WHERE [Key] = N'admission.field.uses_condoms_or_barriers.label' AND Locale = N'ar')
    UPDATE TextTranslation SET [Text] = N'يستخدم الواقي الذكري أو الحواجز المادية الأخرى' WHERE [Key] = N'admission.field.uses_condoms_or_barriers.label' AND Locale = N'ar';
ELSE
    INSERT INTO TextTranslation (Id, [Key], Locale, [Text]) VALUES (NEWID(), N'admission.field.uses_condoms_or_barriers.label', N'ar', N'يستخدم الواقي الذكري أو الحواجز المادية الأخرى');
IF EXISTS (SELECT 1 FROM TextTranslation WHERE [Key] = N'admission.field.work_days.label' AND Locale = N'ar')
    UPDATE TextTranslation SET [Text] = N'ما هي الأيام التي تعمل فيها' WHERE [Key] = N'admission.field.work_days.label' AND Locale = N'ar';
ELSE
    INSERT INTO TextTranslation (Id, [Key], Locale, [Text]) VALUES (NEWID(), N'admission.field.work_days.label', N'ar', N'ما هي الأيام التي تعمل فيها');
IF EXISTS (SELECT 1 FROM TextTranslation WHERE [Key] = N'admission.field.work_hours.label' AND Locale = N'ar')
    UPDATE TextTranslation SET [Text] = N'ما هي ساعات العمل؟' WHERE [Key] = N'admission.field.work_hours.label' AND Locale = N'ar';
ELSE
    INSERT INTO TextTranslation (Id, [Key], Locale, [Text]) VALUES (NEWID(), N'admission.field.work_hours.label', N'ar', N'ما هي ساعات العمل؟');
IF EXISTS (SELECT 1 FROM TextTranslation WHERE [Key] = N'admission.option.alcohol_use_history_table.alcopops' AND Locale = N'ar')
    UPDATE TextTranslation SET [Text] = N'الكوبوبس' WHERE [Key] = N'admission.option.alcohol_use_history_table.alcopops' AND Locale = N'ar';
ELSE
    INSERT INTO TextTranslation (Id, [Key], Locale, [Text]) VALUES (NEWID(), N'admission.option.alcohol_use_history_table.alcopops', N'ar', N'الكوبوبس');
IF EXISTS (SELECT 1 FROM TextTranslation WHERE [Key] = N'admission.option.alcohol_use_history_table.beer' AND Locale = N'ar')
    UPDATE TextTranslation SET [Text] = N'جعة' WHERE [Key] = N'admission.option.alcohol_use_history_table.beer' AND Locale = N'ar';
ELSE
    INSERT INTO TextTranslation (Id, [Key], Locale, [Text]) VALUES (NEWID(), N'admission.option.alcohol_use_history_table.beer', N'ar', N'جعة');
IF EXISTS (SELECT 1 FROM TextTranslation WHERE [Key] = N'admission.option.alcohol_use_history_table.cider' AND Locale = N'ar')
    UPDATE TextTranslation SET [Text] = N'عصير التفاح' WHERE [Key] = N'admission.option.alcohol_use_history_table.cider' AND Locale = N'ar';
ELSE
    INSERT INTO TextTranslation (Id, [Key], Locale, [Text]) VALUES (NEWID(), N'admission.option.alcohol_use_history_table.cider', N'ar', N'عصير التفاح');
IF EXISTS (SELECT 1 FROM TextTranslation WHERE [Key] = N'admission.option.alcohol_use_history_table.fortified_wine' AND Locale = N'ar')
    UPDATE TextTranslation SET [Text] = N'النبيذ المدعم' WHERE [Key] = N'admission.option.alcohol_use_history_table.fortified_wine' AND Locale = N'ar';
ELSE
    INSERT INTO TextTranslation (Id, [Key], Locale, [Text]) VALUES (NEWID(), N'admission.option.alcohol_use_history_table.fortified_wine', N'ar', N'النبيذ المدعم');
IF EXISTS (SELECT 1 FROM TextTranslation WHERE [Key] = N'admission.option.alcohol_use_history_table.others' AND Locale = N'ar')
    UPDATE TextTranslation SET [Text] = N'آحرون' WHERE [Key] = N'admission.option.alcohol_use_history_table.others' AND Locale = N'ar';
ELSE
    INSERT INTO TextTranslation (Id, [Key], Locale, [Text]) VALUES (NEWID(), N'admission.option.alcohol_use_history_table.others', N'ar', N'آحرون');
IF EXISTS (SELECT 1 FROM TextTranslation WHERE [Key] = N'admission.option.alcohol_use_history_table.spirits' AND Locale = N'ar')
    UPDATE TextTranslation SET [Text] = N'المشروبات الروحية' WHERE [Key] = N'admission.option.alcohol_use_history_table.spirits' AND Locale = N'ar';
ELSE
    INSERT INTO TextTranslation (Id, [Key], Locale, [Text]) VALUES (NEWID(), N'admission.option.alcohol_use_history_table.spirits', N'ar', N'المشروبات الروحية');
IF EXISTS (SELECT 1 FROM TextTranslation WHERE [Key] = N'admission.option.alcohol_use_history_table.wine' AND Locale = N'ar')
    UPDATE TextTranslation SET [Text] = N'خمر' WHERE [Key] = N'admission.option.alcohol_use_history_table.wine' AND Locale = N'ar';
ELSE
    INSERT INTO TextTranslation (Id, [Key], Locale, [Text]) VALUES (NEWID(), N'admission.option.alcohol_use_history_table.wine', N'ar', N'خمر');
IF EXISTS (SELECT 1 FROM TextTranslation WHERE [Key] = N'admission.option.assessment_checklist.circumstances_changed' AND Locale = N'ar')
    UPDATE TextTranslation SET [Text] = N'?? ????? ???? ????? ??????? ??? ???? ??? ?????? ??? ???????' WHERE [Key] = N'admission.option.assessment_checklist.circumstances_changed' AND Locale = N'ar';
ELSE
    INSERT INTO TextTranslation (Id, [Key], Locale, [Text]) VALUES (NEWID(), N'admission.option.assessment_checklist.circumstances_changed', N'ar', N'?? ????? ???? ????? ??????? ??? ???? ??? ?????? ??? ???????');
IF EXISTS (SELECT 1 FROM TextTranslation WHERE [Key] = N'admission.option.assessment_checklist.consent_explained' AND Locale = N'ar')
    UPDATE TextTranslation SET [Text] = N'شرح الموافقة والسرية' WHERE [Key] = N'admission.option.assessment_checklist.consent_explained' AND Locale = N'ar';
ELSE
    INSERT INTO TextTranslation (Id, [Key], Locale, [Text]) VALUES (NEWID(), N'admission.option.assessment_checklist.consent_explained', N'ar', N'شرح الموافقة والسرية');
IF EXISTS (SELECT 1 FROM TextTranslation WHERE [Key] = N'admission.option.assessment_checklist.consent_signed_understood' AND Locale = N'ar')
    UPDATE TextTranslation SET [Text] = N'موافقة موقعة ومفهومة من قبل مستخدم الخدمة' WHERE [Key] = N'admission.option.assessment_checklist.consent_signed_understood' AND Locale = N'ar';
ELSE
    INSERT INTO TextTranslation (Id, [Key], Locale, [Text]) VALUES (NEWID(), N'admission.option.assessment_checklist.consent_signed_understood', N'ar', N'موافقة موقعة ومفهومة من قبل مستخدم الخدمة');
IF EXISTS (SELECT 1 FROM TextTranslation WHERE [Key] = N'admission.option.assessment_checklist.initial_care_plan_agreed' AND Locale = N'ar')
    UPDATE TextTranslation SET [Text] = N'تم تطوير خطة الرعاية الأولية والاتفاق عليها مع مستخدم الخدمة بناءً على التقييم' WHERE [Key] = N'admission.option.assessment_checklist.initial_care_plan_agreed' AND Locale = N'ar';
ELSE
    INSERT INTO TextTranslation (Id, [Key], Locale, [Text]) VALUES (NEWID(), N'admission.option.assessment_checklist.initial_care_plan_agreed', N'ar', N'تم تطوير خطة الرعاية الأولية والاتفاق عليها مع مستخدم الخدمة بناءً على التقييم');
IF EXISTS (SELECT 1 FROM TextTranslation WHERE [Key] = N'admission.option.assessment_checklist.new_treatment_episode' AND Locale = N'ar')
    UPDATE TextTranslation SET [Text] = N'هل هذه حلقة علاجية جديدة؟' WHERE [Key] = N'admission.option.assessment_checklist.new_treatment_episode' AND Locale = N'ar';
ELSE
    INSERT INTO TextTranslation (Id, [Key], Locale, [Text]) VALUES (NEWID(), N'admission.option.assessment_checklist.new_treatment_episode', N'ar', N'هل هذه حلقة علاجية جديدة؟');
IF EXISTS (SELECT 1 FROM TextTranslation WHERE [Key] = N'admission.option.assessor_actions_required.child_protection_referral' AND Locale = N'ar')
    UPDATE TextTranslation SET [Text] = N'الأطفال أولاً / حماية الطفل / إحالة العمل الاجتماعي' WHERE [Key] = N'admission.option.assessor_actions_required.child_protection_referral' AND Locale = N'ar';
ELSE
    INSERT INTO TextTranslation (Id, [Key], Locale, [Text]) VALUES (NEWID(), N'admission.option.assessor_actions_required.child_protection_referral', N'ar', N'الأطفال أولاً / حماية الطفل / إحالة العمل الاجتماعي');
IF EXISTS (SELECT 1 FROM TextTranslation WHERE [Key] = N'admission.option.assessor_actions_required.homeless_action_team' AND Locale = N'ar')
    UPDATE TextTranslation SET [Text] = N'????? ??? ???? ????? ?????? ???????' WHERE [Key] = N'admission.option.assessor_actions_required.homeless_action_team' AND Locale = N'ar';
ELSE
    INSERT INTO TextTranslation (Id, [Key], Locale, [Text]) VALUES (NEWID(), N'admission.option.assessor_actions_required.homeless_action_team', N'ar', N'????? ??? ???? ????? ?????? ???????');
IF EXISTS (SELECT 1 FROM TextTranslation WHERE [Key] = N'admission.option.assessor_actions_required.key_work_other_service' AND Locale = N'ar')
    UPDATE TextTranslation SET [Text] = N'???????? ?? ??? ????? ?? ???? ???? ???' WHERE [Key] = N'admission.option.assessor_actions_required.key_work_other_service' AND Locale = N'ar';
ELSE
    INSERT INTO TextTranslation (Id, [Key], Locale, [Text]) VALUES (NEWID(), N'admission.option.assessor_actions_required.key_work_other_service', N'ar', N'???????? ?? ??? ????? ?? ???? ???? ???');
IF EXISTS (SELECT 1 FROM TextTranslation WHERE [Key] = N'admission.option.assessor_actions_required.medical_assessment' AND Locale = N'ar')
    UPDATE TextTranslation SET [Text] = N'التقييم الطبي' WHERE [Key] = N'admission.option.assessor_actions_required.medical_assessment' AND Locale = N'ar';
ELSE
    INSERT INTO TextTranslation (Id, [Key], Locale, [Text]) VALUES (NEWID(), N'admission.option.assessor_actions_required.medical_assessment', N'ar', N'التقييم الطبي');
IF EXISTS (SELECT 1 FROM TextTranslation WHERE [Key] = N'admission.option.assessor_actions_required.multi_agency_meeting' AND Locale = N'ar')
    UPDATE TextTranslation SET [Text] = N'اجتماع أو مراجعة متعددة الوكالات' WHERE [Key] = N'admission.option.assessor_actions_required.multi_agency_meeting' AND Locale = N'ar';
ELSE
    INSERT INTO TextTranslation (Id, [Key], Locale, [Text]) VALUES (NEWID(), N'admission.option.assessor_actions_required.multi_agency_meeting', N'ar', N'اجتماع أو مراجعة متعددة الوكالات');
IF EXISTS (SELECT 1 FROM TextTranslation WHERE [Key] = N'admission.option.assessor_actions_required.opiate_substitution_protocols' AND Locale = N'ar')
    UPDATE TextTranslation SET [Text] = N'التقدم نحو بروتوكولات استبدال المواد الأفيونية' WHERE [Key] = N'admission.option.assessor_actions_required.opiate_substitution_protocols' AND Locale = N'ar';
ELSE
    INSERT INTO TextTranslation (Id, [Key], Locale, [Text]) VALUES (NEWID(), N'admission.option.assessor_actions_required.opiate_substitution_protocols', N'ar', N'التقدم نحو بروتوكولات استبدال المواد الأفيونية');
IF EXISTS (SELECT 1 FROM TextTranslation WHERE [Key] = N'admission.option.assessor_actions_required.other_action' AND Locale = N'ar')
    UPDATE TextTranslation SET [Text] = N'إجراءات أخرى (مثل الإدراج في قائمة الانتظار)' WHERE [Key] = N'admission.option.assessor_actions_required.other_action' AND Locale = N'ar';
ELSE
    INSERT INTO TextTranslation (Id, [Key], Locale, [Text]) VALUES (NEWID(), N'admission.option.assessor_actions_required.other_action', N'ar', N'إجراءات أخرى (مثل الإدراج في قائمة الانتظار)');
IF EXISTS (SELECT 1 FROM TextTranslation WHERE [Key] = N'admission.option.assessor_actions_required.psychiatric_assessment' AND Locale = N'ar')
    UPDATE TextTranslation SET [Text] = N'التقييم النفسي' WHERE [Key] = N'admission.option.assessor_actions_required.psychiatric_assessment' AND Locale = N'ar';
ELSE
    INSERT INTO TextTranslation (Id, [Key], Locale, [Text]) VALUES (NEWID(), N'admission.option.assessor_actions_required.psychiatric_assessment', N'ar', N'التقييم النفسي');
IF EXISTS (SELECT 1 FROM TextTranslation WHERE [Key] = N'admission.option.assessor_actions_required.register_screening_service' AND Locale = N'ar')
    UPDATE TextTranslation SET [Text] = N'??????? ?? ???? ????? ???????' WHERE [Key] = N'admission.option.assessor_actions_required.register_screening_service' AND Locale = N'ar';
ELSE
    INSERT INTO TextTranslation (Id, [Key], Locale, [Text]) VALUES (NEWID(), N'admission.option.assessor_actions_required.register_screening_service', N'ar', N'??????? ?? ???? ????? ???????');
IF EXISTS (SELECT 1 FROM TextTranslation WHERE [Key] = N'admission.option.contact_permissions.contact_at_address' AND Locale = N'ar')
    UPDATE TextTranslation SET [Text] = N'توافق على أن يتم الاتصال بك على العنوان أعلاه' WHERE [Key] = N'admission.option.contact_permissions.contact_at_address' AND Locale = N'ar';
ELSE
    INSERT INTO TextTranslation (Id, [Key], Locale, [Text]) VALUES (NEWID(), N'admission.option.contact_permissions.contact_at_address', N'ar', N'توافق على أن يتم الاتصال بك على العنوان أعلاه');
IF EXISTS (SELECT 1 FROM TextTranslation WHERE [Key] = N'admission.option.contact_permissions.contact_by_email' AND Locale = N'ar')
    UPDATE TextTranslation SET [Text] = N'توافق على أن يتم الاتصال بك عن طريق البريد الإلكتروني' WHERE [Key] = N'admission.option.contact_permissions.contact_by_email' AND Locale = N'ar';
ELSE
    INSERT INTO TextTranslation (Id, [Key], Locale, [Text]) VALUES (NEWID(), N'admission.option.contact_permissions.contact_by_email', N'ar', N'توافق على أن يتم الاتصال بك عن طريق البريد الإلكتروني');
IF EXISTS (SELECT 1 FROM TextTranslation WHERE [Key] = N'admission.option.contact_permissions.contact_via_phone_text' AND Locale = N'ar')
    UPDATE TextTranslation SET [Text] = N'توافق على أن يتم الاتصال بك عبر رسالة نصية عبر الهاتف' WHERE [Key] = N'admission.option.contact_permissions.contact_via_phone_text' AND Locale = N'ar';
ELSE
    INSERT INTO TextTranslation (Id, [Key], Locale, [Text]) VALUES (NEWID(), N'admission.option.contact_permissions.contact_via_phone_text', N'ar', N'توافق على أن يتم الاتصال بك عبر رسالة نصية عبر الهاتف');
IF EXISTS (SELECT 1 FROM TextTranslation WHERE [Key] = N'admission.option.drinking_problem_extent.dependent' AND Locale = N'ar')
    UPDATE TextTranslation SET [Text] = N'متكل' WHERE [Key] = N'admission.option.drinking_problem_extent.dependent' AND Locale = N'ar';
ELSE
    INSERT INTO TextTranslation (Id, [Key], Locale, [Text]) VALUES (NEWID(), N'admission.option.drinking_problem_extent.dependent', N'ar', N'متكل');
IF EXISTS (SELECT 1 FROM TextTranslation WHERE [Key] = N'admission.option.drinking_problem_extent.harmful' AND Locale = N'ar')
    UPDATE TextTranslation SET [Text] = N'ضار' WHERE [Key] = N'admission.option.drinking_problem_extent.harmful' AND Locale = N'ar';
ELSE
    INSERT INTO TextTranslation (Id, [Key], Locale, [Text]) VALUES (NEWID(), N'admission.option.drinking_problem_extent.harmful', N'ar', N'ضار');
IF EXISTS (SELECT 1 FROM TextTranslation WHERE [Key] = N'admission.option.drinking_problem_extent.hazardous' AND Locale = N'ar')
    UPDATE TextTranslation SET [Text] = N'خطرة' WHERE [Key] = N'admission.option.drinking_problem_extent.hazardous' AND Locale = N'ar';
ELSE
    INSERT INTO TextTranslation (Id, [Key], Locale, [Text]) VALUES (NEWID(), N'admission.option.drinking_problem_extent.hazardous', N'ar', N'خطرة');
IF EXISTS (SELECT 1 FROM TextTranslation WHERE [Key] = N'admission.option.drinking_problem_extent.not_known' AND Locale = N'ar')
    UPDATE TextTranslation SET [Text] = N'غير معروف' WHERE [Key] = N'admission.option.drinking_problem_extent.not_known' AND Locale = N'ar';
ELSE
    INSERT INTO TextTranslation (Id, [Key], Locale, [Text]) VALUES (NEWID(), N'admission.option.drinking_problem_extent.not_known', N'ar', N'غير معروف');
IF EXISTS (SELECT 1 FROM TextTranslation WHERE [Key] = N'admission.option.drug_use_history_table.amphetamine' AND Locale = N'ar')
    UPDATE TextTranslation SET [Text] = N'الأمفيتامين' WHERE [Key] = N'admission.option.drug_use_history_table.amphetamine' AND Locale = N'ar';
ELSE
    INSERT INTO TextTranslation (Id, [Key], Locale, [Text]) VALUES (NEWID(), N'admission.option.drug_use_history_table.amphetamine', N'ar', N'الأمفيتامين');
IF EXISTS (SELECT 1 FROM TextTranslation WHERE [Key] = N'admission.option.drug_use_history_table.benzodiazepines' AND Locale = N'ar')
    UPDATE TextTranslation SET [Text] = N'البنزوديازيبينات' WHERE [Key] = N'admission.option.drug_use_history_table.benzodiazepines' AND Locale = N'ar';
ELSE
    INSERT INTO TextTranslation (Id, [Key], Locale, [Text]) VALUES (NEWID(), N'admission.option.drug_use_history_table.benzodiazepines', N'ar', N'البنزوديازيبينات');
IF EXISTS (SELECT 1 FROM TextTranslation WHERE [Key] = N'admission.option.drug_use_history_table.cannabis' AND Locale = N'ar')
    UPDATE TextTranslation SET [Text] = N'القنب' WHERE [Key] = N'admission.option.drug_use_history_table.cannabis' AND Locale = N'ar';
ELSE
    INSERT INTO TextTranslation (Id, [Key], Locale, [Text]) VALUES (NEWID(), N'admission.option.drug_use_history_table.cannabis', N'ar', N'القنب');
IF EXISTS (SELECT 1 FROM TextTranslation WHERE [Key] = N'admission.option.drug_use_history_table.cocaine' AND Locale = N'ar')
    UPDATE TextTranslation SET [Text] = N'الكوكايين' WHERE [Key] = N'admission.option.drug_use_history_table.cocaine' AND Locale = N'ar';
ELSE
    INSERT INTO TextTranslation (Id, [Key], Locale, [Text]) VALUES (NEWID(), N'admission.option.drug_use_history_table.cocaine', N'ar', N'الكوكايين');
IF EXISTS (SELECT 1 FROM TextTranslation WHERE [Key] = N'admission.option.drug_use_history_table.ecstasy_mdma' AND Locale = N'ar')
    UPDATE TextTranslation SET [Text] = N'النشوة / إم دي إم إيه' WHERE [Key] = N'admission.option.drug_use_history_table.ecstasy_mdma' AND Locale = N'ar';
ELSE
    INSERT INTO TextTranslation (Id, [Key], Locale, [Text]) VALUES (NEWID(), N'admission.option.drug_use_history_table.ecstasy_mdma', N'ar', N'النشوة / إم دي إم إيه');
IF EXISTS (SELECT 1 FROM TextTranslation WHERE [Key] = N'admission.option.drug_use_history_table.hallucinogens' AND Locale = N'ar')
    UPDATE TextTranslation SET [Text] = N'المهلوسات' WHERE [Key] = N'admission.option.drug_use_history_table.hallucinogens' AND Locale = N'ar';
ELSE
    INSERT INTO TextTranslation (Id, [Key], Locale, [Text]) VALUES (NEWID(), N'admission.option.drug_use_history_table.hallucinogens', N'ar', N'المهلوسات');
IF EXISTS (SELECT 1 FROM TextTranslation WHERE [Key] = N'admission.option.drug_use_history_table.heroin' AND Locale = N'ar')
    UPDATE TextTranslation SET [Text] = N'الهيروين' WHERE [Key] = N'admission.option.drug_use_history_table.heroin' AND Locale = N'ar';
ELSE
    INSERT INTO TextTranslation (Id, [Key], Locale, [Text]) VALUES (NEWID(), N'admission.option.drug_use_history_table.heroin', N'ar', N'الهيروين');
IF EXISTS (SELECT 1 FROM TextTranslation WHERE [Key] = N'admission.option.drug_use_history_table.methadone' AND Locale = N'ar')
    UPDATE TextTranslation SET [Text] = N'الميثادون' WHERE [Key] = N'admission.option.drug_use_history_table.methadone' AND Locale = N'ar';
ELSE
    INSERT INTO TextTranslation (Id, [Key], Locale, [Text]) VALUES (NEWID(), N'admission.option.drug_use_history_table.methadone', N'ar', N'الميثادون');
IF EXISTS (SELECT 1 FROM TextTranslation WHERE [Key] = N'admission.option.drug_use_history_table.otc_drugs' AND Locale = N'ar')
    UPDATE TextTranslation SET [Text] = N'المخدرات التي لا تستلزم وصفة طبية' WHERE [Key] = N'admission.option.drug_use_history_table.otc_drugs' AND Locale = N'ar';
ELSE
    INSERT INTO TextTranslation (Id, [Key], Locale, [Text]) VALUES (NEWID(), N'admission.option.drug_use_history_table.otc_drugs', N'ar', N'المخدرات التي لا تستلزم وصفة طبية');
IF EXISTS (SELECT 1 FROM TextTranslation WHERE [Key] = N'admission.option.drug_use_history_table.other_drugs' AND Locale = N'ar')
    UPDATE TextTranslation SET [Text] = N'أي أدوية أخرى' WHERE [Key] = N'admission.option.drug_use_history_table.other_drugs' AND Locale = N'ar';
ELSE
    INSERT INTO TextTranslation (Id, [Key], Locale, [Text]) VALUES (NEWID(), N'admission.option.drug_use_history_table.other_drugs', N'ar', N'أي أدوية أخرى');
IF EXISTS (SELECT 1 FROM TextTranslation WHERE [Key] = N'admission.option.drug_use_history_table.other_opiates' AND Locale = N'ar')
    UPDATE TextTranslation SET [Text] = N'المواد الأفيونية الأخرى' WHERE [Key] = N'admission.option.drug_use_history_table.other_opiates' AND Locale = N'ar';
ELSE
    INSERT INTO TextTranslation (Id, [Key], Locale, [Text]) VALUES (NEWID(), N'admission.option.drug_use_history_table.other_opiates', N'ar', N'المواد الأفيونية الأخرى');
IF EXISTS (SELECT 1 FROM TextTranslation WHERE [Key] = N'admission.option.education_level.junior_cert' AND Locale = N'ar')
    UPDATE TextTranslation SET [Text] = N'شهادة المبتدئين' WHERE [Key] = N'admission.option.education_level.junior_cert' AND Locale = N'ar';
ELSE
    INSERT INTO TextTranslation (Id, [Key], Locale, [Text]) VALUES (NEWID(), N'admission.option.education_level.junior_cert', N'ar', N'شهادة المبتدئين');
IF EXISTS (SELECT 1 FROM TextTranslation WHERE [Key] = N'admission.option.education_level.leaving_cert' AND Locale = N'ar')
    UPDATE TextTranslation SET [Text] = N'مغادرة الشهادة' WHERE [Key] = N'admission.option.education_level.leaving_cert' AND Locale = N'ar';
ELSE
    INSERT INTO TextTranslation (Id, [Key], Locale, [Text]) VALUES (NEWID(), N'admission.option.education_level.leaving_cert', N'ar', N'مغادرة الشهادة');
IF EXISTS (SELECT 1 FROM TextTranslation WHERE [Key] = N'admission.option.education_level.never_school' AND Locale = N'ar')
    UPDATE TextTranslation SET [Text] = N'لم أذهب إلى المدرسة قط' WHERE [Key] = N'admission.option.education_level.never_school' AND Locale = N'ar';
ELSE
    INSERT INTO TextTranslation (Id, [Key], Locale, [Text]) VALUES (NEWID(), N'admission.option.education_level.never_school', N'ar', N'لم أذهب إلى المدرسة قط');
IF EXISTS (SELECT 1 FROM TextTranslation WHERE [Key] = N'admission.option.education_level.not_known' AND Locale = N'ar')
    UPDATE TextTranslation SET [Text] = N'غير معروف' WHERE [Key] = N'admission.option.education_level.not_known' AND Locale = N'ar';
ELSE
    INSERT INTO TextTranslation (Id, [Key], Locale, [Text]) VALUES (NEWID(), N'admission.option.education_level.not_known', N'ar', N'غير معروف');
IF EXISTS (SELECT 1 FROM TextTranslation WHERE [Key] = N'admission.option.education_level.primary' AND Locale = N'ar')
    UPDATE TextTranslation SET [Text] = N'المستوى الابتدائي' WHERE [Key] = N'admission.option.education_level.primary' AND Locale = N'ar';
ELSE
    INSERT INTO TextTranslation (Id, [Key], Locale, [Text]) VALUES (NEWID(), N'admission.option.education_level.primary', N'ar', N'المستوى الابتدائي');
IF EXISTS (SELECT 1 FROM TextTranslation WHERE [Key] = N'admission.option.education_level.primary_incomplete' AND Locale = N'ar')
    UPDATE TextTranslation SET [Text] = N'المستوى الابتدائي غير مكتمل' WHERE [Key] = N'admission.option.education_level.primary_incomplete' AND Locale = N'ar';
ELSE
    INSERT INTO TextTranslation (Id, [Key], Locale, [Text]) VALUES (NEWID(), N'admission.option.education_level.primary_incomplete', N'ar', N'المستوى الابتدائي غير مكتمل');
IF EXISTS (SELECT 1 FROM TextTranslation WHERE [Key] = N'admission.option.education_level.third_level' AND Locale = N'ar')
    UPDATE TextTranslation SET [Text] = N'المستوى الثالث' WHERE [Key] = N'admission.option.education_level.third_level' AND Locale = N'ar';
ELSE
    INSERT INTO TextTranslation (Id, [Key], Locale, [Text]) VALUES (NEWID(), N'admission.option.education_level.third_level', N'ar', N'المستوى الثالث');
IF EXISTS (SELECT 1 FROM TextTranslation WHERE [Key] = N'admission.option.ethnicity.arab' AND Locale = N'ar')
    UPDATE TextTranslation SET [Text] = N'عربي' WHERE [Key] = N'admission.option.ethnicity.arab' AND Locale = N'ar';
ELSE
    INSERT INTO TextTranslation (Id, [Key], Locale, [Text]) VALUES (NEWID(), N'admission.option.ethnicity.arab', N'ar', N'عربي');
IF EXISTS (SELECT 1 FROM TextTranslation WHERE [Key] = N'admission.option.ethnicity.asian_irish' AND Locale = N'ar')
    UPDATE TextTranslation SET [Text] = N'الآسيوية أو الأيرلندية الآسيوية' WHERE [Key] = N'admission.option.ethnicity.asian_irish' AND Locale = N'ar';
ELSE
    INSERT INTO TextTranslation (Id, [Key], Locale, [Text]) VALUES (NEWID(), N'admission.option.ethnicity.asian_irish', N'ar', N'الآسيوية أو الأيرلندية الآسيوية');
IF EXISTS (SELECT 1 FROM TextTranslation WHERE [Key] = N'admission.option.ethnicity.black' AND Locale = N'ar')
    UPDATE TextTranslation SET [Text] = N'أسود' WHERE [Key] = N'admission.option.ethnicity.black' AND Locale = N'ar';
ELSE
    INSERT INTO TextTranslation (Id, [Key], Locale, [Text]) VALUES (NEWID(), N'admission.option.ethnicity.black', N'ar', N'أسود');
IF EXISTS (SELECT 1 FROM TextTranslation WHERE [Key] = N'admission.option.ethnicity.black_irish' AND Locale = N'ar')
    UPDATE TextTranslation SET [Text] = N'أسود أو أسود أيرلندي' WHERE [Key] = N'admission.option.ethnicity.black_irish' AND Locale = N'ar';
ELSE
    INSERT INTO TextTranslation (Id, [Key], Locale, [Text]) VALUES (NEWID(), N'admission.option.ethnicity.black_irish', N'ar', N'أسود أو أسود أيرلندي');
IF EXISTS (SELECT 1 FROM TextTranslation WHERE [Key] = N'admission.option.ethnicity.chinese' AND Locale = N'ar')
    UPDATE TextTranslation SET [Text] = N'الصينية' WHERE [Key] = N'admission.option.ethnicity.chinese' AND Locale = N'ar';
ELSE
    INSERT INTO TextTranslation (Id, [Key], Locale, [Text]) VALUES (NEWID(), N'admission.option.ethnicity.chinese', N'ar', N'الصينية');
IF EXISTS (SELECT 1 FROM TextTranslation WHERE [Key] = N'admission.option.ethnicity.indian_pakistani_bangladeshi' AND Locale = N'ar')
    UPDATE TextTranslation SET [Text] = N'هندي / باكستاني / بنجلاديشي' WHERE [Key] = N'admission.option.ethnicity.indian_pakistani_bangladeshi' AND Locale = N'ar';
ELSE
    INSERT INTO TextTranslation (Id, [Key], Locale, [Text]) VALUES (NEWID(), N'admission.option.ethnicity.indian_pakistani_bangladeshi', N'ar', N'هندي / باكستاني / بنجلاديشي');
IF EXISTS (SELECT 1 FROM TextTranslation WHERE [Key] = N'admission.option.ethnicity.irish_traveller' AND Locale = N'ar')
    UPDATE TextTranslation SET [Text] = N'المسافر الايرلندي' WHERE [Key] = N'admission.option.ethnicity.irish_traveller' AND Locale = N'ar';
ELSE
    INSERT INTO TextTranslation (Id, [Key], Locale, [Text]) VALUES (NEWID(), N'admission.option.ethnicity.irish_traveller', N'ar', N'المسافر الايرلندي');
IF EXISTS (SELECT 1 FROM TextTranslation WHERE [Key] = N'admission.option.ethnicity.mixed_multiple' AND Locale = N'ar')
    UPDATE TextTranslation SET [Text] = N'مجموعة عرقية مختلطة / متعددة' WHERE [Key] = N'admission.option.ethnicity.mixed_multiple' AND Locale = N'ar';
ELSE
    INSERT INTO TextTranslation (Id, [Key], Locale, [Text]) VALUES (NEWID(), N'admission.option.ethnicity.mixed_multiple', N'ar', N'مجموعة عرقية مختلطة / متعددة');
IF EXISTS (SELECT 1 FROM TextTranslation WHERE [Key] = N'admission.option.ethnicity.mixed_other' AND Locale = N'ar')
    UPDATE TextTranslation SET [Text] = N'أخرى، بما في ذلك المجموعة / الخلفية المختلطة' WHERE [Key] = N'admission.option.ethnicity.mixed_other' AND Locale = N'ar';
ELSE
    INSERT INTO TextTranslation (Id, [Key], Locale, [Text]) VALUES (NEWID(), N'admission.option.ethnicity.mixed_other', N'ar', N'أخرى، بما في ذلك المجموعة / الخلفية المختلطة');
IF EXISTS (SELECT 1 FROM TextTranslation WHERE [Key] = N'admission.option.ethnicity.other_asian' AND Locale = N'ar')
    UPDATE TextTranslation SET [Text] = N'أي خلفية آسيوية أخرى' WHERE [Key] = N'admission.option.ethnicity.other_asian' AND Locale = N'ar';
ELSE
    INSERT INTO TextTranslation (Id, [Key], Locale, [Text]) VALUES (NEWID(), N'admission.option.ethnicity.other_asian', N'ar', N'أي خلفية آسيوية أخرى');
IF EXISTS (SELECT 1 FROM TextTranslation WHERE [Key] = N'admission.option.ethnicity.other_black' AND Locale = N'ar')
    UPDATE TextTranslation SET [Text] = N'أي خلفية سوداء أخرى' WHERE [Key] = N'admission.option.ethnicity.other_black' AND Locale = N'ar';
ELSE
    INSERT INTO TextTranslation (Id, [Key], Locale, [Text]) VALUES (NEWID(), N'admission.option.ethnicity.other_black', N'ar', N'أي خلفية سوداء أخرى');
IF EXISTS (SELECT 1 FROM TextTranslation WHERE [Key] = N'admission.option.ethnicity.other_white' AND Locale = N'ar')
    UPDATE TextTranslation SET [Text] = N'أي خلفية بيضاء أخرى' WHERE [Key] = N'admission.option.ethnicity.other_white' AND Locale = N'ar';
ELSE
    INSERT INTO TextTranslation (Id, [Key], Locale, [Text]) VALUES (NEWID(), N'admission.option.ethnicity.other_white', N'ar', N'أي خلفية بيضاء أخرى');
IF EXISTS (SELECT 1 FROM TextTranslation WHERE [Key] = N'admission.option.ethnicity.other_write_in' AND Locale = N'ar')
    UPDATE TextTranslation SET [Text] = N'اخرى اكتب في الوصف' WHERE [Key] = N'admission.option.ethnicity.other_write_in' AND Locale = N'ar';
ELSE
    INSERT INTO TextTranslation (Id, [Key], Locale, [Text]) VALUES (NEWID(), N'admission.option.ethnicity.other_write_in', N'ar', N'اخرى اكتب في الوصف');
IF EXISTS (SELECT 1 FROM TextTranslation WHERE [Key] = N'admission.option.ethnicity.roma' AND Locale = N'ar')
    UPDATE TextTranslation SET [Text] = N'روما' WHERE [Key] = N'admission.option.ethnicity.roma' AND Locale = N'ar';
ELSE
    INSERT INTO TextTranslation (Id, [Key], Locale, [Text]) VALUES (NEWID(), N'admission.option.ethnicity.roma', N'ar', N'روما');
IF EXISTS (SELECT 1 FROM TextTranslation WHERE [Key] = N'admission.option.ethnicity.white_irish' AND Locale = N'ar')
    UPDATE TextTranslation SET [Text] = N'الأيرلندية البيضاء' WHERE [Key] = N'admission.option.ethnicity.white_irish' AND Locale = N'ar';
ELSE
    INSERT INTO TextTranslation (Id, [Key], Locale, [Text]) VALUES (NEWID(), N'admission.option.ethnicity.white_irish', N'ar', N'الأيرلندية البيضاء');
IF EXISTS (SELECT 1 FROM TextTranslation WHERE [Key] = N'admission.option.gender_identity.another_way' AND Locale = N'ar')
    UPDATE TextTranslation SET [Text] = N'بطريقة أخرى' WHERE [Key] = N'admission.option.gender_identity.another_way' AND Locale = N'ar';
ELSE
    INSERT INTO TextTranslation (Id, [Key], Locale, [Text]) VALUES (NEWID(), N'admission.option.gender_identity.another_way', N'ar', N'بطريقة أخرى');
IF EXISTS (SELECT 1 FROM TextTranslation WHERE [Key] = N'admission.option.gender_identity.man' AND Locale = N'ar')
    UPDATE TextTranslation SET [Text] = N'رجل (بما في ذلك الرجل المتحول)' WHERE [Key] = N'admission.option.gender_identity.man' AND Locale = N'ar';
ELSE
    INSERT INTO TextTranslation (Id, [Key], Locale, [Text]) VALUES (NEWID(), N'admission.option.gender_identity.man', N'ar', N'رجل (بما في ذلك الرجل المتحول)');
IF EXISTS (SELECT 1 FROM TextTranslation WHERE [Key] = N'admission.option.gender_identity.non_binary' AND Locale = N'ar')
    UPDATE TextTranslation SET [Text] = N'غير ثنائي' WHERE [Key] = N'admission.option.gender_identity.non_binary' AND Locale = N'ar';
ELSE
    INSERT INTO TextTranslation (Id, [Key], Locale, [Text]) VALUES (NEWID(), N'admission.option.gender_identity.non_binary', N'ar', N'غير ثنائي');
IF EXISTS (SELECT 1 FROM TextTranslation WHERE [Key] = N'admission.option.gender_identity.not_listed' AND Locale = N'ar')
    UPDATE TextTranslation SET [Text] = N'جنسي غير مدرج هنا' WHERE [Key] = N'admission.option.gender_identity.not_listed' AND Locale = N'ar';
ELSE
    INSERT INTO TextTranslation (Id, [Key], Locale, [Text]) VALUES (NEWID(), N'admission.option.gender_identity.not_listed', N'ar', N'جنسي غير مدرج هنا');
IF EXISTS (SELECT 1 FROM TextTranslation WHERE [Key] = N'admission.option.gender_identity.woman' AND Locale = N'ar')
    UPDATE TextTranslation SET [Text] = N'امرأة (بما في ذلك المرأة المتحولة)' WHERE [Key] = N'admission.option.gender_identity.woman' AND Locale = N'ar';
ELSE
    INSERT INTO TextTranslation (Id, [Key], Locale, [Text]) VALUES (NEWID(), N'admission.option.gender_identity.woman', N'ar', N'امرأة (بما في ذلك المرأة المتحولة)');
IF EXISTS (SELECT 1 FROM TextTranslation WHERE [Key] = N'admission.option.happiness_scale_matrix.appearance_life' AND Locale = N'ar')
    UPDATE TextTranslation SET [Text] = N'المظهر / الحياة' WHERE [Key] = N'admission.option.happiness_scale_matrix.appearance_life' AND Locale = N'ar';
ELSE
    INSERT INTO TextTranslation (Id, [Key], Locale, [Text]) VALUES (NEWID(), N'admission.option.happiness_scale_matrix.appearance_life', N'ar', N'المظهر / الحياة');
IF EXISTS (SELECT 1 FROM TextTranslation WHERE [Key] = N'admission.option.happiness_scale_matrix.communication_skills' AND Locale = N'ar')
    UPDATE TextTranslation SET [Text] = N'مهارات الاتصال' WHERE [Key] = N'admission.option.happiness_scale_matrix.communication_skills' AND Locale = N'ar';
ELSE
    INSERT INTO TextTranslation (Id, [Key], Locale, [Text]) VALUES (NEWID(), N'admission.option.happiness_scale_matrix.communication_skills', N'ar', N'مهارات الاتصال');
IF EXISTS (SELECT 1 FROM TextTranslation WHERE [Key] = N'admission.option.happiness_scale_matrix.confidence_in_self' AND Locale = N'ar')
    UPDATE TextTranslation SET [Text] = N'الثقة بالنفس' WHERE [Key] = N'admission.option.happiness_scale_matrix.confidence_in_self' AND Locale = N'ar';
ELSE
    INSERT INTO TextTranslation (Id, [Key], Locale, [Text]) VALUES (NEWID(), N'admission.option.happiness_scale_matrix.confidence_in_self', N'ar', N'الثقة بالنفس');
IF EXISTS (SELECT 1 FROM TextTranslation WHERE [Key] = N'admission.option.happiness_scale_matrix.housing' AND Locale = N'ar')
    UPDATE TextTranslation SET [Text] = N'السكن' WHERE [Key] = N'admission.option.happiness_scale_matrix.housing' AND Locale = N'ar';
ELSE
    INSERT INTO TextTranslation (Id, [Key], Locale, [Text]) VALUES (NEWID(), N'admission.option.happiness_scale_matrix.housing', N'ar', N'السكن');
IF EXISTS (SELECT 1 FROM TextTranslation WHERE [Key] = N'admission.option.happiness_scale_matrix.inner_peace' AND Locale = N'ar')
    UPDATE TextTranslation SET [Text] = N'السلام الداخلي' WHERE [Key] = N'admission.option.happiness_scale_matrix.inner_peace' AND Locale = N'ar';
ELSE
    INSERT INTO TextTranslation (Id, [Key], Locale, [Text]) VALUES (NEWID(), N'admission.option.happiness_scale_matrix.inner_peace', N'ar', N'السلام الداخلي');
IF EXISTS (SELECT 1 FROM TextTranslation WHERE [Key] = N'admission.option.happiness_scale_matrix.job_role' AND Locale = N'ar')
    UPDATE TextTranslation SET [Text] = N'الوظيفة/الدور' WHERE [Key] = N'admission.option.happiness_scale_matrix.job_role' AND Locale = N'ar';
ELSE
    INSERT INTO TextTranslation (Id, [Key], Locale, [Text]) VALUES (NEWID(), N'admission.option.happiness_scale_matrix.job_role', N'ar', N'الوظيفة/الدور');
IF EXISTS (SELECT 1 FROM TextTranslation WHERE [Key] = N'admission.option.happiness_scale_matrix.legal_issues' AND Locale = N'ar')
    UPDATE TextTranslation SET [Text] = N'القضايا القانونية' WHERE [Key] = N'admission.option.happiness_scale_matrix.legal_issues' AND Locale = N'ar';
ELSE
    INSERT INTO TextTranslation (Id, [Key], Locale, [Text]) VALUES (NEWID(), N'admission.option.happiness_scale_matrix.legal_issues', N'ar', N'القضايا القانونية');
IF EXISTS (SELECT 1 FROM TextTranslation WHERE [Key] = N'admission.option.happiness_scale_matrix.mental_health_and_happiness' AND Locale = N'ar')
    UPDATE TextTranslation SET [Text] = N'الصحة النفسية والسعادة' WHERE [Key] = N'admission.option.happiness_scale_matrix.mental_health_and_happiness' AND Locale = N'ar';
ELSE
    INSERT INTO TextTranslation (Id, [Key], Locale, [Text]) VALUES (NEWID(), N'admission.option.happiness_scale_matrix.mental_health_and_happiness', N'ar', N'الصحة النفسية والسعادة');
IF EXISTS (SELECT 1 FROM TextTranslation WHERE [Key] = N'admission.option.happiness_scale_matrix.other' AND Locale = N'ar')
    UPDATE TextTranslation SET [Text] = N'أخرى (كن محددًا)' WHERE [Key] = N'admission.option.happiness_scale_matrix.other' AND Locale = N'ar';
ELSE
    INSERT INTO TextTranslation (Id, [Key], Locale, [Text]) VALUES (NEWID(), N'admission.option.happiness_scale_matrix.other', N'ar', N'أخرى (كن محددًا)');
IF EXISTS (SELECT 1 FROM TextTranslation WHERE [Key] = N'admission.option.happiness_scale_matrix.relationships' AND Locale = N'ar')
    UPDATE TextTranslation SET [Text] = N'العلاقات' WHERE [Key] = N'admission.option.happiness_scale_matrix.relationships' AND Locale = N'ar';
ELSE
    INSERT INTO TextTranslation (Id, [Key], Locale, [Text]) VALUES (NEWID(), N'admission.option.happiness_scale_matrix.relationships', N'ar', N'العلاقات');
IF EXISTS (SELECT 1 FROM TextTranslation WHERE [Key] = N'admission.option.happiness_scale_matrix.social_life' AND Locale = N'ar')
    UPDATE TextTranslation SET [Text] = N'الحياة الاجتماعية' WHERE [Key] = N'admission.option.happiness_scale_matrix.social_life' AND Locale = N'ar';
ELSE
    INSERT INTO TextTranslation (Id, [Key], Locale, [Text]) VALUES (NEWID(), N'admission.option.happiness_scale_matrix.social_life', N'ar', N'الحياة الاجتماعية');
IF EXISTS (SELECT 1 FROM TextTranslation WHERE [Key] = N'admission.option.happiness_scale_matrix.spirituality' AND Locale = N'ar')
    UPDATE TextTranslation SET [Text] = N'الروحانية' WHERE [Key] = N'admission.option.happiness_scale_matrix.spirituality' AND Locale = N'ar';
ELSE
    INSERT INTO TextTranslation (Id, [Key], Locale, [Text]) VALUES (NEWID(), N'admission.option.happiness_scale_matrix.spirituality', N'ar', N'الروحانية');
IF EXISTS (SELECT 1 FROM TextTranslation WHERE [Key] = N'admission.option.harm_reduction_advice_given.access_to_naloxone' AND Locale = N'ar')
    UPDATE TextTranslation SET [Text] = N'الوصول إلى النالوكسون' WHERE [Key] = N'admission.option.harm_reduction_advice_given.access_to_naloxone' AND Locale = N'ar';
ELSE
    INSERT INTO TextTranslation (Id, [Key], Locale, [Text]) VALUES (NEWID(), N'admission.option.harm_reduction_advice_given.access_to_naloxone', N'ar', N'الوصول إلى النالوكسون');
IF EXISTS (SELECT 1 FROM TextTranslation WHERE [Key] = N'admission.option.harm_reduction_advice_given.alcohol_use' AND Locale = N'ar')
    UPDATE TextTranslation SET [Text] = N'استخدام الكحول' WHERE [Key] = N'admission.option.harm_reduction_advice_given.alcohol_use' AND Locale = N'ar';
ELSE
    INSERT INTO TextTranslation (Id, [Key], Locale, [Text]) VALUES (NEWID(), N'admission.option.harm_reduction_advice_given.alcohol_use', N'ar', N'استخدام الكحول');
IF EXISTS (SELECT 1 FROM TextTranslation WHERE [Key] = N'admission.option.harm_reduction_advice_given.drug_interactions' AND Locale = N'ar')
    UPDATE TextTranslation SET [Text] = N'التفاعلات الدوائية' WHERE [Key] = N'admission.option.harm_reduction_advice_given.drug_interactions' AND Locale = N'ar';
ELSE
    INSERT INTO TextTranslation (Id, [Key], Locale, [Text]) VALUES (NEWID(), N'admission.option.harm_reduction_advice_given.drug_interactions', N'ar', N'التفاعلات الدوائية');
IF EXISTS (SELECT 1 FROM TextTranslation WHERE [Key] = N'admission.option.harm_reduction_advice_given.drug_use' AND Locale = N'ar')
    UPDATE TextTranslation SET [Text] = N'تعاطي المخدرات' WHERE [Key] = N'admission.option.harm_reduction_advice_given.drug_use' AND Locale = N'ar';
ELSE
    INSERT INTO TextTranslation (Id, [Key], Locale, [Text]) VALUES (NEWID(), N'admission.option.harm_reduction_advice_given.drug_use', N'ar', N'تعاطي المخدرات');
IF EXISTS (SELECT 1 FROM TextTranslation WHERE [Key] = N'admission.option.harm_reduction_advice_given.needle_exchange' AND Locale = N'ar')
    UPDATE TextTranslation SET [Text] = N'تبادل الإبرة الأوقات والأماكن' WHERE [Key] = N'admission.option.harm_reduction_advice_given.needle_exchange' AND Locale = N'ar';
ELSE
    INSERT INTO TextTranslation (Id, [Key], Locale, [Text]) VALUES (NEWID(), N'admission.option.harm_reduction_advice_given.needle_exchange', N'ar', N'تبادل الإبرة الأوقات والأماكن');
IF EXISTS (SELECT 1 FROM TextTranslation WHERE [Key] = N'admission.option.harm_reduction_advice_given.overdose_prevention' AND Locale = N'ar')
    UPDATE TextTranslation SET [Text] = N'الوقاية من الجرعة الزائدة' WHERE [Key] = N'admission.option.harm_reduction_advice_given.overdose_prevention' AND Locale = N'ar';
ELSE
    INSERT INTO TextTranslation (Id, [Key], Locale, [Text]) VALUES (NEWID(), N'admission.option.harm_reduction_advice_given.overdose_prevention', N'ar', N'الوقاية من الجرعة الزائدة');
IF EXISTS (SELECT 1 FROM TextTranslation WHERE [Key] = N'admission.option.harm_reduction_advice_given.safe_injecting_practice' AND Locale = N'ar')
    UPDATE TextTranslation SET [Text] = N'ممارسة الحقن الآمنة' WHERE [Key] = N'admission.option.harm_reduction_advice_given.safe_injecting_practice' AND Locale = N'ar';
ELSE
    INSERT INTO TextTranslation (Id, [Key], Locale, [Text]) VALUES (NEWID(), N'admission.option.harm_reduction_advice_given.safe_injecting_practice', N'ar', N'ممارسة الحقن الآمنة');
IF EXISTS (SELECT 1 FROM TextTranslation WHERE [Key] = N'admission.option.harm_reduction_advice_given.sexual_activity' AND Locale = N'ar')
    UPDATE TextTranslation SET [Text] = N'النشاط الجنسي' WHERE [Key] = N'admission.option.harm_reduction_advice_given.sexual_activity' AND Locale = N'ar';
ELSE
    INSERT INTO TextTranslation (Id, [Key], Locale, [Text]) VALUES (NEWID(), N'admission.option.harm_reduction_advice_given.sexual_activity', N'ar', N'النشاط الجنسي');
IF EXISTS (SELECT 1 FROM TextTranslation WHERE [Key] = N'admission.option.language_other_than_english_or_irish_at_home.no' AND Locale = N'ar')
    UPDATE TextTranslation SET [Text] = N'لا' WHERE [Key] = N'admission.option.language_other_than_english_or_irish_at_home.no' AND Locale = N'ar';
ELSE
    INSERT INTO TextTranslation (Id, [Key], Locale, [Text]) VALUES (NEWID(), N'admission.option.language_other_than_english_or_irish_at_home.no', N'ar', N'لا');
IF EXISTS (SELECT 1 FROM TextTranslation WHERE [Key] = N'admission.option.language_other_than_english_or_irish_at_home.not_known' AND Locale = N'ar')
    UPDATE TextTranslation SET [Text] = N'غير معروف' WHERE [Key] = N'admission.option.language_other_than_english_or_irish_at_home.not_known' AND Locale = N'ar';
ELSE
    INSERT INTO TextTranslation (Id, [Key], Locale, [Text]) VALUES (NEWID(), N'admission.option.language_other_than_english_or_irish_at_home.not_known', N'ar', N'غير معروف');
IF EXISTS (SELECT 1 FROM TextTranslation WHERE [Key] = N'admission.option.language_other_than_english_or_irish_at_home.yes' AND Locale = N'ar')
    UPDATE TextTranslation SET [Text] = N'نعم' WHERE [Key] = N'admission.option.language_other_than_english_or_irish_at_home.yes' AND Locale = N'ar';
ELSE
    INSERT INTO TextTranslation (Id, [Key], Locale, [Text]) VALUES (NEWID(), N'admission.option.language_other_than_english_or_irish_at_home.yes', N'ar', N'نعم');
IF EXISTS (SELECT 1 FROM TextTranslation WHERE [Key] = N'admission.option.living_where.dv_refuge' AND Locale = N'ar')
    UPDATE TextTranslation SET [Text] = N'ملجأ العنف المنزلي' WHERE [Key] = N'admission.option.living_where.dv_refuge' AND Locale = N'ar';
ELSE
    INSERT INTO TextTranslation (Id, [Key], Locale, [Text]) VALUES (NEWID(), N'admission.option.living_where.dv_refuge', N'ar', N'ملجأ العنف المنزلي');
IF EXISTS (SELECT 1 FROM TextTranslation WHERE [Key] = N'admission.option.living_where.homeless' AND Locale = N'ar')
    UPDATE TextTranslation SET [Text] = N'بلا مأوى' WHERE [Key] = N'admission.option.living_where.homeless' AND Locale = N'ar';
ELSE
    INSERT INTO TextTranslation (Id, [Key], Locale, [Text]) VALUES (NEWID(), N'admission.option.living_where.homeless', N'ar', N'بلا مأوى');
IF EXISTS (SELECT 1 FROM TextTranslation WHERE [Key] = N'admission.option.living_where.institution' AND Locale = N'ar')
    UPDATE TextTranslation SET [Text] = N'السجن / المؤسسة / الرعاية السكنية / دار التوقف' WHERE [Key] = N'admission.option.living_where.institution' AND Locale = N'ar';
ELSE
    INSERT INTO TextTranslation (Id, [Key], Locale, [Text]) VALUES (NEWID(), N'admission.option.living_where.institution', N'ar', N'السجن / المؤسسة / الرعاية السكنية / دار التوقف');
IF EXISTS (SELECT 1 FROM TextTranslation WHERE [Key] = N'admission.option.living_where.not_known' AND Locale = N'ar')
    UPDATE TextTranslation SET [Text] = N'غير معروف' WHERE [Key] = N'admission.option.living_where.not_known' AND Locale = N'ar';
ELSE
    INSERT INTO TextTranslation (Id, [Key], Locale, [Text]) VALUES (NEWID(), N'admission.option.living_where.not_known', N'ar', N'غير معروف');
IF EXISTS (SELECT 1 FROM TextTranslation WHERE [Key] = N'admission.option.living_where.other_unstable' AND Locale = N'ar')
    UPDATE TextTranslation SET [Text] = N'أماكن إقامة / تفاصيل أخرى غير مستقرة' WHERE [Key] = N'admission.option.living_where.other_unstable' AND Locale = N'ar';
ELSE
    INSERT INTO TextTranslation (Id, [Key], Locale, [Text]) VALUES (NEWID(), N'admission.option.living_where.other_unstable', N'ar', N'أماكن إقامة / تفاصيل أخرى غير مستقرة');
IF EXISTS (SELECT 1 FROM TextTranslation WHERE [Key] = N'admission.option.living_where.stable_accommodation' AND Locale = N'ar')
    UPDATE TextTranslation SET [Text] = N'إقامة مستقرة' WHERE [Key] = N'admission.option.living_where.stable_accommodation' AND Locale = N'ar';
ELSE
    INSERT INTO TextTranslation (Id, [Key], Locale, [Text]) VALUES (NEWID(), N'admission.option.living_where.stable_accommodation', N'ar', N'إقامة مستقرة');
IF EXISTS (SELECT 1 FROM TextTranslation WHERE [Key] = N'admission.option.living_with.alone' AND Locale = N'ar')
    UPDATE TextTranslation SET [Text] = N'وحيد' WHERE [Key] = N'admission.option.living_with.alone' AND Locale = N'ar';
ELSE
    INSERT INTO TextTranslation (Id, [Key], Locale, [Text]) VALUES (NEWID(), N'admission.option.living_with.alone', N'ar', N'وحيد');
IF EXISTS (SELECT 1 FROM TextTranslation WHERE [Key] = N'admission.option.living_with.alone_children' AND Locale = N'ar')
    UPDATE TextTranslation SET [Text] = N'وحده والأطفال' WHERE [Key] = N'admission.option.living_with.alone_children' AND Locale = N'ar';
ELSE
    INSERT INTO TextTranslation (Id, [Key], Locale, [Text]) VALUES (NEWID(), N'admission.option.living_with.alone_children', N'ar', N'وحده والأطفال');
IF EXISTS (SELECT 1 FROM TextTranslation WHERE [Key] = N'admission.option.living_with.foster_care' AND Locale = N'ar')
    UPDATE TextTranslation SET [Text] = N'الرعاية البديلة' WHERE [Key] = N'admission.option.living_with.foster_care' AND Locale = N'ar';
ELSE
    INSERT INTO TextTranslation (Id, [Key], Locale, [Text]) VALUES (NEWID(), N'admission.option.living_with.foster_care', N'ar', N'الرعاية البديلة');
IF EXISTS (SELECT 1 FROM TextTranslation WHERE [Key] = N'admission.option.living_with.friends' AND Locale = N'ar')
    UPDATE TextTranslation SET [Text] = N'أصدقاء' WHERE [Key] = N'admission.option.living_with.friends' AND Locale = N'ar';
ELSE
    INSERT INTO TextTranslation (Id, [Key], Locale, [Text]) VALUES (NEWID(), N'admission.option.living_with.friends', N'ar', N'أصدقاء');
IF EXISTS (SELECT 1 FROM TextTranslation WHERE [Key] = N'admission.option.living_with.not_known' AND Locale = N'ar')
    UPDATE TextTranslation SET [Text] = N'غير معروف' WHERE [Key] = N'admission.option.living_with.not_known' AND Locale = N'ar';
ELSE
    INSERT INTO TextTranslation (Id, [Key], Locale, [Text]) VALUES (NEWID(), N'admission.option.living_with.not_known', N'ar', N'غير معروف');
IF EXISTS (SELECT 1 FROM TextTranslation WHERE [Key] = N'admission.option.living_with.parents_family' AND Locale = N'ar')
    UPDATE TextTranslation SET [Text] = N'الوالدين / العائلة' WHERE [Key] = N'admission.option.living_with.parents_family' AND Locale = N'ar';
ELSE
    INSERT INTO TextTranslation (Id, [Key], Locale, [Text]) VALUES (NEWID(), N'admission.option.living_with.parents_family', N'ar', N'الوالدين / العائلة');
IF EXISTS (SELECT 1 FROM TextTranslation WHERE [Key] = N'admission.option.living_with.partner_alone' AND Locale = N'ar')
    UPDATE TextTranslation SET [Text] = N'شريك (وحده)' WHERE [Key] = N'admission.option.living_with.partner_alone' AND Locale = N'ar';
ELSE
    INSERT INTO TextTranslation (Id, [Key], Locale, [Text]) VALUES (NEWID(), N'admission.option.living_with.partner_alone', N'ar', N'شريك (وحده)');
IF EXISTS (SELECT 1 FROM TextTranslation WHERE [Key] = N'admission.option.living_with.partner_children' AND Locale = N'ar')
    UPDATE TextTranslation SET [Text] = N'الشريك والأطفال' WHERE [Key] = N'admission.option.living_with.partner_children' AND Locale = N'ar';
ELSE
    INSERT INTO TextTranslation (Id, [Key], Locale, [Text]) VALUES (NEWID(), N'admission.option.living_with.partner_children', N'ar', N'الشريك والأطفال');
IF EXISTS (SELECT 1 FROM TextTranslation WHERE [Key] = N'admission.option.medical_card_status_detailed.applied_for' AND Locale = N'ar')
    UPDATE TextTranslation SET [Text] = N'تقدمت ل' WHERE [Key] = N'admission.option.medical_card_status_detailed.applied_for' AND Locale = N'ar';
ELSE
    INSERT INTO TextTranslation (Id, [Key], Locale, [Text]) VALUES (NEWID(), N'admission.option.medical_card_status_detailed.applied_for', N'ar', N'تقدمت ل');
IF EXISTS (SELECT 1 FROM TextTranslation WHERE [Key] = N'admission.option.medical_card_status_detailed.no' AND Locale = N'ar')
    UPDATE TextTranslation SET [Text] = N'لا' WHERE [Key] = N'admission.option.medical_card_status_detailed.no' AND Locale = N'ar';
ELSE
    INSERT INTO TextTranslation (Id, [Key], Locale, [Text]) VALUES (NEWID(), N'admission.option.medical_card_status_detailed.no', N'ar', N'لا');
IF EXISTS (SELECT 1 FROM TextTranslation WHERE [Key] = N'admission.option.medical_card_status_detailed.yes' AND Locale = N'ar')
    UPDATE TextTranslation SET [Text] = N'نعم' WHERE [Key] = N'admission.option.medical_card_status_detailed.yes' AND Locale = N'ar';
ELSE
    INSERT INTO TextTranslation (Id, [Key], Locale, [Text]) VALUES (NEWID(), N'admission.option.medical_card_status_detailed.yes', N'ar', N'نعم');
IF EXISTS (SELECT 1 FROM TextTranslation WHERE [Key] = N'admission.option.referral_reason.alcohol_use' AND Locale = N'ar')
    UPDATE TextTranslation SET [Text] = N'استخدام الكحول' WHERE [Key] = N'admission.option.referral_reason.alcohol_use' AND Locale = N'ar';
ELSE
    INSERT INTO TextTranslation (Id, [Key], Locale, [Text]) VALUES (NEWID(), N'admission.option.referral_reason.alcohol_use', N'ar', N'استخدام الكحول');
IF EXISTS (SELECT 1 FROM TextTranslation WHERE [Key] = N'admission.option.referral_reason.concerned_person' AND Locale = N'ar')
    UPDATE TextTranslation SET [Text] = N'الشخص المعني' WHERE [Key] = N'admission.option.referral_reason.concerned_person' AND Locale = N'ar';
ELSE
    INSERT INTO TextTranslation (Id, [Key], Locale, [Text]) VALUES (NEWID(), N'admission.option.referral_reason.concerned_person', N'ar', N'الشخص المعني');
IF EXISTS (SELECT 1 FROM TextTranslation WHERE [Key] = N'admission.option.referral_reason.drug_use' AND Locale = N'ar')
    UPDATE TextTranslation SET [Text] = N'تعاطي المخدرات' WHERE [Key] = N'admission.option.referral_reason.drug_use' AND Locale = N'ar';
ELSE
    INSERT INTO TextTranslation (Id, [Key], Locale, [Text]) VALUES (NEWID(), N'admission.option.referral_reason.drug_use', N'ar', N'تعاطي المخدرات');
IF EXISTS (SELECT 1 FROM TextTranslation WHERE [Key] = N'admission.option.referral_reason.homelessness' AND Locale = N'ar')
    UPDATE TextTranslation SET [Text] = N'التشرد' WHERE [Key] = N'admission.option.referral_reason.homelessness' AND Locale = N'ar';
ELSE
    INSERT INTO TextTranslation (Id, [Key], Locale, [Text]) VALUES (NEWID(), N'admission.option.referral_reason.homelessness', N'ar', N'التشرد');
IF EXISTS (SELECT 1 FROM TextTranslation WHERE [Key] = N'admission.option.risk_behaviour_history.ever_injected' AND Locale = N'ar')
    UPDATE TextTranslation SET [Text] = N'حقن من أي وقت مضى' WHERE [Key] = N'admission.option.risk_behaviour_history.ever_injected' AND Locale = N'ar';
ELSE
    INSERT INTO TextTranslation (Id, [Key], Locale, [Text]) VALUES (NEWID(), N'admission.option.risk_behaviour_history.ever_injected', N'ar', N'حقن من أي وقت مضى');
IF EXISTS (SELECT 1 FROM TextTranslation WHERE [Key] = N'admission.option.risk_behaviour_history.shared_needles' AND Locale = N'ar')
    UPDATE TextTranslation SET [Text] = N'الإبر / المحاقن المشتركة من أي وقت مضى' WHERE [Key] = N'admission.option.risk_behaviour_history.shared_needles' AND Locale = N'ar';
ELSE
    INSERT INTO TextTranslation (Id, [Key], Locale, [Text]) VALUES (NEWID(), N'admission.option.risk_behaviour_history.shared_needles', N'ar', N'الإبر / المحاقن المشتركة من أي وقت مضى');
IF EXISTS (SELECT 1 FROM TextTranslation WHERE [Key] = N'admission.option.risk_behaviour_history.shared_paraphernalia' AND Locale = N'ar')
    UPDATE TextTranslation SET [Text] = N'من أي وقت مضى شاركت أدوات أخرى' WHERE [Key] = N'admission.option.risk_behaviour_history.shared_paraphernalia' AND Locale = N'ar';
ELSE
    INSERT INTO TextTranslation (Id, [Key], Locale, [Text]) VALUES (NEWID(), N'admission.option.risk_behaviour_history.shared_paraphernalia', N'ar', N'من أي وقت مضى شاركت أدوات أخرى');
IF EXISTS (SELECT 1 FROM TextTranslation WHERE [Key] = N'admission.option.self_defined_sexual_orientation.bisexual' AND Locale = N'ar')
    UPDATE TextTranslation SET [Text] = N'ثنائي الجنس' WHERE [Key] = N'admission.option.self_defined_sexual_orientation.bisexual' AND Locale = N'ar';
ELSE
    INSERT INTO TextTranslation (Id, [Key], Locale, [Text]) VALUES (NEWID(), N'admission.option.self_defined_sexual_orientation.bisexual', N'ar', N'ثنائي الجنس');
IF EXISTS (SELECT 1 FROM TextTranslation WHERE [Key] = N'admission.option.self_defined_sexual_orientation.heterosexual' AND Locale = N'ar')
    UPDATE TextTranslation SET [Text] = N'من جنسين مختلفين أو مستقيمين' WHERE [Key] = N'admission.option.self_defined_sexual_orientation.heterosexual' AND Locale = N'ar';
ELSE
    INSERT INTO TextTranslation (Id, [Key], Locale, [Text]) VALUES (NEWID(), N'admission.option.self_defined_sexual_orientation.heterosexual', N'ar', N'من جنسين مختلفين أو مستقيمين');
IF EXISTS (SELECT 1 FROM TextTranslation WHERE [Key] = N'admission.option.self_defined_sexual_orientation.other' AND Locale = N'ar')
    UPDATE TextTranslation SET [Text] = N'التوجه الجنسي الآخر غير مدرج' WHERE [Key] = N'admission.option.self_defined_sexual_orientation.other' AND Locale = N'ar';
ELSE
    INSERT INTO TextTranslation (Id, [Key], Locale, [Text]) VALUES (NEWID(), N'admission.option.self_defined_sexual_orientation.other', N'ar', N'التوجه الجنسي الآخر غير مدرج');
IF EXISTS (SELECT 1 FROM TextTranslation WHERE [Key] = N'admission.alcohol.form.description' AND Locale = N'ar')
    UPDATE TextTranslation SET [Text] = N'??? ????? ????? ??????? ??????? ???? ??? ????? ????? HSE.' WHERE [Key] = N'admission.alcohol.form.description' AND Locale = N'ar';
ELSE
    INSERT INTO TextTranslation (Id, [Key], Locale, [Text]) VALUES (NEWID(), N'admission.alcohol.form.description', N'ar', N'??? ????? ????? ??????? ??????? ???? ??? ????? ????? HSE.');