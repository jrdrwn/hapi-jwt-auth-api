# HapiJS JWT Auth API

Auth API that I created using HapiJS and JWT

## Environment Variables

To run this project, you will need to add the following environment variables to your .env file

Run this command before change/add env

```
  cp .env.example .env
```

`MONGODB_URL` [Guide](https://www.mongodb.com/docs/manual/reference/connection-string/)

`JWT_SECRET` Example: `foo`

`HOST`

`PORT`

[READ THIS](https://github.com/bkeepers/dotenv/blob/master/README.md#what-other-env-files-can-i-use)

## Run Locally

Clone the project

```bash
  git clone https://link-to-project
```

Go to the project directory

```bash
  cd my-project
```

Install dependencies

```bash
  npm install
```

Start the server

```bash
  npm run start
```

And go to http://localhost:3000/documentation to see what you can do

## Running Tests

To run tests, run the following command

```bash
  npm run test
```

NOTE: setup environment before testing

## API Reference

go to http://localhost:3000/documentation

## Deploying to Heroku

```
  heroku create
  git push heroku main
  heroku open
```

Alternatively, you can deploy your own copy of the app using this button:

[![Deploy to Heroku](https://www.herokucdn.com/deploy/button.png)](https://heroku.com/deploy)

## License

[MIT](https://choosealicense.com/licenses/mit/)
