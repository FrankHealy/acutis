namespace Acutis.Application.Interfaces;

public interface ITokenService
{
    string CreateAccessToken(string userId, string userName, IEnumerable<string> scopes, TimeSpan lifetime);
}
