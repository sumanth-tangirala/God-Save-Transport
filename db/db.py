import pyrebase
import csv, requests, json

SEARCH_URL = "https://maps.googleapis.com/maps/api/place/textsearch/json?key={}&query={}"
#GOOGLE_KEY

bad_chars = ['<', '>', '#', '[', ']', '.', ',', '!', '@', '#', '$', '%', '^', '&', '*', '(', ')',
             '-', '_', ':', ';', '"', '/']

# set up acccess to Firebase DB
firebase_config = {
  "apiKey": "AIzaSyAQFvW9xPnMyPtNqw0dyZBTg_UyPgPhHWA",
  "authDomain": "god-save-transport-c8155.firebaseapp.com",
  "databaseURL": "https://god-save-transport-c8155.firebaseio.com/",
  "storageBucket": "god-save-transport-c8155.appspot.com"
}

def load_into_firebase(row, db):
  route = row["Route"]
  stop_name = row["Stop_Name"]

  # remove weird characters and cleanup the string
  stop_name = stop_name.replace(' / ',' ')
  stop_name = list(filter(lambda i: i not in bad_chars, stop_name))
  stop_name = ''.join(stop_name)
  stop_name = stop_name.strip()

  ### Load Route ###
  db.child("routes").child(route).push(stop_name)
  print("adding to route " + route + "   " + stop_name)

  ### Load Bus Stop ###
  # check if bus stop exists
  match = db.child("stops").child(stop_name).get().val()

  # if stop already exists, then just append to list of routes
  if match:
    db.child("stops").child(stop_name).child("routes").push(route)
    print("adding stop name " + stop_name + "with route" + route)
  # else set the new data
  else:
    query_string = "bus station " + stop_name
    url = SEARCH_URL.format(GOOGLE_KEY, query_string, "textquery")
    data = requests.get(url).json()

    # Some return bad data, just skip
    if data['status'] != 'ZERO_RESULTS':
      lat = data['results'][0]['geometry']['location']['lat']
      lng = data['results'][0]['geometry']['location']['lng']
      new_entry = {
        "easting": row["Location_Easting"],
        "northing": row["Location_Northing"],
        "lat": lat,
        "lng": lng,
      }
      db.child("stops").child(stop_name).set(new_entry)
      db.child("stops").child(stop_name).child("routes").push(route)
      print("creating stop name " + stop_name + "with route" + row["Route"])


def main():
  firebase = pyrebase.initialize_app(firebase_config)
  db = firebase.database()

  # read CSV file and load into DB
  with open('bus-sequences.csv', mode='r') as csv_file:
      csv_reader = csv.DictReader(csv_file)
      for row in csv_reader:
          # only look at one direction, not return
          if row["Run"] == "1":
            load_into_firebase(row, db)

if __name__ == "__main__":
    main()