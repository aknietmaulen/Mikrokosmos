# Weather App

WeatherApp is a weather forecast application that provides current weather and timezone information of the specified city, also the additional weather facts such as humidity, wind, sunrise and sunset time, etc. It also shows the city information from Wikipedia.

## Table of Contents
- [Getting Started](#getting-started)
  - [Prerequisites](#prerequisites)
  - [Installation](#installation)
- [Usage](#usage)
  - [Sigh Up and Log In](#signup-login)
  - [Search for a City](#search-for-a-city)
- [Admin Page](#admin)
- [Features](#features)
- [Technologies Used](#technologies-used)

## Getting Started

### Prerequisites
Make sure you have the following software installed on your machine:
- [Node.js](https://nodejs.org/)
- [npm](https://www.npmjs.com/)

### Installation
1. Clone the repository to your local machine.
   ```bash
   git clone https://github.com/aknietmaulen/WeatherApp
   ```
2. Navigate to the project directory.
   ```bash
   cd WeatherApp
   ```
3. Install dependencies.
   ```bash
   npm install
   ```
4. Run code
   ```bash
   node index.js
   ```

## Usage

### Sigh Up and Log In
Firstly login is required to use this app.
I recommend using username 'sunki' with password '123'.

### Search for a City
To get weather information for a different city:
1. Enter the desired city name in the search input.
2. Click the "Get Weather" button.
3. The application will display the weather information for the specified city.

## Admin Page
Admin Page stores user ID, username and encrypted password of all users. Admin can add and delete users.
Admin Username: 'akniet' Password: '123'

## Features
- Current weather information (temperature, description, icon, date, location, time, etc.).
- City information from Wikipedia.
- Highlights such as humidity, clouds, wind, sunrise, sunset, and feels-like temperature.


## Technologies Used
- HTML
- CSS (Bootstrap)
- JavaScript
- Node.js (Express)
- OpenWeatherMap API
- TimezoneDB API
- Wikipedia API
