FROM mcr.microsoft.com/dotnet/sdk:8.0 AS build
ARG PROJECT
ARG PROJECT_PATH
WORKDIR /src
COPY acutis.community/ acutis.community/
COPY acutis.practitioner/ acutis.practitioner/
COPY acutis.outreach/ acutis.outreach/
COPY acutis.shared/ acutis.shared/
RUN dotnet publish "${PROJECT_PATH}" -c Release -o /publish /p:UseAppHost=false
FROM mcr.microsoft.com/dotnet/aspnet:8.0
ARG PROJECT
WORKDIR /app
COPY --from=build /publish .
ENV PRODUCT_ASSEMBLY=${PROJECT}.dll
ENTRYPOINT ["sh","-c","dotnet $PRODUCT_ASSEMBLY"]
