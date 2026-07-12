FROM mcr.microsoft.com/dotnet/sdk:8.0 AS build
ARG PROJECT
WORKDIR /src
COPY acutis.api/ acutis.api/
RUN dotnet publish "acutis.api/${PROJECT}/${PROJECT}.csproj" -c Release -o /publish /p:UseAppHost=false
FROM mcr.microsoft.com/dotnet/aspnet:8.0
ARG PROJECT
WORKDIR /app
COPY --from=build /publish .
ENV PRODUCT_ASSEMBLY=${PROJECT}.dll
ENTRYPOINT ["sh","-c","dotnet $PRODUCT_ASSEMBLY"]
