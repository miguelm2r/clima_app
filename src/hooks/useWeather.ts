import axios from "axios";
import { SearchType } from "../types";
import { z } from "zod";
import { useMemo, useState } from "react";

// function isWeatherResponse(weather: unknown) : weather is Weather {
//   // TYPE GUARDS O ASSERTION
//   // Comprueba que el tipo de las variables que nos envia la api es el que le asignamos el types
//   return (
//     Boolean(weather) &&
//     typeof weather === "object" &&
//     typeof (weather as Weather).name === "string" &&
//     typeof (weather as Weather).main.temp === "number" &&
//     typeof (weather as Weather).main.temp_min === "number" &&
//     typeof (weather as Weather).main.temp_max === "number"
//   );
// }

const initialState = {
  name: "",
  main: {
    temp: 0,
    temp_max: 0,
    temp_min: 0,
  },
};

// Usando zod
const Weather = z.object({
  name: z.string(),
  main: z.object({
    temp: z.number(),
    temp_max: z.number(),
    temp_min: z.number(),
  }),
});

export type Weather = z.infer<typeof Weather>;

export default function useWeather() {
  const [weather, setWeather] = useState<Weather>(initialState);

  const [loading, setLoading] = useState(false);
  const [notFound, setNotFound] = useState(false);

  // Funcion para consultar el clima con axios
  const fetchWeather = async (search: SearchType) => {
    const appId = import.meta.env.VITE_API_KEY;
    setLoading(true);
    setWeather(initialState);

    const { city, country } = search;

    try {
      setNotFound(false);
      const geoUrl = `http://api.openweathermap.org/geo/1.0/direct?q=${city},${country}&appid=${appId}`;
      //console.log(geoUrl)

      const { data } = await axios.get(geoUrl);
      //console.log(data);
      // Comprobar si existe la ciudad
      if (!data[0]) {
        setNotFound(true);
      }

      const lat = data[0].lat;
      const lon = data[0].lon;
      const weatherUrl = `https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lon}&appid=${appId}`;

      // Type Guard
      //const { data: weatherResult } = await axios(weatherUrl);
      //const result = isWeatherResponse(weatherResult);
      //console.log(result);
      //   if(result){
      //     console.log(weatherResult.name)
      //   }

      // Zod
      const { data: weatherResult } = await axios(weatherUrl);
      const result = Weather.safeParse(weatherResult);
      //console.log(result);
      if (result.success) {
        //console.log(result.data);
        setWeather(result.data);
      } else {
        console.log("Respuesta mal formada");
      }
    } catch (error) {
      console.log(error);
    } finally {
      setLoading(false);
    }
  };

  // Revisar si hay datos
  const hasWeatherData = useMemo(() => weather.name, [weather]);

  return {
    weather,
    fetchWeather,
    hasWeatherData,
    loading,
    notFound,
  };
}
