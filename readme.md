# Mikrokosmos

**Mikrokosmos** is a cosmos related user-friendly web application that provides users with a convenient way to explore and learn about astronomy-related content, including the APOD(Astronomy Picture of the Day) feature and NASA news, while also offering personalized features such as user authentication and viewing history. The term 'Microkosmos' dedicated to popular group BTS's song.

## Table of Contents
- [Getting Started](#getting-started)
  - [Prerequisites](#prerequisites)
  - [Installation](#installation)
- [Usage](#usage)
  - [Some Explanation](#some-info)
  - [Sigh Up and Log In](#signup-login)
  - [Search for a City](#search-for-a-city)
  - [How to get APOD](#get-APOD)
  - [How to get News](#get-news)
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
   git clone https://github.com/aknietmaulen/Mikrokosmos
   ```
2. Navigate to the project directory.
   ```bash
   cd Mikrokosmos
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

### Some Explanation
'Astronomy Picture of the Day' is a NASA API to get photo(or video sometimes) that was taken by NASA at that day.
**IMPORTANT**: Input date should be **from 16.06.1995 until today.**

### Sigh Up and Log In
Firstly login is required to use this app.
I recommend using username 'user' with password '123456'.

### How to get APOD
There are two ways to get APOD :
1. After login, in main page press "Let's go" button.
2. Choose APOD in navbar.

### How to get News
1. Choose News in navbar.

## Admin Page
Admin Page stores user ID, username, role, creation date, updated date of all users. Admin can add, edit and delete users.
Admin also can add items (in my case, Space Objects) to the main page.
Admin Username: 'akniet' Password: '1234567'

## Features
- APOD for today and any date from 1995.06.16 until today.
- Along with APOD title, date and explanation of the photo/video.
- TOP-10 NASA news.
- Profile for user, where user can change user data(username/password).
- Admin Page that stores all users' and items' data. 


## Technologies Used
- HTML
- CSS (Bootstrap)
- JavaScript
- Node.js (Express)
- NASA API(APOD)
- News API
