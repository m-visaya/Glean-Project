from app import app
from flask import render_template, redirect, request, session, Blueprint, url_for
from .. import utils

app = Blueprint('admin', __name__, url_prefix='/admin/')


@app.route('/')
@utils.Admin.login_required
def index():
    return render_template('admin/dashboard.html')


@app.route('/login', methods=['GET', 'POST'])
def login():
    if request.method == "POST":
        return utils.Admin.auth(request.form.to_dict())
    else:
        return render_template('admin/login.html')


@app.route('/logout')
@utils.Admin.login_required
def logout():
    session.clear()
    return redirect(url_for('.login'))


@app.route('/manage_couriers')
@utils.Admin.login_required
def manage_couriers():
    couriers = utils.Admin.get_couriers() or []
    return render_template('admin/manage_couriers.html', couriers=couriers)


@app.route('/manage_products')
@utils.Admin.login_required
def manage_products():
    products = utils.get_products(ordered=True) or []
    return render_template('admin/manage_products.html', products=products)


@app.route('/view_sales')
@utils.Admin.login_required
def view_sales():
    return render_template('admin/view_sales.html')


@app.route('/order_queue')
@utils.Admin.login_required
def order_queue():
    processing = utils.Admin.get_orderbystatus("Processing")
    ready = utils.Admin.get_orderbystatus("Ready")
    in_transit = utils.Admin.get_orderbystatus("In Transit")
    delivered = utils.Admin.get_orderbystatus("Delivered")
    return render_template('admin/manage_orders.html', processing=processing, ready=ready, in_transit=in_transit, delivered=delivered)


@app.route('/search_orders/<query>')
def search_order_queue(query):
    processing = utils.Admin.get_orderbystatus("Processing", query)
    ready = utils.Admin.get_orderbystatus("Ready", query)
    in_transit = utils.Admin.get_orderbystatus("In Transit", query)
    delivered = utils.Admin.get_orderbystatus("Delivered", query)
    return render_template('admin/search_orders.html', processing=processing, ready=ready, in_transit=in_transit, delivered=delivered)


@app.route('/search_products/<query>')
def admin_searchproducts(query):
    products = utils.get_products(query=query)
    return render_template("admin/search_products.html", products=products)


@app.route('/search_couriers/<query>')
def search_couriers(query):
    couriers = utils.Admin.get_couriers(query) or []
    return render_template('admin/search_couriers.html', couriers=couriers)