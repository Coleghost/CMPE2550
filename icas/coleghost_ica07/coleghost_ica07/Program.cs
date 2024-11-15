using System.Text.RegularExpressions;

namespace coleghost_ica07
{
    public class Program
    {
        record StartData(string playerOne, string playerTwo);
        static Random random = new Random();

        // game values
        static int Player1 = 0;
        static int Player2 = 0;
        static int PitDistance = 10;
        static int Middle = 33;
        static int Pit = Middle;
        static string Player1Name = "";
        static string Player2Name = "";
        static int Turns = 0;
        static bool Running = false;



        public static void Main(string[] args)
        {
            var builder = WebApplication.CreateBuilder(args);
            builder.Services.AddControllers();
            var app = builder.Build();
            app.UseCors(x => x.AllowAnyHeader().AllowAnyMethod().SetIsOriginAllowed(origin => true));
            app.MapGet("/", () => "Hello, this is Cole Ghostkeeper's ICA07 Server");

            // handle a post to this endpoint
            app.MapPost("/start", (StartData data) =>
            {
                // clean data
                string p1 = CleanInputs(data.playerOne);
                string p2 = CleanInputs(data.playerTwo);
                // validate data
                if (p1.Length > 0 && p2.Length > 0)
                {
                    // start game and return json object
                    StartGame(p1, p2);
                    return Results.Json(new
                    {
                        status = "success",
                        pit = Pit
                    });
                }
                else
                {
                    // return json object in case of invalid input
                    return Results.Json(new
                    {
                        status = "error"
                    });
                }
            });

            // handle pull button endpoint
            app.MapPost("/pull", () =>
            {
                if (!Running)
                {
                    return Results.Json(new
                    {
                        status = "gameover"
                    });
                }
                Turns++; // increment turns
                int roll1 = random.Next(1, 6);
                int roll2 = random.Next(1, 6);
                int diff = roll1 - roll2;
                // roll 2 was greater
                if (diff < 0)
                {
                    // move both players right
                    Player1 += Math.Abs(diff);
                    Player2 += Math.Abs(diff);
                }
                // roll 1 was greater
                else
                {
                    // move both players to the left
                    Player1 -= diff;
                    Player2 -= diff;
                }

                int state = CheckWin();

                // return json data according to the state of the game
                if (state == -1)
                {
                    Running = false;
                    return Results.Json(new
                    {
                        status = "win",
                        player = Player2Name
                    });
                }
                else if (state == 1)
                {
                    Running = false;
                    return Results.Json(new
                    {
                        status = "win",
                        player = Player1Name
                    });
                }
                else if (Turns == 31)
                {
                    Running = false;
                    return Results.Json(new
                    {
                        status = "draw"
                    });
                }
                else
                {
                    return Results.Json(new
                    {
                        status = "continue",
                        player1 = Player1Name,
                        p1roll = roll1,
                        p1pos = Player1,
                        player2 = Player2Name,
                        p2roll = roll2,
                        p2pos = Player2,
                        turns = Turns
                    });
                }
            });

            // handle quit button endpoint
            app.MapPost("/quit", () =>
            {
                ResetGame();
                return Results.Json(new
                {
                    status = "success"
                });
            });
            app.Run();
        }

        /// <summary>
        /// This function returns an int based of the game status
        /// -1 Player 1 has fallen in the pit
        /// 1 Player 2 has fallen in the pit
        /// 0 No player is in the pit
        /// </summary>
        /// <returns></returns>
        public static int CheckWin()
        {
            if (Player1 >= Pit)
            {
                Running = false;
                return -1;
            }
            else if (Player2 <= Pit)
            {
                Running = false;
                return 1;
            }
            else
            {
                return 0;
            }
        }

        /// <summary>
        /// This function inits values for a new game
        /// </summary>
        public static void StartGame(string name1, string name2)
        {
            // put the players equal distance away from the pit on either end
            Player1 = Middle - PitDistance;
            Player2 = Middle + PitDistance;
            // update player names
            Player1Name = name1;
            Player2Name = name2;
            Turns = 0; // reset turns
            Running = true;
        }


        /// <summary>
        /// Reset game variables
        /// </summary>
        public static void ResetGame()
        {
            // put the players equal distance away from the pit on either end
            Player1 = Middle - PitDistance;
            Player2 = Middle + PitDistance;
            Turns = 0; // reset turns
        }

        /// <summary>
        /// Cleans inputs from client side
        /// </summary>
        /// <param name="input"></param>
        /// <returns></returns>
        public static string CleanInputs(string input)
        {
            string cleanInput;
            //clean your input here
            cleanInput = Regex.Replace(input.Trim(), "<.*?|&;>$", string.Empty);

            return cleanInput;
        }
    }
}
