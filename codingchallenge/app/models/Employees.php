<?php

/**
 *
 *.This class handle a collection of Employee
 * The collection is represented has an array of Employees
 * 
 * The class provide some methods in order to populate the collection of employees, sort, 
 * filter and return a specific range 
 * An index may be created in the case of sorting / filtering
 *
 */
class Employees
{
	 /**
     * Array of employee
     * The keys of the array are also the Id of each employee
     */
	 protected $_employees;

	 /**
     * Get the current array of employees
     *
     * @return array;
     */
	 public function getEmployees() {
		return $this->_employees;
	}

	/**
     * Get the employee with the specific id given in parameter
     * @param int $id 
     * @return array;
     */
	public function getEmployee($id) {
		if (isset($this->_employees[$id])) {
			return $this->_employees[$id];
		}
		return false;
	}

	/**
     * Get the total number of employees
     * @return int;
     */
	public function getNumEmployees() {
		return count($this->_employees);
	}

	/**
     * Get the number of employees that could be displayed.
   	 * If the data are filterd, the number of employees displayed could be less than the total number
     * @return int;
     */
	public function getNumEmployeesDisplayed() {
		if (isset($this->index)) {
			return count($this->index);
		}
		return count($this->_employees);
	}

 	/**
     * Populate the array of Employee
     *
     * Retrieve the data from database and compute the distance for each employee
     */
	public function populate() {
		//Get the list of employees from DB ordered by bossId
		$employeesListDb = getEmployees();
		if  ($employeesListDb->num_rows == 0) {
			throw new Exception('No data returned');
		}
		//Create all Employee
		while($employeeDb = $employeesListDb->fetch_assoc()) {
			//If the employee is the boss : ie id == bossId
			if($employeeDb['id'] == 1) {
				// Set the distance to 0
				$distance = 0;
				// The employee has no boss
				$boss = null;
			}
			//Else, the employee has a boss
			else {
				// Check if the boss of the employee exist
				if (isset($this->_employees[$employeeDb['bossId']])) {
					// Compute the distance
					// The distance is the distance of his boss + 1
					$distance = $this->_employees[$employeeDb['bossId']]->getDistance() + 1;
					// Set the boss of the employee
					$boss = $this->_employees[$employeeDb['bossId']];
				}
			}
			//Create the employee
			$employee = new Employee(
				array(
					'id' => $employeeDb['id'],
					'name' => $employeeDb['name'],
					'boss' => $boss,
					'distance' => $distance
				)
			);
			//Add the employee to the array of Employee
			$this->_employees[$employeeDb['id']] = $employee;
		}
	}

	
	/**
     * Check if the name given in parameter correspond to the filter
	 * The filter is based on the stristr function
     *
   	 * @param string $filter 
   	 * @param string $name 
     * @return bool;
     */
	protected function filterName($filter , $name) {
		return stristr($name , $filter);
	}

	/**
     * If correct parameters are given, create and populate a new property index
     * index is an array filtered and sorted, each value is an array containing the key used to sort and a reference to an object Employee
     * The index is created to perform a quick sort on the specific key
     *
   	 * @param array $sortParams
   	 * @param string $filterName
     */
	public function filterSort($sortParams = null , $filterName = null) {
		if (isset($sortParams) && is_array($sortParams) && isset($sortParams['col'])) {
			//Create an index containing for each Employee the key needed to perform the search and a reference to an instance of Employee
			$this->index = array();
			//Add the employee in the index with the key needed and according to the filter if it has been set
			foreach($this->_employees as $employee) {
				// If there is a filter defined check if the row correspond to the filter, if not step to the next Employee
				if (!$filterName || ($this->filterName($filterName , $employee->getName()))) {
					if ($sortParams['col'] == 'bossName') {
						if ($employee->getBoss() != null) {
							$this->index[] = array($employee->getBoss()->getName(), $employee);
						}
						else {
							$this->index[] = array('', $employee);
						} 
					}
					elseif ($sortParams['col'] == 'distance') {
						    $this->index[] = array($employee->getDistance(), $employee);
					}
					else {
						//Default search
						$this->index[] = array($employee->getName(), $employee);
					} 
				}
			}
			// Sort the index if it has been created
			if (isset($this->index) && count($this->index)) {
				if (isset($sortParams['order']) && ($sortParams['order'] == 'desc')) {
					rsort($this->index);
				}
				else {
					//Default sort
					sort($this->index);
				}
			}
		}
	}
	

	/**
     * Get an array sorted and filtered of array. Each array represent the data needed to be returned by employee
     * The array returned represent a specific range of the full list of data. The range may be given in parameter 
     *
   	 * @param array $rangeParams
     * @return array;
     */
	public function getArrays($rangeParams = null) { 	
		if (isset($rangeParams) && is_array($rangeParams) && isset($rangeParams['start']) && isset($rangeParams['end'])) {
			// If the range are given in parameter
			$start = intval($rangeParams['start']) - 1;
			$end = intval($rangeParams['end']);
			$numEmployeesDisplayed = $this->getNumEmployeesDisplayed();
			// Validate and set the start of the range
			// If the range given does not fit to the actual array, adjust it with some default behavior
			if (($start < 0) || ($start > $numEmployeesDisplayed)) {
				$start = 0;
			}
			// Validate and set the end of the range
			if (($end < 0) || ($end < $start)) {
				$end = $start + NUM_ROWS_DISPLAYED;
			}
			if ($end > $numEmployeesDisplayed) {
				$end = $numEmployeesDisplayed;
			}
		}
		else {
			// Default range values
			$start = 0;
			$end = NUM_ROWS_DISPLAYED;
		}
		//Create the array to be returned
		$employeesArray = array();
		//For each employee, create the array with the needed data to display
		for ($i = $start ; $i < $end ; $i++) {
			//Refer to the index to create the array if it exist, the employees array otherwise
			if (isset($this->index)) {
				$currEmployee = $this->index[$i][1];
			}
			else {
				$currEmployee = $this->_employees[$i];
			}

			if ($currEmployee->getBoss()) {
				$bossName = $currEmployee->getBoss()->getName();
			}
			else {
				$bossName = '';
			}
			$employeesArray[] = array(
				 $currEmployee->getName(),
				 $bossName,
				 $currEmployee->getDistance()
			);
		}
		return $employeesArray;
	}
}
?>