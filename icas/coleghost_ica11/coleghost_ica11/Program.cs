using System.Linq;
using System.Text.RegularExpressions;
using coleghost_ica11.Models;

// CONNECTION STRING :
// Scaffold-DbContext "Server=data.cnt.sast.ca,24680;Database=cghostkeeper_RestaurantDB;User Id=cghostkeeper2;Password=cnt_123;Encrypt=False;" Microsoft.EntityFrameworkCore.SqlServer -OutputDir Models
namespace coleghost_ica11
{
    public class Program
    {
        public static void Main(string[] args)
        {
            var builder = WebApplication.CreateBuilder(args);
            var app = builder.Build();

            app.MapGet("/", () => "Hello World!");

            app.Run();
        }
    }
}
