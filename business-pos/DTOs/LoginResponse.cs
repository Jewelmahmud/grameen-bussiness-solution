namespace GrameenPOS.DTOs;

public class LoginResponse
{
    public bool Success { get; set; }
    public UserData? User { get; set; }
    public TokenData? Tokens { get; set; }
    public string? Message { get; set; }
}

public class UserData
{
    public string Id { get; set; } = string.Empty;
    public string Email { get; set; } = string.Empty;
    public string FirstName { get; set; } = string.Empty;
    public string LastName { get; set; } = string.Empty;
    public string Phone { get; set; } = string.Empty;
    public List<RoleData> Roles { get; set; } = new();
}

public class RoleData
{
    public int Id { get; set; }
    public string Name { get; set; } = string.Empty;
    public string Description { get; set; } = string.Empty;
}

public class TokenData
{
    public string AccessToken { get; set; } = string.Empty;
    public string RefreshToken { get; set; } = string.Empty;
    public int ExpiresIn { get; set; }
}

