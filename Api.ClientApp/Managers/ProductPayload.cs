namespace Api.ClientApp.Managers;

public class ProductPayload
{
    public string Sku { get; set; } = "";
    public string Name { get; set; } = "";
    public decimal? Width { get; set; }
    public decimal? Length { get; set; }
    public decimal? Height { get; set; }
    public decimal? Weight { get; set; }
    public int Quantity { get; set; }
    public string PartNumber { get; set; } = "";
    public int? StockThreshold { get; set; }
    public TimeSpan? LeadTime { get; set; }
}