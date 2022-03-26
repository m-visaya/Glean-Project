// Checkout Select Municipality Based on Region/City
var citiesByState = {
  NCR: {
    Caloocan: 3012,
    "Las Piñas": 3012,
    Makati: 3012,
    Malabon: 3012,
    Mandaluyong: 3012,
    Manila: 3012,
    Marikina: 3012,
    Muntinlupa: 3012,
    Navotas: 3012,
    Parañaque: 3012,
    Pasay: 3012,
    Pasig: 3012,
    "Quezon City": 3012,
    "San Juan": 3012,
    Taguig: 3012,
    Valenzuela: 3012,
  },
  Bulacan: {
    Angat: 3012,
    Balagtas: 3012,
    Baliuag: 3012,
    Bocaue: 3012,
    Bulakan: 3012,
    Bustos: 3012,
    Calumpit: 3012,
    "Doña Remedios Trinidad": 3012,
    Guiguinto: 3012,
    Hagonoy: 3012,
    Marilao: 3012,
    Norzagaray: 3012,
    Obando: 3012,
    Pandi: 3012,
    Paombong: 3012,
    Plaridel: 3012,
    Pulilan: 3012,
    "San Ildefonso": 3012,
    "San Jose del Monte": 3012,
    "San Miguel": 3012,
    "San Rafael": 3012,
    "Santa Maria": 3012,
  },
  Rizal: {
    Antipolo: 3012,
    Angono: 3012,
    Baras: 3012,
    Binangonan: 3012,
    Cainta: 3012,
    Cardona: 3012,
    Jalajala: 3012,
    Morong: 3012,
    Pililia: 3012,
    Rodriguez: 3012,
    "San Mateo": 3012,
    Tanay: 3012,
    Taytay: 3012,
    Teresa: 3012,
  },
};

function resetSelection() {
  document.getElementById("countrySelect").selectedIndex = 0;
  document.getElementById("citySelect").selectedIndex = 0;
  document.getElementById("zip").value = "";
}

function makeSubmenu(value) {
  document.getElementById("citySelect").selectedIndex = 0;
  document.getElementById("zip").value = "";
  if (value.length == 0) {
    document.getElementById("citySelect").innerHTML = "<option></option>";
  } else {
    var citiesOptions = "<option value='' disabled selected>Choose...</option>";
    for (cityId in citiesByState[value]) {
      citiesOptions += `<option value='${String(cityId)}'> ${cityId} </option>`;
    }
    document.getElementById("citySelect").innerHTML = citiesOptions;
  }
}

$(document).ready(function () {
  province = $("#countrySelect").val();
  city = $("#citySelect").val();
  zip = $("#zip").val();
  if (province != "") {
    makeSubmenu(province);
  }
  if (city != "") {
    $("#citySelect").val(city);
  }
  if (zip != "") {
    $("#zip").val(zip);
  }
});
