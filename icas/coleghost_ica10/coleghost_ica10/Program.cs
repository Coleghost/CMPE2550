using coleghost_ica10.Models;
using System.Linq;

namespace coleghost_ica10
{
    public class Program
    {
        public static void Main(string[] args)
        {
            // set up builder and controllers
            var builder = WebApplication.CreateBuilder(args);
            builder.Services.AddControllers();
            var app = builder.Build();
            app.UseCors(x => x.AllowAnyHeader().AllowAnyMethod().SetIsOriginAllowed(origin => true));

            app.MapGet("/", () => "Hello World!");

            // Get all locations from the Connected DB
            app.MapGet("/GetLocations", () =>
            {
                using (var db = new CghostkeeperRestaurantDbContext())
                {
                    return db.Locations.Select(q => new { q.Locationid, q.LocationName}).ToList();
                }
            });

            app.MapGet("/GetOrders/{locationId}/{customerId}", (string locationId, string customerId) =>
            {
                int locId;
                int custId;
                try
                {
                    int.TryParse(locationId, out locId);
                    int.TryParse(customerId, out custId);
                }
                catch (Exception)
                {
                    return new { status = "error", message = "invalid parameters, try again"};
                }

                using (var db = new CghostkeeperRestaurantDbContext())
                {
                    var result = from order in db.Orders
                                 join customer in db.Customers on order.Cid equals customer.Cid
                                 join item in db.Items on order.Itemid equals item.Itemid
                                 join location in db.Locations on order.Locationid equals location.Locationid
                                 where order.Locationid == locId && order.Cid == custId
                                 select new
                                 {
                                     order.OrderId,
                                     order.OrderDate,
                                     order.PaymentMethod,
                                     item.ItemName,
                                     item.ItemPrice,
                                     order.ItemCount,
                                     location.LocationName,
                                     customer.Fname,
                                     customer.Lname
                                 };
                    return (object) result.ToList();
                }
            });

            app.Run();
        }
    }
}
