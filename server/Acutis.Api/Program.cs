using Acutis.Application;
using Acutis.Application.Validators;
using Acutis.Infrastructure;
using FluentValidation;
using Microsoft.AspNetCore.Builder;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.Extensions.Hosting;
using Microsoft.Extensions.Options;


var builder = WebApplication.CreateBuilder(args);

builder.Services.AddApplication();
builder.Services.AddInfrastructure(builder.Configuration);
builder.Services.AddControllers();
builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen();
builder.Services.AddValidatorsFromAssemblyContaining<CreateResidentRequestValidator>();
builder.Services.AddValidatorsFromAssemblyContaining<UpdateResidentRequestValidator>();
builder.Services.AddCors(options =>
{
    options.AddPolicy("Acutis", cors => cors
.WithOrigins("http://localhost:3000", "https://localhost:3000")
.AllowAnyHeader()
.AllowAnyMethod()
.AllowCredentials() // only if you need cookies/auth
);
});
var app = builder.Build();
if (app.Environment.IsDevelopment()) { app.UseSwagger(); app.UseSwaggerUI(); }

app.UseHttpsRedirection();
app.UseAuthorization();
app.UseCors("Acutis");
app.MapControllers();
app.Run();
