from flask import session, abort, request, jsonify

from app import app, db
from .. import utils
from ..database.tables import *


@app.route('/admin/delete_courier/', methods=['DELETE'])
def delete_courier():
    if not session.get("admin", None):
        abort(403)
    courier = Courier.query.filter_by(id=request.form['id']).first()
    if courier:
        db.session.delete(courier)
        db.session.commit()
        return 'Courier Account deleted', 200
    else:
        return 'Operation Failed', 400


@app.route('/admin/get_couriers/', methods=['GET'])
def get_couriers():
    if not session.get("admin", None):
        abort(403)
    couriers = Courier.query.all()
    if couriers:
        return jsonify(couriers), 200
    else:
        return 'No Couriers'


@app.route('/admin/create_courier/', methods=['POST'])
def create_courier():
    if not session.get("admin", None):
        abort(403)
    params = request.form.to_dict()
    params['available'] = False if params['available'] == "false" else True
    courier = Courier(**params)
    db.session.add(courier)
    db.session.commit()
    return 'Courier Account Created', 200


@app.route('/admin/get_sales/', methods=['GET'])
def get_sales():
    if not session.get("admin", None):
        abort(403)
    sales = Order.query.filter_by(status="Delivered").all()
    monthly_sales = {'January': 0, 'February': 0, 'March': 0, 'April': 0, 'May': 0, 'June': 0,
                     'July': 0, 'August': 0, 'September': 0, 'October': 0, 'November': 0, 'December': 0}

    def add_sales(products):
        res = 0
        for product in products:
            res += product.quantity
        return res

    for sale in sales:
        if sale.updated_on.month == 1:
            monthly_sales['January'] += add_sales(sale.products)
        if sale.updated_on.month == 2:
            monthly_sales['February'] += add_sales(sale.products)
        if sale.updated_on.month == 3:
            monthly_sales['March'] += add_sales(sale.products)
        if sale.updated_on.month == 4:
            monthly_sales['April'] += add_sales(sale.products)
        if sale.updated_on.month == 5:
            monthly_sales['Mat'] += add_sales(sale.products)
        if sale.updated_on.month == 6:
            monthly_sales['June'] += add_sales(sale.products)
        if sale.updated_on.month == 7:
            monthly_sales['July'] += add_sales(sale.products)
        if sale.updated_on.month == 8:
            monthly_sales['August'] += add_sales(sale.products)
        if sale.updated_on.month == 9:
            monthly_sales['September'] += add_sales(sale.products)
        if sale.updated_on.month == 10:
            monthly_sales['October'] += add_sales(sale.products)
        if sale.updated_on.month == 11:
            monthly_sales['November'] += add_sales(sale.products)
        if sale.updated_on.month == 12:
            monthly_sales['December'] += add_sales(sale.products)

    product_sales = {}
    orders = OrderItem.query().all()
    for orderitem in orders:
        if orderitem.order.status == "Delivered":
            if product_sales.get(orderitem.product.name):
                product_sales[orderitem.product.name] += orderitem.quantity
            else:
                product_sales[orderitem.product.name] = orderitem.quantity
    return {'monthly_sales': monthly_sales, 'product_sales': product_sales}
