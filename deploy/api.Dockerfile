FROM mcr.microsoft.com/dotnet/sdk:8.0 AS build
WORKDIR /src

COPY acutis.api/Acutis.Api/Acutis.Api.csproj acutis.api/Acutis.Api/
COPY acutis.api/Acutis.Application/Acutis.Application.csproj acutis.api/Acutis.Application/
COPY acutis.api/Acutis.Domain/Acutis.Domain.csproj acutis.api/Acutis.Domain/
COPY acutis.api/Acutis.Infrastructure/Acutis.Infrastructure.csproj acutis.api/Acutis.Infrastructure/

RUN dotnet restore acutis.api/Acutis.Api/Acutis.Api.csproj

COPY acutis.api/ acutis.api/

RUN dotnet publish acutis.api/Acutis.Api/Acutis.Api.csproj \
    -c Release \
    -o /app/publish \
    /p:UseAppHost=false

FROM mcr.microsoft.com/dotnet/aspnet:8.0 AS runtime
WORKDIR /app

ENV ASPNETCORE_URLS=http://+:5000

COPY --from=build /app/publish/ ./

EXPOSE 5000

ENTRYPOINT ["dotnet", "Acutis.Api.dll"]
