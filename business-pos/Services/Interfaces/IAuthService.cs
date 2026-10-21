using GrameenPOS.Models;

namespace GrameenPOS.Services.Interfaces;

public interface IAuthService
{
    User? CurrentUser { get; }
    bool IsAuthenticated { get; }
    void SetUser(User user);
    void ClearUser();
}

