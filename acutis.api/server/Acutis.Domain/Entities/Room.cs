namespace Acutis.Domain.Entities;

public class Room
{
    public Guid Id { get; private set; } = Guid.NewGuid();
    public string RoomNumber { get; private set; } = string.Empty;
    public string RoomType { get; private set; } = string.Empty; // Detox, Ladies, Alcohol, Drugs
    public int NumberOfResidents { get; private set; }
    public bool IsOpiateDetox { get; private set; }
    public bool IsQuarantine { get; private set; }
    public bool HasOwnWC { get; private set; }

    private Room() { }
    public Room(string number, string type, int capacity, bool isOpiateDetox = false, bool isQuarantine = false, bool hasOwnWc = false)
    {
        RoomNumber = number.Trim();
        RoomType = type.Trim();
        NumberOfResidents = capacity;
        IsOpiateDetox = isOpiateDetox;
        IsQuarantine = isQuarantine;
        HasOwnWC = hasOwnWc;
    }
}

