from flask import redirect, request, url_for

from app import app, db
from .. import utils
from ..database.tables import CartItem, Location, Order, OrderItem, Subscription


@app.route('/proceed_checkout', methods=['GET'])
@utils.login_required
def proceed_checkout():
    cart = utils.get_user().cart

    for item in cart:
        if item.quantity > item.product.stock:
            return {"id": item.product.id, "message": f"{item.product.name}'s unavailable"}, 404

    return '', 200


@app.route('/add_order', methods=['POST'])
@utils.login_required
def add_order():
    user = utils.get_user()
    order = Order(user_id=user.id)
    db.session.add(order)

    for item in user.cart:
        item.product.stock -= item.quantity
        order.products.append(
            OrderItem(product_id=item.product.id, quantity=item.quantity))

    CartItem.query.filter_by(user_id=user.id).delete()
    db.session.commit()

    address = Location(
        province=request.form.get("province"),
        city=request.form.get("city"),
        zip=request.form.get("zip"),
        address=request.form.get("address"),
        order_id=order.id
    )
    db.session.add(address)
    db.session.commit()
    return "Order Created", 200


@app.route('/add_subscription', methods=['POST'])
@utils.login_required
def add_subscription():
    user = utils.get_user()
    preferences = request.form.get("preferences").replace("\n", "").strip()
    subscription_type = request.form.get(
        "subscription_type").replace("\n", "").strip()
    delivery_day = request.form.get("delivery_day").replace("\n", "").strip()
    total_price = int(request.form.get("total"))
    subscription = Subscription(user_id=user.id, preferences=preferences,
                                delivery_day=delivery_day, type=subscription_type, price=total_price)
    db.session.add(subscription)
    db.session.commit()

    address = Location(
        province=request.form.get("province"),
        city=request.form.get("city"),
        zip=request.form.get("zip"),
        address=request.form.get("address"),
        subscription_id=subscription.user_id
    )
    db.session.add(address)
    db.session.commit()
    return "Subscription Created", 200


@app.route('/cancel_subscription', methods=['POST'])
@utils.login_required
def cancel_subscription():
    user = utils.get_user()
    subscription = Subscription.query.filter_by(user_id=user.id).first()
    Location.query.filter_by(subscription_id=subscription.user_id).delete()
    db.session.delete(subscription)
    db.session.commit()

    return redirect(url_for('home'))
