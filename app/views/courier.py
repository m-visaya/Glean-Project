from datetime import datetime
from app import app
from flask import render_template, redirect, request, jsonify, session, Blueprint, url_for
from .. import utils

app = Blueprint('courier', __name__, url_prefix='/courier/')


@app.route('/')
@utils.Courier.login_required
def index():
    # return render_template('courier/home.html',
    #                        deliveries=utils.Courier.get_deliveries(),
    #                        courier=utils.Courier.get_courier(),
    #                        completed_today=len(
    #                            utils.Courier.get_completed_today()),
    #                        completed_orders=len(
    #                            utils.Courier.get_completedorders()),
    #                        today=datetime.now().strftime('%A, %d %B %Y')
    #                        )
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
@utils.Courier.login_required
def jobhistory():
    finished_orders = utils.Courier.get_completedorders()
    return render_template('courier/completed.html', finished_orders=finished_orders)


@app.route('/login', methods=['POST', 'GET'])
@utils.Courier.logged_in
def login():
    if request.method == "POST":
        return utils.Courier.auth(request.form.to_dict())
    else:
        return render_template('courier/login.html')


@app.route('/logout')
@utils.Courier.login_required
def logout():
    session.clear()
    return redirect(url_for('.login'))
