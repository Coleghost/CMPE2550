var url = "https://localhost:7242/";
window.onload = function(){
    GetStudents();
    CreateClassSelect();
    $("#add-student-btn").click(function(ev){
        let data = {};
        data.fName = $("#input-first-name").val();
        data.lName = $("#input-last-name").val();
        data.schoolId = $("#input-school-id").val();
        let selectedOptions = $("#select-class option:selected");
        data.classIds = [];
        selectedOptions.each(function() {
            data.classIds.push(Number($(this).val()));
        });
        AjaxRequest(url + "addStudent", "POST", data, "JSON", AddStudentCallBack, ErrorHandler);
    });
}

function AddStudentCallBack(json){
    if(json.status == "success"){
        $("#add-student-status").html(json.message);
        GetStudents();
    }
    else{
        $("#add-student-status").html(json.message);
    }
}

function CreateClassSelect(){
    let data = {};
    AjaxRequest(url + "getAllClassData", "GET", data, "JSON", function(json){
        let select = $("#select-class");
        // classId classDesc
        for(let i = 0; i < json.classes.length; i++){
            let option = $("<option>").attr({
                "value" : json.classes[i].classId
                }
            ).html(json.classes[i].classDesc);
            select.append(option);
        }
    }, ErrorHandler);
}

function GetStudents(){
    let data = {};
    AjaxRequest(url + "retrieveData", "GET", data, "JSON", GetStudentsCallBack, ErrorHandler);
}

// Success function for on load ajax request
// creates the student table
function GetStudentsCallBack(json){
    $("#student-table-div").find('table').remove();
    let table = $("<table>").attr({
        "id" : "student-table"
    });
    // create table head
    let th = $("<thead>");
    let thtr = $("<tr>");
    let thtds = $("<th>Get Students</th><th>Student ID</th><th>Last Name</th><th>First Name</th><th>School ID</th>");
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
        // Generate the Action Buttons
        let actionTd = $("<td>");
        let deleteBtn = $("<button>").attr({
            "class" : "delete-btn",
            "id" : json.students[i].studentId
        }).html("Delete");
        deleteBtn.click(DeleteClickEvent);
        actionTd.append(deleteBtn);
        let editBtn = $("<button>").attr({
            "class" : "edit-btn",
            "id" : json.students[i].studentId
        }).html("Edit");
        editBtn.click(EditClickEvent);
        actionTd.append(editBtn);
        tr.append(actionTd);
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

function DeleteClickEvent(ev){
    let id = ev.target.id;
    let data = {};
    let row = $(ev.target).closest("tr"); // Find the closest table row
    AjaxRequest(url + `deleteStudent/${id}`, "DELETE", data, "JSON", function(json){
        if (json.status == "success") {
            row.remove(); // Remove the row from the table
            $("#student-table-status").html(`Deleted student with ID: ${id}`);
        } 
        else {
            $("#student-table-status").html(`Failed to delete student with ID: ${id}`);
        }
    }, ErrorHandler);
}

function EditClickEvent(ev){
    let id = ev.target.id;
    let row = $(ev.target).closest("tr"); // Find the closest table row
    let original = [];

    row.find('td').each(function(index){
        if (index == 2 || index == 3 || index == 4) {
            let currentText = $(this).text();
            original.push(currentText); // Store the original content
            let input = $('<input>', {
                type: 'text',
                value: currentText
            });
            $(this).html(input); // apend the input tb
        } 
        else {
            original.push(null); // push null to keep indices the same
        }
    });

    // create and implement the update button
    let updateBtn = row.find(".delete-btn");
    updateBtn.html("Update");
    updateBtn.off('click').on('click', function(){
        let data = {};
        let fName = null;
        let lName = null;
        let schoolId = null;
        row.find('td').each(function(index){
            let input = $(this).find('input');
            if(index == 2){
                lName = input.val();
            }
            else if(index == 3){
                fName = input.val();
            }
            else if(index == 4){
                schoolId = input.val();
            }
        });
        AjaxRequest(url + `updateStudent/${id}/${fName}/${lName}/${schoolId}`, "PUT", data, "JSON", function(json){
            if(json.status == "success"){
                $("#student-table-status").html(`Updated Student: ${id}`);
                row.find("td").each(function(){
                    let val = $(this).find("input[type='text']").val();
                    $(this).html(val);
                });
            }
            else{
                $("#student-table-status").html(`Failed to Update student: ${id}`);
            }
        }, ErrorHandler);
    });

    // create and implement the cancel button
    let cancelBtn = $(ev.target);
    cancelBtn.html("Cancel");
    cancelBtn.off('click').on('click', function(){
        row.find('td').each(function(index){
            if (index == 2 || index == 3 || index == 4) {
                $(this).html(original[index]); // Restore the original content
            }
        });
        updateBtn.html("Delete");
        updateBtn.off("click").on("click", DeleteClickEvent)
        cancelBtn.html("Edit"); 
        cancelBtn.off('click').on('click', EditClickEvent); // Rebind the original click event
    });
}

// This function populates a class information table
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