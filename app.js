// map object
const myMap = {
	coordinates: [],
	businesses: [],
	map: {},
	markers: {},

	// build leaflet map
	buildMap() {
		// Use coordinates only after they are populated
		this.map = L.map('map', {
			center: this.coordinates,
			zoom: 11,
		});
		
		// add openstreetmap tiles
		L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
			attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
			minZoom: 15,
		}).addTo(this.map);

		// create and add geolocation marker if coordinates are set
		if (this.coordinates.length) {
			const marker = L.marker(this.coordinates);
			marker
				.addTo(this.map)
				.bindPopup('<p1><b>Where should we go?</b><br></p1>')
				.openPopup();
		}
	},

	// add business markers
	addMarkers() {
		this.businesses.forEach(business => {
			const marker = L.marker([business.lat, business.long]);
			marker
				.bindPopup(`<p1>${business.name}</p1>`)
				.addTo(this.map);
		});
	},
};

// get coordinates via geolocation api
async function getCoords(){
	const pos = await new Promise((resolve, reject) => {
		navigator.geolocation.getCurrentPosition(resolve, reject);
	});
	return [pos.coords.latitude, pos.coords.longitude];
}

// get foursquare businesses
async function getFoursquare(business) {
	const options = {
		method: 'GET',
		headers: {
			Accept: 'application/json',
			Authorization: 'fsq3ATzZbmcGhdeFafr73wZcnJ+LlN6bK+4dh19a7ClS4u8=',
		},
	};
	const limit = 5;
	const [lat, lon] = myMap.coordinates;
	const response = await fetch(`https://api.foursquare.com/v3/places/search?query=${business}&limit=${limit}&ll=${lat},${lon}`, options);
	const data = await response.json();
	return data.results;
}

// process foursquare array
function processBusinesses(data) {
	return data.map(element => ({
		name: element.name,
		lat: element.geocodes.main.latitude,
		long: element.geocodes.main.longitude,
	}));
}

// event handlers
window.onload = async () => {
	myMap.coordinates = await getCoords();
	myMap.buildMap();
};

// business submit button
document.getElementById('submit').addEventListener('click', async (event) => {
	event.preventDefault();
	const business = document.getElementById('business').value;
	const data = await getFoursquare(business);
	myMap.businesses = processBusinesses(data);
	myMap.addMarkers();
    console.log(data);
});
