import hashlib
import math
import pyotp

from functools import wraps
from datetime import datetime, timedelta
from geopy.distance import distance
from geopy.geocoders import Nominatim
from flask import session, redirect, url_for, abort

from app import app, db
from .database.tables import Order, Product, User, CartItem
from .database.tables import Admin as AdminModel, Courier as CourierModel


def hash(data):
    return hashlib.sha224(str.encode(data)).hexdigest()


def get_secret_key():
    return pyotp.random_base32()


def check_otp(otp):
    id = session.get("temp_id", "")
    user_key = db.session.query(User).filter_by(
        id=id).first().totp_key
    if pyotp.TOTP(user_key).now() == otp:
        session.clear()
        session['id'] = id
        session['otp'] = True
        return "OTP verified", 200
    return "Invalid OTP", 401


def login_required(func):
    """ route decorator for view access control """
    @wraps(func)
    def inner():
        if session.get("id", None):
            return func()
        else:
            print("no session id")
            return redirect(url_for(".login"))

    return inner


def logged_in(func):
    """ route decorator for checking if a user session exists """
    @wraps(func)
    def inner():
        if not session.get("id", None):
            return func()
        else:
            print("already logged in")
            return redirect(url_for(".home"))

    return inner


def is_expired(func):
    """ route decorator for preventing expired accounts to access views """
    @wraps(func)
    def inner():
        if not checkexpired(session.get("id", '')):
            return func()
        else:
            print("account expired")
            return redirect(url_for(".expired"))

    return inner


# database queries
def checkexpired(id):
    user = User.query.filter_by(id=id).first()
    if not user:
        return False
    if user.password_expr <= datetime.utcnow():
        return True


def email_exists(email):
    user = User.query.filter_by(email=email).first()
    return user


def auth_user(email="", password=""):
    user = User.query.filter_by(email=email, password=password).first()
    if user:
        session['pass_expr'] = None
        session['id'] = user.id
        session['firstname'] = user.firstname
        session['lastname'] = user.lastname
        if user.password_expr <= datetime.now():
            return '', 409
        if user.password_expr <= datetime.now() + timedelta(days=10):
            session['pass_expr'] = math.floor(
                (user.password_expr - datetime.now()).days)
        user.rem_attempts = 3
        user.try_again = None
        db.session.commit()
        session.permanent = True
        if user.totp_key:
            return {"totp": True}
        return {"totp": False}
    else:
        user.rem_attempts = user.rem_attempts - 1
        db.session.commit()
        return '', 401


def login_attempts(user):
    if user.rem_attempts < 1:
        if not user.try_again:
            if not user.try_again:
                user.try_again = datetime.utcnow() + timedelta(minutes=5)
                db.session.commit()
            if user.try_again < datetime.utcnow():
                user.rem_attempts = 3
                user.try_again = None
                db.session.commit()
            else:
                waittime = (user.try_again -
                            datetime.utcnow()).seconds // 60
                waittime = "< 1" if waittime == 0 else waittime
                return str(f"Please try again in {waittime} minute(s)"), 406


def get_user():
    return db.session.query(User).filter_by(id=session.get("id", "")).first()


def register_user(data):
    try:
        data['password'] = hash(data['password'])
        user = User(**data)
        db.session.add(user)
        db.session.commit()
        return "Account Registered", 200
    except Exception as e:
        print(e)
        return f"Registration failed: {e}", 404


def get_products():
    products = db.session.query(Product).all()
    return products


def get_cart():
    cart = db.session.query(CartItem).filter_by(
        cart_id=session.get("id", "")).all()
    return cart


def get_cart_total():
    total = db.session.query(CartItem).filter_by(
        cart_id=session.get("id", "")).count()
    return total


def get_pending_orders():
    orders = db.session.query(Order).filter(
        Order.user_id == session.get("id", "") and Order.status != "Delivered")
    return orders


def get_orders():
    orders = db.session.query(User).filter_by(id=session.get("id", "")).orders
    return orders


def get_favorites():
    favorites = db.session.query(User).filter_by(
        id=session.get("id", "")).first().favorites()
    return favorites


class Admin:
    """ class for admin utils """
    @staticmethod
    def login_required(func):
        """ route decorator for view access control """
        @wraps(func)
        def inner():
            if session.get("admin", None):
                return func()
            else:
                print("no session id")
                return redirect(url_for(".login"))

        return inner

    @staticmethod
    def logged_in(func):
        """ route decorator for checking if an admin session exists """
        @wraps(func)
        def inner():
            if not session.get("admin", None):
                return func()
            else:
                print("already logged in")
                return redirect(url_for(".index"))

        return inner

    @staticmethod
    def authorized_only(func):
        """ route decorator for preventing unauthorized access to api routes """
        @wraps(func)
        def inner():
            if session.get("admin", None):
                return func()
            else:
                abort(403)

        return inner

    @staticmethod
    def get_couriers():
        couriers = db.session.query(CourierModel).all()
        return couriers

    @staticmethod
    def get_orderbystatus(status):
        orders = db.session.query(Order).filter_by(status=status).all()
        return orders

    @staticmethod
    def auth(data):
        admin = AdminModel.query.filter_by().first()
        print(admin)
        if admin:
            session['admin'] = data['username']
            return 'Logged In', 200
        return "Invalid Credentials", 401


class Courier:
    """ class for courier utils """
    @staticmethod
    def login_required(func):
        """ route decorator for view access control """
        @wraps(func)
        def inner():
            if session.get("courier_id", None):
                return func()
            else:
                print("no session id")
                return redirect(url_for(".login"))

        return inner

    @staticmethod
    def logged_in(func):
        """ route decorator for checking if a courier session exists """
        @wraps(func)
        def inner():
            if not session.get("courier_id", None):
                return func()
            else:
                print("already logged in")
                return redirect(url_for(".index"))

        return inner

    @staticmethod
    def get_deliveries():
        deliveries = db.session.query(
            CourierModel).filter_by(id=session.get("courier_id", "")).first().orders()
        return deliveries

    @staticmethod
    def get_displayorders():
        res = []
        gl = Nominatim(user_agent="Glean-Store")
        courier = CourierModel.query.filter_by(
            id=session.get("courier_id", "")).first()
        orders = Order.query.filter_by(status="Processing").all()

        if not orders:
            return res

        loc_courier = gl.geocode(
            {'city': courier.city, 'postalcode': int(courier.zip)}).raw
        coords_courier = (loc_courier['lat'], loc_courier['lon'])

        for order in orders:
            loc_order = gl.geocode(
                {'city': order.city, 'postalcode': int(order.zip)}).raw
            coords_order = (loc_order['lat'], loc_order['lon'])
            dist = distance(coords_courier, coords_order).km
            if dist <= 10:
                user = user.query.filter_by(id=order.user_id).first()
                res.append(
                    {'user': user, 'order': order, 'distance': dist})
            res = sorted(res, key=lambda x: x['distance'])

        return res

    @staticmethod
    def get_completed_today():
        orders = Order.query.filter_by(
            courier_id=session.get("courier_id", ""), status="Delivered").all()
        completed_today = [
            order for order in orders if order.updated_on.day == datetime.utcnow().day]
        return completed_today

    @staticmethod
    def get_completedorders():
        orders = Order.query.filter_by(
            courier_id=session.get("courier_id", ""), status="Delivered").all()
        return orders

    @staticmethod
    def auth(data):
        courier = CourierModel.query.filter_by(**data).first()
        if courier:
            session['courier_id'] = courier.id
            return 'Logged In', 200
        return "Invalid Credentials", 401

    @staticmethod
    def get_courier():
        return db.session.query(CourierModel).get(session.get("courier_id", ""))
