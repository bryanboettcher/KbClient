namespace Api.ClientApp.Managers;

using ApiClient.Models;


/// <summary>
/// Provides management operations for products.
/// </summary>
public interface IProductManager
{
    /// <summary>
    /// Retrieves a paginated list of products.
    /// </summary>
    /// <param name="page">The page number to retrieve (0-based). Defaults to 0.</param>
    /// <param name="size">The number of items per page. Defaults to 25.</param>
    /// <param name="cancellationToken">A cancellation token that can be used to cancel the operation.</param>
    /// <returns>A paginated response containing products, or null if the request fails.</returns>
    Task<PaginatedResponseOfProductModel?> GetProductsAsync(int page = 0, int size = 25, CancellationToken cancellationToken = default);

    /// <summary>
    /// Creates a new product.
    /// </summary>
    /// <param name="sku">The unique SKU (Stock Keeping Unit) for the product.</param>
    /// <param name="name">The name of the product.</param>
    /// <param name="width">The width dimension of the product.</param>
    /// <param name="length">The length dimension of the product.</param>
    /// <param name="height">The height dimension of the product.</param>
    /// <param name="weight">The weight of the product.</param>
    /// <param name="quantity">The quantity of the product.</param>
    /// <param name="inventoryId">The unique identifier of the associated inventory item.</param>
    /// <param name="stockThreshold">The minimum stock threshold for the product.</param>
    /// <param name="leadTime">The lead time for the product as a TimeSpan.</param>
    /// <param name="cancellationToken">A cancellation token that can be used to cancel the operation.</param>
    /// <returns>The created product, or null if creation fails.</returns>
    Task<ProductModel?> CreateProductAsync(string sku, string name, double? width, double? length, double? height, double? weight, int quantity, Guid? inventoryId, int? stockThreshold, TimeSpan? leadTime, CancellationToken cancellationToken = default);

    /// <summary>
    /// Retrieves a specific product by its ID.
    /// </summary>
    /// <param name="productId">The unique identifier of the product.</param>
    /// <param name="cancellationToken">A cancellation token that can be used to cancel the operation.</param>
    /// <returns>The product, or null if not found.</returns>
    Task<ProductModel?> GetProductByIdAsync(Guid productId, CancellationToken cancellationToken = default);

    /// <summary>
    /// Deletes a product.
    /// </summary>
    /// <param name="productId">The unique identifier of the product to delete.</param>
    /// <param name="cancellationToken">A cancellation token that can be used to cancel the operation.</param>
    /// <returns>The deleted product, or null if deletion fails.</returns>
    Task<ProductModel?> DeleteProductAsync(Guid productId, CancellationToken cancellationToken = default);

    /// <summary>
    /// Updates the name of a product.
    /// </summary>
    /// <param name="productId">The unique identifier of the product.</param>
    /// <param name="name">The new name for the product.</param>
    /// <param name="cancellationToken">A cancellation token that can be used to cancel the operation.</param>
    /// <returns>The updated product, or null if the operation fails.</returns>
    Task<ProductModel?> UpdateNameAsync(Guid productId, string name, CancellationToken cancellationToken = default);

    /// <summary>
    /// Updates the dimensions of a product.
    /// </summary>
    /// <param name="productId">The unique identifier of the product.</param>
    /// <param name="width">The new width dimension.</param>
    /// <param name="length">The new length dimension.</param>
    /// <param name="height">The new height dimension.</param>
    /// <param name="weight">The new weight.</param>
    /// <param name="cancellationToken">A cancellation token that can be used to cancel the operation.</param>
    /// <returns>The updated product, or null if the operation fails.</returns>
    Task<ProductModel?> UpdateDimensionsAsync(Guid productId, double? width, double? length, double? height, double? weight, CancellationToken cancellationToken = default);

    /// <summary>
    /// Updates the stock threshold of a product.
    /// </summary>
    /// <param name="productId">The unique identifier of the product.</param>
    /// <param name="stockThreshold">The new stock threshold value.</param>
    /// <param name="cancellationToken">A cancellation token that can be used to cancel the operation.</param>
    /// <returns>The updated product, or null if the operation fails.</returns>
    Task<ProductModel?> UpdateStockThresholdAsync(Guid productId, int? stockThreshold, CancellationToken cancellationToken = default);

    /// <summary>
    /// Updates the lead time of a product.
    /// </summary>
    /// <param name="productId">The unique identifier of the product.</param>
    /// <param name="leadTime">The new lead time as a TimeSpan.</param>
    /// <param name="cancellationToken">A cancellation token that can be used to cancel the operation.</param>
    /// <returns>The updated product, or null if the operation fails.</returns>
    Task<ProductModel?> UpdateLeadTimeAsync(Guid productId, TimeSpan leadTime, CancellationToken cancellationToken = default);

    /// <summary>
    /// Enables a product, making it available for use.
    /// </summary>
    /// <param name="productId">The unique identifier of the product.</param>
    /// <param name="cancellationToken">A cancellation token that can be used to cancel the operation.</param>
    /// <returns>The updated product, or null if the operation fails.</returns>
    Task<ProductModel?> EnableProductAsync(Guid productId, CancellationToken cancellationToken = default);

    /// <summary>
    /// Disables a product, preventing it from being used.
    /// </summary>
    /// <param name="productId">The unique identifier of the product.</param>
    /// <param name="cancellationToken">A cancellation token that can be used to cancel the operation.</param>
    /// <returns>The updated product, or null if the operation fails.</returns>
    Task<ProductModel?> DisableProductAsync(Guid productId, CancellationToken cancellationToken = default);
}