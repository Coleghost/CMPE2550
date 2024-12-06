using System;
using System.Collections.Generic;

namespace coleghost_ica11.Models;

public partial class Order
{
    public int OrderId { get; set; }

    public int Locationid { get; set; }

    public int Cid { get; set; }

    public string? PaymentMethod { get; set; }

    public int Itemid { get; set; }

    public int ItemCount { get; set; }

    public DateTime? OrderDate { get; set; }

    public virtual Customer CidNavigation { get; set; } = null!;

    public virtual Item Item { get; set; } = null!;

    public virtual Location Location { get; set; } = null!;
}
