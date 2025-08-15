namespace Api.ClientApp.Managers;

public class InventoryPayload
{
    public string PartNumber { get; set; } = "";
    public string Description { get; set; } = "";
    public int StockQuantity { get; set; }
}