const url = "https://localhost:7171/";

window.onload = function(){
    MakeTable();
    $("#new-game-btn").click(()=>{
        // show the gameboard
        $("#game-board-div").css({
            "style" : "flex"
        }).show();

        // send data to server
        let data = {};
        data.action = "startGame";
        data.playerOne = $("#player-one-tb").val();
        data.playerTwo = $("#player-two-tb").val();

        AjaxRequest(url + "/start", "POST", data, "json", StartGameHandler, ErrorHandler);
    });
}

function StartGameHandler(json){
    
}

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