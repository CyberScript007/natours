export const mapLayer = function (locations) {
  // retrieve the first coordinates of the locations
  const [lng, lat] = locations[0].coordinates;

  // render the map to user and use the first coordinate to set the map view
  const map = L.map('map', {
    zoomControl: false,
  }).setView([lat, lng], 6);

  // render the tile layer of the map
  L.tileLayer(
    'https://a.tile-cyclosm.openstreetmap.fr/cyclosm/{z}/{x}/{y}.png',
    {
      attribution:
        '&copy; OpenStreetMap contributors, Tiles style by Humanitarian OpenStreetMap Team',
    },
  ).addTo(map);

  // use a custom marker icon
  const myIcon = L.divIcon({ className: 'marker', iconSize: [32, 40] });

  // create popup for each of the map
  locations.forEach((location) => {
    const [lng, lat] = location.coordinates;
    L.marker([lat, lng], { icon: myIcon })
      .addTo(map)
      .bindPopup(`Day ${location.day}: ${location.description}`, {
        autoClose: false,
      })
      .openPopup();
  });

  // // get the current map bound
  // const currentBounds = map.getBounds();

  // console.log(currentBounds);

  // // extend the bounds by a center factor(e.g., 1.2 for 20% increase)
  // const extendsBounds = currentBounds.pad(0.2);

  // // set the extends bound as the new map bound
  // map.setMaxBounds(extendsBounds);
};
