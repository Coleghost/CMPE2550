using System;
using System.Collections.Generic;

namespace PracticeDemo.Models1;

public partial class Location
{
    public int Locationid { get; set; }

    public string LocationName { get; set; } = null!;

    public virtual ICollection<ItemsOffered> ItemsOffereds { get; set; } = new List<ItemsOffered>();

    public virtual ICollection<Order> Orders { get; set; } = new List<Order>();
}
