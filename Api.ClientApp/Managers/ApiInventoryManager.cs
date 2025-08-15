namespace Api.ClientApp.Managers;

using ApiClient;
using ApiClient.Models;

public class ApiInventoryManager : IInventoryManager
{
    private readonly ApiClient _apiClient;

    public ApiInventoryManager(ApiClient apiClient)
    {
        _apiClient = apiClient;
    }

    public async Task<PaginatedResponseOfInventoryModel?> GetInventoryAsync(int page = 0, int size = 25, CancellationToken cancellationToken = default)
    {
        return await _apiClient.Inventory.GetAsync(config =>
        {
            config.QueryParameters.Page = page;
            config.QueryParameters.Size = size;
        }, cancellationToken);
    }

    public async Task<InventoryModel?> CreateInventoryAsync(string partNumber, string description, int? stockQuantity,
        CancellationToken cancellationToken = default)
    {
        var payload = new CreateInventoryPayload
        {
            PartNumber = partNumber,
            Description = description,
            StockQuantity = stockQuantity
        };

        return await _apiClient.Inventory.PostAsync(payload, cancellationToken: cancellationToken);
    }

    public async Task<InventoryModel?> GetInventoryByIdAsync(Guid inventoryId, CancellationToken cancellationToken = default)
    {
        return await _apiClient.Inventory[inventoryId].GetAsync(cancellationToken: cancellationToken);
    }

    public async Task<InventoryModel?> DeleteInventoryAsync(Guid inventoryId, CancellationToken cancellationToken = default)
    {
        return await _apiClient.Inventory[inventoryId].DeleteAsync(cancellationToken: cancellationToken);
    }

    public async Task<InventoryModel?> IncreaseStockAsync(Guid inventoryId, int amount, CancellationToken cancellationToken = default)
    {
        return await _apiClient.Inventory[inventoryId].Increase[amount].PatchAsync(cancellationToken: cancellationToken);
    }

    public async Task<InventoryModel?> DecreaseStockAsync(Guid inventoryId, int amount, CancellationToken cancellationToken = default)
    {
        return await _apiClient.Inventory[inventoryId].Decrease[amount].PatchAsync(cancellationToken: cancellationToken);
    }

    public async Task<InventoryModel?> UpdateDescriptionAsync(Guid inventoryId, string description, CancellationToken cancellationToken = default)
    {
        return await _apiClient.Inventory[inventoryId].Description.PatchAsync(description, cancellationToken: cancellationToken);
    }

    public async Task<InventoryModel?> HoldInventoryAsync(Guid inventoryId, CancellationToken cancellationToken = default)
    {
        return await _apiClient.Inventory[inventoryId].Hold.PatchAsync(cancellationToken: cancellationToken);
    }

    public async Task<InventoryModel?> ReleaseInventoryAsync(Guid inventoryId, CancellationToken cancellationToken = default)
    {
        return await _apiClient.Inventory[inventoryId].Release.PatchAsync(cancellationToken: cancellationToken);
    }
}