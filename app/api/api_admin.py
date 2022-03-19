from flask import session, abort, request, jsonify

from app import app, db
from .. import utils
from ..database.tables import Courier, Location, Order, OrderItem


@app.route('/admin/delete_courier', methods=['DELETE'])
@utils.Admin.authorized_only
def delete_courier():
    courier = Courier.query.filter_by(id=request.form['id']).first()
    if courier:
        db.session.delete(courier)
        db.session.commit()
        return 'Courier Account deleted', 200
    else:
        return 'Operation Failed', 400


@app.route('/admin/get_couriers', methods=['GET'])
@utils.Admin.authorized_only
def get_couriers():
    couriers = Courier.query.all()
    if couriers:
        return jsonify(couriers), 200
    else:
        return 'No Couriers'


@app.route('/admin/create_courier', methods=['POST'])
@utils.Admin.authorized_only
def create_courier():
    params = request.form.to_dict()
    courier = Courier(
        firstname=params['firstname'],
        lastname=params['lastname'],
        password=params['password'],
        email=params['email'],
        available=False if params['available'] == "false" else True
    )
    db.session.add(courier)
    db.session.commit()
    address = Location(
        province=params['province'],
        city=params['city'],
        zip=params['zip'],
        courier_id=courier.id
    )
    db.session.add(address)
    db.session.commit()
    return 'Courier Account Created', 200


@app.route('/admin/get_sales', methods=['GET'])
@utils.Admin.authorized_only
def get_sales():
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
