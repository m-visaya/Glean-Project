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
      if (data.totp) {
        window.location.href = "/user-totp";
      } else {
        window.location.href = "/store";
      }
    },
    error: async function (jqXHR, exception) {
      var msg = "";
      if (jqXHR.status === 0) {
        msg = "Not connect.\n Verify Network.";
      } else if (jqXHR.status == 401) {
        $("#loginPassword").get(0).setCustomValidity("error");
      } else if (jqXHR.status == 406) {
        let toastLiveExample = document.getElementById("liveToast");
        let toast = new bootstrap.Toast(toastLiveExample);
        toast.show();
        $("#login-toast-content").text(jqXHR.responseText);
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
                            type="number"
                            max="9"
                            min="1"
                            value="1"
                            style="max-width: 3.5rem"
                          />
                          <button
                            onclick="unfavorite(event, '${product.id}')"
                            class="btn-favorite flex-shrink-0 me-2"
                            type="button"
                            data-bs-dismiss="modal"
                            aria-label="Close"
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

async function newPassword(e) {
  e.preventDefault();
  document.getElementById("settings-repass").setCustomValidity("");
  document.getElementById("settings-pass").setCustomValidity("");

  password = document.getElementById("settings-pass").value;
  confirm = document.getElementById("settings-repass").value;
  fname = user["firstname"];
  lname = user["lastname"];

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
      alert("password changed");
      window.location.href = "/profile";
    },
    error: function () {
      document.getElementById("settings-repass").setCustomValidity("error");
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
        let alert = $("#alert-outofstock");
        alert.find("p").text(jqXHR.responseText);
        alert.css("visibility", "visible");
        setTimeout(() => alert.css("visibility", "hidden"), 10000);
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

// Checkout Select Municipality Based on Region/City
var citiesByState = {
  NCR: [
    "Caloocan",
    "Las Piñas",
    "Makati",
    "Malabon",
    "Mandaluyong",
    "Manila",
    "Marikina",
    "Muntinlupa",
    "Navotas",
    "Parañaque",
    "Pasay",
    "Pasig",
    "Quezon City",
    "San Juan",
    "Taguig",
    "Valenzuela",
  ],
  Bulacan: [
    "Angat",
    "Balagtas",
    "Baliuag",
    "Bocaue",
    "Bulakan",
    "Bustos",
    "Calumpit",
    "Doña Remedios Trinidad",
    "Guiguinto",
    "Hagonoy",
    "Marilao",
    "Norzagaray",
    "Obando",
    "Pandi",
    "Paombong",
    "Plaridel",
    "Pulilan",
    "San Ildefonso",
    "San Miguel",
    "San Rafael",
    "Santa Maria",
  ],
  Rizal: [
    "Antipolo",
    "Angono",
    "Baras",
    "Binangonan",
    "Cainta",
    "Cardona",
    "Jalajala",
    "Morong",
    "Pililia",
    "Rodriguez",
    "San Mateo",
    "Tanay",
    "Taytay",
    "Teresa",
  ],
};

function resetSelection() {
  document.getElementById("countrySelect").selectedIndex = 0;
  document.getElementById("citySelect").selectedIndex = 0;
  document.getElementById("countrySelect-bill").selectedIndex = 0;
  document.getElementById("citySelect-bill").selectedIndex = 0;
}

function makeSubmenu(value) {
  if (value.length == 0)
    document.getElementById("citySelect").innerHTML = "<option></option>";
  else {
    var citiesOptions = "";
    for (cityId in citiesByState[value]) {
      citiesOptions +=
        "<option " +
        "value=" +
        citiesByState[value][cityId] +
        " >" +
        citiesByState[value][cityId] +
        "</option>";
    }
    document.getElementById("citySelect").innerHTML = citiesOptions;
  }
}

function makeSubmenuforbill(value) {
  if (value.length == 0)
    document.getElementById("citySelect-bill").innerHTML = "<option></option>";
  else {
    var citiesOptions = "";
    for (cityId in citiesByState[value]) {
      citiesOptions +=
        "<option " +
        "value=" +
        citiesByState[value][cityId] +
        ">" +
        citiesByState[value][cityId] +
        "</option>";
    }
    document.getElementById("citySelect-bill").innerHTML = citiesOptions;
  }
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

function updateInfo(e) {
  e.preventDefault();
  $.ajax({
    type: "POST",
    url: "/update_info",
    data: {
      phone: document.getElementById("set-phone").value,
      email: document.getElementById("set-email").value,
      password: document.getElementById("set-password").value,
    },
    success: function (data) {
      alert("user info updated");
      location.reload();
    },
    error: function (jqXHR) {
      if (jqXHR.status == 0) {
        alert("Not connect.\n Verify Network.");
      } else if (jqXHR.status == 404) {
        console.log("wrong");
        alert("wrong password");
      } else {
        alert(jqXHR.status);
      }
    },
  });
}

function deleteUser(e) {
  e.preventDefault();
  $.ajax({
    type: "DELETE",
    url: "/delete_user",
    data: {},
    success: function () {
      window.location.href = "/logout";
    },
    error: function (jqXHR) {
      if (jqXHR.status == 0) {
        alert("Not connect.\n Verify Network.");
      } else {
        alert(jqXHR.status);
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
        alert(jqXHR.responseText);
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
      alert("success");
      location.reload();
    },
    error: function (jqXHR) {
      if (jqXHR.status == 0) {
        alert("Not connect.\n Verify Network.");
      } else if (jqXHR.status == 401) {
        alert(jqXHR.responseText);
      } else {
        alert(jqXHR.status);
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
      alert("success");
      location.reload();
    },
    error: function (jqXHR) {
      if (jqXHR.status == 0) {
        alert("Not connect.\n Verify Network.");
      } else if (jqXHR.status == 401) {
        alert("Invalid Password");
      } else {
        alert(jqXHR.status);
      }
    },
  });
}

function search(e) {
  e.preventDefault();
  $.ajax({
    type: "POST",
    url: "/search_products",
    data: {
      name: document.getElementById("search-product").value,
    },
    success: function (data) {
      products = data["products"];
      id = data["id"];
      cards = ``;
      for (let i = 0; i < products.length; i++) {
        if (products[i]["stock"] > 0) {
          cards +=
            `
            <div class="col">
              <div class="card shadow-sm" data-bs-toggle="modal" data-bs-target="#modal-` +
            products[i]["id"] +
            `">  <!-- cards -->
                <img src=` +
            products[i]["image"] +
            ` alt=` +
            products[i]["name"] +
            ` class="card-img-top card-ggc">
                <div class="card-body card-body-height">
                  <h5 class="overflow-ellipsis"> ` +
            products[i]["name"] +
            ` </h5>
<!--                   <h6 class="card-text-price">₱` +
            products[i]["price"] +
            `</h6> -->
                  <p class="card-text prod-desc overflow-auto" style="height: 5rem"> ` +
            products[i]["description"] +
            `</p>
                </div>
                  <div class="d-flex justify-content-between align-items-center ms-3 mt-1 mb-3">
                      <span class="badge rounded-pill bg-primary-green prod-category">` +
            products[i]["category"] +
            `</span>
                  </div>
              </div>
              
              <div class="modal fade" id="modal-` +
            products[i]["id"] +
            `" tabindex="-1" aria-labelledby="exampleModalLabel" aria-hidden="true"> <!--cards-modal-->
              <div class="modal-dialog modal-lg modal-dialog-centered">
                <div class="modal-content">
                  <div class="modal-header border-0">
                    <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
                  </div>
                  <div class="modal-body">
                    <div class="container px-lg-5 my-5 mt-3">
                      <div class="row gx-4 gx-lg-5 align-items-center">
                          <div class="col-md-12 col-lg-6"><img class="card-img mb-5 mb-md-0" src="` +
            products[i]["image"] +
            `"/></div>
                          <div class="col-md-12 col-lg-6 mt-4">
                              <span class="badge rounded-pill bg-primary-green mb-1">` +
            products[i]["category"] +
            `</span>
                              <p class="fs-2 fw-bolder" id="` +
            products[i]["id"] +
            `-product-name">` +
            products[i]["name"] +
            `</p>
                              <div class="fs-5 mb-2">
                                  <span id="` +
            products[i]["id"] +
            `-product-price">₱` +
            products[i]["price"] +
            `</span>
                              </div>
                              <p class="lead fs-6">` +
            products[i]["description"] +
            `</p>
                              <p class="lead fs-5 fw-bold">What's in the box</p>
                              <p class="lead fs-6 mt-1">` +
            products[i]["ingredients"] +
            `</p>
                              <div class="d-flex pt-4">
                                <input class="form-control text-center me-3" id="` +
            products[i]["id"] +
            `-inputQuantity" type="number" max="9" min="1" value="1" style="max-width: 3.5rem">
                                
                                <button onclick="favorite(event, '` +
            products[i]["id"] +
            `')" class="btn-favorite flex-shrink-0 me-2" type="button"  data-bs-dismiss="modal" aria-label="Close">
                                    <i class="bi bi-heart"></i>
                                </button>
                                
                                <button onclick="addtoCart('` +
            id +
            `', '` +
            products[i]["id"] +
            `')" class="btn-primary-green flex-shrink-0" type="button"  data-bs-dismiss="modal" aria-label="Close">
                                    <i class="bi bi-cart-plus me-1 text-link"></i>
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
        }
      }
      document.getElementById("cards-container").innerHTML = cards;
    },
    error: function (jqXHR) {
      console.log(jqXHR.status);
    },
  });
}

function favorite(e, id) {
  e.preventDefault();
  $.ajax({
    type: "POST",
    url: "/addto_favorites",
    data: {
      id: id,
    },
    success: function (data) {
      let toastElem = $("#toast_addedToCart");
      let toast = new bootstrap.Toast(toastElem);
      $("#toast-message").text("Item Added to Favorites");
      toast.show();
      loadFavorites();
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

function unfavorite(e, id) {
  e.preventDefault();
  $.ajax({
    type: "POST",
    url: "/removefrom_favorites",
    data: {
      id: id,
    },
    success: function (data) {
      $(`#cardfave-${id}`).remove();
      $(`#modalfave-${id}`).remove();
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
