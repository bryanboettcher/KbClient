namespace Api.ClientApp.Managers;

using System.Globalization;
using System.Runtime.CompilerServices;
using CsvHelper;
using CsvHelper.Configuration;


public class CsvProductLoader : IProductLoader
{
    public async IAsyncEnumerable<ProductPayload> LoadProductsAsync(string path, [EnumeratorCancellation] CancellationToken cancellationToken = default)
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

        await foreach (var record in csv.GetRecordsAsync<ProductPayload>(cancellationToken))
            yield return record;
    }
}