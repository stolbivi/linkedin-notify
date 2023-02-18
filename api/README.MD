Building Docker:
`
docker build . --tag linkedin-manager-api
heroku login
docker ps
heroku container:login
heroku container:push web --app linkedin-manager-api
heroku container:release web --app linkedin-manager-api
`

`
cd node_modules/geoip-lite && npm run-script updatedb license_key=l94LXoI7OdAt3RLl
`