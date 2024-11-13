namespace asp_demo_02
{
    public class Program
    {
        public static void Main(string[] args)
        {
            //SQL Server info
            //data.cnt.sast.ca,24860
            //demoUser
            //temP2020#
            var builder = WebApplication.CreateBuilder(args);
            builder.Services.AddControllers();
            var app = builder.Build();
            app.UseCors(x => x.AllowAnyMethod().AllowAnyHeader().SetIsOriginAllowed(origin => true));

            app.MapGet("/", () => "Hello World!");

            app.Run();
        }
    }
}
