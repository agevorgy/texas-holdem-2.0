### Deploy to Heroku
1. Login to Heroku by running `heroku login`
2. Create a new Heroku application and push your application to a Git remote repository
    1. Run `heroku create project_name` 
    2. Run `git push heroku master`
3. Add mLab MongoDB to your project. In Heroku go to Resources -> Add-ons
    1. Search for mLab MongoDB and install it
    2. Choose Sandbox - Free for plan name and save
4. Copy the MONGODB_URI from Heroku to your .env file
    1. Go to Settings -> Reveal Config Vars and copy the URI from there
5. Open the heroku app by running `heroku open`. You should see `hello world!` on the website