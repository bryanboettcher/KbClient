namespace Api.ClientApp.Managers;

using ApiClient;
using ApiClient.Models;


public class ApiProductManager : IProductManager
{
    private readonly ApiClient _apiClient;

    public ApiProductManager(ApiClient apiClient)
    {
        _apiClient = apiClient;
    }

    public async Task<PaginatedResponseOfProductModel?> GetProductsAsync(int page = 0, int size = 25, CancellationToken cancellationToken = default)
    {
        return await _apiClient.Products.GetAsync(config =>
        {
            config.QueryParameters.Page = page;
            config.QueryParameters.Size = size;
        }, cancellationToken);
    }

    public async Task<ProductModel?> CreateProductAsync(string sku, string name, double? width, double? length, double? height, double? weight, int quantity, Guid? inventoryId, int? stockThreshold, TimeSpan? leadTime, CancellationToken cancellationToken = default)
    {
        var dimensions = (width.HasValue || length.HasValue || height.HasValue || weight.HasValue)
            ? new NullableOfProductDimensions
            {
                Width = width,
                Length = length,
                Height = height,
                Weight = weight
            }
            : null;

        var payload = new CreateProductPayload
        {
            Sku = sku,
            Name = name,
            Dimensions = dimensions,
            InventoryId = inventoryId,
            StockThreshold = stockThreshold,
            Quantity = quantity,
            LeadTime = leadTime?.ToString(@"d\.hh\:mm\:ss\.fffffff")
        };

        return await _apiClient.Products.PostAsync(payload, cancellationToken: cancellationToken);
    }

    public async Task<ProductModel?> GetProductByIdAsync(Guid productId, CancellationToken cancellationToken = default)
    {
        return await _apiClient.Products[productId].GetAsync(cancellationToken: cancellationToken);
    }

    public async Task<ProductModel?> DeleteProductAsync(Guid productId, CancellationToken cancellationToken = default)
    {
        return await _apiClient.Products[productId].DeleteAsync(cancellationToken: cancellationToken);
    }

    public async Task<ProductModel?> UpdateNameAsync(Guid productId, string name, CancellationToken cancellationToken = default)
    {
        return await _apiClient.Products[productId].Name.PatchAsync(name, cancellationToken: cancellationToken);
    }

    public async Task<ProductModel?> UpdateDimensionsAsync(Guid productId, double? width, double? length, double? height, double? weight, CancellationToken cancellationToken = default)
    {
        var dimensions = new NullableOfProductDimensions2
        {
            Width = width,
            Length = length,
            Height = height,
            Weight = weight
        };

        return await _apiClient.Products[productId].Dimensions.PatchAsync(dimensions, cancellationToken: cancellationToken);
    }

    public async Task<ProductModel?> UpdateStockThresholdAsync(Guid productId, int? stockThreshold, CancellationToken cancellationToken = default)
    {
        return await _apiClient.Products[productId].StockThreshold.PatchAsync(stockThreshold, cancellationToken: cancellationToken);
    }

    public async Task<ProductModel?> UpdateLeadTimeAsync(Guid productId, TimeSpan leadTime, CancellationToken cancellationToken = default)
    {
        var leadTimeString = leadTime.ToString(@"d\.hh\:mm\:ss\.fffffff");
        return await _apiClient.Products[productId].LeadTime.PatchAsync(leadTimeString, cancellationToken: cancellationToken);
    }

    public async Task<ProductModel?> EnableProductAsync(Guid productId, CancellationToken cancellationToken = default)
    {
        return await _apiClient.Products[productId].Enable.PatchAsync(cancellationToken: cancellationToken);
    }

    public async Task<ProductModel?> DisableProductAsync(Guid productId, CancellationToken cancellationToken = default)
    {
        return await _apiClient.Products[productId].Disable.PatchAsync(cancellationToken: cancellationToken);
    }
}