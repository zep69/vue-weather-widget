import { defineCustomElement } from 'vue';
import WeatherWidget from './components/WeatherWidget.vue';

// подключаем глобальные стили (если нужно)
// import './styles/global.scss';

const WeatherElement = defineCustomElement(WeatherWidget);

if (!customElements.get('weather-widget')) {
  customElements.define('weather-widget', WeatherElement);
}
