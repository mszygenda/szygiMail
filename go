#!/bin/bash

npm install
echo "Enter your password (to get it running on port 80)"
sudo echo "Running on port 80. Add entries to /etc/hosts for easier access"
echo "http://localhost/email.html"
echo "http://localhost/mobile.html"
echo
echo
sudo PORT=80 DEBUG=mock-messages:* npm start
