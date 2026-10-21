using GrameenPOS.Models;
using GrameenPOS.Services.Interfaces;

namespace GrameenPOS.Services;

public class AuthService : IAuthService
{
    private User? _currentUser;

    public User? CurrentUser => _currentUser;

    public bool IsAuthenticated => _currentUser != null && !string.IsNullOrEmpty(_currentUser.AccessToken);

    public void SetUser(User user)
    {
        _currentUser = user;
    }

    public void ClearUser()
    {
        _currentUser = null;
    }
}

