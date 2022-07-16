<div align="center">
  <a href="https://github.com/m-visaya/Glean-Project">
    <img src="./app/static/assets/logo_index.svg" alt="Logo" height="70">
  </a>
  <h3 align="center">no crops wasted</h3>
<br>
<br>
  <p align="center">
An e-commerce platform offering a door-to-door delivery service of pre-packaged meal ingredients.
<br />
<a href="https://glean-project.herokuapp.com/"><strong>Visit Website 🛒</strong></a>
<br />
<br />
<a href="https://github.com/m-visaya/Glean-Project/issues">Report a bug or Request a feature</a> 
  </p>
</div>

<br>
<br>

<div>
    <h1>Tools Used</h1>
    <ul>
        <li><a href="https://www.python.org/">Python</a></li>
        <li><a href="https://flask.palletsprojects.com/en/2.1.x/">Flask</a></li>
        <li><a href="https://getbootstrap.com/">Bootstrap</a></li>
        <li><a href="https://jquery.com/">JQuery</a></li>
    </ul>
</div>

<br>
<br>

<div>
    <h1>Prerequisite/s</h1>
    <ul>
        <li> Python 3.7 and newer </li>
    </ul><br>
    To check for your local python version, open the terminal and type:
    <br><br>

    python --version

</div>

<br>
<br>

<div>
    <h1>Local Development Setup</h1>
    <h3>- [ Optional ] Crete a python virtual environment.</h3>
    <br>
    In your terminal type:
    <br><br>

    python -m venv pathname/env
    -------------or---------------
    python3 -m venv pathname/env

    cd pathname
    env\Scripts\activate

<br>
The current directory in your terminal should contain an (env) tag:
<br><br>

    (env) C:\**\pathname

<br>
<h3>- Clone the repository</h3>
<br>

    git clone https://github.com/m-visaya/Glean-Project.git
    cd Glean-Project

<br>
<h3>- Install dependencies</h3>
<br>

    pip install -r requirements.txt

<br>
<h3>- Create a .env file inside the directory and include:</h3>
<br>

    SECRET_KEY="replace  with a complex key"
    SQLALCHEMY_DATABASE_URI="sqlite:///database/database.db"
    ADMIN_PASSWORD="password for the admin account"
    USER_PASSWORD="password for creating a user account using the CLI"
    FLASK_ENV=development
    SQLALCHEMY_TRACK_MODIFICATIONS="False"
    FLASK_APP=wsgi.py

\*\* SQLALCHEMY_DATABASE_URI can be replaced with your database of choice, for more info visit https://flask-sqlalchemy.palletsprojects.com/en/2.x/config/

<br>
<h3>- Run the following commands in your terminal:</h3>
<br>

    flask db upgrade
    flask account create user
    flask account create admin

<br>
<h3>- Start the flask server:</h3>
<br>

    flask run

<h3>- Navigate to the admin route <a>127.0.0.1:5000/admin</a> and login with the following credentials: </h3>

    username: admin
    password: [admin password you set in the .env file]

\*\* The port number 5000 may differ depending on the available ports on your device
<br>

<br>
<h3>- Navigate to <i>Product Inventory</i> and select the <i>upload excel file</i> from the <i>add package(s)</i> button then upload the .xlsx file located in: </h3> 
<br>

    Glean-Project\app\static\assets\packages.xlsx

<br>
<h3>- Navigate to the user login route <a>127.0.0.1:5000/login</a> and login with the following credentials: </h3> 
<br>

    email: user@gmail.com
    password: [user password you set in the .env file]

</div>

<br>
<br>
<div>
    <h1>Contributing</h1>
    <ol>
    <li> Fork the Project </li>
    <li> Clone the Forked Project </li>
    <li> Create a new branch for your new updates </li>
    <br>

    git checkout -b feature-or-fix-name

<p>
    <li> Commit your Changes </li>
    <br>

    git commit -m 'Fix sample module'

<p>
    <li> Push to the Branch </li>
    <br>

    git push origin feature-or-fix-name

<p>
    <li> Open a Pull Request </li>
    </ol>
</div>
