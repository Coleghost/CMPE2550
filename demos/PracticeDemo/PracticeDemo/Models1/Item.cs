using System;
using System.Collections.Generic;

namespace PracticeDemo.Models1;

public partial class Item
{
    public int Itemid { get; set; }

    public string ItemName { get; set; } = null!;

    public double ItemPrice { get; set; }

    public virtual ICollection<ItemsOffered> ItemsOffereds { get; set; } = new List<ItemsOffered>();

    public virtual ICollection<Order> Orders { get; set; } = new List<Order>();
}
