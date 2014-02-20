<?php


/**
 * Access to the database and perform the sql request to retrieve the employees
 *
 * @return mixed
 **/
function getEmployees() {
	$mysqli = new mysqli(DB_HOST, DB_USER,DB_PASSWORD, DB_DATABASE);
	if ($mysqli->connect_errno) {
	   throw new Exception('Database connexion error');
	}
	if (!($res = $mysqli->query("SELECT id,name,bossId from employees order by bossId"))) {
		throw new Exception('Sql request error');
	}
	return $res;	
}