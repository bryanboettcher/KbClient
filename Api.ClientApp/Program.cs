namespace Api.ClientApp;

using Managers;
using ApiClient;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.Extensions.Hosting;
using Microsoft.Kiota.Abstractions.Authentication;
using Microsoft.Kiota.Http.HttpClientLibrary;


internal class Program
{
    static async Task Main(string[] args)
    {
        var builder = Host.CreateApplicationBuilder(args);

        Configure(builder);

        var app = builder.Build();
        var loader = app.Services.GetRequiredService<CatalogLoader>();

        await loader.CreateCatalog();
    }

    private static void Configure(HostApplicationBuilder builder)
    {
        builder.Services.AddScoped(provider =>
        {
            var authProvider = new AnonymousAuthenticationProvider();
            var httpClient = new HttpClient();

            var requestAdapter = new HttpClientRequestAdapter(
                authenticationProvider: authProvider,
                httpClient: httpClient
            );

            return new ApiClient(requestAdapter);
        });

        // Register Manager Services
        builder.Services.AddScoped<IInventoryManager, ApiInventoryManager>();
        builder.Services.AddScoped<IInventoryLoader, CsvInventoryLoader>();
        builder.Services.AddScoped<IProductManager, ApiProductManager>();
        builder.Services.AddScoped<IProductLoader, CsvProductLoader>();

        builder.Services.AddScoped<CatalogLoader>();
    }
}
