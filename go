#!/bin/bash

if [ "$1" = "" ]; then
  TEST_ENV=dev
else
  TEST_ENV=$1
fi

npm install
echo "Killing all existing tunnels on port 8888"
pkill -f 'ssh -L 8888:'

echo "Setting up tunnel to work against $TEST_ENV environment (it may ask for your azure password)"
tunnels/$TEST_ENV.sh

echo "Enter your system (NOT AZURE) password (to get it running on port 80)"
sudo echo "Running on port 80. Add entries to /etc/hosts for easier access"
echo "http://localhost/email.html"
echo "http://localhost/mobile.html"
echo
echo
sudo PORT=80 DEBUG=mock-messages:* npm start
