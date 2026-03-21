import requests

# login
login_obj = {
    "username": "owen@real.fake",
    "password": "password"
}

login_response = requests.post("http://localhost:3000/api/login", json = login_obj)

api_key = login_response.json()['userApiKey']

# Get notifications
notification_obj = {
    "userApiKey": api_key
}

notification_response = requests.post("http://localhost:3000/api/notifications", json = notification_obj)

print(notification_response.json())