# File Change Monitor

### Never miss a feature update again

File Change Monitor detects changes in JavaScript files, notifying you when new API endpoints are added. This way, you can stay on top of latest changes across the web.

## Hosted Version

For convenience, a hosted version is available at https://filechangemonitor.io. The hosted service is free for up to 10 files and $5 a month for up to 100 files (to pay for hosting costs).

## Usage

After creating an account, you may add domains to monitor. Start by entering the base domain of a website. From here, File Change Monitor will scrape the site for JavaScript files and automatically begin monitoring files that have interesting content. File Change Monitor also checks for updates in filenames of dynamically-named files (i.e. `application-198a3ef8943.js`).

## Installation
1. Download the repository
2. Install npm modules: `npm install`
3. Install bower dependencies `bower install`
4. Start up the server: `node server.js`
5. View in browser at http://localhost:3000

## Installing MongoDB

See https://docs.mongodb.com/manual/installation/.

## Configuration

Copy `.env.example` into `.env`:

`cp .env.example .env`

Then, configure the following environment variables:

- Generate a JWT token secret and set it as the `TOKEN_SECRET` value
- Set `MONGO_URI` to the uri of your MongoDB database
- Set `SENDGRID_KEY` to your Sendgrid API key
- Configure AWS secrets (for s3 storage)
