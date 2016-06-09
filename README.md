#OVERVIEW

It's a simple frontend app for ISG Email Stub.

It's able to extract IDP emails like:

OTP Notification, Password Reset, User registration, User Re-registration emails

And IDAM notification emails:

New platform administrator created, New support admin created, Inform List updated email

and present them in demo-able way :-) in a Web Browser.

There's a fake email client and fake mobile phone for that purposes.


[![Email Mock](docs/mail.png)]

[![Mobile Mock](docs/mobile.png)]

#DEPENDENCIES

It's a node application so you need to install npm and all project dependencies first.

    cd szygiMail
    npm install

#STARTING SERVER

    TEST_ENV=int PORT=80 npm start

If you're using mac or *nix system you can just execute go script (it'll install dependencies and everything)

    ./go [ENVIRONMENT]

Where `ENVIRONMENT` is 'int' or 'pr1'

#URLs

Once application starts up it's available at these addresses:

Urls:

    http://localhost/email.html <- This simulates regular Email client
    http://localhost/mobile.html <- This is mobile phone simulator which reads only OTP Notification emails

Suggested approach is to add appropriate entries to /etc/hosts

    127.0.0.1 mymail.com mobilephone.com szygimail.com szygiphone.com

#CONFIGURATION

All configurable elements sits in:

    config/int.js - for integration environment
    config/pr1.js - for pr1 environment

    module.exports = {
        idpEmailMockService: {
            url: "http://10.124.107.11:8888"
        },
        idamEmailMockService: {
            url: "http://10.124.10.93:5025"
        },
        httpClient: {
            proxy: "http://10.224.23.8:3128"
        }
    }

To access those servers http client uses HaSS HTTP proxy. Disable it if you don't need it

