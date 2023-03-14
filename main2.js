import { ApiKeyManager } from "@esri/arcgis-rest-request";
import { geocode, suggest } from "@esri/arcgis-rest-geocoding";
import API_KEY from "./js/apikey";
const authentication = new ApiKeyManager({ key: API_KEY });

let sugg = [];
let body = document.getElementById("the-body");
let inputField = document.getElementById("input");
let ulField = document.getElementById("suggestions");
let apt = document.getElementById("apt");
let city = document.getElementById("city");
let state = document.getElementById("state");
let postal = document.getElementById("postal");
let country = document.getElementById("country");
let form = document.getElementById("form");
let modalBody = document.getElementById("modal-body");
let address = document.getElementById("input");
let value = {};
let theSuggAdd = "";
let theSuggCity = "";
let theSuggState = "";
let theSuggPostal = "";
let theSuggCountry = "";
let submitBtn = document.getElementById("submit-btn");
let buttonArea = document.getElementById("button-area");
let yesBtn = document.createElement("button");
let mDialog = document.getElementById("m-dialog");

//getting suggestions
inputField.addEventListener("input", ({ target }) => {
  suggest(target.value, {
    params: {
      category: "Address",
    },
    authentication,
  }).then((res) => {
    res.suggestions.forEach((item) => {
      sugg.push(item);
    });
    if (target.value) {
      inputField.setAttribute("autocomplete", "new-password");
    }
    changeAutoComplete(target.value);
  });
});

//showing suggestions
function changeAutoComplete(data) {
  ulField.innerHTML = ``;
  if (data.length > 0) {
    ulField.style.border = "1px solid gray";
    for (value of sugg) {
      let li = document.createElement("li");
      li.innerHTML = "📍 " + value.text;
      li.classList.add(value.magicKey);
      li.classList.add("list-group-item-action");
      li.classList.add("active");
      li.addEventListener("click", (event) => {
        inputField.removeAttribute("autocomplete");
        li.classList.remove("active");
        geo(event.target.className);
        ulField.style.border = "";
        ulField.innerHTML = "";
      });
      ulField.appendChild(li);
    }
    body.addEventListener("click", (event) => {
      inputField.removeAttribute("autocomplete");
      ulField.style.border = "";
      ulField.innerHTML = "";
      setAllFields();
    });
    sugg = [];
  }
}

function geo(magicKey) {
  geocode({
    magicKey,
    maxLocations: 1,
    outFields: "*",
    authentication,
  }).then((resu) => {
    let result = resu.candidates[0];
    result.attributes.StAddr
      ? (inputField.value = result.attributes.StAddr)
      : (inputField.value = result.attributes.ShortLabel);
    address.value = result.attributes.StAddr;
    city.value = result.attributes.City;
    state.value = result.attributes.Region;
    country.value = result.attributes.CntryName;
    postal.value = result.attributes.Postal;
    setAllFields();
  });
}

function geoSuggestion(magic) {
  geocode({
    magicKey: magic,
    maxLocations: 1,
    outFields: "*",
    authentication,
  }).then((res) => {
    console.log(res.candidates[0]);
    theSuggAdd = res.candidates[0].attributes.StAddr;
    theSuggCity = res.candidates[0].attributes.City;
    theSuggState = res.candidates[0].attributes.Region;
    theSuggPostal = res.candidates[0].attributes.Postal;
    theSuggCountry = res.candidates[0].attributes.CntryName;
    showSugg();
  });
}

function setAllFields() {
  inputField.addEventListener("change", (event) => {
    event.preventDefault();
    inputField.value = event.target.value;
  });
  apt.addEventListener("change", (event) => {
    event.preventDefault();
    apt.value = event.target.value;
  });
  city.addEventListener("change", (event) => {
    event.preventDefault();
    city.value = event.target.value;
  });
  state.addEventListener("change", (event) => {
    event.preventDefault();
    state.value = event.target.value;
  });
  postal.addEventListener("change", (event) => {
    event.preventDefault();
    postal.value = event.target.value;
  });
  country.addEventListener("change", (event) => {
    event.preventDefault();
    country.value = event.target.value;
  });
}

function giveSugg() {
  suggest(
    `${inputField.value}, ${city.value}, ${state.value}, ${postal.value}`,
    {
      params: {
        category: "Address",
      },
      authentication,
    }
  ).then((res) => {
    let magic = document.createElement("div");
    magic.classList.add(res.suggestions[0].magicKey);
    geoSuggestion(magic.className);
    console.log(magic.className);
  });
}

function showSugg() {
  let noBtn = submitBtn;
  yesBtn.innerText = "Yes, accept new address.";
  yesBtn.classList.add("button");
  noBtn.innerText = "No, go back to form.";
  if (!apt.value) {
    modalBody.innerHTML = `<div style="display:flex;">
                              <div style="text-align:left;margin-left:30px;flex:1;">
                                <span style="font-weight:900;font-size:30px;">You entered: </span><br/>
                                <span style="font-family: Rooney;">${inputField.value}<br/>${city.value}, ${state.value} ${postal.value}<br/>${country.value}</span>
                              </div>
                              <div style="text-align:left;flex:1;">
                                <span style="font-weight:900;font-size:30px;">Did you mean?</span><br/>
                                <span style="font-family: Rooney;">${theSuggAdd}<br/>${theSuggCity}, ${theSuggState} ${theSuggPostal}<br/>${theSuggCountry}</span>
                              </div>
                          </div>`;
  } else {
    modalBody.innerHTML = `<div style="display:flex;">
                                <div style="text-align:left;margin-left:30px;flex:1;">
                                  <span style="font-weight:900;font-size:30px;">You entered: </span><br/>
                                  <span style="font-family: Rooney;">${inputField.value}, ${apt.value}<br/>${city.value}, ${state.value} ${postal.value}<br/>${country.value}</span>
                                </div>
                                <div style="text-align:left;flex:1;">
                                  <span style="font-weight:900;font-size:30px;">Did you mean?</span><br/>
                                  <span style="font-family: Rooney;">${theSuggAdd}, ${apt.value}<br/>${theSuggCity}, ${theSuggState} ${theSuggPostal}<br/>${theSuggCountry}</span>
                                </div>
                            </div>`;
  }
  buttonArea.appendChild(yesBtn);
  modalBody.appendChild(buttonArea);
  yesBtn.onclick = handleReload;
  noBtn.onclick = removeYes;
  mDialog.classList.add("modal-lg");
}

function removeYes() {
  buttonArea.removeChild(yesBtn);
}

function accept() {
  mDialog.classList.remove("modal-lg");
  buttonArea.removeChild(submitBtn);
  let subArea = document.createElement("div");
  let subBtn = document.createElement("button");
  subBtn.classList.add("button");
  subBtn.classList.add("submit-button");
  subBtn.innerText = "OK";
  modalBody.innerHTML = `<div style="font-weight:900;margin-bottom:15px;">Address accepted!</div>`;
  subArea.appendChild(subBtn);
  modalBody.appendChild(subArea);
  subBtn.onclick = handleReload;
}

function handleReload() {
  window.location.reload(false);
}

form.addEventListener("submit", (event) => {
  event.preventDefault();
  geocode({
    address: inputField.value,
    city: city.value,
    region: state.value,
    postal: postal.value,
    countryCode: country.value,
    authentication,
  }).then((res) => {
    let score = res.candidates[0].score;
    if (score < 95) {
      giveSugg();
    } else {
      console.log(score);
      accept();
    }
  });
});
