from flask import request

from app import app, db
from app.views.main import cart
from .. import utils
from ..database.tables import CartItem, Location, Order, OrderItem


@app.route('/proceed_checkout', methods=['GET'])
@utils.login_required
def proceed_checkout():
    cart = utils.get_user().cart

    for item in cart:
        if item.quantity > item.product.stock:
            return f"{item.product.name}'s unavailable", 404

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
