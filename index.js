const express = require("express");
const path = require("path");
const { open } = require("sqlite");
const sqlite3 = require("sqlite3");

const app = express();
app.use(express.json());
const dbPath = path.join(__dirname, "cityCollection.db");

let db = null;

const initializeDBAndServer = async () => {
  try {
    db = await open({
      filename: dbPath,
      driver: sqlite3.Database,
    });
    app.listen(3000, () => {
      console.log("Server Running at http://localhost:3000/");
    });
  } catch (e) {
    console.log(`DB Error: ${e.message}`);
    process.exit(1);
  }
};
initializeDBAndServer();

//ADD City Details API 
app.post("/city/", async (request, response) => {
  const cityDetails = request.body;
  const { name, population, country, latitude, longitude } = cityDetails;
  const getCityDetails = `
 SELECT *
 FROM cityDetails
 WHERE name = '${name}';
 `;
  const dbUser = await db.get(getCityDetails);
  if (dbUser === undefined) {
    const addCityDetails = `
        INSERT INTO cityDetails(name,population,country,latitude ,longitude)
        VALUES(
            '${name}',
            ${population},
            '${country}',
            ${latitude},
            ${longitude}        

        );`;
    await db.run(addCityDetails);
    response.send("Created City Detailed Successfully..!");
  } else {
    response.status(400);
    response.send("City Details Not Exits..");
  }
});

//SINGLE CITY DETAILS API
app.get("/cities/:name/", async (request, response) => {
  const { name } = request.params;
  const getDetails =
   `
    SELECT *
    FROM cityDetails
    WHERE
     name= '${name}'
                    
     ;`;
    response.send(await db.all(getDetails));
});

//UPDATED CITY DETAILS  API

app.put("/cities/:name/", async (request, response) => {
  const { name } = request.params;

  const cityDetails = request.body;
  const { nameChange, population, country, latitude, longitude } = cityDetails;
  const updateBookQuery = `
    UPDATE
      cityDetails
    SET
      name='${nameChange}',
      population = ${population},
      country = '${country}',
      latitude = ${latitude},
      longitude = ${longitude}
     WHERE
      name ='${name}';`;
  await db.run(updateBookQuery);
  response.send("City Updated Successfully");
  console.log(nameChange);
});

//Delete API
app.delete("/cities/:name/", async (request, response) => {
  const { name } = request.params;
  deleteBookDetails = ` DELETE FROM cityDetails 
    WHERE name= '${name}'
    `;
  await db.run(deleteBookDetails);
  response.send("Delete City Details Successfully..!");
});


//QUERY CITY DETAILS API
app.get("/cities/", async (request, response) => {
  const {offset,limit ,search_q ,order,order_by } = request.query;
  const getCityQuery = `
    SELECT
      *
    FROM
     cityDetails
    WHERE
     name LIKE '%${search_q}%'
    ORDER BY ${order_by} ${order}
    LIMIT ${limit} OFFSET ${offset};`;
  const cityArray = await db.all(getCityQuery);
  response.send(cityArray);
});