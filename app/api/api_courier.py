from flask import session, request

from app import app, db
from .. import utils
from ..database.tables import Order


@app.route('/courier/accept_order', methods=['POST'])
@utils.Courier.login_required
def accept_order():
    order_id = request.form['order_id']

    order = Order.query.filter_by(id=order_id).first()
    order.status = "Picked Up"
    order.courier_id = session['courier_id']
    db.session.commit()

    return 'Order Accepted', 200


@app.route('/courier/update_orderstatus', methods=['POST'])
@utils.Courier.login_required
def update_orderstatus():
    order = Order.query.filter_by(
        id=int(request.form['order_id'])).first()

    if order.status == "Picked Up":
        order.status = "In Transit"
    elif order.status == "In Transit":
        order.status = "Delivered"

    db.session.commit()

    return '', 200
