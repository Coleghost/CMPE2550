using System;
using System.Collections.Generic;

namespace PracticeDemo.Models1;

public partial class ItemsOffered
{
    public int Locationid { get; set; }

    public int Itemid { get; set; }

    public bool OfferedStatus { get; set; }

    public virtual Item Item { get; set; } = null!;

    public virtual Location Location { get; set; } = null!;
}
