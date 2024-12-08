using System.Linq;
using System.Text.RegularExpressions;
using coleghost_ica11.Models;

// CONNECTION STRING :
// Scaffold-DbContext "Server=data.cnt.sast.ca,24680;Database=cghostkeeper_RestaurantDB;User Id=cghostkeeper2;Password=cnt_123;Encrypt=False;" Microsoft.EntityFrameworkCore.SqlServer -OutputDir Models
namespace coleghost_ica11
{
    public class Program
    {
        record OrderData(string custId, string itemId, string quantity, string paymentType, string locationId);
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
                    return db.Locations.Select(q => new { q.Locationid, q.LocationName }).ToList();
                }
            });

            // Get all items from the Connected DB
            app.MapGet("/GetItems", () =>
            {
                using (var db = new CghostkeeperRestaurantDbContext())
                {
                    return db.Items.Select(q => new { q.ItemName, q.ItemPrice, q.Itemid }).ToList();
                }
            });

            // Handle get request from client side
            // returns specific customer order information for location provided
            app.MapGet("/GetOrders/{locationId}/{customerId}", (string locationId, string customerId) =>
            {
                int locId;
                int custId;
                try
                {
                    // try to get params as an int
                    int.TryParse(locationId, out locId);
                    int.TryParse(customerId, out custId);
                }
                catch (Exception)
                {
                    // return error message if data is not numeric
                    return new { status = "error", message = "invalid parameters, try again" };
                }

                using (var db = new CghostkeeperRestaurantDbContext())
                {
                    // execute query on db and build result object
                    var result = from order in db.Orders
                                     // join tables
                                 join customer in db.Customers on order.Cid equals customer.Cid
                                 join item in db.Items on order.Itemid equals item.Itemid
                                 join location in db.Locations on order.Locationid equals location.Locationid
                                 // filter
                                 where order.Locationid == locId && order.Cid == custId
                                 // build the result items
                                 select new
                                 {
                                     order.OrderId,
                                     order.OrderDate,
                                     order.PaymentMethod,
                                     item.ItemName,
                                     item.ItemPrice,
                                     order.ItemCount,
                                     location.LocationName,
                                     location.Locationid,
                                     customer.Fname,
                                     customer.Lname
                                 };
                    // return the json formatted objects to the client
                    return (object)result.ToList();
                }
            });

            // Handle Delete request from client
            // returns a status and message containing info on query result
            app.MapDelete("/DeleteOrder/{orderId}/{locationId}", (string orderId, string locationId) =>
            {
                // Sanitize the orderId input
                string cleanOrderId = Regex.Replace(orderId.Trim(), @"<.*?|&;>$", string.Empty);
                string cleanLocationId = Regex.Replace(locationId.Trim(), @"<.*?|&;>$", string.Empty);
                int oId = 0;
                int lId = 0;
                // Tryparse to parse the sanitize id
                if (!int.TryParse(cleanOrderId, out oId) || oId <= 0)
                {
                    return Results.Json(new
                    {
                        status = "error",
                        message = "Order Id is invalid"
                    });
                }

                if (!int.TryParse(cleanLocationId, out lId) || lId <= 0)
                {
                    return Results.Json(new
                    {
                        status = "error",
                        message = "Location Id is invalid"
                    });
                }

                try
                {
                    using (var db = new CghostkeeperRestaurantDbContext())
                    {
                        Console.WriteLine($"Order ID {oId}, Location ID: {lId}");
                        // find the order based off the the orderId and locationId
                        var order = db.Orders.FirstOrDefault(o => o.OrderId == oId && o.Locationid == lId);
                        if (order != null)
                        {
                            db.Orders.Remove(order);
                            db.SaveChanges();
                            return Results.Json(new
                            {
                                status = "success",
                                message = "Order deleted successfully"
                            });
                        }
                        else
                        {
                            return Results.Json(new
                            {
                                status = "error",
                                message = "Order not found"
                            });
                        }
                    }
                }
                catch (Exception ex)
                {
                    return Results.Json(new
                    {
                        status = "error",
                        message = $"An error occurred: {ex.Message}"
                    });
                }
            });

            app.MapPost("/PlaceOrder", (OrderData data) =>
            {
                // Sanitize input data
                string cleanCustId = Regex.Replace(data.custId.Trim(), @"<.*?|&;>$", string.Empty);
                string cleanItemId = Regex.Replace(data.itemId.Trim(), @"<.*?|&;>$", string.Empty);
                string cleanQuantity = Regex.Replace(data.quantity.Trim(), @"<.*?|&;>$", string.Empty);
                string cleanPaymentType = Regex.Replace(data.paymentType.Trim(), @"<.*?|&;>$", string.Empty);
                string cleanLocationId = Regex.Replace(data.locationId.Trim(), @"<.*?|&;>$", string.Empty);

                int custId, itemId, quantity, locationId;

                // Tryparse to parse the sanitized data
                if (!int.TryParse(cleanCustId, out custId) || custId <= 0)
                {
                    return Results.Json(new
                    {
                        status = "error",
                        message = "Customer Id is invalid"
                    });
                }

                if (!int.TryParse(cleanItemId, out itemId) || itemId <= 0)
                {
                    return Results.Json(new
                    {
                        status = "error",
                        message = "Item Id is invalid"
                    });
                }

                if (!int.TryParse(cleanQuantity, out quantity) || quantity <= 0)
                {
                    return Results.Json(new
                    {
                        status = "error",
                        message = "Quantity is invalid"
                    });
                }

                if (!int.TryParse(cleanLocationId, out locationId) || locationId <= 0)
                {
                    return Results.Json(new
                    {
                        status = "error",
                        message = "Location Id is invalid"
                    });
                }
                
                if (cleanPaymentType == "")
                {
                    return Results.Json(new
                    {
                        status = "error",
                        message = "Payment Type is invalid"
                    });
                }

                try
                {
                    using (var db = new CghostkeeperRestaurantDbContext())
                    {
                        // check valid customer
                        var customer = db.Customers.Find(custId);
                        if (customer == null)
                        {
                            return Results.Json(new
                            {
                                status = "error",
                                message = "Customer not found"
                            });
                        }

                        // valid customer, go ahead with order
                        var order = new Order
                        {
                            Cid = custId,
                            Itemid = itemId,
                            ItemCount = quantity,
                            PaymentMethod = cleanPaymentType,
                            Locationid = locationId,
                            OrderDate = DateTime.Now
                        };

                        db.Orders.Add(order);
                        db.SaveChanges();

                        return Results.Json(new
                        {
                            status = "success",
                            message = "Order placed successfully"
                        });
                    }
                }
                catch (Exception ex)
                {
                    return Results.Json(new
                    {
                        status = "error",
                        message = $"An error occurred: {ex.Message}"
                    });
                }
            });

            app.Run();
        }
    }
}
