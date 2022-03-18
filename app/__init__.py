import os

from datetime import timedelta

from flask import Flask
from flask_sqlalchemy import SQLAlchemy

app = Flask(__name__)
app.config.update(
    SESSION_COOKIE_SECURE = True,
    SESSION_COOKIE_SAMESITE = 'Lax',
    SQLALCHEMY_DATABASE_URI = os.environ.get('SQLALCHEMY_DATABASE_URI'),
    SECRET_KEY = os.environ.get('SECRET_KEY'),
    SQLALCHEMY_TRACK_MODIFICATIONS = False,
    PERMANENT_SESSION_LIFETIME = timedelta(days=28)
)


db = SQLAlchemy(app)

from .api import api_admin, api_courier, api_orders, api_products, api_user
from .database import tables
from .views import main, admin, courier

app.register_blueprint(admin.app, static_folder='static')
app.register_blueprint(courier.app)

@app.shell_context_processor
def make_shell_context():
    return {'db': db, 'tables': tables}

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
