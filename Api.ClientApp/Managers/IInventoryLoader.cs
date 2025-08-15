namespace Api.ClientApp.Managers;

public interface IInventoryLoader
{
    IAsyncEnumerable<InventoryPayload> LoadInventoryAsync(string path, CancellationToken cancellationToken = default);
}