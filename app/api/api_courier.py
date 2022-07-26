from flask import session, request

from app import app, db
from .. import utils
from ..database.tables import Order, Product, OrderItem


@app.route('/courier/accept_order', methods=['POST'])
@utils.Courier.login_required
def accept_order():
    order_id = request.form['order_id']

    order = Order.query.filter_by(id=order_id).first()
    order.status = "In Transit"
    order.courier_id = session['courier_id']
    db.session.commit()

    return 'Order Accepted', 200


@app.route('/courier/update_orderstatus', methods=['POST'])
@utils.Courier.login_required
def update_orderstatus():
    order = Order.query.filter_by(
        id=int(request.form['order_id'])).first()

    order.status = "Delivered"

    order_item = OrderItem.query.filter_by(order_id=order.id).first()
    product = Product.query.get(int(order_item.product_id))

    product.sales = product.sales + 1

    db.session.commit()

    return '', 200
