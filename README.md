# NC_NEWS
NC_NEWS is a backend service for a news platform

## Hosted Version Link
```bash
https://news-app-u364.onrender.com
```

## Installation

This project is run on package manager: [npm](https://www.npmjs.com).

1. Git Clone from
```bash
https://github.com/booayl/backend-project
```

2. Install Dependencies
```bash
npm install
```

3. Seed Local Database
```bash
npm run setup-dbs
```

4. To Run tests
```bash
npm test
```

5. Create the .env files for development:

At the top level of your folder, create a new file name ```.env.development```

With the content: 
```bash
PGDATABASE=nc_news_dev
```

6. Create the .env files for test:

Then, create another file name ```.env.test```

With the content: 
```bash
PGDATABASE=nc_news_test
```

## Minimum Required Versions 
Node.js ```v21.6.2```

Postgres  ```14.11```


## Usage
For all available endpoints, run endpoint for information:
```bash
https://news-app-u364.onrender.com/api
```