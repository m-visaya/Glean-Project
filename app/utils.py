import hashlib
import math
import pyotp

from functools import wraps
from datetime import datetime, timedelta
from geopy.distance import distance
from geopy.geocoders import Nominatim
from flask import session, redirect, url_for, abort

from app import db
from .database.tables import Order, Product, User, CartItem
from .database.tables import Admin as AdminModel, Courier as CourierModel


def hash_data(data):
    return hashlib.sha224(str.encode(data)).hexdigest()


def get_secret_key():
    return pyotp.random_base32()


def check_otp(otp, key=None):
    id = session.get("temp_id") or get_user().id
    user_key = key or db.session.query(User).get(int(id)).totp_key
    if pyotp.TOTP(user_key).now() == otp:
        session.pop("temp_id", None)
        session['id'] = id
        return True
    return False


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
    if not user:
        return False
    return True


def auth_user(**kwargs):
    user = User.query.filter_by(
        email=kwargs.get("email"), password=hash_data(kwargs.get("password"))).first()
    if user:
        session['pass_expr'] = None
        session['id'] = user.id
        session['firstname'] = user.firstname
        session['lastname'] = user.lastname
        if user.password_expr <= datetime.utcnow():
            return '', 409
        if user.password_expr <= datetime.utcnow() + timedelta(days=10):
            session['pass_expr'] = math.floor(
                (user.password_expr - datetime.utcnow()).days)
        user.rem_attempts = 3
        user.try_again = None
        db.session.commit()
        session.permanent = True
        if user.totp_key:
            session['temp_id'] = session.pop("id")
            return "TOTP"
        return "Login Validated"
    else:
        user = User.query.filter_by(email=kwargs.get("email")).first()
        user.rem_attempts = user.rem_attempts - 1
        db.session.commit()
        return '', 401


def login_attempts(email):
    user = get_user(email=email)
    if user.rem_attempts < 1:
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
            waittime = "<1" if waittime == 0 else waittime
            return str(f"Account locked! Try again in {waittime} min(s)"), 406


def get_user(**kwargs):
    if kwargs:
        return db.session.query(User).filter_by(**kwargs).first_or_404()
    return db.session.query(User).filter_by(id=session.get("id", "")).first_or_404()


def register_user(data):
    try:
        data['password'] = hash_data(data['password'])
        user = User(**data)
        db.session.add(user)
        db.session.commit()
        return "Account Registered", 200
    except Exception as e:
        print(e)
        return f"Registration failed: {e}", 404


def get_products(query=None, ordered=None):
    if ordered:
        return db.session.query(Product).order_by(Product.stock)
    if query is not None:
        return db.session.query(Product).filter(
            Product.name.contains(query)).all()

    return db.session.query(Product).all()


def get_cart():
    cart = db.session.query(CartItem).filter_by(
        user_id=session.get("id", "")).all()
    return cart


def get_cart_total():
    total = db.session.query(CartItem).filter_by(
        user_id=session.get("id", "")).count()
    return total


def get_subscription():
    return get_user().subscription


def get_preferences():
    try:
        preferences = get_user().subscription.preferences
        preferences = preferences.split(",")
        return preferences
    except:
        return None


def get_pending_orders():
    orders = db.session.query(Order).filter(
        Order.user_id == session.get("id", "") and Order.status != "Delivered").all()
    return orders


def get_orders():
    orders = db.session.query(User).filter_by(id=session.get("id", "")).orders
    return orders


def get_favorites():
    favorites = db.session.query(User).filter_by(
        id=session.get("id", "")).first().favorites
    return favorites


def checkzip(city, zip):
    gl = Nominatim(user_agent="Glean-Project")
    try:
        gl.geocode({'city': str(city), 'postalcode': int(zip)}).raw
        return True
    except:
        return False


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
        admin = AdminModel.query.filter_by(
            username=data['username'], password=hash_data(data['password'])).first()
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
        deliveries = db.session.query(Order).filter(
            Order.courier_id == session.get("courier_id", ""), Order.status != "Delivered").all()
        return deliveries

    @staticmethod
    def get_displayorders():
        res = []
        gl = Nominatim(user_agent="Glean-Project")
        courier = CourierModel.query.filter_by(
            id=session.get("courier_id", "")).first()
        orders = Order.query.filter_by(status="Processing").all()

        if not orders:
            return res

        loc_courier = gl.geocode(
            {'city': courier.location.city, 'postalcode': int(courier.location.zip)}).raw
        coords_courier = (loc_courier['lat'], loc_courier['lon'])

        for order in orders:
            loc_order = gl.geocode(
                {'city': order.location.city, 'postalcode': int(order.location.zip)}).raw
            coords_order = (loc_order['lat'], loc_order['lon'])
            dist = distance(coords_courier, coords_order).km
            if dist <= 10:
                user = User.query.filter_by(id=order.user_id).first()
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
        courier = CourierModel.query.filter_by(
            email=data['email'], password=hash_data(data['password'])).first()
        if courier:
            session['courier_id'] = courier.id
            return 'Logged In', 200
        return "Invalid Credentials", 401

    @staticmethod
    def get_courier():
        return db.session.query(CourierModel).get(session.get("courier_id", ""))
