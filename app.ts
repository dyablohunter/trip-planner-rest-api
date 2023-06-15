const express = require('express');
const { Validator } = require('jsonschema');

const app = express();
app.use(express.json());
app.use(express.static('public'));

const CO2_MULTIPLIERS = {
    AIRPLANE: 144,
    BICYCLE: 0,
    BICYCLE_RENT: 0,
    BUS: 74,
    CAR: 160,
    ESCOOTER: 110,
    FERRY: 144,
    FUNICULAR: 54,
    METRO: 54,
    PUBLIC_TRANSIT: 74,
    RAIL: 14,
    SCOOTER: 75,
    SHARED_BICYCLE: 0,
    SUBWAY: 74,
    TAXI: 250,
    TRAIN: 14,
    TRAM: 54,
    WALK: 0,
};

// Validate response against JSON schema
const validateResponse = (response) => {
    const schema = {
        $schema: 'http://json-schema.org/draft-07/schema#',
        type: 'object',
        properties: {
            plan: {
                type: 'object',
                properties: {
                    from: {
                        type: 'object',
                        properties: {
                            coordinates: {
                                type: 'array',
                                items: [
                                    { type: 'number' },
                                    { type: 'number' },
                                ],
                            },
                        },
                        required: ['coordinates'],
                    },
                    to: {
                        type: 'object',
                        properties: {
                            coordinates: {
                                type: 'array',
                                items: [
                                    { type: 'number' },
                                    { type: 'number' },
                                ],
                            },
                        },
                        required: ['coordinates'],
                    },
                    itineraries: {
                        type: 'array',
                        maxItems: 5,
                        items: {
                            type: 'object',
                            properties: {
                                co2: { type: 'number' },
                                distance: { type: 'number' },
                                startTime: {
                                    type: 'string',
                                    pattern: '^\\d{4}-((0[1-9])|(1[012]))-((0[1-9])|([12]\\d)|(3[01]))T(([01]\\d)|(2[0123])):([012345]\\d):([012345]\\d)(\\.\\d+)?(Z|([\\+\\-]([01]\\d|2[0123]):[012345]\\d))$',
                                },
                                endTime: {
                                    type: 'string',
                                    pattern: '^\\d{4}-((0[1-9])|(1[012]))-((0[1-9])|([12]\\d)|(3[01]))T(([01]\\d)|(2[0123])):([012345]\\d):([012345]\\d)(\\.\\d+)?(Z|([\\+\\-]([01]\\d|2[0123]):[012345]\\d))$',
                                },
                                duration: { type: 'integer' },
                                legs: {
                                    type: 'array',
                                    items: {
                                        type: 'object',
                                        properties: {
                                            mode: { type: 'string' },
                                            routeShortName: { type: 'string' },
                                            distance: { type: 'number' },
                                            co2: { type: 'number' },
                                        },
                                        required: ['mode', 'distance', 'co2'],
                                    },
                                },
                            },
                            required: ['co2', 'distance', 'startTime', 'endTime', 'duration', 'legs'],
                        },
                    },
                },
                required: ['from', 'to', 'itineraries'],
            },
        },
        required: ['plan']
    };

    const validator = new Validator();
    const validationResult = validator.validate(response, schema);
    if (!validationResult.valid) {
        const errorMessage = validationResult.errors.map((error) => error.stack).join('\n');
        throw new Error(`Response validation error: ${errorMessage}`);
    }
};

// Handle POST request
app.post('/plan', async (req, res) => {
    try {
        const { mode, from, to } = req.body;

        // Make the request to the OpenTripPlanner2 server using fetch
        // TRIED AXIOS, TRIED NODE-FETCH, using updated node default fetch here, still can't get itineraries
        const response = await fetch(
            'https://finland-staging.trip-planner.maas.global/otp/routers/default/plan' +
            `?fromPlace=${from.latitude},${from.longitude}` +
            `&toPlace=${to.latitude},${to.longitude}` +
            '&time=8:40am' +
            '&date=06-24-2023' +
            `&mode=${mode}` +
            '&arriveBy=false' +
            '&wheelchair=false' +
            '&showIntermediateStops=true' +
            '&locale=en',
            {
                headers: {
                    'x-api-key': '2TCLEtnmLprXDMVroWbsUu8xyUJaK2MPrkaue7rm',
                },
            }
        );

        if (!response.ok) {
            throw new Error(`HTTP request failed with status ${response.status}`);
        }

        const data = await response.json();
        ////// IF I REMOVE VALIDATION IT WORKS, THERE IS SOMETHING WRONG WITH THE SCHEMA PROVIDED, NEED MORE INFO ABOUT WHAT LIBRARY TO USE, I TRIED: Joi, jsonschema, json-schema and the result is the same

        validateResponse(data);

        // Calculate total CO2 emissions //// THIS MIGHT BE DONE DIFFERENTLY BUT SINCE I CANNOT GET ITINERARIES NO MATTER WHAT I DO, I DON'T KNOW HOW TO HANDLE IT
        data.plan.itineraries.forEach((itinerary) => {
            let totalCO2 = 0;
            itinerary.legs.forEach((leg) => {
                if (leg.mode in CO2_MULTIPLIERS) {
                    totalCO2 += leg.distance * CO2_MULTIPLIERS[leg.mode];
                }
            });
            itinerary.totalCO2 = totalCO2;
        });

        res.json(data);
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
});

const port = 3000;
app.listen(port, () => {
    console.log(`Server is running on port ${port}`);
});
