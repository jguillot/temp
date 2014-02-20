<?php

/**
 *
 * This class represent an employee
 * Each employee have a reference to his boss 
 *.
 */
class Employee
{
	/**
     * String : Name of the employee
     */
	protected $_name;

	/**
     * int : id of the employee
     */
	protected $_id;

	/**
     * Employee : reference to the boss of the employee
     */
	protected $_boss;

	/**
     * int : distance to the CEO (root of the tree of employee)
     */
	protected $_distance;

	/**
     * Constructor of an Employee
     *
     * @param array param 
     *
     */
	function __construct($param = null)
	{
		if ($param && is_array($param)) {
			if (isset($param['name'])) {
				$this->_name = $param['name'];
			}
			if (isset($param['id'])) {
				$this->_id = $param['id'];
			}
			if (isset($param['boss'])) {
				$this->_boss = $param['boss'];
			}
			if (isset($param['distance'])) {
				$this->_distance = $param['distance'];
			}
		}
	}

	/**
     * Get the name
     * @return string;
     */
	public function getName() {
		return $this->_name;
	}

	/**
     * Set the name
     */
	public function setName($name) {
		$this->_name = $name;
	}

	/**
     * Get the id
     * @return int;
     */
	public function getId() {
		return $this->_id;
	}

	/**
     * Set the id
     */
	public function setId($id) {
		$this->_id = $id;
	}

	/**
     * Get the boss
     * @return Employee;
     */
	public function getBoss() {
		return $this->_boss;
	}

	/**
     * Set the boss
     */
	public function setBoss($boss) {
		$this->_boss = $boss;
	}

	/**
     * Get the distance to the root
     * @return int;
     */
	public function getDistance() {
		return $this->_distance;
	}

	/**
     * Set the distance
     */
	public function setDistance($distance) {
		$this->_distance = $distance;
	}
}



?>