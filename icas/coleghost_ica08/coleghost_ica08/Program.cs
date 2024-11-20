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
            string connectionString = "Server = data.cnt.sast.ca,24680; Database = ClassTrak; User Id = demoUser; Password = temP2020#; Encrypt = False;";

            app.MapGet("/retrieveData",() =>
            {
                // Step 1: Establish a connection to DB
                // Pass connection string here
                // Use SQLConnection class to open a connection to the db.
                SqlConnection connection = new SqlConnection(connectionString);
                // Step 2: Open the connection
                connection.Open();
                // Step 3:  Prepare your query
                string query = "SELECT * FROM Students WHERE first_name LIKE 'E%' OR first_name LIKE 'F%'";
                // step 4: execute SQL
                SqlCommand command = new SqlCommand(query, connection);
                // step 5: run query
                SqlDataReader reader = command.ExecuteReader();
                var students = new List<Student>();
                while (reader.Read())
                {
                    var id = reader["student_id"];
                    students.Add(new Student(reader["student_id"], reader["last_name"], reader["first_name"], reader["school_id"]));
                }
                connection.Close();
                return Results.Json(new
                {
                    status = "Success",
                    students
                });
            });
            app.Run();
        }
    }

    public class Student
    {
        public int StudentId { get; set; }
        public string LastName { get; set; }
        public string FirstName { get; set; }
        public int SchoolId { get; set; }
        public Student(object studentid, object lastname, object firstname, object schoolid)
        {
            StudentId = (int)studentid;
            LastName = (string)lastname;
            FirstName = (string)firstname;
            SchoolId = (int)schoolid;
        }
    }
}
