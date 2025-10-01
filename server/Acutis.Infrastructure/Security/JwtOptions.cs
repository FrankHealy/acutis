﻿namespace Acutis.Infrastructure.Security;

public class JwtOptions
{
    public string Issuer { get; set; } = string.Empty;
    public string Audience { get; set; } = string.Empty;
    public string SigningKey { get; set; } = string.Empty;
    public TimeSpan DefaultLifetime { get; set; } = TimeSpan.FromHours(1);
}
