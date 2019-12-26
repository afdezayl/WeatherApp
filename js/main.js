(() => {
  // IMPORTS
  const { Observable, fromEvent } = rxjs;
  const { throttleTime, switchMap } = rxjs.operators;
  const { fromFetch } = rxjs.fetch;

  const currentWeather = {
    city: undefined,
    celsius: undefined,
    fahrenheit: undefined,
    icon: undefined,
    description: undefined
  };
  
  const locationBtn = document.getElementById('get_location');
  const toggleBtn = document.getElementById('toggle');
  const toggleFn = new TemperatureToggler();

  fromEvent(toggleBtn, 'click').subscribe(r => toggleFn());

  const $click = fromEvent(locationBtn, 'click')
    .pipe(
      throttleTime(1000),
      switchMap(ev => getPosition()),
      switchMap(position => getWeather(position))
    )
    .subscribe(
      weather => {        
        currentWeather.city = weather.name;
        currentWeather.celsius = weather.main.temp + ' ºC';
        currentWeather.fahrenheit =
          celsiusToFahrenheit(weather.main.temp) + ' ºF';
        currentWeather.icon = weather.weather[0].icon || '';
        currentWeather.description = weather.weather[0].main;

        showWeather();
      },
      err => console.error(err)
    );

  /**
   * Returns current position from navigator
   */
  function getPosition() {
    return Observable.create(observer => {
      window.navigator.geolocation.getCurrentPosition(
        position => {
          observer.next(position);
          observer.complete();
        },
        error => {
          alert('Location access denied!');
          observer.error = error;
        }
      );
    });
  }

  /**
   * Call API to get weather on position
   * @param {Position} position
   */
  function getWeather(position) {
    const lat = position.coords.latitude;
    const lon = position.coords.longitude;

    return fromFetch(
      `https://fcc-weather-api.glitch.me/api/current?lat=${lat}&lon=${lon}`
    ).pipe(
      switchMap(res => {
        if (res.ok) {
          return res.json();
        } else {
          return of({
            error: true,
            message: `Error ${response.status}`
          });
        }
      })
    );
  }

  function showWeather() {
    document.getElementById('weather_city').innerText = currentWeather.city;
    document.getElementById('celsius').innerText = currentWeather.celsius;
    document.getElementById('fahrenheit').innerText = currentWeather.fahrenheit;

    const iconNode = document.getElementById('icon');
    iconNode.querySelector('img').src = currentWeather.icon;
    iconNode.querySelector('figcaption').innerText = currentWeather.description;

    document.getElementById('weather_panel').style.display = 'block';
    locationBtn.style.display = 'none';
  }

  function celsiusToFahrenheit(celsius) {
    return ((celsius * 9) / 5 + 32).toFixed(2);
  }

  function TemperatureToggler() {
    let isCelsius = true;
    return () => {
      isCelsius = !isCelsius;

      document.getElementById('celsius').style.display = isCelsius
        ? 'inline'
        : 'none';
      document.getElementById('fahrenheit').style.display = isCelsius
        ? 'none'
        : 'inline';
    };
  }
})();
