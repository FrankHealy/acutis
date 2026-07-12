FROM mcr.microsoft.com/dotnet/sdk:8.0 AS build
WORKDIR /src

COPY acutis.centre/acutis.centre.api/ acutis.centre/acutis.centre.api/
COPY acutis.centre/acutis.centre.db/ acutis.centre/acutis.centre.db/

RUN dotnet restore acutis.centre/acutis.centre.api/src/Acutis.Api/Acutis.Api.csproj

RUN dotnet publish acutis.centre/acutis.centre.api/src/Acutis.Api/Acutis.Api.csproj \
    -c Release \
    -o /app/publish \
    /p:UseAppHost=false

FROM mcr.microsoft.com/dotnet/aspnet:8.0 AS runtime
WORKDIR /app

ENV ASPNETCORE_URLS=http://+:5000

COPY --from=build /app/publish/ ./

EXPOSE 5000

ENTRYPOINT ["dotnet", "Acutis.Api.dll"]
