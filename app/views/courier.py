from datetime import datetime
from app import app
from flask import render_template, redirect, request, jsonify, session, Blueprint, url_for
from .. import utils

app = Blueprint('courier', __name__, url_prefix='/courier/')


@app.route('/')
@utils.Courier.login_required
def index():
    return render_template('courier/home.html',
                           display_orders=utils.Courier.get_displayorders(),
                           deliveries=utils.Courier.get_deliveries(),
                           courier=utils.Courier.get_courier(),
                           completed_today=len(
                               utils.Courier.get_completed_today()),
                           completed_orders=len(
                               utils.Courier.get_completedorders()),
                           today=datetime.now().strftime('%A, %d %B %Y'))


@app.route('/jobhistory')
def jobhistory():
    finished_orders = utils.Courier.get_completedorders()
    return render_template('courier/completed.html', finished_orders=finished_orders)


@app.route('/login')
@utils.Courier.logged_in
def login():
    return render_template('courier/login.html')


@app.route('/logout')
def logout():
    session.clear()
    return redirect(url_for('.login'))
