# GitHub Views

## :star: Features

- [x] Login With GitHub
- [x] View all time views and unique views charts for your repos
- [x] Share your repos views data with other users
- [x] Create aggregate line-charts of multiple repos
- [x] Email & Password authentication
- [x] Export data as CSV
- [x] Configurable time window for charts
- [ ] Display commits as vertical markers (lines) on the repo chart
- [ ] Cumulative charts summing the views of multiple repos into one line chart
- [ ] Create aggregate bar-charts of multiple repos

## :rocket: Deployment

Clone this repository.

```sh
$ git clone https://github.com/MicrochipTech/GitHub-Views.git
```

In the project folder create a file called `.env`. This file is used to configure the variables used by Docker. There is an example file called [.example.env](./.example.env) in this repo.

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

`MONGO_USERNAME`, `MONGO_PASSWORD`, `MONGO_DATABASE`, `ME_CONFIG_BASICAUTH_USERNAME`, `ME_CONFIG_BASICAUTH_PASSWORD` values you can chose freely.

Now [create a new GitHub OAuth application](https://developer.github.com/apps/building-github-apps/creating-a-github-app/). You will need the client id and the client secret associated with this GitHub OAuth application. These will be added in the `.env` file as the values of `GH_CLIENT_ID` and `GH_CLIENT_SECRET`.

`TOKEN_ENC_KEY` and `TOKEN_SIG_KEY` keys are used to protect the GitHub access tokens once saved in the database. Use the following commands to generate them:

```sh
$ openssl rand -base64 32
$ openssl rand -base64 64
```

Install the npm dependencies and start the application.

```sh
$ cd src
$ npm i
$ cd ..
$ docker-compose up
```

Visit [http://loclahost:8000](http://loclahost:8000) and login with your GitHub account.

The tool will start collecting views data for all the repos you have access to.

## :thumbsup: Your contribution is awesome

Feel free to add features and this project and submit a PR. We will add you to the contributors list below.

[<img alt="m17336" src="https://github.com/alexmchp.png?size=40" height="40">](https://github.com/alexmchp)
[<img alt="filipgeorge" src="https://github.com/filipgeorge.png?size=40" height="40">](https://github.com/filipgeorge)
[<img alt="CristianSabiuta" src="https://github.com/CristianSabiuta.png?size=40" height="40">](https://github.com/CristianSabiuta)
