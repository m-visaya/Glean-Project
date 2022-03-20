from app import app
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
        return render_template("home.html", user=None, id=None, products=products, expires=None)
    favorites_id = [favorite.product_id for favorite in utils.get_favorites()]
    return render_template("home.html", user=utils.get_user(), id=utils.get_user().id, products=products, expires=session['pass_expr'],
                           total=utils.get_cart_total(), favorites=utils.get_favorites(), favorites_id=favorites_id)


@app.route('/login', methods=['GET', 'POST'])
@utils.logged_in
@utils.is_expired
def login():
    if request.method == "POST":
        utils.email_exists(request.form.get("email"))
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
            return 'Email Exists', 409
        return utils.register_user(request.form.to_dict())
    else:
        return render_template("signup.html")


@app.route('/logout')
def logout():
    session.clear()
    return redirect(url_for('login'))


@app.route('/expired')
@utils.login_required
def pwexpired():
    return render_template("pwexp.html", fname=session['fname'], lname=session['lastname'])


@app.route('/user-totp', methods=['GET', 'POST'])
@utils.login_required
@utils.is_expired
def totp():
    if request.method == "GET":
        user, fname, lname = session['id'], session['fname'], session['lastname']
        session.clear()
        session['temp_id'] = user
        return render_template("mfaprompt.html", fname=fname, lname=lname)
    else:
        return utils.check_otp(request.form['otpCode'])


@app.route('/cart')
@utils.login_required
@utils.is_expired
def cart():
    return render_template("cart.html", cart=utils.get_cart(), user=utils.get_user(), total=utils.get_cart_total())


@app.route('/tracking')
@utils.login_required
@utils.is_expired
def tracking():
    return render_template("tracking.html", orders=utils.get_pending_orders(), user=utils.get_user())


@app.route('/checkout')
@utils.login_required
@utils.is_expired
def checkout():
    if utils.get_cart_total() < 1:
        return redirect(url_for('cart'))

    return render_template("checkout.html", user=utils.get_user(),
                           cart=utils.get_cart(), total=utils.get_cart_total())


@app.route('/profile')
@utils.login_required
@utils.is_expired
def profile():
    return render_template("profile.html", user=utils.get_user())


@app.route('/settings')
@utils.login_required
@utils.is_expired
def settings():
    return render_template("settings.html", user=utils.get_user(), otp=session.get("otp", None))


@app.route('/clear')
def clear():
    session.clear()
    return "cleared"
