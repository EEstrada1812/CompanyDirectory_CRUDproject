//******** FUNCTIONS ************/
var table;
function populateTable() {
    $.ajax({
    url: 'libs/php/getAll.php',
    method: 'POST',
    dataType: 'json',
    success: function (result) {
        let tableData = result.data;
            table = $('#mainTable').DataTable ({
            "scrollY": "65vh",
            "scrollCollapse": true,
            
            "paging": false,
            "responsive": true,
            "destroy": true,
            "data" : tableData,
            "order": [[ 2, "asc" ]],
            "columnDefs": [
                {
                    "targets": [ 0 ],
                    "visible": false,
                    "searchable": false
                }],
            "columns" : [
                { "data" : "employeeID" },
                { "data" : "firstName" },
                { "data" : "lastName" },
                { "data" : "jobTitle" },
                { "data" : "email" },
                { "data" : "department" },
                { "data" : "location" },
                
                {defaultContent : '<button type="button" id="btn-editEmployee" class="btn btn-primary"><i class="bi bi-pencil-square"></i></button><button type="button" id="btn_deleteEmployee" class="btn btn-danger"><i class="bi bi-person-x-fill"></i></button>',
                className: "td-buttons"
                }
            ],
            responsive: {
                details: {
                    renderer: function ( api, rowIdx, columns ) {
                        var data = $.map( columns, function ( col, i ) {
                            return col.hidden ?
                                '<tr data-dt-row="'+col.rowIndex+'" data-dt-column="'+col.columnIndex+'">'+
                                    '<td>'+col.title+':'+'</td> '+
                                    '<td' + (col.title === 'Edit' ? ' class="td-buttons"' : '') + '>'+col.data+'</td>'+
                                '</tr>' :
                                '';
                        } ).join('');
         
                        return data ?
                            $('<table/>').append( data ) :
                            false;
                    }
                }
             } 
        });
    }
});
}

//function to populate department select options
function popDeptSelOptions() {
  $.ajax({
    url: 'libs/php/getAllDepartments.php',
    method: 'POST',
    dataType: 'json',
    success: function (result) {
        console.log('Departments', result);
        if (result.status.name == "ok") {
            $('#selectedNewEmployeeDepartment, #changeExistingEmployeeDepartment, #selectedDepartmentToDelete').empty();

            for (var i=0; i<result.data.length; i++) {
                $('#selectedNewEmployeeDepartment, #changeExistingEmployeeDepartment, #selectedDepartmentToDelete').append($('<option>', {
                    value: result.data[i].id,
                    text: result.data[i].name,
                }, '</option>'));
                
            }

            //sort options alphabetically
            $("#selectedNewEmployeeDepartment").html($("#selectedNewEmployeeDepartment option").sort(function (a, b) {
                return a.text == b.text ? 0 : a.text < b.text ? -1 : 1
                }))
                $("#changeExistingEmployeeDepartment").html($("#changeExistingEmployeeDepartment option").sort(function (a, b) {
                    return a.text == b.text ? 0 : a.text < b.text ? -1 : 1
                    }))
                    $("#selectedDepartmentToDelete").html($("#selectedDepartmentToDelete option").sort(function (a, b) {
                        return a.text == b.text ? 0 : a.text < b.text ? -1 : 1
                        }))
        }
    }
  });  
};

let deptID;
$('#selectedNewEmployeeDepartment, #changeExistingEmployeeDepartment, #selectedDepartmentToDelete').on('change',function() {
    deptID = $(this).find('option:selected').val();
    console.log('DepartmentID',deptID);
    linkDeptLoc();
});

function linkDeptLoc() {
    $.ajax({
        url: 'libs/php/getLocationByDepartmentID.php',
        method: 'POST',
        dataType: 'json',
        data: {
            deptID: deptID
        },
        success: function (result) {
            $('#selectedNewEmployeeLocation, #changeExistingEmployeeLocation, #selAddNewDepartmentLocation, #selectedLocationOfDepartmentToDelete, #selectedLocationToDelete').attr('value', result.data[0].name);
        }
    });
  };

//function to populate location select options
function popLocationSelOptions() {
    $.ajax({
      url: 'libs/php/getAllLocations.php',
      method: 'POST',
      dataType: 'json',
      success: function (result) {
          console.log('Locations', result);
          if (result.status.name == "ok") {
            $('#selectedNewEmployeeLocation, #changeExistingEmployeeLocation, #selAddNewDepartmentLocation, #selectedLocationOfDepartmentToDelete, #selectedLocationToDelete').empty();
              for (var i=0; i<result.data.length; i++) {
                $('#selectedNewEmployeeLocation, #changeExistingEmployeeLocation, #selAddNewDepartmentLocation, #selectedLocationOfDepartmentToDelete, #selectedLocationToDelete').append($('<option>', {
                      value: result.data[i].id,
                      text: result.data[i].name,
                  }, '</option>'));
                  
              }
              $("#selectedLocationToDelete").html($("#selectedLocationToDelete option").sort(function (a, b) {
                return a.text == b.text ? 0 : a.text < b.text ? -1 : 1
                }))
          }
      }
    });  
  };

//function for general alert modal
let alertMessage;
function alertModal(alertMessage) {
    $("#alertModal").modal('show');

    if(alertMessage){
        return alertMessage;
        
    } else {
        $(".alertTxt").html('Error: Action not completed');
    }
    
};

//function to check for empty fields
function isNotEmpty(field) {
    if (field.val() == '') {
        field.css('border', '1px solid red');
        return false;
    } else {
        field.css('border', '');
        return true;
    }
}

//on click function to clear modals with table
$(".closeModal").on('click', function () {
     $("#deptDeleteDeniedTableBody").empty();
     $("#locationDeleteDeniedTableBody").empty();
     $("#locationDeleteDeniedBcDeptTableBody").empty();
})

//call function to populate table
populateTable();


//call function to populate department select options
popDeptSelOptions();



// *************************************/
//          EMPLOYEE RECORDS            /
// *************************************/

//show add new employee modal
$("#openAddNewEmployeeModal").on('click', function () {
    $("#personFirstNameTxt").val("");
    $("#personLastNameTxt").val("");
    $("#personJobTitleTxt").val("");
    $("#personEmailTxt").val("");
    
    deptID = $('#selectedNewEmployeeDepartment option:selected').val();
    linkDeptLoc();
    popDeptSelOptions();
    $("#addNewEmployeeModal").modal('show');
});

//add a new employee 
$("#btn-saveNewEmployee").on("click", function() {
    
    let fName = $("#personFirstNameTxt");
    let lName = $("#personLastNameTxt");
    let pJobTitle = $("#personJobTitleTxt");
    let pEmail = $("#personEmailTxt");
    let pDept = $("#selectedNewEmployeeDepartment");
    let pLoc = $("#selectedNewEmployeeLocation");

    if (isNotEmpty(fName) && isNotEmpty(lName) && isNotEmpty(pEmail) && isNotEmpty(pDept) && isNotEmpty(pLoc)) {
        $.ajax({
            url: 'libs/php/insertPersonnel.php',
            method: 'POST',
            dataType: 'json',
            data: {
                fName: fName.val(),
                lName: fName.val(),
                pJobTitle: pJobTitle.val(),
                pEmail: pEmail.val(),
                pDept: pDept.val()
            }, success: function (result) {
                populateTable();
                alertMessage = $(".alertTxt").html('New Employee Record Created');
                $("#addNewEmployeeModal").modal('hide');
                alertModal(alertMessage);
                
            }
        });
    }
});

//show edit employee modal with employee data
$(document).on('click', '#btn-editEmployee', function () {
    popDeptSelOptions();
    $("#editEmployeeModal").modal('show');
    var editRow = $(this).closest('tr');
    var editEmployID = table.row( editRow ).data().employeeID;
    
    $.ajax({
        url: 'libs/php/getPersonnel.php',
        method: 'POST',
        dataType: 'json',
        data: {
            id: editEmployID
        },
        success: function (result) {
            console.log('edit employee',result);
            $("#editEmployID").attr('value', result.data.personnel[0].id);
            $("#editFirstNameTxt").attr('value', result.data.personnel[0].firstName);
            $("#editLastNameTxt").attr('value', result.data.personnel[0].lastName);
            $("#editJobTitleTxt").attr('value', result.data.personnel[0].jobTitle);
            $("#editEmailTxt").attr('value', result.data.personnel[0].email);
            $('#changeExistingEmployeeDepartment option[value="' + result.data.personnel[0].departmentID +'"]').prop("selected", true);

            deptID = $('#changeExistingEmployeeDepartment option:selected').val();
            linkDeptLoc();
        }
    });
});

//save updated employee record
$("#btn-saveEmployeeChanges").on("click", function() {
    $.ajax({
        url: 'libs/php/updatePersonnelByID.php',
        method: 'POST',
        dataType: 'json',
        data: {
            fName: $("#editFirstNameTxt").val(),
            lName: $("#editLastNameTxt").val(),
            pJobTitle: $("#editJobTitleTxt").val(),
            pEmail: $("#editEmailTxt").val(),
            pDept: deptID,
            employeeID: $("#editEmployID").val()
        },
        success: function (result) {
            alertMessage = $(".alertTxt").html('Updated Employee Record');
            $("#editEmployeeModal").modal('hide');
            alertModal(alertMessage)
            populateTable();
        }
    });
});

//delete employee record
$(document).on("click", "#btn_deleteEmployee", function() {
    $("#confirmDeletionModal").modal('show');
    var deleteRow = $(this).closest('tr');
    var id = table.row( deleteRow ).data().employeeID;
    $("#btn-confirmDeletion").on("click", function() {
    
        $.ajax({
            url: 'libs/php/deletePersonnelByID.php',
            method: 'POST',
            dataType: 'json',
            data: {
                id: id
            },
            success: function (result) {
                $("#confirmDeletionModal").modal('hide');
                alertMessage = $(".alertTxt").html('Employee Record Deleted');
                alertModal(alertMessage);
                populateTable();

            }
        });
        
    })
});

// *************************************/
//          DEPARTMENT RECORDS          /
// *************************************/

//show edit department modal
$("#openEditDepartmentsModal").on('click', function () {
    popDeptSelOptions();
    linkDeptLoc();
    $("#editDeptsModal").modal('show');
    
});

//show add new department modal
$("#openAddNewDepartmentModalBtn").on('click', function () {
    $("#addNewDepartmentTxt").val("");
    $("#editDeptsModal").modal('hide');
    $("#addNewDeptModal").modal('show');
    popLocationSelOptions();
});

// add a new department
$("#btn-saveAddNewDepartment").on("click", function() {
    var addDeptLocName = $("#addNewDepartmentTxt");
    var addDeptlocationID = $("#selAddNewDepartmentLocation");

    if (isNotEmpty(addDeptLocName)) {

        $.ajax({
            url: 'libs/php/getAllDepartments.php',
            method: 'POST',
            dataType: 'json',
            success: function (result) {
                let existed = false;
            for (let i = 0; i < result.data.length; i++) {

                if (result.data[i].name === addDeptLocName.val() && result.data[i].locationID === $( "#selAddNewDepartmentLocation option:selected" ).val()) {
                    
                    existed = true
                    break  
                    
                    
                }
            }
            if(existed){
                const alertMessage = $(".alertTxt").html('This Department aready exists');
                alertModal(alertMessage);
                
                return 
            }

               $.ajax({
                url: 'libs/php/insertDepartment.php',
                method: 'POST',
                dataType: 'json',
                data: {
                addDeptLocName: addDeptLocName.val(),
                addDeptlocationID: addDeptlocationID.val(),

            }, success: function (result) {
                populateTable();
                alertMessage = $(".alertTxt").html('New Department Record Created');
                $("#addNewDeptModal").modal('hide');
                alertModal(alertMessage);
                
            }
        }); 
            }
          });

        
    }
});

//show delete department modal
$("#openDeleteDepartmentModalBtn").on('click', function () {
    $("#editDeptsModal").modal('hide');
    $("#deleteDeptModal").modal('show');
    popDeptSelOptions();
    deptID = $('#selectedDepartmentToDelete option:selected').val();
    linkDeptLoc();
});

//delete department record
$("#btn-deleteDepartment").on("click", function() {
    $("#deleteDeptModal").modal('hide');
    $.ajax({
        url: 'libs/php/getAll.php',
        method: 'POST',
        dataType: 'json',
        success: function (result) {
            
            let filterData = result.data.filter((a) => (a.department === $( "#selectedDepartmentToDelete option:selected" ).text()));
            filterData.forEach(person => {
                let newDeptRowContent = `<tr><td>${person.firstName}</td><td>${person.lastName}</td><td>${person.department}</td></tr>`;
                $("#deptDeleteDeniedTableBody").append(newDeptRowContent);
            });
           
            if (filterData.length !== 0) {
                $(".alertTxt").html('Error: Cannot delete department with current employees.');
                $("#deptDeleteDeniedModal").modal('show');
                $("#deleteDeptModal").modal('hide');
              } else {
                $.ajax({
                    url: 'libs/php/deleteDepartmentByID.php',
                    method: 'POST',
                    dataType: 'json',
                    data: {
                        deleteDeptID: $( "#selectedDepartmentToDelete option:selected" ).val()
                    },
                    success: function (result) {
                        alertMessage = $(".alertTxt").html('Department Record Deleted.');
                        alertModal(alertMessage);
                        populateTable();
                    }
                });
            }
        }
    });
})

// *************************************/
//          LOCATION RECORDS          /
// *************************************/

//show edit locations modal
$("#openEditLocationsModal").on('click', function () {
    $("#editLocationsModal").modal('show');
});

//show add new Location modal
$("#openAddNewLocationModalBtn").on('click', function () {
    $("#addLocationTxt").val("");
    $("#editLocationsModal").modal('hide');
    $("#addNewLocationModal").modal('show');
});

// add a new location
$("#btn-saveNewLocation").on("click", function () {
    var addLocationName = $("#addLocationTxt");
    if (isNotEmpty(addLocationName)) {
    $.ajax({
        url: 'libs/php/getAllLocations.php',
        method: 'POST',
        dataType: 'json',
        success: function (result) {
            let existed = false;
            for (let i = 0; i < result.data.length; i++) {

                if (result.data[i].name === addLocationName.val()) {
                    existed = true
                    break
                }
            }
            if(existed){
                alertMessage = $(".alertTxt").html('This location aready exists');
                alertModal(alertMessage)
                
                return 
            }
            $.ajax({
                url: 'libs/php/insertLocation.php',
                method: 'POST',
                dataType: 'json',
                data: {
                    addLocationName: addLocationName.val(),
                },
                success: function (result) {
                    $("#addNewLocationModal").modal('hide');
                    alertMessage = $(".alertTxt").html('New Location Record Created');
                    alertModal(alertMessage);

                }
            });

        }
    })
}
})

//show delete location modal
$("#openDeleteLocationModalBtn").on('click', function () {
    $("#editLocationsModal").modal('hide');
    $("#deleteLocationModal").modal('show');
    popLocationSelOptions();
});

//delete location record
function getData(yt_url, callback) {
    $.ajax({
        type: "POST",
        url: yt_url,
        dataType: "json",
        success: callback,
        error: function(request, status, error) {
            alert(status);
        }
    });
}

$("#btn-deleteLocation").on("click", function() {
    getData('libs/php/getAllDepartments.php', function(result) {
    
    let filteredLocations = result.data.filter((a) => (a.locationID === $( "#selectedLocationToDelete option:selected" ).val()));
    
    filteredLocations.forEach(location => {
        var newRowContentLoc = `<tr><td>${location.name}</td><td>${$( "#selectedLocationToDelete option:selected" ).text()}</td></tr>`;
        $("#locationDeleteDeniedBcDeptTableBody").append(newRowContentLoc);
    }); 

    $.ajax({
        url: 'libs/php/getAll.php',
        method: 'POST',
        dataType: 'json',
        success: function (result) {
            console.log('filter locations', filteredLocations);
            const filterData = result.data.filter((a) => (a.location === $( "#selectedLocationToDelete option:selected" ).text()));

            filterData.forEach(person => {
                var newRowContent = `<tr><td>${person.firstName}</td><td>${person.lastName}</td><td>${person.location}</td></tr>`;
                $("#locationDeleteDeniedTableBody").append(newRowContent);
            }); 

            
            if ( filteredLocations.length !== 0 || filterData.length !== 0) {
                if (filterData.length !== 0) {
                    console.log('fitLen', filteredLocations.length);
                    $("#locationDeleteDeniedModal").modal('show');
                    $("#deleteLocationModal").modal('hide');
                    alertMessage = $(".alertTxt").html('Error: Cannot delete Location with current employees.');
                    
                } else if (filteredLocations.length !== 0) {
                    $("#locationDeleteDeniedBcDeptModal").modal('show');
                    $("#deleteLocationModal").modal('hide');
                    alertMessage = $(".alertTxt").html('Error: Cannot delete Location with current departments.');
                }
                
              } else {
                $("#deleteLocationModal").modal('hide');  
                $("#confirmDeletionModal").modal('show');
                $("#btn-confirmDeletion").on("click", function() {
                    
                    $("#confirmDeletionModal").modal('hide');

                    $.ajax({
                        url: 'libs/php/deleteLocationByID.php',
                        method: 'POST',
                        dataType: 'json',
                        data: {
                            deleteLocationID: $( "#selectedLocationToDelete option:selected" ).val()
                        },
                    success: function (result) {
                        alertMessage = $(".alertTxt").html('Location Record Deleted.');
                        alertModal(alertMessage);
                        populateTable();
                    }
                    });
                });
              }
        }
    });
})
});

