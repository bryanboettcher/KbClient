namespace Api.ClientApp;

using Managers;
using ApiClient.Models;

public class CatalogLoader
{
    private readonly IInventoryManager _inventoryManager;
    private readonly IProductManager _productManager;
    private readonly IInventoryLoader _inventoryLoader;
    private readonly IProductLoader _productLoader;

    public CatalogLoader(
        IInventoryManager inventoryManager, 
        IProductManager productManager,
        IInventoryLoader inventoryLoader,
        IProductLoader productLoader
    )
    {
        _inventoryManager = inventoryManager;
        _productManager = productManager;
        _inventoryLoader = inventoryLoader;
        _productLoader = productLoader;
    }

    public async Task CreateCatalog(string inventoryPath = "inventory.csv", string productsPath = "products.csv", CancellationToken cancellationToken = default)
    {
        // In-memory dictionaries to track created objects
        var inventoryModels = new Dictionary<string, InventoryModel>();
        var productModels = new Dictionary<string, ProductModel>();

        // Mapping from PartNumber to InventoryId for product creation
        var partNumberToInventoryId = new Dictionary<string, Guid?>(StringComparer.OrdinalIgnoreCase);

        Console.WriteLine("Starting catalog creation...");

        await CreateInventory(inventoryPath, cancellationToken, inventoryModels, partNumberToInventoryId);
        await CreateProducts(productsPath, cancellationToken, partNumberToInventoryId, productModels);
        
        ShowSummary(inventoryModels, productModels);
    }
    private static void ShowSummary(Dictionary<string, InventoryModel> inventoryModels, Dictionary<string, ProductModel> productModels)
    {
        // Final summary
        Console.WriteLine();
        Console.WriteLine("=== Catalog Creation Summary ===");
        Console.WriteLine($"Inventory Items Created: {inventoryModels.Count}");
        Console.WriteLine($"Products Created: {productModels.Count}");
        Console.WriteLine($"Total Items in Catalog: {inventoryModels.Count + productModels.Count}");

        if (inventoryModels.Count > 0)
        {
            Console.WriteLine();
            Console.WriteLine("Inventory Items:");
            foreach (var kvp in inventoryModels.Take(5)) // Show first 5
            {
                Console.WriteLine($"  {kvp.Key}: {kvp.Value.Description} (Stock: {kvp.Value.StockQuantity})");
            }
            if (inventoryModels.Count > 5)
            {
                Console.WriteLine($"  ... and {inventoryModels.Count - 5} more inventory items");
            }
        }

        if (productModels.Count > 0)
        {
            Console.WriteLine();
            Console.WriteLine("Products:");
            foreach (var kvp in productModels.Take(5)) // Show first 5
            {
                Console.WriteLine($"  {kvp.Key}: {kvp.Value.Name}");
            }
            if (productModels.Count > 5)
            {
                Console.WriteLine($"  ... and {productModels.Count - 5} more products");
            }
        }

        Console.WriteLine("Catalog creation completed successfully!");
    }

    private async Task CreateProducts(string productsPath, CancellationToken cancellationToken, Dictionary<string, Guid?> partNumberToInventoryId, Dictionary<string, ProductModel> productModels)
    {
        // Phase 2: Create all products, mapping PartNumber to InventoryId
        Console.WriteLine("Phase 2: Creating products...");
        var productCount = 0;
        var skippedCount = 0;

        await foreach (var productPayload in _productLoader.LoadProductsAsync(productsPath, cancellationToken))
        {
            try
            {
                cancellationToken.ThrowIfCancellationRequested();

                var stockThreshold = productPayload.StockThreshold;

                var inventoryId = partNumberToInventoryId.GetValueOrDefault(productPayload.PartNumber, null);
                if (inventoryId is null)
                    stockThreshold = null;

                var productModel = await _productManager.CreateProductAsync(
                    productPayload.Sku,
                    productPayload.Name,
                    (double?)productPayload.Width,
                    (double?)productPayload.Length,
                    (double?)productPayload.Height,
                    (double?)productPayload.Weight,
                    productPayload.Quantity,
                    inventoryId,
                    stockThreshold,
                    productPayload.LeadTime,
                    cancellationToken
                );

                if (productModel?.ProductId.HasValue == true)
                {
                    // Store in tracking dictionary
                    productModels[productPayload.Sku] = productModel;

                    productCount++;
                    Console.WriteLine($"Created product: {productPayload.Sku} -> Inventory: {productPayload.PartNumber} (Product ID: {productModel.ProductId})");
                }
                else
                {
                    Console.WriteLine($"Warning: Failed to create product {productPayload.Sku} - no ID returned");
                }
            }
            catch (OperationCanceledException)
            {
                throw;
            }
            catch (Exception ex)
            {
                Console.WriteLine($"Error creating product {productPayload.Sku}: {ex.Message}");
                // Continue processing other items
            }
        }

        Console.WriteLine($"Phase 2 complete: Created {productCount} products, skipped {skippedCount} products");
    }

    private async Task CreateInventory(string inventoryPath, CancellationToken cancellationToken, Dictionary<string, InventoryModel> inventoryModels, Dictionary<string, Guid?> partNumberToInventoryId)
    {
        // Phase 1: Create all inventory items first
        Console.WriteLine("Phase 1: Creating inventory items...");
        var inventoryCount = 0;

        await foreach (var inventoryPayload in _inventoryLoader.LoadInventoryAsync(inventoryPath, cancellationToken))
        {
            try
            {
                cancellationToken.ThrowIfCancellationRequested();

                var inventoryModel = await _inventoryManager.CreateInventoryAsync(
                    inventoryPayload.PartNumber,
                    inventoryPayload.Description,
                    inventoryPayload.StockQuantity,
                    cancellationToken
                );

                if (inventoryModel?.InventoryId.HasValue == true)
                {
                    // Store in tracking dictionaries
                    inventoryModels[inventoryPayload.PartNumber] = inventoryModel;
                    partNumberToInventoryId[inventoryPayload.PartNumber] = inventoryModel.InventoryId.Value;

                    inventoryCount++;
                    Console.WriteLine($"Created inventory item: {inventoryPayload.PartNumber} (ID: {inventoryModel.InventoryId})");
                }
                else
                {
                    Console.WriteLine($"Warning: Failed to create inventory item {inventoryPayload.PartNumber} - no ID returned");
                }
            }
            catch (OperationCanceledException)
            {
                throw;
            }
            catch (Exception ex)
            {
                Console.WriteLine($"Error creating inventory item {inventoryPayload.PartNumber}: {ex.Message}");
                // Continue processing other items
            }
        }

        Console.WriteLine($"Phase 1 complete: Created {inventoryCount} inventory items");
    }
}