const url = "https://localhost:7171/";

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
}

// Handles start game request
function StartGameHandler(json){
    if(json.status == "success"){
        StatusUpdate("startSuccess");
        // show the gameboard
        $("#game-board-div").css({
            "style" : "flex"
        }).show();
    }
    else{
        // update the status
        StatusUpdate("startError");
    }
}

function PullHandler(json){
    // handle the json response
    if(json.status == "win"){
        StatusUpdate("win", undefined, message = `${json.player} has won the game!`);
    }
    else if(json.status == "draw"){
        StatusUpdate("draw", undefined, message = `Turn limit reached, take a break!`);
    }
    else{
        StatusUpdate("continue", undefined, message = `Player1 rolled: ${json.p1roll}<br>Player2 rolled: ${json.p2roll}`);
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