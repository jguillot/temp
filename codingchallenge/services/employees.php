<?php
/**
  * This file is the entry point of the service
  * It is acting like a controller, get the parameters, compute the data and send the response
  * 
  *
*/
require_once ('../app/Boostrap.php');

 /********************* Handle DataTable parameters  *******************************/

  $dataTable = new dataTable();
  $dataTable->setParams($_GET);
  if ($dataTable->getError()) {
    exit(dataTable::getErrorResponse()); // Return an error
  }

  /********************* Compute Date  **********************************************/

try {
  $employees = new Employees();
  //Populate the employees object with all the data needed to be displayed
  $employees->populate();
  //filter and sort the employees collection
  $employees->filterSort($dataTable->getSort(),$dataTable->getFilter());

  /********************* OUTPUT  ****************************************************/

  //Get an array containing a specific range of employees
  $employeesRecord = $employees->getArrays($dataTable->getRange());
  //Construct the JSON response compatible with the datatable library
  $dataTable->setResponse(
    array(
      "sEcho" => $dataTable->getSEcho(),
      "iTotalRecords" => $employees->getNumEmployees(),
      "iTotalDisplayRecords" => $employees->getNumEmployeesDisplayed(),
      "aaData" => $employeesRecord,
    )
  );
}
catch(Exception $e) {
  exit(dataTable::getErrorResponse()); // Return and error
}

//Output
echo $dataTable->getResponse();
?>