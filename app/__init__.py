import os
import click

from datetime import timedelta, datetime

from flask import Flask
from flask.cli import AppGroup
from flask_sqlalchemy import SQLAlchemy
from flask_migrate import Migrate

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
migrate = Migrate(app, db)
account_cli = AppGroup('account')

from .api import api_admin, api_courier, api_orders, api_products, api_user
from .database import tables
from .views import main, admin, courier
from .utils import hash_data

app.register_blueprint(admin.app, static_folder='static')
app.register_blueprint(courier.app)

@app.shell_context_processor
def make_shell_context():
    return {'db': db, 'tables': tables}

@app.cli.command("init-db")
def init_db():
    """ Initialize the database if not yet created """
    db.create_all()
    print("database created")

@app.cli.command("clear-db")
def destroy_db():
    """ Clear all database data """
    db.drop_all()
    db.create_all()
    print("database cleared")

@account_cli.command('create')
@click.argument('name')
def create_user(name):
    """ Create different user accounts """
    if name == "user":
        db.session.add(tables.User(email="user@gmail.com", password=hash_data(os.environ.get('USER_PASSWORD')), phone="09312312313", firstname="Normal", lastname="User"))
    elif name == "admin":
        db.session.add(tables.Admin(username="admin",
                   password=hash_data(os.environ.get('ADMIN_PASSWORD'))))
    elif name == "will_expire":
        db.session.add(tables.User(email="will_expire@gmail.com", password=os.environ.get('USER_PASSWORD'), phone="09312312313", firstname="Will", lastname="Expire", password_expr=datetime.utcnow() + timedelta(days=8)))
    elif name == "expired":
        db.session.add(tables.User(email="expired@gmail.com", password=os.environ.get('USER_PASSWORD'), phone="09312312313", firstname="Expired", lastname="User", password_expr=datetime.utcnow()))
    else:
        return
    db.session.commit()
    print(f"{name} account created")

@app.cli.command("view-config")
def view_config():
    """ View current app configurations """
    print(app.config)

app.cli.add_command(account_cli)