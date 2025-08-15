namespace Api.ClientApp.Managers;

public interface IProductLoader
{
    IAsyncEnumerable<ProductPayload> LoadProductsAsync(string path, CancellationToken cancellationToken = default);
}