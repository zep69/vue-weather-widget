<template>
  <div class="weather-wrapper">
    <div class="widget">
      <h3>Weather</h3>
      <div v-if="weather.length === 0 && typeCard === 'weather'">
        <div class="header"  >
          <img :src="gearUrl" height="25" class="gearButton" @click="typeCard = 'settings'"/>
        </div>
        <div class="noDataBlock" >
          <img :src="infoUrl" height="50px" alt="">
          <span>Please add city</span>
        </div>
      </div>
      <div v-for="(item, index) in weather" :key="item.city" class="card" v-if="typeCard === 'weather'">
        <div class="card--row card--header">
          <span>{{ item.city }}</span>
          <img :src="gearUrl" height="25" class="gearButton" v-if="index===0 && canEdit" @click="typeCard = 'settings'"/>
        </div>
        <div class="card--center" v-if="item.weather.length > 0">
          <img :src="`https://openweathermap.org/img/wn/${item.weather[0].icon}@2x.png`" />
          <span class="card--temp">{{ item.main.temp }}°C</span>
        </div>
        <div class="card--center" v-if="item.weather.length > 0">
          <span>Feels like {{ item.main.feels_like }}°C. {{ item.weather[0].main }}, {{ item.weather[0].description }}</span>
        </div>
        <table class="card--info">
          <tbody>
            <tr>
              <td>
                <img :src="windUrl" height="15" />
                {{ item.wind.speed }} m/s
              </td>
              <td>
                <img :src="pressureUrl" height="15" />
                {{ item.main.pressure }} hPa
              </td>
            </tr>
            <tr>
              <td>Humidity: {{ item.main.humidity }}%</td>
              <td>Visibility: {{ item.visibility }} km</td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
    <div v-if="typeCard === 'settings'" class="card">
        <div class="card--row card--header">
            <span>Settings</span>
            <img :src="closeUrl" height="25px" alt="" class="closeButton" @click="typeCard = 'weather'">
        </div>
        <div 
                v-for="(item, index) in weather" 
                class="card--cities" 
                :draggable="dragIndex === index"
                @dragstart="onDragStart(index)"
                @dragover.prevent
                @drop="onDrop(index)"
                @dragend="onDragEnd"
                >
            <div class="card--cities--item">
                <img :src="birgerUrl" height="20px" alt="" class="card--cities--item--burger" @mousedown="enableDrag(index)" @mouseup="disableDrag">
                <span>{{ item.city }}, {{ item.country }}</span>
            </div>
            <div class="card--cities--delete">
                <img :src="deleteUrl" @click="deleteFromWeather(index)" height="20px" alt="">
            </div>
        </div>
        <div class="actionsSettings" v-if="weather.length > 0"> 
          <button class="actionsSettings--btn actionsSettings--btn--save" @click="saveInStorage(weather)">Save</button>
          <button class="actionsSettings--btn actionsSettings--btn--cancel">Cancel</button>
        </div>
        <div class="card--add">
            <span>Add Location:</span>
            <div class="card--add--row">
                <input type="text" v-model="newCity" @keyup.enter="getCities(newCity)"/>
                <img :src="enterUrl" height="20px" @click="getCities(newCity)" alt="">
            </div>
        </div>
        <div class="card--list">
            <div v-for="(item, index) in listSearch" class="card--list--item">
                <div class="card--list--item--row">
                    <span>{{ item.city }}, {{item.country}}<span v-if="item.state !== undefined"> , {{ item.state }} </span></span>
                </div>
                <div class="card--list--item--row">
                    <img :src="addUrl" @click="pushToWeather(index)" height="20px" alt="">
                </div>
            </div>
        </div>
        
    </div>
  </div>

</template>

<script lang="ts" setup>
import { ref, onBeforeMount, } from 'vue';
import gearUrl from '@/assets/gear-svgrepo-com.svg';
import pressureUrl from '@/assets/gauge-high-svgrepo-com.svg';
import windUrl from '@/assets/wind-svgrepo-com.svg';
import closeUrl from '@/assets/close-svgrepo-com.svg';
import birgerUrl from '@/assets/burger-menu-svgrepo-com.svg';
import deleteUrl from '@/assets/delete-2-svgrepo-com.svg';
import enterUrl from '@/assets/enter-svgrepo-com.svg';
import addUrl from '@/assets/add-ellipse-svgrepo-com.svg'
import infoUrl from '@/assets/info-svgrepo-com.svg';

type Card = 'weather' | 'settings';

const typeCard = ref<Card>('weather');
const newCity = ref<string>('')
const canEdit = ref<boolean>(true)


const dragIndex = ref<number | null>(null);
let startIndex: number | null = null

function enableDrag(index: number){
  dragIndex.value = index
}
function disableDrag(){
  dragIndex.value = null
}
function onDragStart(index: number){
  startIndex = index
}
function onDrop(dropIndex: number){
  if (startIndex === null) return

  const moved = weather.value[startIndex]
  weather.value.splice(startIndex, 1)
  weather.value.splice(dropIndex, 0, moved)

  startIndex = null
}
function onDragEnd(){
  dragIndex.value = null
  startIndex = null
}

function deleteFromWeather(index:number){
    weather.value.splice(index, 1)
}

type WeatherInfo = { main: string; description: string; icon: string };
type MainInfo = { temp: number; feels_like: number; humidity: number; pressure: number };
type WindInfo = { speed: number; deg: number; gust?: number };
type Coord = { lon: number; lat: number };
type CityWeather = {
  city: string;
  country: string;
  coord: Coord;
  weather: WeatherInfo[];
  main: MainInfo;
  visibility: number;
  wind: WindInfo;
};

type CityListSearch = {
    city : string;
    country : string;
    coord: Coord
    state: string;
}

const listSearch = ref<CityListSearch[]>([])

const weather = ref<CityWeather[]>([]);

async function saveInStorage(arr:CityWeather[]) {
  try{
    const json = JSON.stringify(arr)
    localStorage.setItem('weather', json)
    typeCard.value = 'weather'
    canEdit.value = false
  }catch(e) {
    console.error(e)
  }
}

function loadFromStorage() {
  const data = localStorage.getItem('weather')
  if (!data) return 

  try {
    weather.value =  JSON.parse(data) as CityWeather[]
  } catch (e) {
    console.error(e)
    return 
  }
}

async function getCities(city:string){
    try{
        listSearch.value = []
        const response = await fetch(`https://api.openweathermap.org/geo/1.0/direct?q=${city}&limit=5&appid=825dcc91205501c25f7a9e1bfb75bdc2`)
        if(response.ok){
            const data = await response.json()
            for(let i =0; i<data.length ; i++){
                listSearch.value.push({
                    city:String(data[i].name),
                    country: String(data[i].country),
                    coord:{
                        lat: Number(data[i].lat),
                        lon:Number(data[i].lon)
                    },
                    state:data[i].state
                })
            }
            console.log(listSearch.value)
        }else{
            alert('Error')
        }
    }catch(e){
        alert(e)
    }
}

async function pushToWeather(index:number){
    try{
        const response = await fetch(
            `https://api.openweathermap.org/data/2.5/weather?lat=${listSearch.value[index].coord.lat}&lon=${listSearch.value[index].coord.lon}&appid=825dcc91205501c25f7a9e1bfb75bdc2&units=metric`
        );
        if(response.ok){
            const data = await response.json()
            console.log(data)
            const temp : CityWeather = {
                city:String(listSearch.value[index].city),
                country:String(listSearch.value[index].country),
                coord:{
                    lat:Number(data.coord.lat),
                    lon:Number(data.coord.lon)
                },
                weather: (data.weather || []) as WeatherInfo[],
                main: {
                    temp: Number(data.main?.temp ?? 0),
                    feels_like: Number(data.main?.feels_like ?? 0),
                    humidity: Number(data.main?.humidity ?? 0),
                    pressure: Number(data.main?.pressure ?? 0)
                },
                visibility: Number(data.visibility ?? 0)/1000,
                wind: {
                    speed: Number(data.wind?.speed ?? 0),
                    deg: Number(data.wind?.deg ?? 0),
                    gust: data.wind?.gust ? Number(data.wind.gust) : undefined
                }
            }
            weather.value.push(temp)
        }
    }catch(e){
        console.log(e)
    }
}

async function getWeather(arr: CityWeather[]) {
  try {
    for (let i = 0; i < arr.length; i++) {
      const response = await fetch(
        `https://api.openweathermap.org/data/2.5/weather?lat=${arr[i].coord.lat}&lon=${arr[i].coord.lon}&appid=825dcc91205501c25f7a9e1bfb75bdc2&units=metric`
      );
      if (response.ok) {
        const data = await response.json();
        arr[i] = {
          ...arr[i],
          weather: (data.weather || []) as WeatherInfo[],
          main: {
            temp: Number(data.main?.temp ?? 0),
            feels_like: Number(data.main?.feels_like ?? 0),
            humidity: Number(data.main?.humidity ?? 0),
            pressure: Number(data.main?.pressure ?? 0)
          },
          visibility: Number(data.visibility ?? 0)/1000,
          wind: {
            speed: Number(data.wind?.speed ?? 0),
            deg: Number(data.wind?.deg ?? 0),
            gust: data.wind?.gust ? Number(data.wind.gust) : undefined
          }
        };
      } else if (response.status === 404) {
        console.warn('City not found');
      }
    }
  } catch (e) {
    console.error(e);
  }
}

onBeforeMount(async () => {
  if(localStorage.getItem('weather')) {
    loadFromStorage()
    await getWeather(weather.value);
    canEdit.value = false
  }
  
});

</script>

<style lang="scss" scoped>
.header {
    display: flex;
    justify-content: end;
    align-items: center;
  }
.noDataBlock {
    background-color: rgb(209, 209, 218);
    padding: 15px;
    display: flex;
    justify-content: center;
    align-items: center;
    margin-top: 5px;
  }
.weather-wrapper {
  font-family: Roboto, system-ui, -apple-system, sans-serif;
  .gearButton {
    cursor: pointer;
    border-radius: 50%;

    &:hover {
        background-color: rgb(194, 194, 194);
        transition: all 1s;
    }
  }
  .closeButton {
    cursor: pointer;
    border-radius: 50%;   
    &:hover {
        background-color: rgb(194, 194, 194);
        transition: all 1s;
    } 
  }
  .widget {
    padding: 12px;
    border-radius: 8px;
    width: 300px;
    
  }
  .actionsSettings {
    margin-top: 10px;
    display: flex;
    justify-content: center;
    align-items: center;
    &--btn {
      padding: 10px;
      border-radius: 10px;
      cursor: pointer;
      transition: all 0.5s;
      &--save {
        background-color: rgb(72, 72, 74);
        color: white;
        border: none;
        &:hover {
          background-color: rgb(108, 108, 112);
        }
      }
      &--cancel {
        margin-left: 5px;
        border: rgb(72, 72, 74) solid 1px;
        background: none;
        color: rgb(72, 72, 74);
        &:hover {
          background-color: rgb(209, 209, 218);
        }
      }
    }
  }
  .card {
    width: 300px;
    margin: 16px 0;
    padding: 8px;
    &--cities {
        background-color: rgb(226, 226, 226);
        display: flex;
        justify-content: space-between;
        align-items: center;
        margin-top: 15px;
        padding: 10px;
        &--item {
            display: flex;
            align-items: center;
            &--burger {
                 cursor: grab;
                user-select: none; 
                &:active {
                    cursor: grabbing;
                }
            }
        }
        &--delete {
            display: flex;
            align-items: center;
            cursor: pointer;
        }
    }
    &--add {
        margin-top: 40px;
        input {
            padding: 5px;
            width: 100%;
            margin-top: 10px;
        }
        &--row {
            display: flex;
            align-items: center;
        }
        img {
          margin-top: 10px;
          margin-left: 5px;
          cursor: pointer;
        }
    }
    &--list {
        margin-top: 10px;
        &--item {
            display: flex;
            justify-content: space-between;
            align-items: center;
            background-color: rgb(226, 226, 226);
            padding: 10px;
            margin-top: 10px;

            &--row {
                display: flex;
                align-items: center;
                img {
                  cursor: pointer;
                }
            }
        }
    }
    &--header {
      display:flex; justify-content:space-between; align-items:center;
    }
    &--center {
      display:flex; justify-content:center; align-items:center;
    }
    &--temp { font-size: 20px; margin-left: 8px; }
    &--info { width:100%; td { padding:6px; } }
  }
  //border: 3px dashed transparent;
}
</style>
