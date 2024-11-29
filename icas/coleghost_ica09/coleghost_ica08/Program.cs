using Microsoft.Data.SqlClient;
using System.Net;
using System.Text;

namespace coleghost_ica09
{
    public class Program
    {
        record Data ( int id );
        public static void Main(string[] args)
        {
            // set up builder and controllers
            var builder = WebApplication.CreateBuilder(args);
            builder.Services.AddControllers();
            var app = builder.Build();
            app.UseCors(x => x.AllowAnyHeader().AllowAnyMethod().SetIsOriginAllowed(origin => true));

            app.MapGet("/", () => "COLE GHOSTKEEPER ICA09");

            // define the connection string
            string connectionString = "Server = data.cnt.sast.ca,24680; Database = ClassTrak; User Id = demoUser; Password = temP2020#; Encrypt = False;";

            // Hanle the retrieve data endpoint
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
                // read each row from the query at a time
                while (reader.Read())
                {
                    // add a new student to the list
                    students.Add(new Student(reader["student_id"], reader["last_name"], reader["first_name"], reader["school_id"]));
                }
                connection.Close();
                // return json data to client side
                return Results.Json(new
                {
                    status = "success",
                    students
                });
            });

            // This endpoint returns a json object containing class information for a specific student
            app.MapPost("retrieveClassData", (Data data) =>
            {
                SqlConnection connection = new SqlConnection(connectionString);
                connection.Open();
                // build the query
                StringBuilder query = new StringBuilder();
                query.Append(
                    "SELECT " +
                    "c.class_id AS ClassId, " +
                    "c.class_desc AS ClassDesc, " +
                    "c.days AS Days, " +
                    "c.start_date AS StartDate, " +
                    "i.instructor_id AS InstructorId, " +
                    "i.first_name AS InstructorFirstName, " +
                    "i.last_name AS InstructorLastName " +
                    "FROM Students s " +
                    "JOIN class_to_student cs ON s.student_id = cs.student_id " +
                    "JOIN Classes c ON cs.class_id = c.class_id " +
                    "JOIN Instructors i ON c.instructor_id = i.instructor_id " +
                    "WHERE s.student_id = @StudentId"
                );
                SqlCommand command = new SqlCommand(query.ToString(), connection);
                command.Parameters.AddWithValue("@StudentId", data.id);
                SqlDataReader reader = command.ExecuteReader();
                var classes = new List<ClassData>();
                while (reader.Read())
                {
                    classes.Add(new ClassData(
                        reader["ClassId"],
                        reader["ClassDesc"],
                        reader["Days"],
                        reader["StartDate"],
                        reader["InstructorId"],
                        reader["InstructorFirstName"],
                        reader["InstructorLastName"]
                    ));
                }
                connection.Close();
                return Results.Json(new
                {
                    status = "success",
                    classes
                });
            });

            app.MapGet("/deleteStudent/{id}", (int id) =>
            {
                SqlConnection connection = new SqlConnection(connectionString);
                connection.Open();

                string query = "DELETE FROM Students WHERE student_id = @StudentId"; 
                SqlCommand command = new SqlCommand(query, connection); // create command object with query and connection string

                command.Parameters.AddWithValue("@StudentId", id); // bind param to query

                int rowsAffected = command.ExecuteNonQuery(); // gets the rows affected and executes query
                connection.Close();
                return Results.Json(new
                {
                    status = rowsAffected > 0 ? "success" : "error",
                    message = rowsAffected > 0 ? "Student deleted successfully" : "Student not found"
                });
            });

            app.MapGet("updateStudent/{id}/{fName}/{lName}/{schoolId}", (int id, string fName, string lName, int schoolId) =>
            {
                if (fName == null || lName == null || schoolId <= 0)
                {
                    return Results.Json(new
                    {
                        status = "error",
                        messasge = "Invalid arguments"
                    });
                }
                SqlConnection connection = new SqlConnection(connectionString);
                connection.Open();
                string query = "UPDATE Students SET first_name = @fName, last_name = @lName, school_id = @schoolId where student_id = @studentId";
                SqlCommand command = new SqlCommand(query, connection);
                command.Parameters.AddWithValue("@fName", fName);
                command.Parameters.AddWithValue("@lName", lName);
                command.Parameters.AddWithValue("@schoolId", schoolId);
                command.Parameters.AddWithValue("@studentId", id);
                int rowsAffected = command.ExecuteNonQuery(); // gets the rows affected and executes query
                connection.Close();
                return Results.Json(new
                {
                    status = rowsAffected > 0 ? "success" : "error",
                    message = rowsAffected > 0 ? "Student Updated successfully" : "Student not found"
                });
            });
            app.Run();
        }
    }

    /// <summary>
    /// This class represents a student in the ClassTrak database
    /// </summary>
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

    /// <summary>
    /// This class class information from classtrak database
    /// </summary>
    public class ClassData
    {
        public int ClassId { get; set; }
        public string ClassDesc { get; set; }
        public int Days { get; set; }
        public DateTime StartDate { get; set; }
        public int InstructorId { get; set; }
        public string InstructorFirstName { get; set; }
        public string InstructorLastName { get; set; }

        public ClassData(object classId, object classDesc, object days, object startDate, object instructorId, object instructorFirstName, object instructorLastName)
        {
            ClassId = (int)classId;
            ClassDesc = (string)classDesc;
            Days = days == DBNull.Value ? 0 : (int)days;
            StartDate = (DateTime)startDate;
            InstructorId = (int)instructorId;
            InstructorFirstName = (string)instructorFirstName;
            InstructorLastName = (string)instructorLastName;
        }

    }
}
