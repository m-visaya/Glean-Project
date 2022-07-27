function login(e) {
  e.preventDefault();
  $.ajax({
    type: "POST",
    url: "/admin/login",
    data: {
      username: document.getElementById("loginUsername").value,
      password: document.getElementById("loginPassword").value,
    },
    success: function (data) {
      console.log("Logged In");
      window.location.href = "/admin";
    },
    error: function (jqXHR, exception) {
      var msg = "";
      if (jqXHR.status === 0) {
        alert("Not connect.\n Verify Network.");
      } else if (jqXHR.status == 401) {
        alert("Unauthorized");
      }
    },
  });
}

function logout() {
  console.log("Logged Out");
  window.location.href = "/admin/logout";
}

function delete_user(uid) {
  $.ajax({
    type: "DELETE",
    url: "/admin/delete_user",
    data: {
      id: uid,
    },
    success: function (data) {
      document.getElementById(uid).remove();
      alert("account deleted!");
    },
  });
}

function add_product(e) {
  e.preventDefault();
  $.ajax({
    type: "POST",
    url: "/admin/add_product",
    data: {
      name: document.getElementById("addProduct-name").value,
      category: document.getElementById("addProduct-category").value,
      description: document.getElementById("addProduct-description").value,
      ingredients: document.getElementById("addProduct-ingredients").value,
      price: document.getElementById("addProduct-price").value,
      stock: document.getElementById("addProduct-stock").value,
      image: document.getElementById("addProduct-image").value,
    },
    success: function (data) {
      let alertText = `Product Added: ${data}`;
      alert(alertText);
      location.reload();
    },
  });
}

function updateOrderStatus(id) {
  $.ajax({
    type: "POST",
    url: "/admin/update_orderstatus",
    data: {
      order_id: id,
    },
    success: function (data) {
      location.reload();
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

function open_editProduct(product_id) {
  $.ajax({
    type: "POST",
    url: "/get_product",
    data: {
      id: product_id,
    },
    success: function (data) {
      document.getElementById("editProduct-id").value = product_id;
      document.getElementById("editProduct-name").value = data.name;
      document.getElementById("editProduct-category").value = data.category;
      document.getElementById("editProduct-description").value =
        data.description;
      document.getElementById("editProduct-ingredients").value =
        data.ingredients;
      document.getElementById("editProduct-price").value = data.price;
      document.getElementById("editProduct-stock").value = data.stock;
      document.getElementById("editProduct-image").value = data.image;
    },
  });
}

function set_featured(product_id) {
  $.ajax({
    type: "PUT",
    url: "/admin/set_featured",
    data: {
      id: product_id,
    },
    success: function (data) {
      location.reload();
    },
  });
}

function edit_product(e) {
  e.preventDefault();
  $.ajax({
    type: "PUT",
    url: "/admin/edit_product",
    data: {
      id: document.getElementById("editProduct-id").value,
      price: document.getElementById("editProduct-price").value,
      stock: document.getElementById("editProduct-stock").value,
      category: document.getElementById("addProduct-category").value,
      image: document.getElementById("editProduct-image").value,
    },
    success: function (data) {
      location.reload();
    },
  });
}

function deleteProduct() {
  $.ajax({
    type: "DELETE",
    url: "/admin/delete_product",
    data: {
      id: product_id,
    },
    success: function (data) {
      let alertText = `Product Deleted: ${data}`;
      alert(alertText);
      document.getElementById(product_id).remove();
    },
  });
}

function createCourier(e) {
  e.preventDefault();

  $.ajax({
    type: "POST",
    url: "/admin/create_courier",
    data: {
      firstname: $("#add-courier-fname").val(),
      lastname: $("#add-courier-lname").val(),
      email: $("#add-courier-email").val(),
      password: $("#add-courier-password").val(),
      province: $("#countrySelect").val(),
      city: $("#citySelect").val(),
      zip: $("#zip").val(),
      available: $("#add-courier-status")[0].checked,
    },
    success: function (data) {
      alert("courier account created");
      location.reload();
    },
    error: function (jqXHR, exception) {
      if (jqXHR.status == 400) {
        alert("Account not Created! Invalid ZIP Code");
      } else {
        alert("Something went wrong");
      }
    },
  });
}

function loadCharts() {
  $.ajax({
    type: "GET",
    url: "/admin/get_sales",
    success: function (data) {
      createChart(data);
    },
    error: function (jqXHR, exception) {
      alert(jqXHR.status);
    },
  });
}

function createChart(info) {
  //sales chart
  let monthly_sales = {
    January: info.monthly_sales.January,
    February: info.monthly_sales.February,
    March: info.monthly_sales.March,
    April: info.monthly_sales.April,
    May: info.monthly_sales.May,
    June: info.monthly_sales.June,
    July: info.monthly_sales.July,
    August: info.monthly_sales.August,
    September: info.monthly_sales.September,
    October: info.monthly_sales.October,
    November: info.monthly_sales.November,
    December: info.monthly_sales.December,
  };
  let data = {
    datasets: [
      {
        label: "Monthly Sales",
        backgroundColor: "rgb(149, 194, 43)",
        borderColor: "rgb(149, 194, 43)",
        data: monthly_sales,
      },
    ],
  };
  let config = {
    type: "line",
    data: data,
    options: {},
  };

  const myChart = new Chart(document.getElementById("myChart"), config);

  data = {
    datasets: [
      {
        label: "Sales by Product",
        backgroundColor: "rgb(149, 194, 43)",
        borderColor: "rgb(149, 194, 43)",
        data: info.product_sales,
      },
    ],
  };
  config = {
    type: "bar",
    data: data,
    options: {
      responsive: true,
    },
  };

  const myChart2 = new Chart(document.getElementById("myChart2"), config);
}

function changeChart(id) {
  if (id == "product-sales") {
    $(`#product-sales`).show();
    $(`#monthly-sales`).hide();
    $(`#button-chart`).text("Product Sales");
  } else {
    $(`#product-sales`).hide();
    $(`#monthly-sales`).show();
    $(`#button-chart`).text("Monthly Sales");
  }
}

function changeStatView(e, id) {
  e.preventDefault();
  if (id == "processing") {
    $(`#processing`).show();
    $(`#picked-up`).hide();
    $(`#in-transit`).hide();
    $(`#delivered`).hide();
    $(`#button-orderStat`).text("Processing");
  } else if (id == "ready") {
    $(`#processing`).hide();
    $(`#picked-up`).show();
    $(`#in-transit`).hide();
    $(`#delivered`).hide();
    $(`#button-orderStat`).text("Ready");
  } else if (id == "in-transit") {
    $(`#processing`).hide();
    $(`#picked-up`).hide();
    $(`#in-transit`).show();
    $(`#delivered`).hide();
    $(`#button-orderStat`).text("In Transit");
  } else if (id == "delivered") {
    $(`#processing`).hide();
    $(`#picked-up`).hide();
    $(`#in-transit`).hide();
    $(`#delivered`).show();
    $(`#button-orderStat`).text("Delivered");
  }
}

function pSearch(e) {
  if (e.key == "Enter" || e.keyCode == 13 || e.code == "Enter") {
    let query = $("#search-products").val();
    if (query != " " && query != "") {
      location.href = `/admin/search_products/${query}`;
    }
  }
  return;
}

function cSearch(e) {
  if (e.key == "Enter" || e.keyCode == 13 || e.code == "Enter") {
    let query = $("#search-couriers").val();
    if (query != " " && query != "") {
      location.href = `/admin/search_couriers/${query}`;
    }
  }
  return;
}

function oSearch(e) {
  if (e.key == "Enter" || e.keyCode == 13 || e.code == "Enter") {
    let query = $("#search-orders").val();
    if (query != " " && query != "") {
      location.href = `/admin/search_orders/${query}`;
    }
  }
  return;
}

var product_id;

$("#modal-delete-product").on("show.bs.modal", function (e) {
  //get data-id attribute of the clicked element
  product_id = $(e.relatedTarget).data("product-id");
});
