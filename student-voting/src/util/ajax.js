// https://stackoverflow.com/questions/39019094/reactjs-get-json-object-data-from-an-url
export function loadData(url) {
  return new Promise((resolve, reject) => {
    var xhttp = new XMLHttpRequest();
    xhttp.onreadystatechange = function() {
      if (xhttp.readyState === 4 && xhttp.status === 200) {
         return resolve(xhttp.responseText);
      }
    };
    xhttp.open("GET", url, true);
    xhttp.send();
  });
}

export async function getDistrict(state, district) {
  const url = 'https://theunitedstates.io/districts/cds/2016/' + state + '-' + district + '/shape.geojson';
  const responseText = await loadData(url);
  return JSON.parse(responseText);
}

export function geoFind(geo, address) {
  return new Promise((resolve, reject) => {
    geo.find(address, (err, res) => {
      if (err) {
        return reject(new Error(err));
      } else {
        return resolve({ location: res[0].location, zip: res[0].postal_code.short_name });
      }
    });
  });
}