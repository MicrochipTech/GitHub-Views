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

In the project folder create a file called `.env`. This file is used to configure the variables used by Docker. There is an example file called [.example.env](./.example.env) in this repo.

The complete list of variables that have to be in your `.env` file is:

- ENVIRONMENT
- MONGO_USERNAME=
- MONGO_PASSWORD=
- MONGO_DATABASE=
- ME_CONFIG_BASICAUTH_USERNAME=
- ME_CONFIG_BASICAUTH_PASSWORD=

- GH_CLIENT_ID=
- GH_CLIENT_SECRET=

- MSFT_IDENTITY_META=
- MSFT_CLIENT_ID=
- MSFT_CLIENT_SECRET=
- MSFT_REDIRECT_URL=
- MSFT_COOKIE_ENC_KEY_1=
- MSFT_COOKIE_ENC_KEY_2=
- MSFT_COOKIE_ENC_IV_1=
- MSFT_COOKIE_ENC_IV_2=

- TOKEN_ENC_KEY=
- TOKEN_SIG_KEY=

- MAIL_SERVICE=
- MAIL_AUTH_TYPE=
- MAIL_AUTH_USER=
- MAIL_AUTH_CLIENT_ID=
- MAIL_AUTH_CLIENT_SECRET=
- MAIL_AUTH_ACCESS_TOKEN=
- MAIL_AUTH_REFRESH_TOKEN=
- MAIL_AUTH_EXPIRES=
- MAIL_ADMINS=

- PUBLIC_REPO_OWNERS=
- REACT_APP_FEEDBACK_MODAL_CONTENT=

`MONGO_USERNAME`, `MONGO_PASSWORD`, `MONGO_DATABASE`, `ME_CONFIG_BASICAUTH_USERNAME`, `ME_CONFIG_BASICAUTH_PASSWORD` values you can chose freely.

## Login

### With Github

[Create a new GitHub OAuth application](https://developer.github.com/apps/building-github-apps/creating-a-github-app/). You will need the client id and the client secret associated with this GitHub OAuth application. These will be added in the `.env` file as the values of `GH_CLIENT_ID` and `GH_CLIENT_SECRET`.

### With Microsoft (@microchip.com email addresses only)

In order to create a Microsoft Azure AD application follow the instruction in [their tutorial](https://docs.microsoft.com/en-us/azure/active-directory/develop/quickstart-v2-nodejs-webapp).

`TOKEN_ENC_KEY` and `TOKEN_SIG_KEY` keys are used to protect the GitHub access tokens once saved in the database. Use the following commands to generate them:

```sh
$ openssl rand -base64 32
$ openssl rand -base64 64
```

The `PUBLIC_REPOS_OWNERS` variable is a space separated list of users and/or organizations whos repos will be visible by default to all users who used login with Microsoft options. Also those repos can be self-shared and are returned by the public repos endpoint.

`REACT_APP_FEEDBACK_MODAL_CONTENT` is a varaible for the react app (this is visible on the client code) that holds the HTML code inside the modal for the feedback button.

Install the npm dependencies and start the application.

```sh
$ cd src
$ npm i
$ cd ..
$ docker-compose up
```

## Windows+Docker: frontend is not refreshing automatically on changes

This issue can be fixed by adding a .env file in the frontend folder with the following cotent:

`CHOKIDAR_USEPOLLING=true`

Visit [http://loclahost:8000](http://loclahost:8000) and login with your GitHub account.

The tool will start collecting views data for all the repos you have access to.

## :thumbsup: Your contribution is awesome

Feel free to add features and this project and submit a PR. We will add you to the contributors list below.

[<img alt="m17336" src="https://github.com/alexmchp.png?size=40" height="40">](https://github.com/alexmchp)
[<img alt="filipgeorge" src="https://github.com/filipgeorge.png?size=40" height="40">](https://github.com/filipgeorge)
[<img alt="CristianSabiuta" src="https://github.com/CristianSabiuta.png?size=40" height="40">](https://github.com/CristianSabiuta)
