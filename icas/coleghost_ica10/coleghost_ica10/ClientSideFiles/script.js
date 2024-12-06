const url = "https://localhost:7181/";

window.onload = function(){
    GetLocations();
}

// Function to submit an ajax request to server
// expects to receive all locations in the database
// creates and populates a select control with the data
function GetLocations(){
    let data = {};
    AjaxRequest(url + 'GetLocations', "GET", data, "JSON", function(data){
        // create a location select
        let div = $("#input-div");
        let label = $("<label>").html("Location: ");
        let select = $("<select>").attr({
            "id" : "select-location"
        });
        select.append($("<option>"));
        select.change(GetOrderDetails);
        for(let i = 0; i < data.length; i++){
            let option = $("<option>").attr({
                "value" : data[i].locationid
            }).html(data[i].locationName);
            select.append(option);
        }
        label.append(select);
        div.append(label);
    }, ErrorHandler);
}

// Submits an ajax request to server
// expects to receive order data for a specified customer
function GetOrderDetails(ev){
    let locationId = $(ev.target).val();
    let customerId = $("#input-customer-id").val();
    if(customerId == "" || Number(customerId) < 0){
        $("#input-div").find("p").remove();
        let status = $("<p>Please provide a valid customer ID</p>");
        $("#input-div").append(status);
        $("#input-customer-id").focus();
    }
    else{
        $("#input-div").find("p").remove();
        let data = {};
        AjaxRequest(url + `GetOrders/${locationId}/${customerId}`, "GET", data, "JSON", GetOrderDetailsCallback, ErrorHandler);
    }
}

// Function to create the table
// from the customers order details
function GetOrderDetailsCallback(data){
    if(data.length == 0){
        $("#table-div").find("table").remove();
        $("#table-status").find("p").remove();
        $("#table-div").find("h1").remove();
        let status = $("<p>No data on this Order</p>")
        $("#table-status").html(status);
        return;
    }
    let div = $("#table-div");
    div.find("table").remove();
    div.find("h1").remove();
    // create a title
    let h1 = $("<h1>").html(`Orders placed by 
        ${data[0].fname} ${data[0].lname} at location: ${data[0].locationName}`
    );
    div.append(h1);
    // create the table element
    let table = $("<table>");
    let thead = $("<thead>");
    let ths = $(`
        <th>Order Id</th>
        <th>Order Date</th>
        <th>Payment Method</th>
        <th>Item Name</th>
        <th>Item Price</th>
        <th>Item Count</th>
    `);
    thead.append(ths);
    table.append(thead);
    let tbody = $("<tbody>");
    for(let i = 0; i < data.length; i++){
        let tr = $("<tr>");
        let tds = $(`
            <td>${data[i].orderId}</td>
            <td>${data[i].orderDate}</td>
            <td>${data[i].paymentMethod}</td>
            <td>${data[i].itemName}</td>
            <td>${data[i].itemPrice}</td>
            <td>${data[i].itemCount}</td>
        `);
        tr.append(tds);
        tbody.append(tr);
    }
    table.append(tbody);
    div.append(table);

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