namespace coleghost_ica07
{
    public class Program
    {
        public static void Main(string[] args)
        {
            var builder = WebApplication.CreateBuilder(args);
            builder.Services.AddControllers();
            var app = builder.Build();
            app.UseCors(x => x.AllowAnyHeader().AllowAnyMethod().SetIsOriginAllowed(origin => true));
            app.MapGet("/", () => "Hello, this is Cole Ghostkeeper's ICA07 Server");

            app.Run();
        }
    }
}
