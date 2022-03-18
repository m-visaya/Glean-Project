from app import app, db
from flask import render_template, redirect, request, jsonify, session, Blueprint, url_for
from .. import utils
from ..database.tables import *

app = Blueprint('admin', __name__, url_prefix='/admin/')


@app.route('/')
@utils.Admin.login_required
def index():
    return render_template('admin/dashboard.html')


@app.route('/login/', methods=['GET', 'POST'])
def login():
    if request.method == "POST":
        return utils.Admin.auth(request.form.to_dict)
    else:
        return render_template('admin/login.html')


@app.route('/logout/')
@utils.Admin.login_required
def logout():
    session.clear()
    return redirect(url_for('.login'))


@app.route('/manage_couriers/')
@utils.Admin.login_required
def manage_couriers():
    couriers = utils.Admin.get_couriers() or []
    return render_template('admin/manage_couriers.html', couriers=couriers)


@app.route('/manage_products/')
@utils.Admin.login_required
def manage_products():
    products = utils.get_products() or []
    return render_template('admin/manage_products.html', products=products)


@app.route('/view_sales/')
@utils.Admin.login_required
def view_sales():
    return render_template('admin/view_sales.html')


@app.route('/order_queue/')
@utils.Admin.login_required
def order_queue():
    processing = utils.Admin.get_orderbystatus("Processing")
    picked_up = utils.Admin.get_orderbystatus("Picked Up")
    in_transit = utils.Admin.get_orderbystatus("In Transit")
    delivered = utils.Admin.get_orderbystatus("Delivered")
    return render_template('admin/manage_orders.html', processing=processing, picked_up=picked_up, in_transit=in_transit, delivered=delivered)
