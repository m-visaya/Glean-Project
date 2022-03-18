function login(e) {
  e.preventDefault();
  $.ajax({
    type: "POST",
    url: "https://Glean-Store.marcovisaya.repl.co/courier/login",
    data: {
      email: document.getElementById("loginEmail").value,
      password: document.getElementById("loginPassword").value,
    },
    success: function (data) {
      console.log("Logged In");
      window.location.href = "https://Glean-Store.marcovisaya.repl.co/courier";
    },
    error: function (jqXHR, exception) {
      var msg = "";
      if (jqXHR.status === 0) {
        msg = "Not connect.\n Verify Network.";
      } else if (jqXHR.status == 401) {
        alert("Account not retrieved");
      }
    },
  });
}

function logout() {
  console.log("Logged Out");
  window.location.href =
    "https://Glean-Store.marcovisaya.repl.co/courier/logout";
}

function acceptOrder(e, id) {
  e.preventDefault();

  $.ajax({
    type: "POST",
    url: "https://Glean-Store.marcovisaya.repl.co/courier/accept_order",
    data: {
      order_id: id,
    },
    success: function (data) {
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

function updateOrderStatus(e, id) {
  e.preventDefault();

  $.ajax({
    type: "POST",
    url: "https://Glean-Store.marcovisaya.repl.co/courier/update_orderstatus",
    data: {
      order_id: id,
    },
    success: function (data) {
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
