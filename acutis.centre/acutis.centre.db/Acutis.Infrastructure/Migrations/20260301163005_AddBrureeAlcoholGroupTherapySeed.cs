using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

#pragma warning disable CA1814 // Prefer jagged arrays over multidimensional

namespace Acutis.Infrastructure.Migrations
{
    /// <inheritdoc />
    public partial class AddBrureeAlcoholGroupTherapySeed : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.CreateTable(
                name: "GroupTherapySubjectTemplate",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    UnitCode = table.Column<string>(type: "nvarchar(100)", maxLength: 100, nullable: false),
                    ProgramCode = table.Column<string>(type: "nvarchar(100)", maxLength: 100, nullable: false),
                    WeekNumber = table.Column<int>(type: "int", nullable: false),
                    Topic = table.Column<string>(type: "nvarchar(200)", maxLength: 200, nullable: false),
                    IntroText = table.Column<string>(type: "nvarchar(2000)", maxLength: 2000, nullable: false),
                    IsActive = table.Column<bool>(type: "bit", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_GroupTherapySubjectTemplate", x => x.Id);
                });

            migrationBuilder.CreateTable(
                name: "GroupTherapyDailyQuestion",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    SubjectTemplateId = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    DayNumber = table.Column<int>(type: "int", nullable: false),
                    SortOrder = table.Column<int>(type: "int", nullable: false),
                    QuestionText = table.Column<string>(type: "nvarchar(500)", maxLength: 500, nullable: false),
                    IsActive = table.Column<bool>(type: "bit", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_GroupTherapyDailyQuestion", x => x.Id);
                    table.ForeignKey(
                        name: "FK_GroupTherapyDailyQuestion_GroupTherapySubjectTemplate_SubjectTemplateId",
                        column: x => x.SubjectTemplateId,
                        principalTable: "GroupTherapySubjectTemplate",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.InsertData(
                table: "GroupTherapySubjectTemplate",
                columns: new[] { "Id", "IntroText", "IsActive", "ProgramCode", "Topic", "UnitCode", "WeekNumber" },
                values: new object[,]
                {
                    { new Guid("3320719d-9af6-63cd-ced5-f7307e87fe25"), "Week focus: safe reflection on past hurt, shame, and unresolved pain. The goal is emotional processing with boundaries, accountability, and healthier meaning-making.", true, "bruree_alcohol_gt", "Healing the Hurts of the Past", "alcohol", 3 },
                    { new Guid("33e552ec-eb11-2489-3f59-475ec3f06114"), "Week focus: understanding change as a process. Residents identify patterns, barriers, motivation, and practical actions that turn intention into behavior.", true, "bruree_alcohol_gt", "Change", "alcohol", 2 },
                    { new Guid("94a61edf-0fd8-24a5-5f4c-d57f08c3fa18"), "Week focus: practical relapse prevention planning. Residents define triggers, rehearse response plans, and build support structures for high-risk situations post-treatment.", true, "bruree_alcohol_gt", "Relapse Prevention", "alcohol", 4 },
                    { new Guid("e74c88f7-6f59-688c-f224-849ceab3ebad"), "Week focus: spirituality as connection, meaning, and values in recovery. Sessions are reflective, practical, and respectful of each resident's personal belief framework.", true, "bruree_alcohol_gt", "Spirituality", "alcohol", 1 }
                });

            migrationBuilder.InsertData(
                table: "GroupTherapyDailyQuestion",
                columns: new[] { "Id", "DayNumber", "IsActive", "QuestionText", "SortOrder", "SubjectTemplateId" },
                values: new object[,]
                {
                    { new Guid("00f7495b-3de0-8f2c-1745-55f86ffa791c"), 7, true, "What insight from this week changed your perspective?", 1, new Guid("3320719d-9af6-63cd-ced5-f7307e87fe25") },
                    { new Guid("02647450-acfc-2379-e25c-8c48c8a806f8"), 3, true, "What facts challenge that shame narrative?", 2, new Guid("3320719d-9af6-63cd-ced5-f7307e87fe25") },
                    { new Guid("04dd2538-eb34-5266-50b0-dec197045d3c"), 5, true, "What relationships make change harder?", 2, new Guid("33e552ec-eb11-2489-3f59-475ec3f06114") },
                    { new Guid("05bc9648-36f7-eb4e-574f-7e03598a4537"), 4, true, "What daily routine keeps you stable?", 2, new Guid("94a61edf-0fd8-24a5-5f4c-d57f08c3fa18") },
                    { new Guid("05def099-ec4a-3d3f-8fb1-b806f7945c6e"), 1, true, "What past hurt still affects you most today?", 1, new Guid("3320719d-9af6-63cd-ced5-f7307e87fe25") },
                    { new Guid("06810550-1322-640c-b221-d0980f87f9ab"), 3, true, "What places or people increase relapse risk for you?", 1, new Guid("94a61edf-0fd8-24a5-5f4c-d57f08c3fa18") },
                    { new Guid("06e8ea49-904b-007a-c928-4044f9ea6751"), 3, true, "How do you usually respond to stress without substances?", 1, new Guid("33e552ec-eb11-2489-3f59-475ec3f06114") },
                    { new Guid("07d0720e-3160-6f14-7d66-cf6b4a96c97b"), 6, true, "What setback taught you something useful?", 1, new Guid("33e552ec-eb11-2489-3f59-475ec3f06114") },
                    { new Guid("0abf89ec-0b87-a267-673e-1e250161e2ed"), 7, true, "What has changed in you this week?", 1, new Guid("33e552ec-eb11-2489-3f59-475ec3f06114") },
                    { new Guid("0c6fe10b-49f0-b0aa-a694-374d78bea1db"), 2, true, "How can you challenge those thoughts in real time?", 2, new Guid("94a61edf-0fd8-24a5-5f4c-d57f08c3fa18") },
                    { new Guid("0d85f3c9-d75a-eb80-9480-072a577efac4"), 2, true, "What value do you want to rebuild this week?", 2, new Guid("e74c88f7-6f59-688c-f224-849ceab3ebad") },
                    { new Guid("1624a10b-1aa2-09f3-372f-92e95b478698"), 6, true, "What does healing look like in practical daily life?", 1, new Guid("3320719d-9af6-63cd-ced5-f7307e87fe25") },
                    { new Guid("1a4512f2-fc4a-427a-142f-4475ac05c13a"), 1, true, "What are your top three relapse triggers?", 1, new Guid("94a61edf-0fd8-24a5-5f4c-d57f08c3fa18") },
                    { new Guid("1b843fb6-b9d0-15a4-fa91-c414414ac68a"), 7, true, "How will spirituality support your plan for next week?", 3, new Guid("e74c88f7-6f59-688c-f224-849ceab3ebad") },
                    { new Guid("1d68e1d6-1257-4c4d-9e49-069b7979f0e1"), 6, true, "What personal ritual can you commit to each morning?", 3, new Guid("e74c88f7-6f59-688c-f224-849ceab3ebad") },
                    { new Guid("1fe50197-210b-c4ed-8fc3-5fbea7f816ff"), 1, true, "What change are you most committed to right now?", 1, new Guid("33e552ec-eb11-2489-3f59-475ec3f06114") },
                    { new Guid("215d4641-5d4e-051b-7bba-5a64db8d6677"), 6, true, "What is one boundary that protects your peace?", 1, new Guid("e74c88f7-6f59-688c-f224-849ceab3ebad") },
                    { new Guid("23df84ad-969b-d0f5-6ee8-7e73db21525d"), 3, true, "What small act of kindness can you offer today?", 3, new Guid("e74c88f7-6f59-688c-f224-849ceab3ebad") },
                    { new Guid("2e54e334-9e3f-ad34-190a-7e49f1278278"), 4, true, "What apology do you owe, and what accountability is needed first?", 1, new Guid("3320719d-9af6-63cd-ced5-f7307e87fe25") },
                    { new Guid("304d9b34-95db-bf9b-80a3-87b158f011de"), 6, true, "How does silence or reflection help your recovery?", 2, new Guid("e74c88f7-6f59-688c-f224-849ceab3ebad") },
                    { new Guid("3468cd5f-dd1d-069c-b992-251917f9e35c"), 1, true, "What daily practice helps you feel grounded for recovery?", 3, new Guid("e74c88f7-6f59-688c-f224-849ceab3ebad") },
                    { new Guid("34849208-59f1-4176-b834-bce004dd3ebc"), 7, true, "How will you measure progress over the next 7 days?", 3, new Guid("33e552ec-eb11-2489-3f59-475ec3f06114") },
                    { new Guid("3ad88107-75c7-0faa-fe88-f35a46c1c56d"), 3, true, "What support do you need when pressure rises?", 3, new Guid("33e552ec-eb11-2489-3f59-475ec3f06114") },
                    { new Guid("3bdca135-404d-8c90-af51-bfaa3fe24087"), 6, true, "What healthy reward can reinforce sobriety milestones?", 1, new Guid("94a61edf-0fd8-24a5-5f4c-d57f08c3fa18") },
                    { new Guid("3c92761e-d641-a520-c3de-7bfcdd37a746"), 3, true, "What shame narrative do you carry about your past?", 1, new Guid("3320719d-9af6-63cd-ced5-f7307e87fe25") },
                    { new Guid("3e5d3ec4-8746-5051-6afd-c7b0ed8c9d37"), 5, true, "How will you reduce harm if you feel close to using?", 3, new Guid("94a61edf-0fd8-24a5-5f4c-d57f08c3fa18") },
                    { new Guid("4bec4b25-ae53-3467-6ae9-c0b3a4e12f37"), 7, true, "Which practice from this week will you continue?", 2, new Guid("e74c88f7-6f59-688c-f224-849ceab3ebad") },
                    { new Guid("4cd1d5c8-2365-b5cd-4ebf-3a441d74177f"), 1, true, "What does spirituality mean to you personally, if anything?", 1, new Guid("e74c88f7-6f59-688c-f224-849ceab3ebad") },
                    { new Guid("4fce93d1-0511-5149-ebd0-95848a84163c"), 4, true, "How does poor sleep, hunger, or stress affect your risk level?", 1, new Guid("94a61edf-0fd8-24a5-5f4c-d57f08c3fa18") },
                    { new Guid("546f7be7-e513-235a-0046-b274aedc8214"), 4, true, "What new statement can you repeat when discouraged?", 3, new Guid("33e552ec-eb11-2489-3f59-475ec3f06114") },
                    { new Guid("55dbccec-7267-f5e6-66e9-2435dfd055a7"), 1, true, "What makes this change important to you today?", 2, new Guid("33e552ec-eb11-2489-3f59-475ec3f06114") },
                    { new Guid("5a4a1375-fb9b-c664-1154-6a8ccf568f83"), 6, true, "How will you stay connected to peer or community support?", 2, new Guid("94a61edf-0fd8-24a5-5f4c-d57f08c3fa18") },
                    { new Guid("5a5b67a5-9006-9268-88fe-2a925236e62f"), 2, true, "What is your earliest warning sign that you are slipping?", 2, new Guid("33e552ec-eb11-2489-3f59-475ec3f06114") },
                    { new Guid("5bda6720-de41-6065-e1d2-8a18e7e0e293"), 7, true, "What is your next healing step with your care team?", 3, new Guid("3320719d-9af6-63cd-ced5-f7307e87fe25") },
                    { new Guid("6572d921-a68b-970c-f2e4-cf0b88f2573f"), 7, true, "Which relapse prevention tools were most useful this week?", 1, new Guid("94a61edf-0fd8-24a5-5f4c-d57f08c3fa18") },
                    { new Guid("6f2afe39-387c-a14a-6ac1-486881252e81"), 4, true, "What early warning signs tell you to seek support quickly?", 3, new Guid("94a61edf-0fd8-24a5-5f4c-d57f08c3fa18") },
                    { new Guid("6f8c6b0d-9bb5-48b4-b980-67d8aa55915c"), 2, true, "How do avoided emotions show up in your behavior?", 2, new Guid("3320719d-9af6-63cd-ced5-f7307e87fe25") },
                    { new Guid("79487d11-09b5-02a1-4f33-f7e27747f34c"), 5, true, "How do you know when to pause and regulate?", 2, new Guid("3320719d-9af6-63cd-ced5-f7307e87fe25") },
                    { new Guid("7c484055-814b-1b18-e5e1-e55e44bea000"), 5, true, "What does your emergency relapse plan include?", 1, new Guid("94a61edf-0fd8-24a5-5f4c-d57f08c3fa18") },
                    { new Guid("7c7f4791-1f84-02f5-e637-9d9b628d9716"), 5, true, "What fear are you carrying right now?", 1, new Guid("e74c88f7-6f59-688c-f224-849ceab3ebad") },
                    { new Guid("7fea982e-f1ab-ebdf-6361-a80aaf65bbbd"), 1, true, "When do you feel most connected to purpose or meaning?", 2, new Guid("e74c88f7-6f59-688c-f224-849ceab3ebad") },
                    { new Guid("8411a3e6-36ab-f0e1-4cf8-c8ba5a8b66e7"), 7, true, "What unfinished hurt needs ongoing support after discharge?", 2, new Guid("3320719d-9af6-63cd-ced5-f7307e87fe25") },
                    { new Guid("8a760496-439c-76b1-904f-4e4ea4ec33e0"), 4, true, "How can you prepare for difficult conversations responsibly?", 3, new Guid("3320719d-9af6-63cd-ced5-f7307e87fe25") },
                    { new Guid("8aedc2aa-89ff-238a-5870-47b0decde262"), 2, true, "How has addiction impacted your sense of purpose?", 1, new Guid("e74c88f7-6f59-688c-f224-849ceab3ebad") },
                    { new Guid("913200fa-225f-67d1-67b2-27cd1fd1e98e"), 6, true, "What does progress look like besides perfection?", 3, new Guid("33e552ec-eb11-2489-3f59-475ec3f06114") },
                    { new Guid("920d5d58-87bd-12a5-b187-e39b3ddf01bd"), 6, true, "How can you show trustworthiness this week?", 3, new Guid("3320719d-9af6-63cd-ced5-f7307e87fe25") },
                    { new Guid("9301cba8-88f1-b7a5-5c5d-a4a4e4d91e0d"), 2, true, "Who or what reminds you of your better self?", 3, new Guid("e74c88f7-6f59-688c-f224-849ceab3ebad") },
                    { new Guid("96704e0a-da39-bdc1-f238-e18dddad8141"), 1, true, "What support helps you discuss this safely?", 3, new Guid("3320719d-9af6-63cd-ced5-f7307e87fe25") },
                    { new Guid("96d1e812-360f-878f-095a-ac3503656105"), 2, true, "Which old pattern appears most often before relapse behavior?", 1, new Guid("33e552ec-eb11-2489-3f59-475ec3f06114") },
                    { new Guid("989e09c4-0708-b8f1-49de-4c11d808f32c"), 7, true, "Which habit will you strengthen next week?", 2, new Guid("33e552ec-eb11-2489-3f59-475ec3f06114") },
                    { new Guid("9925610a-bade-536a-6d47-3f650de01573"), 1, true, "Which trigger is highest risk in the next month?", 2, new Guid("94a61edf-0fd8-24a5-5f4c-d57f08c3fa18") },
                    { new Guid("9c821b3e-018f-5ffc-f37f-f1c8605cdbb3"), 2, true, "What replacement behavior can you use immediately?", 3, new Guid("33e552ec-eb11-2489-3f59-475ec3f06114") },
                    { new Guid("9ebb18a2-beed-2cb9-a5f9-c7c4fc37c2ce"), 4, true, "Where do you need to make amends without causing further harm?", 2, new Guid("3320719d-9af6-63cd-ced5-f7307e87fe25") },
                    { new Guid("9ec36266-abdd-b018-7aa3-e5246907142a"), 7, true, "What did you learn this week about your inner life?", 1, new Guid("e74c88f7-6f59-688c-f224-849ceab3ebad") },
                    { new Guid("a29438ae-f65b-9866-4fa9-eea1f1bcd633"), 2, true, "What thoughts usually come before a lapse?", 1, new Guid("94a61edf-0fd8-24a5-5f4c-d57f08c3fa18") },
                    { new Guid("a2b424d6-abc3-fdef-978d-eb1c36b0a5b8"), 1, true, "What is one action you can take in the next 24 hours?", 3, new Guid("33e552ec-eb11-2489-3f59-475ec3f06114") },
                    { new Guid("a2c0aa72-601e-f091-039e-dff09b9e0530"), 1, true, "How has this hurt influenced your addiction story?", 2, new Guid("3320719d-9af6-63cd-ced5-f7307e87fe25") },
                    { new Guid("a50a3aa4-251d-bc3a-d9e1-b9e6e01f79c9"), 6, true, "What commitment can you make to your future self today?", 3, new Guid("94a61edf-0fd8-24a5-5f4c-d57f08c3fa18") },
                    { new Guid("a5d56aae-7e9b-3d64-82ca-0f6049de7cc6"), 2, true, "Who can you contact immediately when those thoughts appear?", 3, new Guid("94a61edf-0fd8-24a5-5f4c-d57f08c3fa18") },
                    { new Guid("a88f821e-2852-dee8-b1c7-0c7fb85db4b0"), 2, true, "What healthy way can you express one difficult emotion today?", 3, new Guid("3320719d-9af6-63cd-ced5-f7307e87fe25") },
                    { new Guid("a8f407c3-55e9-0645-d32c-82b04f8dc5b6"), 3, true, "What are three things you are grateful for today?", 1, new Guid("e74c88f7-6f59-688c-f224-849ceab3ebad") },
                    { new Guid("acdccd58-4d7d-419b-157f-2eb259c45f37"), 2, true, "What emotions do you avoid most often?", 1, new Guid("3320719d-9af6-63cd-ced5-f7307e87fe25") },
                    { new Guid("b556eecd-2a1d-5c0d-a9c1-1a1ca0abd542"), 3, true, "How can gratitude support you during cravings?", 2, new Guid("e74c88f7-6f59-688c-f224-849ceab3ebad") },
                    { new Guid("b9306229-4a14-eb56-de8e-dd8ce2c36e52"), 4, true, "What would self-forgiveness look like this week?", 3, new Guid("e74c88f7-6f59-688c-f224-849ceab3ebad") },
                    { new Guid("bdbb002a-cc12-47c3-3a86-a3fbe4d493c3"), 5, true, "How can trust be rebuilt one action at a time?", 3, new Guid("e74c88f7-6f59-688c-f224-849ceab3ebad") },
                    { new Guid("c0af9654-7a1e-b278-63c8-d11df8d1e584"), 3, true, "What exit plan will you use in unsafe environments?", 3, new Guid("94a61edf-0fd8-24a5-5f4c-d57f08c3fa18") },
                    { new Guid("c3502a9b-236a-a631-3c46-aa434ee73b7b"), 5, true, "What boundaries protect you when discussing trauma?", 1, new Guid("3320719d-9af6-63cd-ced5-f7307e87fe25") },
                    { new Guid("c4c5e04d-55dd-eae0-77ad-0a1a9c21f132"), 5, true, "Which grounding technique works best for you?", 3, new Guid("3320719d-9af6-63cd-ced5-f7307e87fe25") },
                    { new Guid("c5bae6d0-0283-1d43-fe39-076ce0d88742"), 3, true, "Which boundaries are non-negotiable after discharge?", 2, new Guid("94a61edf-0fd8-24a5-5f4c-d57f08c3fa18") },
                    { new Guid("c8743f18-c898-368e-9758-5f3cfee822fd"), 4, true, "What does forgiveness mean in your own words?", 1, new Guid("e74c88f7-6f59-688c-f224-849ceab3ebad") },
                    { new Guid("d3ebff8b-43f6-f707-8e1e-28baf51baba2"), 5, true, "What helps you let go when you cannot control an outcome?", 2, new Guid("e74c88f7-6f59-688c-f224-849ceab3ebad") },
                    { new Guid("d8a66a6d-26d6-f3d9-e525-c9f14adb8b02"), 4, true, "Is there someone you need to forgive to move forward?", 2, new Guid("e74c88f7-6f59-688c-f224-849ceab3ebad") },
                    { new Guid("db18abac-c6e6-06e3-4699-c6b256c224ca"), 7, true, "What is your key message to yourself when cravings hit?", 3, new Guid("94a61edf-0fd8-24a5-5f4c-d57f08c3fa18") },
                    { new Guid("dcb905b5-cf3f-7330-9100-40f55e003ae4"), 7, true, "What is your first 7-day post-program action plan?", 2, new Guid("94a61edf-0fd8-24a5-5f4c-d57f08c3fa18") },
                    { new Guid("e80a7061-c44c-8a01-c290-e5db5c1ce706"), 4, true, "What belief about yourself needs to change for recovery to last?", 1, new Guid("33e552ec-eb11-2489-3f59-475ec3f06114") },
                    { new Guid("e9b07766-06a7-b327-af84-7fd9227b911d"), 3, true, "Which coping strategy has worked for you in the past?", 2, new Guid("33e552ec-eb11-2489-3f59-475ec3f06114") },
                    { new Guid("eb68cbb7-9128-ce2f-3f1e-d45bb7b02c3a"), 1, true, "What is your first-step response when that trigger appears?", 3, new Guid("94a61edf-0fd8-24a5-5f4c-d57f08c3fa18") },
                    { new Guid("f1c63432-85dc-9db4-9682-cf67ff8dfce2"), 4, true, "How does self-talk affect your daily choices?", 2, new Guid("33e552ec-eb11-2489-3f59-475ec3f06114") },
                    { new Guid("f415fbef-6297-5095-faf3-dd69614273a0"), 3, true, "What compassionate truth can replace it?", 3, new Guid("3320719d-9af6-63cd-ced5-f7307e87fe25") },
                    { new Guid("f4611fad-43b9-764c-4029-a13874150461"), 5, true, "Where is your written plan stored and who has a copy?", 2, new Guid("94a61edf-0fd8-24a5-5f4c-d57f08c3fa18") },
                    { new Guid("f4fa4c7a-5d15-80c6-2909-85518a97f912"), 6, true, "How can you recover quickly after a difficult day?", 2, new Guid("33e552ec-eb11-2489-3f59-475ec3f06114") },
                    { new Guid("f9057826-d11c-997e-15e5-d54394d6b1e7"), 5, true, "What boundary protects your recovery progress?", 3, new Guid("33e552ec-eb11-2489-3f59-475ec3f06114") },
                    { new Guid("fbf09562-de3d-9ef0-8cd3-821a7d290a7b"), 6, true, "What relationship needs rebuilding through consistent action?", 2, new Guid("3320719d-9af6-63cd-ced5-f7307e87fe25") },
                    { new Guid("fd3e0267-3da4-94cf-c209-923a25557d83"), 5, true, "Who supports your change and how do they help?", 1, new Guid("33e552ec-eb11-2489-3f59-475ec3f06114") }
                });

            migrationBuilder.CreateIndex(
                name: "UQ_GroupTherapyDailyQuestion_Subject_Day_Sort",
                table: "GroupTherapyDailyQuestion",
                columns: new[] { "SubjectTemplateId", "DayNumber", "SortOrder" },
                unique: true);

            migrationBuilder.CreateIndex(
                name: "UQ_GroupTherapySubjectTemplate_Unit_Program_Week",
                table: "GroupTherapySubjectTemplate",
                columns: new[] { "UnitCode", "ProgramCode", "WeekNumber" },
                unique: true);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropTable(
                name: "GroupTherapyDailyQuestion");

            migrationBuilder.DropTable(
                name: "GroupTherapySubjectTemplate");
        }
    }
}
