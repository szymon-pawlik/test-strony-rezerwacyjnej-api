using BackendApp.Models; 
using System.Collections.Generic; 

namespace BackendApp.GraphQL.Payloads
{
    public record UserError(
        string Message,
        string Code 
    );

    public record UserPayload(
        User? User, 
        IReadOnlyList<UserError>? Errors = null 
    )
    {
        public UserPayload(User user) : this(user, null) { }
        
        public UserPayload(IReadOnlyList<UserError> errors) : this(null, errors) { }
        
        public UserPayload(UserError error) : this(null, new List<UserError> { error }) { }
    }
}