namespace coleghost_ica08
{
    using Microsoft.Data.SqlClient;
    public class Program
    {
        public static void Main(string[] args)
        {
            // set up builder and controllers
            var builder = WebApplication.CreateBuilder(args);
            builder.Services.AddControllers();
            var app = builder.Build();
            app.UseCors(x => x.AllowAnyHeader().AllowAnyMethod().SetIsOriginAllowed(origin => true));

            app.MapGet("/", () => "COLE GHOSTKEEPER ICA08");

            // define the connection string
            string connectionString = "Server = data.cnt.sast.ca,24680; Database = demoUser_ClassTrak; User Id = demoUser; Password = temP2020#; Encrypt = False;";

            app.Run();
        }
    }
}
