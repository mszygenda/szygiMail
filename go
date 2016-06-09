#!/bin/bash
TEST_ENV=$1

if [ "$TEST_ENV" = '' ]; then
    TEST_ENV=int
fi

npm install
echo "Enter your password (to get it running on port 80)"
sudo echo "Running on port 80. Add entries to /etc/hosts for easier access"
echo "http://localhost/email.html"
echo "http://localhost/mobile.html"
echo
echo "Mock will run against '$TEST_ENV' environment"
echo
sudo PORT=80 TEST_ENV=$TEST_ENV DEBUG=mock-messages:* npm start


