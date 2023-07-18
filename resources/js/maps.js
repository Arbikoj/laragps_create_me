console.log("maps");


let mapku, markers = [];

var latlngs = [
    [-7.275791355265137, 112.79304304779649],
    [-7.276619222747623, 112.79021996428808],
    [-7.278834524356996, 112.79020165860294],
    [-7.279342952691109, 112.78974401647433],
    [-7.279869538572467, 112.78606457376024],
    [-7.280541388648063, 112.7807925364166],
    [-7.277490818149759, 112.78088406484233],
];



/* ----------------------------- Initialize Map ----------------------------- */
function initMap(dataku) {
    mapku = L.map('map', {
        center: {
            lat: -7.275435177186381,
            lng: 112.79366084960017
        },
        zoom: 15
    });
    L.marker([-7.275791355265137, 112.79304304779649]).addTo(mapku);
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '© OpenStreetMap'
    }).addTo(mapku);

    var polyline = L.polyline(dataku, { color: 'red' }).addTo(mapku);

    // zoom the map to the polyline
    mapku.fitBounds(polyline.getBounds());
}

function fetchContent() {
    $.ajax({
        url: 'http://127.0.0.1:8000/jsondata/2',
        type: 'GET',
        dataType: 'json',
        success: function(data) {
            var arrayOfArrays = data.map(function(obj) {
                return [obj.lat, obj.long];
            });

            initMap(arrayOfArrays);

        },

        error: function(xhr, status, error) {
            // Handle error
            console.log('Ajax request error:', error);
        }
    });
}

fetchContent();
// console.log(window.location.href);
// setInterval(fetchContent, 3000);