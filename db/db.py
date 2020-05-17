import pyrebase
import csv, requests, json

SEARCH_URL = "https://maps.googleapis.com/maps/api/place/findplacefromtext/json?key={}&input={}&inputtype={}"
GOOGLE_KEY = 'AIzaSyAkUsj_AEvDVpir5aRR4eU526u9KfIF_U0'

firebase_config = {
  "apiKey": "AIzaSyAQFvW9xPnMyPtNqw0dyZBTg_UyPgPhHWA",
  "authDomain": "god-save-transport-c8155.firebaseapp.com",
  "databaseURL": "https://god-save-transport-c8155.firebaseio.com/",
  "storageBucket": "god-save-transport-c8155.appspot.com"
}

def load_route(row, db):
  route = row["Route"]
  # check if bus route exists
  match = db.child("routes").get(route)

  # if route already exists, then append to the existing list
  if match:
    db.child("routes").get(route).push(row["Stop_Name"])
  # else set the new data
  else:
    db.child("routes").child(route).set(row["Stop_Name"])

def load_stop(row, db):
  stop_name = row["Stop_Name"]
  # check if bus stop exists
  match = db.child("stops").get(stop_name)

  # if stop already exists, then just append to list of routes
  if match:
    stop = db.child("stops").get(stop_name)
    stop.child("routes").push(row["Route"])
  # else set the new data
  else:
    url = SEARCH_URL.format(GOOGLE_KEY, stop_name, "textquery")
    data = requests.get(url).json()

    lat = data['results'][0]['geometry']['location']['lat']
    lng = data['results'][0]['geometry']['location']['lng']
    data = {
      "easting": row["Location_Easting"],
      "northing": row["Location_Northing"],
      "lat": lat,
      "lng": lng,
      "routes": row["Route"]
    }
    db.child("stops").child(stop_name).set(data)

def main():
  firebase = pyrebase.initialize_app(firebase_config)
  db = firebase.database()
  # read CSV file and load into DB
  with open('bus-sequences.csv', mode='r') as csv_file:
      csv_reader = csv.DictReader(csv_file)
      for row in csv_reader:
          # only look at one direction, not return
          if row["Run"] == "1":
            load_route(row, db)
            load_stop(row, db)

if __name__ == "__main__":
    main()