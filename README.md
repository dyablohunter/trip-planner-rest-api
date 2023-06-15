Trip Planner Application
License: GPL-3.0

This is a Trip Planner application built with Node.js and Express. It uses the OpenTripPlanner2 API to retrieve travel itineraries and calculates the total CO2 emissions for each itinerary based on transportation modes.

Prerequisites
Before running the application, ensure that you have the following installed:

Node.js (version 14 or higher)
NPM (Node Package Manager)
Installation
Clone the repository or download the source code:

bash
Copy code
git clone https://github.com/dyablohunter/trip-planner-rest-api.git
Navigate to the project directory:

bash
Copy code
cd trip-planner-application
Install the dependencies using NPM:

Copy code
npm install
Configuration
Before running the application, you need to configure the following settings:

OpenTripPlanner2 API Key: Obtain an API key from the OpenTripPlanner2 service. Once you have the key, open the app.ts file and replace the value of 'x-api-key' header in the POST request with your API key.
Usage
Start the application:

sql
Copy code
npm start
The application will start and listen on port 3000.

Use a REST client or HTTP client tool (e.g., cURL, Postman) to send a POST request to http://localhost:3000/plan with the following JSON payload:

json
Copy code
{
  "mode": "CAR",
  "from": {
    "latitude": 52.520008,
    "longitude": 13.404954
  },
  "to": {
    "latitude": 51.5074,
    "longitude": -0.1278
  }
}
Replace the values of latitude and longitude with the desired coordinates for the starting and ending locations.

The application will retrieve the travel itineraries from the OpenTripPlanner2 API and calculate the total CO2 emissions for each itinerary. The response will be in JSON format and will include the travel plan with CO2 emissions data.

Testing
To run the automated tests for the application, use the following command:

bash
Copy code
npm test
The tests are located in the test directory and cover the validation of the response schema and the CO2 emissions calculation.

Contributing
Contributions are welcome! If you find any issues or have suggestions for improvements, feel free to open an issue or submit a pull request.

License
This project is licensed under the GNU General Public License v3.0.