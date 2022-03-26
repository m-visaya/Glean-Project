function login(e) {
  e.preventDefault();
  grecaptcha.execute();
}

function loginValidated() {
  grecaptcha.reset();
  $("#loginBtn").toggle();
  $("#loginBtn2").toggle();

  $("#loginEmail").get(0).setCustomValidity("");
  $("#loginPassword").get(0).setCustomValidity("");

  $.ajax({
    type: "POST",
    url: "/login",
    data: {
      email: document.getElementById("loginEmail").value,
      password: document.getElementById("loginPassword").value,
    },
    success: async function (data) {
      await new Promise((resolve) => setTimeout(resolve, 1000));
      $("#loginBtn2").toggle();
      $("#loginBtn").toggle();
      if (data == "TOTP") {
        location.href = "/user-totp";
      } else {
        location.href = "/store";
      }
    },
    error: async function (jqXHR, exception) {
      var msg = "";
      if (jqXHR.status === 0) {
        msg = "Not connect.\n Verify Network.";
      } else if (jqXHR.status == 401) {
        $("#loginPassword").get(0).setCustomValidity("error");
      } else if (jqXHR.status == 406) {
        $("#loginPassword").get(0).setCustomValidity("error");
        let toastElem = $("#toast-login");
        let toast = new bootstrap.Toast(toastElem);
        $("#toast-message").text(jqXHR.responseText);
        toast.show();
      } else if (jqXHR.status == 404) {
        $("#loginEmail").get(0).setCustomValidity("error");
        $("#loginPassword").get(0).setCustomValidity("error");
      } else if (jqXHR.status == 409) {
        window.location.href = "/expired";
      }
      $("#loginBtn2").toggle();
      $("#loginBtn").toggle();
    },
  });
}

function signup(e) {
  e.preventDefault();
  grecaptcha.execute();
}

async function signupValidated() {
  grecaptcha.reset();
  $("#signupBtn2").toggle();
  $("#signupBtn").toggle();

  let lname = document.getElementById("signupLastname").value;
  let fname = document.getElementById("signupFirstname").value;
  let pass_field = document.getElementById("signupPassword");
  let re_field = document.getElementById("signupRePassword");
  let email_field = document.getElementById("signupEmail");
  let phone = document.getElementById("signupPhone");
  let pass = true;

  email_field.setCustomValidity("");
  re_field.setCustomValidity("");
  pass_field.setCustomValidity("");
  phone.setCustomValidity("");

  if (!(await validatePassword(pass_field.value, lname, fname))) {
    pass_field.setCustomValidity("error");
    pass = false;
  }

  if (pass_field.value != re_field.value) {
    re_field.setCustomValidity("error");
    pass = false;
  }

  if ($("#signupEmail").is(":invalid") || $("#signupPhone").is(":invalid")) {
    pass = false;
  }

  if (!pass) {
    $("#signupBtn2").toggle();
    $("#signupBtn").toggle();
    return;
  }

  email_field.setCustomValidity("");
  re_field.setCustomValidity("");
  pass_field.setCustomValidity("");
  phone.setCustomValidity("");

  $.ajax({
    type: "POST",
    url: "/signup",
    data: {
      firstname: document.getElementById("signupFirstname").value,
      lastname: document.getElementById("signupLastname").value,
      password: pass_field.value,
      phone: document.getElementById("signupPhone").value,
      email: email_field.value,
    },
    success: async function (data) {
      email_field.setCustomValidity("");
      await new Promise((resolve) => setTimeout(resolve, 1000));
      $("#signupBtn2").toggle();
      $("#signupBtn").toggle();
      window.location.href = "/login";
    },
    error: async function (jqXHR, exception) {
      if (jqXHR.status == 0) {
        alert("Not connect.\n Verify Network.");
      } else if (jqXHR.status == 409) {
        console.log(jqXHR.status);
        await new Promise((resolve) => setTimeout(resolve, 1000));
        $("#signupBtn2").toggle();
        $("#signupBtn").toggle();
        email_field.setCustomValidity("error");
      } else {
        alert("Unexpected Error");
      }
    },
  });
}

function logout() {
  console.log("Logged Out");
  window.location.href = "/logout";
}

//main switcher

function swsignup() {
  $("#formLogin").removeClass("was-validated");
  document.getElementById("formLogin").reset();
  window.location.href = "/signup";
}

function swlogin() {
  $("#formSignup").removeClass("was-validated");
  document.getElementById("formSignup").reset();
  window.location.href = "/login";
}

function swindividual() {
  var state = document.getElementById("individualcards");
  var state1 = document.getElementById("subscriptioncards");
  var state2 = document.getElementById("favoritescards");
  var state3 = document.getElementById("individualhead");
  var state4 = document.getElementById("subscriptionhead");
  var state5 = document.getElementById("favoriteshead");

  if (
    state.style.display === "none" &&
    (state1.style.display !== "none" || state2.style.display !== "none")
  ) {
    state.style.display = "block";
    state1.style.display = "none";
    state2.style.display = "none";
    state3.style.display = "block";
    state4.style.display = "none";
    state5.style.display = "none";
    console.log("individual displayed");
  }
}

function loadFavorites() {
  $.ajax({
    type: "GET",
    url: "/get_favorites",
    success: function (response) {
      $("#container-favorites").html("");

      for (const product of response.favorites) {
        let content = `
          <div class="col" id="cardfave-${product.id}">
          <div
            class="card shadow-sm"
            data-bs-toggle="modal"
            data-bs-target="#modalfave-${product.id}"
          >
            <img
              src="${product.image}"
              alt="${product.name}"
              class="card-img-top card-ggc"
            />
            <div class="card-body card-body-height">
              <h5 class="overflow-ellipsis">${product.name}</h5>
              <p class="card-text card-description">
                ${product.description}
              </p>
            </div>
            <div
              class="d-flex justify-content-between align-items-center ms-3 mt-1 mb-3"
            >
              <span
                class="badge rounded-pill bg-primary-green prod-category"
                >${product.category}</span
              >
            </div>
          </div>

          <div
            class="modal fade"
            id="modalfave-${product.id}"
            tabindex="-1"
            aria-labelledby="exampleModalLabel"
            aria-hidden="true"
          >
            <div class="modal-dialog modal-lg modal-dialog-centered">
              <div class="modal-content">
                <div class="modal-header border-0">
                  <button
                    type="button"
                    class="btn-close"
                    data-bs-dismiss="modal"
                    aria-label="Close"
                  ></button>
                </div>
                <div class="modal-body">
                  <div class="container px-lg-5 my-5 mt-3">
                    <div class="row gx-4 gx-lg-5 align-items-center">
                      <div class="col-md-12 col-lg-6">
                        <img
                          class="card-img mb-5 mb-md-0"
                          src="${product.image}"
                        />
                      </div>
                      <div class="col-md-12 col-lg-6 mt-4">
                        <span
                          class="badge rounded-pill bg-primary-green mb-1"
                          >${product.category}</span
                        >
                        <h1 class="fs-2 fw-bolder">
                          ${product.name}
                        </h1>
                        <div class="fs-4 mb-2">
                          <span>₱${product.price}</span>
                        </div>
                        <p class="lead fs-5">
                          ${product.description}
                        </p>
                        <div class="d-flex pt-4">
                          <input
                            class="form-control text-center me-3"
                            id="${product.id}-inputQuantity"
                            type="text"
                            maxlength="2"
                            onkeypress="return event.charCode >= 48 && event.charCode <= 57"
                            value="1"
                            style="max-width: 3.5rem"
                          />
                          <button
                            onclick="favorite(event, '${product.id}')"
                            class="btn-favorite flex-shrink-0 me-2"
                            type="button"
                            data-bs-dismiss="modal"
                            aria-label="Close"
                            id="button-favorite-${product.id}"
                          >
                            <i class="bi bi-heart-fill"></i>
                          </button>
                          <button
                            onclick="addtoCart('${response.id}', '${product.id}')"
                            class="btn-primary-green flex-shrink-0"
                            type="button"
                            data-bs-dismiss="modal"
                            aria-label="Close"
                          >
                            <i
                              class="bi bi-cart-plus me-1 text-white"
                            ></i>
                            Add to cart
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      `;
        $("#container-favorites").append(content);
      }
    },
  });
}

// password validation methods

async function validatePassword(password, lname, fname) {
  if (
    password.length < 10 ||
    password.toUpperCase().includes(lname.toUpperCase()) ||
    password.toUpperCase().includes(fname.toUpperCase()) ||
    password.toUpperCase() == password ||
    password.toLowerCase() == password ||
    !/[1234567890]/.test(password) ||
    !/[`!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?~]/.test(password) ||
    (await hasWord(password))
  ) {
    return false;
  }
  return true;
}

//check for words in password
async function hasWord(word) {
  async function checkWord(curr) {
    let resume = true;
    try {
      await $.ajax({
        type: "GET",
        url: "https://api.dictionaryapi.dev/api/v2/entries/en/" + curr,
        data: {},
        success: function () {
          resume = false;
        },
        error: function () {
          resume = true;
        },
      });
    } catch (error) {}
    return resume;
  }

  for (let x = 0; x < word.length; x++) {
    for (let y = 4 + x; y <= word.length; y++) {
      curr = word.substring(x, y);
      if (!/^[a-zA-Z]+$/.test(curr)) {
        continue;
      }
      let res = await checkWord(curr);
      console.log(res);
      if (!res) {
        return true;
      }
    }
  }
  return false;
}

//bootstrap form validation
(function () {
  "use strict";
  // Fetch all the forms we want to apply custom Bootstrap validation styles to
  var forms = document.querySelectorAll(".needs-validation");

  // Loop over them and prevent submission
  Array.prototype.slice.call(forms).forEach(function (form) {
    form.addEventListener(
      "submit",
      function (event) {
        if (!form.checkValidity()) {
          event.preventDefault();
          event.stopPropagation();
        }
        form.classList.add("was-validated");
      },
      false
    );
  });
})();

async function newPassword(e, fname, lname) {
  e.preventDefault();
  document.getElementById("settings-repass").setCustomValidity("");
  document.getElementById("settings-pass").setCustomValidity("");

  password = document.getElementById("settings-pass").value;
  confirm = document.getElementById("settings-repass").value;

  let pass = true;

  if (!(await validatePassword(password, fname, lname))) {
    document.getElementById("settings-pass").setCustomValidity("error");
    pass = false;
  }
  if (password != confirm) {
    document.getElementById("settings-repass").setCustomValidity("error");
    pass = false;
  }
  if (!pass) {
    return;
  }

  $.ajax({
    type: "POST",
    url: "/change_password",
    data: {
      password: password,
    },
    success: function (data) {
      let modal = new bootstrap.Modal(
        document.getElementById("modal-feedback")
      );
      $("#modal-feedback p").text("Password Changed");
      $("#modal-feedback button").attr("onclick", "location.reload()");
      modal.toggle();
    },
    error: function () {
      document.getElementById("settings-pass").setCustomValidity("error");
    },
  });
}

function addtoCart(id, product_id) {
  if (id == "None") {
    window.location.href = "/login";
    return;
  }
  let qty = document.getElementById(`${product_id}-inputQuantity`).value;
  $.ajax({
    type: "POST",
    url: "/addto_cart",
    data: {
      id: product_id,
      qty: qty,
    },
    success: function (data) {
      let toastElem = $("#toast_addedToCart");
      let toast = new bootstrap.Toast(toastElem);
      $("#toast-message").text("Item Added to Cart");
      toast.show();
      let new_qty = data;
      $("#badge_cartQty").text(new_qty);
    },
    error: async function (jqXHR, exception) {
      if (jqXHR.status == 0) {
        alert("Not connect.\n Verify Network.");
      } else if (jqXHR.status == 404) {
        window.location.href = "/login";
      }
    },
  });
}

function clearCart(e) {
  e.preventDefault();
  $.ajax({
    type: "POST",
    url: "/clear_cart",
    data: {},
    success: function () {
      alert("cart cleared");
      window.location.href = "/store";
    },
    error: async function (jqXHR, exception) {
      if (jqXHR.status == 0) {
        alert("Not connect.\n Verify Network.");
      } else {
        alert(jqXHR.status);
      }
    },
  });
}

function remItem(e, id) {
  e.preventDefault();
  $.ajax({
    type: "POST",
    url: "/rem_item",
    data: {
      id: id,
    },
    success: function () {
      location.reload();
    },
    error: async function (jqXHR, exception) {
      if (jqXHR.status == 0) {
        alert("Not connect.\n Verify Network.");
      } else {
        alert(jqXHR.status);
      }
    },
  });
}

function proceedCheckout() {
  $.ajax({
    type: "GET",
    url: "/proceed_checkout",
    success: function () {
      window.location.href = "/checkout";
    },
    error: async function (jqXHR, exception) {
      if (jqXHR.status == 0) {
        alert("Not connect.\n Verify Network.");
      } else if (jqXHR.status == 404) {
        let toastElem = $("#toast-cart");
        let toast = new bootstrap.Toast(toastElem);
        $("#toast-message").text(jqXHR.responseJSON.message);
        toast.show();
        $(`#${jqXHR.responseJSON.id}`).css("backgroundColor", "#f8d7da");
        $(`#${jqXHR.responseJSON.id}`).css("color", "#842029");
        $(`#${jqXHR.responseJSON.id}`).css("transition", "ease-in-out 100ms");
      } else {
        alert(jqXHR.status);
      }
    },
  });
}

function addOrder(e) {
  e.preventDefault();
  let form = document.getElementById("formCheckout");
  if (!form.checkValidity()) {
    return;
  }

  $.ajax({
    type: "POST",
    url: "/add_order",
    data: {
      amount: parseInt(document.getElementById("total-price").innerHTML),
      province: document.getElementById("countrySelect").value,
      city: document.getElementById("citySelect").value,
      zip: document.getElementById("zip").value,
      address: document.getElementById("address").value,
    },
    success: function () {
      window.location.href = "/tracking";
    },
    error: async function (jqXHR, exception) {
      if (jqXHR.status == 0) {
        alert("Not connect.\n Verify Network.");
      } else {
        alert(jqXHR.status);
      }
    },
  });
}

function addSubscription(e) {
  e.preventDefault();
  let form = document.getElementById("formCheckout");
  if (!form.checkValidity()) {
    return;
  }

  $.ajax({
    type: "POST",
    url: "/add_subscription",
    data: {
      delivery_day: $("#delivery-day").text(),
      subscription_type: $("#subscription-type").text(),
      preferences: $("#preferences").text(),
      total: $("#total-price").text(),
      province: document.getElementById("countrySelect").value,
      city: document.getElementById("citySelect").value,
      zip: document.getElementById("zip").value,
      address: document.getElementById("address").value,
    },
    success: function () {
      window.location.href = "/store";
    },
    error: async function (jqXHR, exception) {
      if (jqXHR.status == 0) {
        alert("Not connect.\n Verify Network.");
      } else {
        alert(jqXHR.status);
      }
    },
  });
}

async function passwordExpired(e) {
  e.preventDefault();
  document.getElementById("pwexpPassword").setCustomValidity("");
  document.getElementById("pwexpRePassword").setCustomValidity("");
  password = document.getElementById("pwexpPassword").value;
  confirm = document.getElementById("pwexpRePassword").value;
  fname = document.getElementById("pwexpUser").dataset.fname;
  lname = document.getElementById("pwexpUser").dataset.lname;
  let pass = true;
  if (!(await validatePassword(password, fname, lname))) {
    document.getElementById("pwexpPassword").setCustomValidity("error");
    pass = false;
  }
  if (password != confirm) {
    document.getElementById("pwexpRePassword").setCustomValidity("error");
    pass = false;
  }
  if (!pass) {
    return;
  }

  $.ajax({
    type: "POST",
    url: "/change_password",
    data: {
      password: password,
    },
    success: function (data) {
      window.location.href = "/store";
    },
    error: function () {
      document.getElementById("pwexpPassword").setCustomValidity("error");
    },
  });
}

async function updateInfo(e) {
  e.preventDefault();

  let proceed = true;

  if ($("#citySelect").val() != "" && $("#citySelect").val() !== null) {
    await $.ajax({
      type: "POST",
      url: "/check_zip",
      data: {
        city: $("#citySelect").val(),
        zip: $("#zip").val(),
      },
      success: function (response) {},
      error: function (jqXHR) {
        proceed = false;
        document.getElementById("zip").setCustomValidity("error");
      },
    });
  }

  if (proceed) {
    await $.ajax({
      type: "POST",
      url: "/update_info",
      data: {
        phone: document.getElementById("set-phone").value,
        email: document.getElementById("set-email").value,
        password: document.getElementById("set-password").value,
        province: $("#countrySelect").val(),
        city: $("#citySelect").val(),
        zip: $("#zip").val(),
        address: $("#address").val(),
      },
      success: function (data) {
        let modal = new bootstrap.Modal(
          document.getElementById("modal-feedback")
        );
        $("#modal-feedback p").text("User Info Updated");
        $("#modal-feedback button").attr("onclick", "location.reload()");
        modal.toggle();
      },
      error: function (jqXHR) {
        if (jqXHR.status == 0) {
          alert("Not connect.\n Verify Network.");
        } else if (jqXHR.status == 404) {
          let modal = new bootstrap.Modal(
            document.getElementById("modal-feedback")
          );
          $("#modal-feedback p").text("Wrong Password, Changes not Saved");
          $("#modal-feedback button").removeAttr("onclick");
          $("#set-password").val("");
          modal.toggle();
        } else {
          alert(jqXHR.status);
        }
      },
    });
  }
}

function deleteUser(e) {
  e.preventDefault();
  $.ajax({
    type: "DELETE",
    url: "/delete_user",
    data: {
      password: $("#input-confirm-password").val(),
    },
    success: function () {
      let modal = new bootstrap.Modal(
        document.getElementById("modal-feedback")
      );
      $("#modal-feedback p").text("Account Deleted");
      $("#modal-feedback button").attr("onclick", "location.href='/signup'");
      modal.toggle();
    },
    error: function (jqXHR) {
      if (jqXHR.status == 0) {
        alert("Not connect.\n Verify Network.");
      } else {
        let modal = new bootstrap.Modal(
          document.getElementById("modal-feedback")
        );
        $("#modal-feedback p").text("Invalid Credential");
        $("#modal-feedback button").removeAttr("onclick");
        $("#input-confirm-password").val("");
        modal.toggle();
      }
    },
  });
}

async function getTOTP() {
  let secret = null;
  await $.ajax({
    type: "GET",
    url: "/get_totp",
    success: function (data) {
      secret = data.secret_key;
    },
    error: function (jqXHR) {
      if (jqXHR.status == 0) {
        alert("Not connect.\n Verify Network.");
      } else {
        alert(jqXHR.status);
      }
    },
  });
  document.getElementById("totp-secret").value = secret;
  let userauth = document.getElementById("set-email").value;

  let url =
    "https://api.qrserver.com/v1/create-qr-code/?size=1000x1000&data=otpauth://totp/gleanproject:" +
    userauth +
    "?secret=" +
    secret +
    "&issuer=gleanproject";
  document.getElementsByClassName("qr-code")[0].style.backgroundImage =
    "url(" + url + ")";
  document.getElementsByClassName("qr-code")[0].style.backgroundSize =
    "100% 100%";
  document.getElementsByClassName("qr-code")[0].innerHTML = "";
  document.getElementsByClassName("qr-code")[0].style.border = "0";
}

function verifyOTP(e, user) {
  e.preventDefault();
  let otpCode = document.getElementById("totp-login").value;

  $.ajax({
    type: "POST",
    url: "/user-totp",
    data: {
      otpCode: otpCode,
      id: user,
    },
    success: function (data) {
      window.location.href = "/store";
    },
    error: function (jqXHR) {
      if (jqXHR.status == 0) {
        alert("Not connect.\n Verify Network.");
      } else if (jqXHR.status == 401) {
        $("#totp-login").get(0).setCustomValidity("error");
      } else {
        alert(jqXHR.status);
      }
    },
  });
}

function verifyTOTP(e) {
  e.preventDefault();
  let otpCode = document.getElementById("totp-value").value;
  let password = document.getElementById("totp-passw").value;
  let otpKey = document.getElementById("totp-secret").value;

  $.ajax({
    type: "POST",
    url: "/activate_totp",
    data: {
      otpCode: otpCode,
      password: password,
      otpKey: otpKey,
    },
    success: function (data) {
      let modal = new bootstrap.Modal(
        document.getElementById("modal-feedback")
      );
      $("#modal-feedback p").text("2FA Activated");
      $("#modal-feedback button").attr("onclick", "location.reload()");
      modal.toggle();
    },
    error: function (jqXHR) {
      if (jqXHR.status == 0) {
        alert("Not connect.\n Verify Network.");
      } else if (jqXHR.status == 401 || jqXHR.status == 404) {
        let modal = new bootstrap.Modal(
          document.getElementById("modal-feedback")
        );
        $("#modal-feedback p").text(jqXHR.responseText);
        $("#modal-feedback button").removeAttr("onclick");
        $("#totp-passw").val("");
        $("#totp-value").val("");
        modal.toggle();
      }
    },
  });
}

function disableOTP(e) {
  e.preventDefault();
  let password = document.getElementById("disable-mfa-password").value;

  $.ajax({
    type: "POST",
    url: "/disable_totp",
    data: {
      password: password,
    },
    success: function (data) {
      let modal = new bootstrap.Modal(
        document.getElementById("modal-feedback")
      );
      $("#modal-feedback p").text("2FA Deactivated");
      $("#modal-feedback button").attr("onclick", "location.reload()");
      modal.toggle();
    },
    error: function (jqXHR) {
      if (jqXHR.status == 0) {
        alert("Not connect.\n Verify Network.");
      } else if (jqXHR.status == 401) {
        let modal = new bootstrap.Modal(
          document.getElementById("modal-feedback")
        );
        $("#modal-feedback p").text("Invalid Credential");
        $("#modal-feedback button").removeAttr("onclick");
        $("#disable-mfa-password").val("");
        modal.toggle();
      } else {
        alert(jqXHR.status);
      }
    },
  });
}
function search(e) {
  if (e.key == "Enter" || e.keyCode == 13 || e.code == "Enter") {
    let query = $("#search-products").val() || $("#search-product").val();
    if (query != " " && query != "") {
      location.href = `/search/${query}`;
    }
  }
  return;
}

function favorite(e, id) {
  e.preventDefault();
  $.ajax({
    type: "POST",
    url: "/addto_favorites",
    data: {
      id: id,
    },
    success: function (response, textStatus, jqXHR) {
      let toastElem = $("#toast_addedToCart");
      let toast = new bootstrap.Toast(toastElem);
      if (jqXHR.status == 201) {
        $("#toast-message").text("Item Added to Favorites");
        toast.show();
        loadFavorites();
        $("#no-favs").hide();
        $(`#button-favorite-${id}`)
          .find("i")
          .removeClass()
          .addClass("bi bi-heart-fill");
      } else if (jqXHR.status == 200) {
        $("#toast-message").text("Item Removed from Favorites");
        toast.show();
        $(`#cardfave-${id}`).remove();
        $(`#modalfave-${id}`).remove();
        $(`#button-favorite-${id}`)
          .find("i")
          .removeClass()
          .addClass("bi bi-heart");
        if (response == "0") {
          $("#no-favs").show();
        }
      }
    },
    error: function (jqXHR) {
      if (jqXHR.status == 0) {
        alert("Not connect.\n Verify Network.");
      } else if (jqXHR.status == 401) {
        console.log("error");
      } else {
        alert(jqXHR.status);
      }
    },
  });
}
