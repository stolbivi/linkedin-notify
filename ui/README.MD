Building Docker:
`
docker build . --tag linkedin-manager-ui
heroku login
docker ps
heroku container:login
heroku container:push web --app linkedin-manager-ui
heroku container:release web --app linkedin-manager-ui
`