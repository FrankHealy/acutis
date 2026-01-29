using FluentValidation;
using Microsoft.Extensions.DependencyInjection;

namespace Acutis.Application
{
    public static class ApplicationServiceRegistration
    {
        public static IServiceCollection AddApplication(this IServiceCollection services)
        {
            // Registers all validators in the Application assembly
            services.AddValidatorsFromAssembly(typeof(ApplicationServiceRegistration).Assembly);

            // No more AddFluentValidationAutoValidation / AddFluentValidationClientsideAdapters in v12.
            // ASP.NET Core's built-in model validation will now invoke FluentValidation automatically
            // when validators are registered through DI.

            return services;
        }
    }
}
