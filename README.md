# Lead Time For Change Graph Viewer

## Overview

[Lead Time For Change Graph Viewer](https://se06-website.web.app/) is a web-app built by 2021's Team SE06 at Glasgow University.
The aim of this app is to accompany a GitHub Action that the same team created which [calculates the
lead time for change for a release](https://github.com/marketplace/actions/calculate-lead-time-for-change).

This web-app allows users to send the lead time for change calculated by the action to this web app 
and then generate a graphical representation of the lead time changing from version to version.
This provides a much more visually appealing way for users to view the data calculated by the action
instead of checking the results for each release in the release description on GitHub.

## How to use the app

If you wish to use the app follow the following steps:

### Get a token

You need to get a secret token that will allow us to confirm that the data being sent to our backend
server is in fact coming from you. To do this go to the create account page and enter your GitHub
username. You will then be provided with a token onscreen, copy this token for safe keeping.

**Note: if you wish to use the action for your organisation please use the organisations' username
when signing up**

You can share this token with all your repositories that use the action e.g. if you have two repos
using the action, johnDoe/my-repo and johnDoe/website then you can use the same token for both
repositories. Just make sure you set the token as a repository secret for both of them (shown in 
next step).

### Add token as GitHub secret

To allow our action to authenticate into the web app as you, it needs to have access to your token.
To provide it, please navigate to the settings tab of the repository you are running the action.
Then select Secrets from the options on the left-hand menu. From there you want to add a new
repository secret and give it the name "LEAD_TIME_AUTH_TOKEN" and paste the token you received
in the previous step inside the value text box.

### Providing the token as input to the action

You now need to give our action access to your token. To do this edit your main.yml file located
inside `.github/workflows` to the following:

~~~yaml
on:
    release:
        types: [created]

jobs:
    calculate_lead_time_job:
        runs-on: ubuntu-latests
        name: Calculate Lead Time For Change
        steps:
        -   name: calculate lead time for change action step
            id: lead-time
            uses: actions/lead-time-for-change-action@v1.3
            with:
                auth-token: ${{ secrets.GITHUB_TOKEN }}
                web-token: ${{ secrets.LEAD_TIME_AUTH_TOKEN }}
                calculate-previous-releases: true
                number-of-releases: 4
                
        -   name: output lead time for change
            run: echo "The lead time for change in days is ${{ steps.lead-time.outputs.lead-time-for-change }}
~~~

The line here that provides the token to our action is `web-token: ${{ secrets.LEAD_TIME_AUTH_TOKEN }}`.
This input is optional, if you do not provide it then the data will not be sent to our web app.
If you did not name the secret `LEAD_TIME_AUTH_TOKEN`, then change it to match the name you gave the token.

Now that your setup you can leave the GitHub action alone and when you create a release it will
calculate the lead time for change of that release and then send that data to the web app.

### Viewing your data

To view a graph plot of the last 5 lead times calculated by our action, go to the website and 
head to the view graph section.

You will be asked to provide your owner name (the name that you created the account with), and the name
of the repository you want to see the lead times for.

## Problems

If there are any problems please create a new issue or contact a member of the team at se06.glasgow@gmail.com