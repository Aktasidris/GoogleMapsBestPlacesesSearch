document.addEventListener("DOMContentLoaded", function () {
  const searchButton = document.getElementById("btn-Ara");
  searchButton.addEventListener("click", searchPlaces);

  console.log("deneme");

  function searchPlaces() {
    const cityInput = document.getElementById("il_alan");
    const provinceInput = document.getElementById("ilçe_alan");
    const sectorInput = document.getElementById("Sektör_alan");

    const city = cityInput.value;
    const province = provinceInput.value;
    const sector = sectorInput.value;

    fetch(`http://localhost:3000/searchPlaces`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ city, province, sector }),
    })
      .then((response) => response.json())
      .then((data) => {
        if (data.status === "OK") {
          const places = data.results;
          places.forEach((place) => {
            createPlaceCard(place);
          });
        } else {
          console.error("API isteği başarısız oldu:", data.error_message);
        }
      })
      .catch((error) => console.error("Hata:", error));
  }

  function createPlaceCard(place) {
    const cardContainer = document.getElementById("cardContainer");

    const card = document.createElement("div");
    card.classList.add("card");

    const cardBody = document.createElement("div");
    cardBody.classList.add("card-body");

    const name = document.createElement("h5");
    name.classList.add("card-title");
    name.textContent = place.name;

    const address = document.createElement("p");
    address.classList.add("card-text");
    address.textContent = place.formatted_address;

    const rating = document.createElement("p");
    rating.classList.add("card-text");
    rating.textContent = `Rating: ${place.rating}`;

    const button = document.createElement("button");
    button.classList.add("btn", "btn-secondary");
    button.textContent = "Favorilere Ekle";
    // Favori ekleme işlemleri için event listener buraya eklenebilir

    cardBody.appendChild(name);
    cardBody.appendChild(address);
    cardBody.appendChild(rating);
    cardBody.appendChild(button);

    card.appendChild(cardBody);

    cardContainer.appendChild(card);
  }
});
