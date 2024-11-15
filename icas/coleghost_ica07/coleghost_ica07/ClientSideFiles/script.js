const url = "http://localhost:5218/";

window.onload = function(){
    MakeTable();
    $("#new-game-btn").click(()=>{
        // create data object
        let data = {};
        data.playerOne = $("#player-one-tb").val();
        data.playerTwo = $("#player-two-tb").val();
        if(data.playerOne && data.playerTwo){
            AjaxRequest(url + "start", "POST", data, "json", StartGameHandler, ErrorHandler);
        }
        else{
            // update the status
            StatusUpdate("startError");
        }
    });

    $("#pull-btn").click(()=>{
        let data = {};
        AjaxRequest(url + "pull", "POST", data, "json", PullHandler, ErrorHandler);
    });

    $("#quit-game-btn").click(()=>{
        let data = {};
        AjaxRequest(url + "quit", "POST", data, "json", QuitGameHandler, ErrorHandler);
    });
}

// This function updates the image in the grid
// according to the difference in roles
function MoveImage(net){
    net *= -1;// invert the differnce to move the correct way
    let col = $("#image").css("grid-column"); // grab the current position
    // update the grid pos
    $("#image").css({
        "grid-column" : `${Number(col) + Number(net)}`
    });
}

// Handles start game request
function StartGameHandler(json){
    if(json.status == "success"){
        StatusUpdate("startSuccess");
        // show the gameboard
        $("#game-board-div").css({
            "style" : "flex"
        }).show();
        // place the image
        $("#image").css({
            "grid-column" : json.pit
        });
    }
    else{
        // update the status
        StatusUpdate("startError");
    }
}

// Handles Ajax request from pull button
// updates the ui
// and moves the image
function PullHandler(json){
    // handle the json response
    if(json.status == "win"){
        StatusUpdate("win", undefined, message = `${json.player} has won the game!`);
    }
    else if(json.status == "draw"){
        StatusUpdate("draw", undefined, message = `Turn limit reached, take a break!`);
    }
    else if (json.status == "continue"){
        StatusUpdate("continue", undefined, message = `${json.player1} rolled: ${json.p1roll}<br>${json.player2} rolled: ${json.p2roll}`);
        MoveImage(Number(json.p1roll) - Number(json.p2roll));
    }
}

// handle an ajax request to quit the game
// updates the status and clears the ui
function QuitGameHandler(json){
    if(json.status == "success"){
        StatusUpdate("quitGame");
        // clear the ui
        $("#player-one-tb").val("");
        $("#player-two-tb").val("");
        $("#game-board-div").hide();
    }
}

// this function will create the table row representing the game board
function MakeTable(){
    let gbDiv = $("#game-board-div");
    let div = $("<div>").attr({
        "id" : "table-div"
    });
    let table = $("<table>");
    let tr = $("<tr>");
    for(let i = 1; i < 66; i++){
        let td = $("<td>");
        td.html(i);
        tr.append(td);
    }
    table.append(tr);
    div.append(table);
    gbDiv.prepend(div);
}

// this function will update a status element on the page
// action -> the reason for the update
// status -> the jquery element to write the message
// message -> an option message to put in the status if we need json data to create it
function StatusUpdate(action, status = $("#status"), message = null){
    switch(action){
        case "startError":
            status.html("Please provide valid player names");
            break;
        case "startSuccess":
            status.html("Let's GO!");
            break;
        case "win":
            status.html(message);
            break;
        case "draw":
            status.html(message);
            break;
        case "continue":
            status.html(message);
            break;
        case "quitGame":
            status.html("Enter Player Names:<br>");
            break;
    }
}

// Use this function to make an ajax call
function AjaxRequest(url, type, data, dataType, successFunc, errorFunc){
    let ajaxOptions = {};
    ajaxOptions.url = url;
    ajaxOptions.type = type;
    ajaxOptions.data = JSON.stringify(data); // asp ajax call
    ajaxOptions.dataType = dataType;
    ajaxOptions.success = successFunc;
    ajaxOptions.error = errorFunc;
    ajaxOptions.contentType = "application/json";

    $.ajax(ajaxOptions); // make the ajax call and return the value
}

function ErrorHandler(request, status, error){
    console.log("Ajax request invalid");
}