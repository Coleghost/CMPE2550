var url = "https://localhost:7191/"

window.onload = function (){
    let data = {};
    // request for welcome message
    AjaxRequest(url, "GET", data, "JSON", (json)=>{
        $("#welcome").html(json.message);
    }, ErrorHandler);

    // request for menu items and locations
    AjaxRequest(url, "POST", data, "JSON", (json)=>{
        let locations = json.locations;
        // build the locations select
        locations.forEach((location)=>{
            let option = $("<option>").attr({
                "value" : location
            }).text(location);
            $("select[name='select-location']").append(option);
        });

        // build the menu items list
        let list = $("<ol>")
        Object.keys(json.items).forEach((item)=>{
            let li = $("<li>");
            li.html(`${item} : $${json.items[item]}`);
            list.append(li);
            let option = $("<option>").attr({
                "value" : json.items[item]
            }).text(item);
            $("select[name='selectItem']").append(option);
        });
        $("#items-div").append(list);
    }, ErrorHandler);

    $("#btn-post").click(()=>{
        $("#status").html("");
        let data = {};
        data.name = $("input[name='tbName']").val();
        data.item = $("select[name='selectItem']").val();
        data.amount = $("input[name='numberAmount']").val();
        data.payment = $("select[name='selectPaymentType']").val();
        if (!data.name || !data.item || !data.amount || !data.payment) {
            $("#status").html("Please fill in all fields");
            return;
        }
        else{
            AjaxRequest(url + "submit", "POST", data, "JSON", PostSuccess, ErrorHandler);
        }
    });
}

function PostSuccess(json){

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