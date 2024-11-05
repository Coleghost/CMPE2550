namespace coleghost_ica05
{
    public class Program
    {
        public static Random random = new Random();
        record Data(string tbName, string selectItem, int numberAmount, string selectPaymentType);
        public static void Main(string[] args)
        {
            var builder = WebApplication.CreateBuilder(args);
            builder.Services.AddControllers(); // CORS services will fail without this
            var app = builder.Build();

            // allow the web service to be called from any website, local or live server
            app.UseCors(x => x.AllowAnyMethod().AllowAnyHeader().SetIsOriginAllowed(origin => true));

            app.MapGet("/", () => new { message = "Welcome to Tims!" });

            app.MapPost("/", () => new
            {
                locations = new string[] { "Bytes Location", "CAT Location", "Kingsway", "West Ed" },
                items = new Dictionary<string, double> {
                    { "Muffins", 3.29},
                    { "Croissants", 2.19 },
                    { "Cookies", 1.49 },
                    { "Iced Coffee", 2.49 },
                    { "Pumpkin Spiced Iced Capp", 4.29},
                    { "Caramel Toffee Cold Brew", 3.99 }
                }
            });

            app.MapPost("/submit", (Data data) =>
            {
                return new
                {
                    Name = data.tbName,
                    Item = data.selectItem,
                    Amount = data.numberAmount,
                    PaymentType = data.selectPaymentType,
                    Eta = random.Next(5, 31)
                };
            });
            app.Run();
        }
    }
}