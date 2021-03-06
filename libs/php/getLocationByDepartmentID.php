<?php


	// example use from browser
	// http://localhost/companydirectory/libs/php/getDepartmentByID.php?id=2
	
	// remove next two lines for production

	ini_set('display_errors', 'On');
	error_reporting(E_ALL);

	$executionStartTime = microtime(true);

	include("config.php");

	$conn = new mysqli($cd_host, $cd_user, $cd_password, $cd_dbname, $cd_port, $cd_socket);
	$deptID = $conn->real_escape_string($_REQUEST['deptID']);
	//$deptID = $conn->real_escape_string($_POST['deptID']);

	if (mysqli_connect_errno()) {
		
		$output['status']['code'] = "300";
		$output['status']['name'] = "failure";
		$output['status']['description'] = "database unavailable";
		$output['status']['returnedIn'] = (microtime(true) - $executionStartTime) / 1000 . " ms";
		$output['data'] = [];
		
		mysqli_close($conn);

		echo json_encode($output); 

		exit;

	}	
	
	// $_REQUEST used for development / debugging. Remember to cange to $_POST for production
	$query = "SELECT * FROM location WHERE id = ANY( SELECT locationID FROM department WHERE id = '$deptID')";
	//$query = 'SELECT id, name, locationID FROM department WHERE id = ' . $_REQUEST['deptID'];

	$result = $conn->query($query);
	
	if (!$result) {

		$output['status']['code'] = "400";
		$output['status']['name'] = "executed";
		$output['status']['description'] = "query failed";	
		$output['data'] = [];

		mysqli_close($conn);

		echo json_encode($output); 

		exit;

	}
   
   	$data = [];

	while ($row = mysqli_fetch_assoc($result)) {

		array_push($data, $row);

	}

	$output['status']['code'] = "200";
	$output['status']['name'] = "ok";
	$output['status']['description'] = "success";
	$output['status']['returnedIn'] = (microtime(true) - $executionStartTime) / 1000 . " ms";
	$output['data'] = $data;

	header('Content-Type: application/json; charset=UTF-8');
	
	mysqli_close($conn);

	echo json_encode($output); 

?>