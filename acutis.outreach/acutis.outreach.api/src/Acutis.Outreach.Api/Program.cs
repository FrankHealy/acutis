var builder=WebApplication.CreateBuilder(args);var app=builder.Build();app.MapGet("/health",()=>Results.Ok(new{product="Acutis Outreach",status="preview"}));app.Run();public partial class Program{}
