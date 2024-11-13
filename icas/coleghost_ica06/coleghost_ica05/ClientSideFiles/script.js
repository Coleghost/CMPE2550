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
                "value" : item
            }).text(item);
            $("select[name='selectItem']").append(option);
        });
        $("#items-div").append(list);
    }, ErrorHandler);

    // on submit send data to the server
    $("#btn-post").click(()=>{
        $("#status").html("");
        let data = {};
        data.tbName = $("input[name='tbName']").val();
        data.Location = $("select[name='select-location']").val()
        data.selectItem = $("select[name='selectItem']").val();
        data.numberAmount = $("input[name='numberAmount']").val();
        data.selectPaymentType = $("select[name='selectPaymentType']").val();
        if (!data.tbName || !data.Location || !data.selectItem || !data.numberAmount || !data.selectPaymentType) {
            $("#status").html("Please fill in all fields");
            return;
        }
        else{
            AjaxRequest(url + "submit", "POST", data, "JSON", PostSuccess, ErrorHandler);
        }
    });
}

// On a successfull submit update the UI
// json -> a json object from the server side
function PostSuccess(json){
    div = $("#order-details");
    div.html("");
    div.append(`<h3>Thank you ${json.name} for placing this order</h3>`);
    let ol = $("<ol>");
    ol.append(`<li>Pick Up location: ${json.location}</li>`);
    ol.append(`<li>Item Ordered: ${json.item}</li>`);
    ol.append(`<li>Amount: ${json.amount}</li>`);
    ol.append(`<li>Payment Type: ${json.paymentType}</li>`);
    div.append(ol);
    div.append(`<p>Your order will be ready in ${json.eta} minutes</p>`);
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