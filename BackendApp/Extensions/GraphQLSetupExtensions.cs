using BackendApp.GraphQL.Queries;   // Dla Query
using BackendApp.GraphQL.Mutations; // Dla Mutation
using BackendApp.GraphQL.Types;     // Dla ApartmentType, BookingType, ReviewType, UserType, NodeType
using HotChocolate.Types;           // <<< DODAJ TEN USING dla UploadType
using Microsoft.Extensions.DependencyInjection;

namespace BackendApp.Extensions
{
    public static class GraphQLSetupExtensions
    {
        public static IServiceCollection AddAppGraphQL(this IServiceCollection services, bool isDevelopmentEnvironment)
        {
            services
                .AddGraphQLServer()
                .AddAuthorization()
                .AddQueryType<Query>(d => d.Name("Query"))
                .AddMutationType<Mutation>()
                .AddType<ApartmentType>()
                .AddType<BookingType>()
                .AddType<ReviewType>()
                .AddType<UserType>()
                .AddType<NodeType>()
                .AddGlobalObjectIdentification()
                .AddProjections()
                .AddFiltering()
                .AddSorting()
                .ModifyRequestOptions(opt =>
                    opt.IncludeExceptionDetails = isDevelopmentEnvironment);

            return services;
        }
    }
}