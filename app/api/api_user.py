from datetime import datetime, timedelta
import json

from flask import session, request, jsonify

from app import app, db
from .. import utils
from ..database.tables import CartItem, Favorite, FavoriteItem, User, Cart, Order, OrderItem


@app.route('/change_password/', methods=['POST'])
@utils.login_required
def change_password():
    user = utils.get_user()
    password_history = json.loads(user.password_history)
    if hash(request.form['password']) in password_history or hash(request.form['password']) == user.password:
        return 'Invalid Password', 401
    password_history.append(user.password)
    if len(password_history) == 6:
        password_history.pop(0)
    user.password_history = json.dumps(password_history)
    user.password = hash(request.form['password'])
    user.password_expr = datetime.utcnow() + timedelta(days=30)
    session['pass_expr'] = None
    db.session.commit()
    return 'Password Changed', 200


@app.route('/addto_cart', methods=['POST'])
@utils.login_required
def addto_cart():
    user = utils.get_user()
    if not user:
        return 'User not Found', 404
    item_exists = CartItem.query.filter_by(
        cart_id=user.id, product_id=request.form['id']).first()
    if item_exists:
        item_exists.quantity += request.form["qty"]
    else:
        cart_item = CartItem(
            cart_id=user.id, product_id=request.form['id'], quantity=request.form["qty"])
        db.session.add(cart_item)
    db.session.commit()
    return 'Item added to cart', 200


@app.route('/addto_favorites', methods=['POST'])
@utils.login_required
def addto_favorites():
    user = utils.get_user()
    if not user:
        return 'User not Found', 404

    item_exists = FavoriteItem.query.filter_by(
        product_id=request.form['id'], favorite_id=user.id).first()
    if item_exists:
        return "Item Already in Favorites", 401
    else:
        favorite = Favorite(favorite_id=user.id, product_id=request.form['id'])
        db.session.add(favorite)
        db.session.commit()
        return 'Item added to Favorites', 200


@app.route('/removefrom_favorites', methods=['POST'])
@utils.login_required
def removefrom_favorites():
    user = utils.get_user()
    if not user:
        return 'User not Found', 404

    FavoriteItem.query.filter_by(
        product_id=request.form['id'], favorite_id=user.id).delete()
    db.session.commit()
    return '', 200


@app.route('/clear_cart', methods=['POST'])
@utils.login_required
def clear_cart():
    user = utils.get_user()
    if not user:
        return 'User not Found', 404

    CartItem.query.filter_by(cart_id=user.id).delete()
    db.session.commit()
    return 'Cart Cleared', 200


@app.route('/rem_item', methods=['POST'])
@utils.login_required
def rem_item():
    user = utils.get_user()
    if not user:
        return 'User not Found', 404

    try:
        CartItem.query.filter_by(
            cart_id=user.id, product_id=request.form['id']).delete()
        db.session.commit()
        return 'Item removed from cart', 200
    except Exception as e:
        return f"{e}", 400


@app.route('/update_info', methods=['POST'])
@utils.login_required
def update_info():
    user = utils.get_user()
    if not user:
        return 'User not Found', 404

    user = User.query.filter_by(
        id=session['id'], password=hash(request.form['password'])).first()

    if not user:
        return 'Invalid Credentials', 404

    user.email = request.form['email']
    user.phone = request.form['phone']
    db.session.commit()
    return 'Changes Saved', 200


@app.route('/delete_user', methods=['DELETE'])
@utils.login_required
def delete_me():
    user = utils.get_user()
    if not user:
        return 'User not Found', 404

    CartItem.query.filter(cart_id=user.id).delete()
    Cart.query.filter(user_id=user.id).delete()
    orders = Order.query.all()

    for order in orders:
        if order.user_id == user.id and order.status == "Processing":
            OrderItem.query.filter_by(order_id=order.id).delete()
            db.session.delete(order)

    db.session.delete(user)
    db.session.commit()
    return 'User Account Deleted', 200


@app.route('/get_totp', methods=['GET'])
@utils.login_required
def get_totp():
    user = utils.get_user()
    if not user:
        return 'User not Found', 404

    return {"secret_key": utils.get_secret_key()}


@app.route('/activate_totp', methods=['POST'])
@utils.login_required
def activate_totp():
    user = utils.get_user()
    if not user:
        return 'User not Found', 404

    user = User.query.filter_by(
        id=session['id'], password=hash(request.form['password'])).first()
    if not user:
        return 'Invalid Credentials', 404
    if not utils.check_otp(request.form['otpCode']):
        return 'Invalid OTP Code', 401

    user.totp_key = request.form['otpKey']
    db.session.commit()
    session['otp'] = True

    return 'TOTP Enabled', 200


@app.route('/disable_totp', methods=['POST'])
@utils.login_required
def disable_totp():
    user = utils.get_user()
    if not user:
        return 'User not Found', 404

    user = User.query.filter_by(
        id=session['id'], password=hash(request.form['password'])).first()
    if not user:
        return 'Invalid Credentials', 401

    user.totp_key = None
    db.session.commit()
    session.pop("otp")

    return 'TOTP Disabled', 200
