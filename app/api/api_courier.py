from flask import session, abort, request

from app import app, db
from .. import utils
from ..database.tables import *


@app.route('/courier/accept_order/', methods=['POST'])
def accept_order():
    if not session.get("courier_id", None):
        abort(403)

    order_id = request.form['order_id']

    order = Order.query.filter_by(id=order_id).first()
    order.status = "Picked Up"
    order.courier_id = session['courier_id']
    db.session.commit()

    return 'Order Accepted', 200


@app.route('/courier/update_orderstatus', methods=['POST'])
def update_orderstatus():
    if not session.get("id", None):
        abort(403)

    order = Order.query.filter_by(
        id=int(request.form['order_id'])).first()

    if order.status == "Picked Up":
        order.status = "In Transit"
    elif order.status == "In Transit":
        order.status = "Delivered"

    db.session.commit()

    return '', 200
