**Installation**

This program run under php 5.4 and mysql 5.5
Simply copy the codingchallenge directory under any web directory
Then, change the parameter in app/conf/Application.php to configure the connexion to the database
Finally, go to following URL : http://servername/index.html

**Features**

The following features has been developped :
1) Generate an html table with the following columns : Employee Name, Boss Name, Distance from CEO
2) The html is generating using DataTables
3) Clicking on a column name sort results on that column, clicking again will sort in reverse order
4) The user is able to choose how many result he want to by page : 10, 25, 50, 100
5) The user is able to navigate using the pagination
6) The user is able to search an employee name using search box


**Code Architecture**

Root Directory
-- codingchallenge

There are three main directories :

1) app Directory : contain the logic of the application
---- app 			 
------ conf
------ db
------ helper
------ models
------ Bootstrap.php

2) service Directory : entry point of the web services. Handle the request, call the logic, and provide the response
---- services

3) public Directory containing the css, images and the javascript libraries
---- public
------ css
------ images
------ lib

index of the application
---- index.html


**Conception**

Info : As a constraint I took the choice to never store the result under any kind of cache/file/database, then I compute the distance for each request.   

The data are displayed using the dataTable javascript library.

The dataTable library call the service '/services/employees.php' using an Ajax each time some data have to be displayed

The service handle the parameters sent and deferred their validation and computation to a dataTable class 

The dataTable instance analyze the different parameters, validate them, or if the parameters are incorrect use default value if possible or set up an error.

The service use these parameters to build the data by instanciating an Employees object, and call different 
method in order to populate, filter and order the records.

The population of the Employees is done by requesting data from the database, and while fetching the data the computation of the 'distance' is done for each Employee.

In order to sort the data and to use the built-in sort method, an index is created using as a key the column to be sorted.
In the meantime of the creation of the index and for the sake of performance, the data are filtered if necessary. Which mean that only the data who pass the filter are added to the index.

For the final part, the service get an array containing the range of Employee needed, then provide the array to the dataTable which return the final JSON response. 


If there is an error at anytime, an error is throwed and empty data are returned.
@todo : Handle the error on client side
