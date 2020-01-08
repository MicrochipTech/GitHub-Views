# GitHub Views

## :star: Features

- [x] Login With GitHub
- [x] View all time views and unique views for your repo
- [x] Share your repo views data with other users
- [x] Create aggregate line-charts of multiple repos
- [ ] Email & Password authentication
- [ ] Configurable time window for charts
- [ ] Create aggregate bar-charts of multiple repos
- [ ] Export data as CSV

## :rocket: Deployment

Get the code using the following commands:

```sh
$ git clone
$ cd
```

Create a file called `.env`. This file is used to configure the variables used by Docker. There is an example file called [.example.env](./.example.env) in this repo.

The complete list of variables that have to be in your `.env` file is:

- MONGO_USERNAME
- MONGO_PASSWORD
- MONGO_DATABASE
- ME_CONFIG_BASICAUTH_USERNAME
- ME_CONFIG_BASICAUTH_PASSWORD
- GH_CLIENT_ID
- GH_CLIENT_SECRET
- TOKEN_ENC_KEY
- TOKEN_SIG_KEY

`MONGO_USERNAME`, `MONGO_PASSWORD`, `MONGO_DATABASE`, `ME_CONFIG_BASICAUTH_USERNAME`, `ME_CONFIG_BASICAUTH_PASSWORD` are values you can chose freely.

Now [create a new GitHub OAuth application](https://developer.github.com/apps/building-github-apps/creating-a-github-app/). You will need the client id and the client secret associated with this GitHub OAuth application. These will be added in the `.env` file as the values of `GH_CLIENT_ID` and `GH_CLIENT_SECRET`.

`TOKEN_ENC_KEY` and `TOKEN_SIG_KEY` keys are used to protect the GitHub access tokens once saved in the database. Use the following commands to generate them:

```sh
$ openssl rand -base64 32
$ openssl rand -base64 64
```

```sh
$ cd
$ npm i
$ cd ..
$ docker-compose up
```

## :thumbsup: Contributions are much appreciated

[![m17336](https://github.com/m17336.png?size=40)](https://github.com/m17336)
[![filipgeorge](https://github.com/filipgeorge.png?size=40)](https://github.com/filipgeorge)
