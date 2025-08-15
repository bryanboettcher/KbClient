namespace Api.ClientApp.Managers;

using System.Globalization;
using System.Runtime.CompilerServices;
using CsvHelper;
using CsvHelper.Configuration;


public class CsvInventoryLoader : IInventoryLoader
{
    public async IAsyncEnumerable<InventoryPayload> LoadInventoryAsync(string path, [EnumeratorCancellation] CancellationToken cancellationToken = default)
    {
        var config = new CsvConfiguration(CultureInfo.InvariantCulture)
        {
            NewLine = Environment.NewLine,
            Delimiter = ",",
            Quote = '"',
            HasHeaderRecord = true
        };

        using var reader = new StreamReader(path);
        using var csv = new CsvReader(reader, config);

        await foreach (var record in csv.GetRecordsAsync<InventoryPayload>(cancellationToken))
            yield return record;
    }
}