namespace Api.ClientApp.Managers;

using ApiClient.Models;


/// <summary>
/// Provides management operations for inventory items.
/// </summary>
public interface IInventoryManager
{
    /// <summary>
    /// Retrieves a paginated list of inventory items.
    /// </summary>
    /// <param name="page">The page number to retrieve (0-based). Defaults to 0.</param>
    /// <param name="size">The number of items per page. Defaults to 25.</param>
    /// <param name="cancellationToken">A cancellation token that can be used to cancel the operation.</param>
    /// <returns>A paginated response containing inventory items, or null if the request fails.</returns>
    Task<PaginatedResponseOfInventoryModel?> GetInventoryAsync(int page = 0, int size = 25, CancellationToken cancellationToken = default);

    /// <summary>
    /// Creates a new inventory item.
    /// </summary>
    /// <param name="partNumber">The unique part number for the inventory item.</param>
    /// <param name="description">A description of the inventory item.</param>
    /// <param name="stockQuantity">The initial stock quantity for the item.</param>
    /// <param name="cancellationToken">A cancellation token that can be used to cancel the operation.</param>
    /// <returns>The created inventory item, or null if creation fails.</returns>
    Task<InventoryModel?> CreateInventoryAsync(string partNumber, string description, int? stockQuantity, CancellationToken cancellationToken = default);

    /// <summary>
    /// Retrieves a specific inventory item by its ID.
    /// </summary>
    /// <param name="inventoryId">The unique identifier of the inventory item.</param>
    /// <param name="cancellationToken">A cancellation token that can be used to cancel the operation.</param>
    /// <returns>The inventory item, or null if not found.</returns>
    Task<InventoryModel?> GetInventoryByIdAsync(Guid inventoryId, CancellationToken cancellationToken = default);

    /// <summary>
    /// Deletes an inventory item.
    /// </summary>
    /// <param name="inventoryId">The unique identifier of the inventory item to delete.</param>
    /// <param name="cancellationToken">A cancellation token that can be used to cancel the operation.</param>
    /// <returns>The deleted inventory item, or null if deletion fails.</returns>
    Task<InventoryModel?> DeleteInventoryAsync(Guid inventoryId, CancellationToken cancellationToken = default);

    /// <summary>
    /// Increases the stock quantity of an inventory item.
    /// </summary>
    /// <param name="inventoryId">The unique identifier of the inventory item.</param>
    /// <param name="amount">The amount to increase the stock by.</param>
    /// <param name="cancellationToken">A cancellation token that can be used to cancel the operation.</param>
    /// <returns>The updated inventory item, or null if the operation fails.</returns>
    Task<InventoryModel?> IncreaseStockAsync(Guid inventoryId, int amount, CancellationToken cancellationToken = default);

    /// <summary>
    /// Decreases the stock quantity of an inventory item.
    /// </summary>
    /// <param name="inventoryId">The unique identifier of the inventory item.</param>
    /// <param name="amount">The amount to decrease the stock by.</param>
    /// <param name="cancellationToken">A cancellation token that can be used to cancel the operation.</param>
    /// <returns>The updated inventory item, or null if the operation fails.</returns>
    Task<InventoryModel?> DecreaseStockAsync(Guid inventoryId, int amount, CancellationToken cancellationToken = default);

    /// <summary>
    /// Updates the description of an inventory item.
    /// </summary>
    /// <param name="inventoryId">The unique identifier of the inventory item.</param>
    /// <param name="description">The new description for the inventory item.</param>
    /// <param name="cancellationToken">A cancellation token that can be used to cancel the operation.</param>
    /// <returns>The updated inventory item, or null if the operation fails.</returns>
    Task<InventoryModel?> UpdateDescriptionAsync(Guid inventoryId, string description, CancellationToken cancellationToken = default);

    /// <summary>
    /// Puts an inventory item on hold, preventing it from being used.
    /// </summary>
    /// <param name="inventoryId">The unique identifier of the inventory item.</param>
    /// <param name="cancellationToken">A cancellation token that can be used to cancel the operation.</param>
    /// <returns>The updated inventory item, or null if the operation fails.</returns>
    Task<InventoryModel?> HoldInventoryAsync(Guid inventoryId, CancellationToken cancellationToken = default);

    /// <summary>
    /// Releases an inventory item from hold, making it available for use.
    /// </summary>
    /// <param name="inventoryId">The unique identifier of the inventory item.</param>
    /// <param name="cancellationToken">A cancellation token that can be used to cancel the operation.</param>
    /// <returns>The updated inventory item, or null if the operation fails.</returns>
    Task<InventoryModel?> ReleaseInventoryAsync(Guid inventoryId, CancellationToken cancellationToken = default);
}