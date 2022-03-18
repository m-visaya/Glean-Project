from flask import Flask, session
from flask_sqlalchemy import SQLAlchemy
import os
from dotenv import load_dotenv

load_dotenv()
app = Flask(__name__, instance_relative_config=True)
app.config.from_object(os.environ.get('FLASK_ENV') or 'config.Development')

db = SQLAlchemy(app)

from .api import api_admin, api_courier, api_orders, api_products, api_user
from .database import tables
from .views import main, admin, courier

app.register_blueprint(admin.app, static_folder='static')
app.register_blueprint(courier.app)

@app.cli.command("init-db")
def init_db():
    db.create_all()
    print("database created")


@app.cli.command("destroy-db")
def destroy_db():
    db.drop_all()
    print("database destroyed")


@app.cli.command("create-admin")
def create_admin():
    db.session.add(tables.Admin(username="admin",
                   password=os.environ.get('ADMIN_PASSWORD')))
    db.session.commit()
    print("admin account created")

@app.cli.command("view-config")
def view_config():
    print(app.config)
