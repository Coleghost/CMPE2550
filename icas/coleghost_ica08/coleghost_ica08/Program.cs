using Microsoft.Data.SqlClient;

namespace coleghost_ica08
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

            app.MapGet("/", () => "COLE GHOSTKEEPER ICA08");

            // define the connection string
            string connectionString = "Server = data.cnt.sast.ca,24680; Database = demoUser_ClassTrak; User Id = demoUser; Password = temP2020#; Encrypt = False;";

            app.MapGet("/retrieveData",() =>
            {
                // Step 1: Establish a connection to DB
                // Pass connection string here
                // Use SQLConnection class to open a connection to the db.
                SqlConnection connection = new SqlConnection(connectionString);
                // Step 2: Open the connection
                connection.Open();
                // Step 3:  Prepare your query
                string query = "SELECT * FROM Students WHERE first_name = E% OR first_name = F%";
                // step 4: execute SQL
                SqlCommand command = new SqlCommand(query, connection);
                // step 5: run query
                SqlDataReader reader = command.ExecuteReader();
                
                while (reader.Read())
                {

                }
            });
            app.Run();
        }
    }
}
