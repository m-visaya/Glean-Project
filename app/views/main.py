from app import app, db
from flask import render_template, redirect, request, session, url_for
from .. import utils


@app.route('/')
def index():
    return render_template("index.html")


@app.route('/store')
@utils.is_expired
def home():
    products = utils.get_products()
    if not products:
        return "No Products"

    if 'id' not in session:
        return render_template("home.html", user=None, id=None, products=products, expires=None, subscription=None, featured=utils.get_featured(), recommended=utils.get_recommended())
    favorites_id = [favorite.product_id for favorite in utils.get_favorites()]
    return render_template("home.html", user=utils.get_user(), id=utils.get_user().id, products=products, expires=session['pass_expr'],
                           total=utils.get_cart_total(), favorites=utils.get_favorites(), favorites_id=favorites_id, subscription=utils.get_subscription(), preferences=utils.get_preferences(), featured=utils.get_featured(), recommended=utils.get_recommended())


@app.route('/search/<query>')
def search(query):
    products = utils.get_products(query=query)

    if 'id' not in session:
        return render_template("search.html", user=None, id=None, products=products, expires=None, query=query)

    favorites_id = [favorite.product_id for favorite in utils.get_favorites()]

    return render_template("search.html", user=utils.get_user(), id=utils.get_user().id, products=products, expires=session['pass_expr'],
                           total=utils.get_cart_total(), favorites=utils.get_favorites(), favorites_id=favorites_id, query=query)


@app.route('/login', methods=['GET', 'POST'])
@utils.logged_in
@utils.is_expired
def login():
    session.clear()
    if request.method == "POST":
        if not utils.email_exists(request.form.get("email")):
            return "Account does not exists", 404
        msg, code = utils.login_attempts(
            email=request.form.get("email")) or [None, None]
        if msg:
            return msg, int(code)
        else:
            return utils.auth_user(**request.form.to_dict())
    else:
        return render_template("login.html")


@app.route('/signup', methods=['GET', 'POST'])
@utils.logged_in
@utils.is_expired
def signup():
    if request.method == "POST":
        if utils.email_exists(request.form.get("email", "")):
            return 'Email Already Exists', 409
        return utils.register_user(request.form.to_dict())
    else:
        return render_template("signup.html")


@app.route('/logout')
def logout():
    session.clear()
    return redirect(url_for('login'))


@app.route('/expired')
@utils.login_required
def expired():
    return render_template("pwexp.html", fname=session['firstname'], lname=session['lastname'])


@app.route('/user-totp', methods=['GET', 'POST'])
def totp():
    if not session.get("temp_id"):
        return redirect(url_for('.login'))
    if request.method == "GET":
        return render_template("mfaprompt.html", fname=session.get("firstname"), lname=session.get(
            "lastname"), user=session.get("temp_id"))
    else:
        if not utils.check_otp(request.form['otpCode']):
            return "Invalid OTP Code", 401
        return "OTP Code Validated", 200


@app.route('/cart')
@utils.login_required
@utils.is_expired
def cart():
    return render_template("cart.html", cart=utils.get_cart(), user=utils.get_user(), total=utils.get_cart_total())


@app.route('/tracking')
@utils.login_required
@utils.is_expired
def tracking():
    return render_template("tracking.html", orders=utils.get_pending_orders(), user=utils.get_user(), total=utils.get_cart_total())


@app.route('/checkout', methods=['GET', 'POST'])
@utils.login_required
@utils.is_expired
def checkout():
    if request.method == "GET":
        if utils.get_cart_total() < 1:
            return redirect(url_for('cart'))

        return render_template("checkout.html", user=utils.get_user(),
                               cart=utils.get_cart(), total=utils.get_cart_total())
    elif request.method == "POST":
        preferences = [key.removeprefix("categ:") for key in request.form.keys()
                       if key.startswith("categ:")]
        return render_template("checkout_subscription.html", user=utils.get_user(), total=utils.get_cart_total(), form_data=request.form.to_dict(), preferences=preferences)


@app.route('/profile')
@utils.login_required
@utils.is_expired
def profile():
    return render_template("profile.html", user=utils.get_user(), total=utils.get_cart_total())


@app.route('/settings')
@utils.login_required
@utils.is_expired
def settings():
    return render_template("settings.html", user=utils.get_user(), total=utils.get_cart_total())


@app.errorhandler(500)
def internal_error(error):
    db.session.rollback()
    return render_template('error_500.html'), 500


@app.route('/clear')
def clear():
    session.clear()
    return "cleared"
