
(() => {
    const mapContainer = document.getElementById("map");
    const errorContainer = document.getElementById("map-error");

    if (!mapContainer) return;

    function showError(message) {
        if (errorContainer) {
            errorContainer.textContent = message;
        }
        console.error("Map error:", message);
    }

    if (typeof mapboxgl === "undefined") {
        showError("Mapbox library load nahi hui. Internet aur script URL check karo.");
        return;
    }

    if (typeof mapToken === "undefined" || !mapToken.trim()) {
        showError("Mapbox token missing hai. Apni .env file mein MAP_TOKEN check karo.");
        return;
    }

    const coordinates = listingData?.geometry?.coordinates;

    if (
        !Array.isArray(coordinates) ||
        coordinates.length < 2 ||
        !Number.isFinite(Number(coordinates[0])) ||
        !Number.isFinite(Number(coordinates[1]))
    ) {
        showError("Is listing ke coordinates nahi mile. Listing ko dobara location ke saath update karo.");
        return;
    }

    const longitude = Number(coordinates[0]);
    const latitude = Number(coordinates[1]);

    if (
        longitude < -180 || longitude > 180 ||
        latitude < -90 || latitude > 90
    ) {
        showError("Listing ke coordinates invalid hain.");
        return;
    }

    try {
        mapboxgl.accessToken = mapToken;

        const map = new mapboxgl.Map({
            container: mapContainer,
            style: "mapbox://styles/mapbox/streets-v12",
            center: [longitude, latitude],
            zoom: 10
        });

        map.addControl(new mapboxgl.NavigationControl(), "top-right");

        map.on("load", () => {
            new mapboxgl.Marker({ color: "red" })
                .setLngLat([longitude, latitude])
                .setPopup(
                    new mapboxgl.Popup({ offset: 25 }).setText(
                        `${listingData.title} — Exact location will be provided after booking`
                    )
                )
                .addTo(map);

            map.resize();
        });

        map.on("error", (event) => {
            console.error("Mapbox error details:", event.error);
            showError(
                "Map load nahi ho paaya. Token, network ya Mapbox access check karo."
            );
        });
    } catch (error) {
        console.error(error);
        showError("Map initialize nahi ho paaya. Console mein error check karo.");
    }
})();
