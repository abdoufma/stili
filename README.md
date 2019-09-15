# Basic Specs and functionality for a VTC service
> This is meant as a rough scaffolding for our VTC projects, this is by no means and exaustif set of features


## users:

    main:
        -fully functional map (see yassir) 
        -specify departure & destination locations (with search results)
        -calculate itinerary & price (google API) & display them 
        -send request to drivers in range
        -onDriverSelected -> accept/reject
        
    profile & settings:
        -edit profile info
        -edit settings (if any)

    history:
        -trip & drivers history (with details onClick) 


## drivers:

    driving:
        -signup with info (full name, phone number, number plate, car type, photo, email?)
        --make oneself available or not
        -show the map details (radius ...etc)
        -on incoming trip -> interface with trip/user details and accept/reject options
        -onTripStarted:> start or cancel-> submit form
        -on trip ended :> get yo money & note the customer

    profile & settings:
        -edit profile info
        -edit settings (radius, car details....etc)

    history:>
        -trip & user history (with details onClick) 
        -trip stats & earnings

## crm:

    drivers:

        -list of all drivers (sort by name/date/type/activity)
        -onDriverSelected: get a view with their profile info, their trip history, rating, currecnt location, and current activity
        -Drivers CRUD

    trips:
        -list of all trips (sort by date/status)
        -onTripSelected: get a view with trip details + status

    users:
        -list of all users (sort by name/date/type/activity)
        -onUserSelected: get a view with their profile info, their trip history, rating, currecnt location, and current activity


## dashboard:
    Coming soon™
        
