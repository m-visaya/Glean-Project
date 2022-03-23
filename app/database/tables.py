from datetime import datetime, timedelta
from app import db


def repr(Class):
    """ Represent table modes as dictionary """
    repr = {key: value for key,
            value in Class.__dict__.items() if type(value) in [str, int, float, datetime]}
    return f"{repr}"


class User(db.Model):
    """ Represents the database model for User Accounts """
    id = db.Column(db.Integer(), primary_key=True)
    firstname = db.Column(db.String(50), nullable=False)
    lastname = db.Column(db.String(50), nullable=False)
    email = db.Column(db.String(50), nullable=False, unique=True)
    password = db.Column(db.String(50), nullable=False)
    phone = db.Column(db.String(20), nullable=False)
    created_on = db.Column(db.DateTime(), default=datetime.utcnow)
    updated_on = db.Column(
        db.DateTime(), default=datetime.utcnow, onupdate=datetime.utcnow)
    orders = db.relationship('Order', backref='user')
    cart = db.relationship('CartItem', backref='user')
    favorites = db.relationship('FavoriteItem', backref='user')
    password_history = db.Column(db.String(500))
    password_expr = db.Column(
        db.DateTime, default=lambda: datetime.utcnow() + timedelta(days=30))
    rem_attempts = db.Column(db.Integer, default=3)
    try_again = db.Column(db.DateTime, nullable=True)
    totp_key = db.Column(db.String(100), nullable=True)
    location = db.relationship('Location', backref='user', uselist=False)
    subscription = db.relationship(
        'Subscription', backref='user', uselist=False)

    def __repr__(self) -> str:
        return repr(self)


class OrderItem(db.Model):
    """ Represents the database model for Order Items """
    order_id = db.Column(db.Integer, db.ForeignKey(
        'order.id'), primary_key=True)
    product_id = db.Column(db.Integer, db.ForeignKey(
        'product.id'), primary_key=True)
    quantity = db.Column(db.Integer, default=1)

    def __repr__(self) -> str:
        return f"{self.order_id=} {self.product_id=} {self.quantity=}"


class Order(db.Model):
    """ Represents the database model for Orders """
    id = db.Column(db.Integer, primary_key=True)
    created_on = db.Column(db.DateTime(), default=datetime.utcnow)
    updated_on = db.Column(
        db.DateTime(), default=datetime.utcnow, onupdate=datetime.utcnow)
    status = db.Column(db.String(50), default="Processing")
    products = db.relationship('OrderItem', backref="order")
    user_id = db.Column(db.Integer, db.ForeignKey('user.id'))
    courier_id = db.Column(db.Integer, db.ForeignKey('courier.id'))
    location = db.relationship('Location', backref='order', uselist=False)

    def __repr__(self) -> str:
        return repr(self)


class Subscription(db.Model):
    """ Represents the database model for Subscription """
    type = db.Column(db.String(50), nullable=False)
    delivery_day = db.Column(db.String(10), nullable=False)
    next_payment = db.Column(
        db.DateTime(), default=lambda: datetime.utcnow() + timedelta(days=7))
    price = db.Column(db.Integer, nullable=False)
    created_on = db.Column(db.DateTime(), default=datetime.utcnow)
    preferences = db.Column(db.String(200), nullable=False)
    user_id = db.Column(db.Integer, db.ForeignKey('user.id'), primary_key=True)
    location = db.relationship(
        'Location', backref='subscription', uselist=False)

    def __repr__(self) -> str:
        return repr(self)


class Product(db.Model):
    """ Represents the database model for Products """
    id = db.Column(db.Integer, primary_key=True)
    created_on = db.Column(db.DateTime(), default=datetime.utcnow)
    updated_on = db.Column(
        db.DateTime(), default=datetime.utcnow, onupdate=datetime.utcnow)
    name = db.Column(db.String(100), nullable=False)
    category = db.Column(db.String(50), nullable=False)
    description = db.Column(db.String(100), nullable=False)
    ingredients = db.Column(db.String(200), nullable=False)
    stock = db.Column(db.Integer(), default=0)
    price = db.Column(db.Float(), nullable=False)
    image = db.Column(db.String(100), nullable=False)
    orders = db.relationship('OrderItem', backref="product")
    carts = db.relationship('CartItem', backref="product")
    favorites = db.relationship('FavoriteItem', backref="product")

    def __repr__(self) -> str:
        return repr(self)


class CartItem(db.Model):
    """ Represents the database model for Cart Items """
    user_id = db.Column(db.Integer, db.ForeignKey(
        'user.id'), primary_key=True)
    product_id = db.Column(db.Integer, db.ForeignKey(
        'product.id'), primary_key=True)
    quantity = db.Column(db.Integer, default=1)

    def __repr__(self) -> str:
        return f"{self.user_id=} {self.product_id=} {self.quantity=}"


class FavoriteItem(db.Model):
    """ Represents the database model for Favorite Items"""
    user_id = db.Column(db.Integer, db.ForeignKey(
        'user.id'), primary_key=True)
    product_id = db.Column(db.Integer, db.ForeignKey(
        'product.id'), primary_key=True)

    def __repr__(self) -> str:
        return f"{self.user_id=} {self.product_id=}"


class Courier(db.Model):
    """ Represents the database model for Courier Accounts """
    id = db.Column(db.Integer, primary_key=True)
    firstname = db.Column(db.String(100), nullable=False)
    lastname = db.Column(db.String(100), nullable=False)
    password = db.Column(db.String(50), nullable=False)
    email = db.Column(db.String(50), nullable=False)
    location = db.relationship("Location", backref='courier', uselist=False)
    available = db.Column(db.Boolean, default=False)
    orders = db.relationship('Order', backref='courier')

    def __repr__(self) -> str:
        return repr(self)


class Admin(db.Model):
    """ Represents the database model for Admin Accounts """
    id = db.Column(db.Integer, primary_key=True)
    username = db.Column(db.String(100), nullable=False)
    password = db.Column(db.String(50), nullable=False)

    def __repr__(self) -> str:
        return repr(self)


class Location(db.Model):
    """ Represents the database model for Address """
    id = db.Column(db.Integer, primary_key=True)
    province = db.Column(db.String(50), nullable=False)
    city = db.Column(db.String(50), nullable=False)
    zip = db.Column(db.Integer(), nullable=False)
    address = db.Column(db.String(100))
    user_id = db.Column(db.Integer, db.ForeignKey('user.id'))
    order_id = db.Column(db.Integer, db.ForeignKey(
        'order.id'))
    subscription_id = db.Column(db.Integer, db.ForeignKey(
        'subscription.user_id'))
    courier_id = db.Column(db.Integer, db.ForeignKey(
        'courier.id'))

    def __repr__(self) -> str:
        return repr(self)
