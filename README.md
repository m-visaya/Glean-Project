<div align="center">
  <a href="https://github.com/m-visaya/Glean-Project">
    <img src="./app/static/assets/logo_index.svg" alt="Logo" height="70">
  </a>
  <h3 align="center">no crops wasted</h3>
<br>
  <p align="center">
An e-commerce platform offering a door-to-door delivery service of pre-packaged meal ingredients.
<br>
<a href="https://glean-project.herokuapp.com/"><strong>Visit Website 🛒</strong></a>
<br>
<br>
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
   <h1>Setting up Local Development</h1>
   <h3>Clone the repository</h3>
   In your prefered working directory open a terminal and type:
   <br><br>
  
    git clone https://github.com/m-visaya/Glean-Project.git
  
   <h3>Install the dependencies</h3>
   Install the necessary requirements using pip
   <br><br>
  
    pip install -r requirements.txt
  
   <h3>Configure environment variables</h3>
   Create a .env file in your working directory and include the following:
   <br><br>
  
    SECRET_KEY="#nominate any string here as key"
    SQLALCHEMY_DATABASE_URI="sqlite:///database/database.db"
    ADMIN_PASSWORD="#nominate a password for admin"
    FLASK_ENV=development
    SQLALCHEMY_TRACK_MODIFICATIONS="False"
    FLASK_APP=wsgi.py
  
   If successful, your working directory should look like
   
      Glean-Project/
      ├─ .git/
      ├─ __pycache__/
      ├─ app/
      ├─ migrations/
      ├─ .env
      ├─ .gitignore
      ├─ procfile
      ├─ README.md
      ├─ requirements.txt
      ├─ wsgi.py
  
   <h3>Initialize the database</h3>
   To initialize the database open a terminal and type
   <br><br>
  
     flask db upgrade
     flask account create user
     flask account create admin

   <h3>Start Flask server:</h3>
   Start the server using the following command
   <br><br>
  
     flask run
  
   After running the server it should return a localhost and a port that start at 5000, you can access the web application through any browser.
</div>

<br>
<br>

<div>
   <h1>Initialize the store</h1>
  Opening the web application will return a <code>no products</code> prompt when the user accessed any of the store page. This can be solved by adding store items to the system.
  <br><br>
  To do this navigate to <code>localhost:5000/admin</code> or the addresse assigned by the flask server followed by <code>/admin</code>.
  <br><br>
  Login to the admin page with the following credentials: 
  <br><br>
  
    username: admin
    password: ADMIN_PASSWORD FROM .ENV FILE

  Navigate to the product inventory, then select upload excel file from the add package(s) button. The excel file containing dummy packages are located in
  
    Glean-Project\app\static\assets\packages.xlsx
  
  The <code>No Products</code> prompt should be resolved.
  
</div>

<br>
<br>

<div>
    <h1>License</h1>
    Distributed under the GPL3 License. See LICENSE for more information.
</div>
