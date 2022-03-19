from flask import session, abort, request, jsonify

from app import app, db
from .. import utils
from ..database.tables import CartItem, Location, Order, OrderItem, Product


@app.route('/proceed_checkout', methods=['GET'])
@utils.login_required
def proceed_checkout():
    user = utils.get_user()
    cart_items = CartItem.query.filter_by(cart_id=user.id).all()

    for item in cart_items:
        if item.quantity > item.product.stock:
            return f"{item.product.name}'s quantity is greater than the stock!", 404

    return '', 200


@app.route('/add_order', methods=['POST'])
@utils.login_required
def add_order():
    user = utils.get_user()
    order = Order(user_id=user.id)
    db.session.add(order)

    for item in user.cart.products:
        Product.query.filter_by(
            id=item.product_id).first().stock -= item.quantity
        order.products.append(
            OrderItem(product_id=item.product.id, quantity=item.quantity))

    CartItem.query.filter_by(cart_id=user.id).delete()
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
