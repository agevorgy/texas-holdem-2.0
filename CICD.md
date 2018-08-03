### Deploy to Heroku
1. Login to Heroku by running `heroku login`
2. Create a new Heroku application and push your application to a Git remote repository
    1. Run `heroku create` 
    2. Run `git push heroku master`
3. By default Heroku generates a random name for the project. In order to rename the project  run `git remote rename heroku new_project_name`

4. Add mLab MongoDB to your project. In Heroku go to Resources -> Add-ons
    1. Search for mLab MongoDB and install it
    2. Choose Sandbox - Free for plan name and save
5. Copy the MONGODB_URI from Heroku to your .env file
    1. Go to Settings -> Reveal Config Vars and copy the URI from there
6. Open the heroku app by running `heroku open`. You should see `hello world!` on the website