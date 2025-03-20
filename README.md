# MySchedule

The motivation behind MySchedule stems from the need for better time management and organization in daily life. Many people struggle with forgetfulness, missed deadlines, and inefficient planning, which can lead to stress and decreased productivity. MySchedule aims to solve these problems by providing a simple yet effective reminders application that helps users schedule their tasks, stay on top of important events, and optimize their daily routines. It exists to enhance productivity, reduce stress, and support users in managing their time more efficiently.

IMPORTANT NOTE: The local port of 5000 may be in use for non windows systems since the code was used for windows systems in mind. If the application will be run on NON-WINDOWS SYSTEMS you need to change the PORT constant in the server.js file to 6000. Also, since the application was designed for windows systems, some of the code may not work correctly. For example, you cannot add a task in our application in a non windows system but all other features work as intended.

Required Tools and Program:
To run the task scheduling app, one will need the following tools and programs:
Operating System: 
Window.
Programming Languages:
Backend - the backend is built with Node.js and Express
Front End - HTML/CSS/JavaScript, with React
Database: MongoDB
Dependancies: Covered in the installation but includes, node.js react, express, mongoose, cors, and axios. When downloading the repository, the following will all be installed as part of the 'npm install' step.

Version Control: Git
Code Editor: VS code

Contribution: describe the process for contributing to your project. 
○ Do you use git flow? 
	No.
○ What do you name your branches? 
	There are two branches in use, sprint1, and dataBaseConnectionWithBackendSprint1, with dataBaseConnectionWithBackendSprint1 being the most recent branch of the two.
○ Do you use GitHub issues or another ticketing website? 
	Possibility for using GitHub issues.
○ Do you use pull requests? 
	Yes when pulling from GitHub as a safety precaution.

Installation: 

Our application uses react, mongodb, and node.js and express, and In order to use our application you need to follow the steps to make sure it works correctly

You must copy the repository in github to some folder or file that you create .

	-Create the file testingFile on your desktop
	Ex. “cd desktop/testingfile”.

Then clone the repository FROM THE BRANCH NOT FROM MAIN as follows 

	“git clone -b dataBaseConnectionWithBackendSprint1 https://github.com/hvpham-yorku/mySchedule-group-3.git”.

From there, there navigate to the repository you cloned and run/type in 

	“cd mySchedule-group-3” and then type in 
	“npm install”.

Once it is finished you need to run the backend server first to load in all the tasks in the database, and then run the front end server.
	To run the back end server, navigate to your folder and go inside the back end

	“cd backend”
	Then type “node server.js”.

From there open another terminal and navigate to the repository 

	“cd desktop/testingFile/mySchedule-group-3 and then type
	“npm start”  to load on the website.

From there the application should appear in your browser and you are free to use it.


