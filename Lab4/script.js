const apiKey = "9fa6bca286bbfc9b6f264fcfa36582d9";

document.getElementById("getWeatherBtn").addEventListener("click", function() {
    const city = document.getElementById("cityInput").value.trim();
    if (!city) {
        document.getElementById("weatherResult").innerHTML = "Wprowadź nazwę miasta.";
        return;
    }
    document.getElementById("weatherResult").innerHTML = "";
    getCurrentWeather(city);
});

function getCurrentWeather(city) {
    const xhr = new XMLHttpRequest();
    const url = `https://api.openweathermap.org/data/2.5/weather?q=${encodeURIComponent(city)}&appid=${apiKey}&units=metric&lang=pl`;

    xhr.open("GET", url);
    xhr.onload = function () {
        let resultDiv = document.getElementById("weatherResult");
        if (xhr.status === 200) {
            const data = JSON.parse(xhr.responseText);
            console.log("Current weather:", JSON.parse(xhr.responseText));
            resultDiv.innerHTML = `<h2>Bieżąca pogoda</h2>
                <p><b>Miasto:</b> ${data.name}</p>
                <p><b>Temperatura:</b> ${data.main.temp}°C</p>
                <p><b>Opis:</b> ${data.weather[0].description}</p>`;
            getForecast(city);
        } else {
            let msg = "Nie udało się pobrać danych o bieżącej pogodzie.";
            try { msg = JSON.parse(xhr.responseText).message; } catch {}
            resultDiv.innerHTML = `<p>Błąd: ${msg}</p>`;
        }
    };
    xhr.onerror = function () {
        document.getElementById("weatherResult").innerHTML = "Błąd połączenia z API.";
    };
    xhr.send();
}

function getForecast(city) {
    const url = `https://api.openweathermap.org/data/2.5/forecast?q=${encodeURIComponent(city)}&appid=${apiKey}&units=metric&lang=pl`;

    fetch(url)
        .then(response => {
            if (!response.ok) throw new Error("Błąd pobierania prognozy.");
            return response.json();
        })
        .then(data => {
            console.log("Forecast:", data);
            let forecastHTML = `<h2>Prognoza (najbliższe 5 pomiarów co 3h)</h2><ul>`;
            data.list.slice(0, 5).forEach(item => {
                forecastHTML += `<li>
                    <b>${item.dt_txt}:</b>
                    ${item.main.temp}°C, ${item.weather[0].description}
                </li>`;
            });
            forecastHTML += "</ul>";
            document.getElementById("weatherResult").innerHTML += forecastHTML;
        })
        .catch(() => {
            document.getElementById("weatherResult").innerHTML += "<p>Nie udało się pobrać prognozy.</p>";
        });
}
