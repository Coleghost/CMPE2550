var url = "https://localhost:7242/";
window.onload = function(){
    GetStudents();
}

function GetStudents(){
    let data = {};
    AjaxRequest(url + "retrieveData", "GET", data, "JSON", GetStudentsCallBack, ErrorHandler);
}

function GetStudentsCallBack(json){
    let table = $("<table>").attr({
        "id" : "student-table"
    });
    // create table head
    let th = $("<thead>");
    let thtr = $("<tr>");
    let thtds = $("<th>Get Students</th><th>Student ID</th><th>First Name</th><th>Last Name</th><th>School ID</th>");
    thtr.append(thtds);
    th.append(thtr);
    table.append(th);
    // create table body
    let tbody = $("<tbody>");
    for(let i = 0; i < json.students.length; i++){
        let tr = $("<tr>");
        let btntd = $("<td>");
        let btn = $("<button>").attr({
            "class" : "get-class-data-btn",
            "id" : json.students[i].studentId
        }).html("Retrieve Class Info");
        btn.click(RetrieveClickEvent);
        btntd.append(btn);
        tr.append(btntd);
        let tds = $(`<td>${json.students[i].studentId}</td><td>${json.students[i].lastName}</td><td>${json.students[i].firstName}</td><td>${json.students[i].schoolId}</td>`);
        tr.append(tds);
        tbody.append(tr);
    }    
    table.append(tbody);
    $("#student-table-div").prepend(table);
    $("#student-table-status").html(`Retrieved: ${json.students.length} student records`);
}

function RetrieveClickEvent(ev){
    let id = ev.target.id;
    let data = {};
    data.id = id;
    AjaxRequest(url + "retrieveClassData", "POST", data, "JSON", GetClassCallBack, ErrorHandler);
}

function GetClassCallBack(json){
    // Clear the existing table content
    $("#class-table").empty();
    let table = $("<table>").attr({
        "id" : "class-table"
    });
    // create table head
    let th = $("<thead>");
    let thtr = $("<tr>");
    let thtds = $("<th>Class ID</th><th>Class Desc</th><th>Days</th><th>Start Date</th><th>Instructor ID</th><th>Instructor First Name</th><th>Instructor Last Name</th>");
    thtr.append(thtds);
    th.append(thtr);
    table.append(th);
    if(json.classes.length == 0){
        $("#class-table-status").html(`Retrieved: ${json.classes.length} class records`);
        return;
    }
    // create table body
    let tbody = $("<tbody>");
    for(let i = 0; i < json.classes.length; i++){
        let tr = $("<tr>");
        let tds = $(`
            <td>${json.classes[i].classId}</td>
            <td>${json.classes[i].classDesc}</td>
            <td>${json.classes[i].days}</td>
            <td>${json.classes[i].startDate}</td>
            <td>${json.classes[i].instructorId}</td>
            <td>${json.classes[i].instructorFirstName}</td>
            <td>${json.classes[i].instructorLastName}</td>
            `);
        tr.append(tds);
        tbody.append(tr);
    }    
    table.append(tbody);
    $("#class-table-div").prepend(table);
    $("#class-table-status").html(`Retrieved: ${json.classes.length} class records`);
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