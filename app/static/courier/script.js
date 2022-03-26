function login(e) {
  e.preventDefault();
  $.ajax({
    type: "POST",
    url: "/courier/login",
    data: {
      email: document.getElementById("loginEmail").value,
      password: document.getElementById("loginPassword").value,
    },
    success: function (data) {
      console.log("Logged In");
      window.location.href = "/courier";
    },
    error: function (jqXHR, exception) {
      var msg = "";
      if (jqXHR.status === 0) {
        msg = "Not connect.\n Verify Network.";
      } else if (jqXHR.status == 401) {
        alert("Invalid credentials");
      }
    },
  });
}

function logout() {
  console.log("Logged Out");
  window.location.href = "/courier/logout";
}

function acceptOrder(e, id) {
  e.preventDefault();

  $.ajax({
    type: "POST",
    url: "/courier/accept_order",
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
    url: "/courier/update_orderstatus",
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

var percent = Math.floor(
  (parseInt(document.querySelector("#count-completed").textContent) /
    (parseInt(document.querySelector("#count-completed").textContent) +
      parseInt(document.querySelector("#count-deliveries").textContent))) *
    100
);

percent = isNaN(percent) ? 100 : percent;
percent = isFinite(percent) ? percent : 100;

var options = {
  series: [percent],
  chart: {
    height: 350,
    type: "radialBar",
    offsetY: 0,
  },
  plotOptions: {
    radialBar: {
      startAngle: -135,
      endAngle: 135,
      dataLabels: {
        name: {
          fontSize: "18px",
          color: "#444",
          offsetY: 100,
        },
        value: {
          offsetY: 0,
          fontSize: "50px",
          color: "#95c22b",
          formatter: function (val) {
            return val + "%";
          },
        },
      },
    },
  },
  fill: {
    colors: ["#95c22b", "#000", "#9C27B0"],
  },
  labels: ["Delivery Progress"],
};

var chart = new ApexCharts(document.querySelector("#progress-chart"), options);
chart.render();
