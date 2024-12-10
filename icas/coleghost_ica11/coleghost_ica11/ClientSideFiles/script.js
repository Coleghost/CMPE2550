const url = "https://localhost:7117/";

window.onload = function(){
    GetLocations();
    CreateLocationSelect();
    CreateItemSelect();

    $("#process-btn").click(PlaceOrderHandler);
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

function CreateLocationSelect(){
    let data = {};
    AjaxRequest(url + 'GetLocations', "GET", data, "JSON", function(data){
        // create pickup location select
        let pickUp = $("#pickup-select")
        for(let i = 0; i < data.length; i++){
            let option = $("<option>").attr({
                "value" : data[i].locationid
            }).html(data[i].locationName);
            pickUp.append(option);
        }
    }, ErrorHandler);
}

function CreateItemSelect(){
    let data = {};
    AjaxRequest(url + 'GetItems', "GET", data, "JSON", function(data){
        // create pickup location select
        let items = $("#item-select")
        for(let i = 0; i < data.length; i++){
            let option = $("<option>").attr({
                "value" : data[i].itemid
            }).html(`${data[i].itemName} : $${data[i].itemPrice}`);
            items.append(option);
        }
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
        $("#table-div").find("h1").remove();
        $("#table-status").html("No data on this Order");
        return;
    }
    let div = $("#table-div");
    div.find("table").remove();
    div.find("h1").remove();
    $("#table-status").html("");
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
        <th>Delete Order</th>
    `);
    thead.append(ths);
    table.append(thead);
    let tbody = $("<tbody>");
    for(let i = 0; i < data.length; i++){
        let tr = $("<tr>");
        // create the delete button
        let deleteBtn = $("<button>").attr({
            "class" : "delete-btn",
            "orderId" : data[i].orderId,
            "locationId" : data[i].locationid
        }).html("Delete");
        deleteBtn.click(DeleteOrderHandler);
        let deleteTd = $("<td>").append(deleteBtn);

        let tds = $(`
            <td>${data[i].orderId}</td>
            <td>${data[i].orderDate}</td>
            <td>${data[i].paymentMethod}</td>
            <td>${data[i].itemName}</td>
            <td>${data[i].itemPrice}</td>
            <td>${data[i].itemCount}</td>
        `);
        tr.append(tds);
        tr.append(deleteTd);
        tbody.append(tr);
    }
    table.append(tbody);
    div.append(table);

}

function DeleteOrderHandler(ev){
    let btn = $(ev.target);
    let orderId = btn.attr("orderId");
    let locationId = btn.attr("locationid");
    let data = {};
    AjaxRequest(url + `DeleteOrder/${orderId}/${locationId}`, "DELETE", data, "JSON", function(json){
        DeleteOrderCallback(json, ev);
    }, ErrorHandler);
}

function DeleteOrderCallback(json, ev){
    let status = $("#table-status");
    status.html(json.message);
    if(json.status == "error"){
        return;
    }
    // remove the row from the table
    $(ev.target).closest("tr").remove();
    
}

function PlaceOrderHandler(){
    // get vals from input
    let data = {};
    data.customerId = $("#customer-id-input").val();
    data.itemId = $("#item-select").val();
    data.quantity = $("#quantity-input").val();
    data.paymentType = $("#payment-type-select").val();
    data.locationId = $("#pickup-select").val();

    if(!data.customerId || !data.itemId || !data.quantity || !data.paymentType || !data.locationId){
        $("#order-status").html("Please provide valid order details");
        return;
    }
    AjaxRequest(url + "PlaceOrder", "POST", data, "JSON", PlaceOrderCallback, ErrorHandler);
}

function PlaceOrderCallback(json){
    // display error message in status if order was not processed
    if(json.status == "error"){
        $("#order-status").html(json.message);
        return;
    }
    // successful order created
    $("#order-status").html(`${json.message}, order ${json.id} will be ready in ${json.eta} minutes. Thank you`);
    // edit ui to make some inputs read only
    $("#customer-id-input").attr("readonly", true);
    $("#pickup-select").attr("disabled", true);
    // change the text and event for the process button
    let btn = $("#process-btn");
    btn.off(); // remove the add event
    btn.html("Update Order");
    // create the update order function
    btn.click(function(ev){

        // get vals from input
        let data = {};
        data.customerId = $("#customer-id-input").val();
        data.itemId = $("#item-select").val();
        data.quantity = $("#quantity-input").val();
        data.paymentType = $("#payment-type-select").val();
        data.locationId = $("#pickup-select").val();
        data.orderId = json.id;

        if(!data.customerId || !data.itemId || !data.quantity || !data.paymentType || !data.locationId){
            $("#order-status").html("Please provide valid order details");
            return;
        }
        AjaxRequest(url + "UpdateOrder", "PUT", data, "JSON", UpdateOrderCallback, ErrorHandler);
    });
}

function UpdateOrderCallback(json){
    $("#order-status").html(json.message);
    $("#process-btn").attr("disabled", true);
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