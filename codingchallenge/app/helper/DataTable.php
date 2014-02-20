<?php
/**
  * The dataTable class handle the dataTable library
  * 
  * The class is able to read and validate the parameters sent by the dataLibrary
  * Then the class provide some methods to export these data
  * The class is also able to provide the body of the http response compatible with the dataTable library
  * 
*/

class dataTable
{
	/**
     * If an error is catched then set to true
     */
	protected $_error;

	/**
     * Specific count for dataTable
     */
	protected $_sEcho;

	/**
	 * Range computed regarding the data sent by dataTable
	 * Array of 2 columns : start and end
	 */
	protected $_range;

	/**
	 * Sort computed regarding the data sent by dataTable.
	 * Array of 2 columns : col and order
	 */
	protected $_sort;
	/**
	 * Filter computed regarding the data sent by dataTable.
	 * String representing the filter
	 */
	protected $_filter;

	/**
	 * Body of the http response to be sent
	 */
	protected $_response;

	/**
	 * Default Constant
	 */
	const default_range_start = 1; 
	const default_range_end = NUM_ROWS_DISPLAYED;
	/**
	* This function handle the parameters sent by the dataTable library
	* @param array get represent $_GET
	*/
	public function setParams($get) {
		$this->setSEcho($get);
		$this->setRange($get);
		$this->setSort($get);
		$this->setFilter($get);
	}

	/**
     * Get the error
     * @return bool;
     */
	public function getError() {
		return $this->_error;
	}

	/**
     * Get SEcho
     * @return int;
     */
	public function getSEcho() {
		return $this->_sEcho;
	}

	/**
     * Set SEcho
     * SEcho is sent by dataTable, and have to be return incremented. There is an error otherwise
     *
     * @param array get 
     */
	protected function setSEcho($get) {
		if (isset($get['sEcho'])) {
		  return $this->_sEcho =  intval($get['sEcho']) + 1;
		}
		else {
			//If SEcho if not provided this is an error
			$this->_error = true;
			return false;
		}
		return false;
	}

	/**
     * Get Range
     * @return array;
     */
	public function getRange() {
		return $this->_range;
	}

	/**
     * Set Range
     * Get and validate the parameters given by dataTable about the range
     * If the data are note correct, compute data by default
     *
     * @param array get 
     */
	protected function setRange($get) {
		//Optional : set range parameters
		$this->_range = array();
		if (isset($get['iDisplayStart']) && (intval(($get['iDisplayStart'])) >= 0)) {
		  $this->_range['start'] = intval($get['iDisplayStart']) + 1;
		  if (isset($get['iDisplayLength']) && (intval(($get['iDisplayLength'])) > 0)) {
		    $this->_range['end'] =$this->_range['start'] +  intval($get['iDisplayLength']);
		  }
		  else {
		    $this->_range['end'] = $this->_range['start'] + NUM_ROWS_DISPLAYED;
		  }
		}
		else {
		  // Default values
		  $this->_range['start'] = self::default_range_start;
		  $this->_range['end'] = sels::default_range_end;
		}	
	}

	/**
     * Get Sort
     * @return array;
     */
	public function getSort() {
		return $this->_sort;
	}

	/**
     * Set Sort
     * Get and validate the parameters given by dataTable about the sort
     * If the data are note correct, compute data by default
     *
     * @param array get
     */
	protected function setSort($get) {
		//Optional : set sort parameters
		$this->_sort = array();
		//Define the columns
		$columns = array('name','bossName','distance');
		if (isset( $get['iSortCol_0'])) {
		  //Check if the num of the colum to sort is defined
		  if (isset($columns[$get['iSortCol_0']])) {
		    $this->_sort['col'] = $columns[$get['iSortCol_0']];
		  }
		  //Check if there is an order specified for the sort
		  if ( isset( $get['sSortDir_0'])) {
		    if ($_GET['sSortDir_0'] === 'desc') {
		      $this->_sort['order'] = 'desc';
		    }
		    else {
		      $this->_sort['order'] = 'asc';
		    }
		  }
		}
		else {
		  // Default values
		  $this->_sort['col'] = $columns[0]; 
		  $this->_sort['order'] = 'asc'; 
		}
	}

	/**
     * Get Filter
     * @return string;
     */
	public function getFilter() {
		return $this->_filter;
	}

	/**
     * Set Filter
     * Get and validate the parameters given by dataTable about the filter
     * If the data are note correct set filter to null
     *
     * @param array get
     */
	protected function setFilter($get) {
		//Optional : set filter parameters
		if (isset($get['sSearch']) && (strlen($get['sSearch']) < 50)) {
		  $this->_filter = $get['sSearch'];
		}
		else {
		  // Default value
		  $this->_filter = null;
		}
	}

	/**
     * Set the response
     *
     * @param array responseParam 
     */
	public  function setResponse($responseParam) {
		$this->_response = $responseParam;
	}

	/**
     * Get response
     * @return JSON;
     */
	public  function getResponse() {
		return json_encode($this->_response);
	}

	public static function getErrorResponse() 
	{
		return json_encode(array(
			"sEcho" => intval($_GET['sEcho']) + 1,
			"iTotalRecords" => 0,
			"iTotalDisplayRecords" => 0,
			"aaData" => array()
		));
	}
}