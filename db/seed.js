
// CREATE TABLE crew_members (
// id SERIAL PRIMARY KEY,
// name VARCHAR(255)
// );


// CREATE TABLE excursion_participants (
// id SERIAL PRIMARY KEY,
// crew_member_id INTEGER REFERENCES crew_members(id),
// excursion_id INTEGER REFERENCES excursions(id)
// );
	

// CREATE TABLE excursions(
// id SERIAL PRIMARY KEY,
// country VARCHAR(255),
// vehicle VARCHAR(255),
// occurred_on date,
// duration_hours INTEGER,
// duration_minutes INTEGER,
// purpose text
// );

const { Pool } = require("pg");

const pool = new Pool({
  connectionString: "postgres://postgres:password@127.0.0.1:5432/nasa"
});

const path = require("path");

const quotePath = path.join(__dirname, "../eva-data.csv");
const LineReader = require("line-reader");

LineReader.eachLine(quotePath, (line, last, done) => {
  const [id, country, crew, vehicle, occurred_on, duration_hours, duration_minutes, purpose] = line.replace(/\:/gi, ",").split(",");

  // build our SQL query string
  const queryString = "INSERT INTO excursions (country, vehicle, purpose) VALUES ($1, $2, $3) RETURNING id";
  const queryStringTwo = "INSERT INTO crew_members (name) VALUES ($1) RETURNING id";
  const queryStringThree = "INSERT INTO excursion_participants (excursion_id, crew_member_id) VALUES ($1, $2)";
  //execute our query
  pool
  // console.log(queryString)
  // console.log([
  //   country,
  //   vehicle,
  //   purpose
  // ]);
  pool.query(queryString, [country,vehicle,purpose])
    .then(result => {
        return pool.query(queryStringTwo, [crew]).then(crewResult => {
          return [result.rows[0][0], crewResult.rows[0][0]]
        })
    }).then(results => {
      // console.log(results)
      return pool.query(queryStringThree, results);
    }).then(() => {
      if(last) {
        return pool.end()
      }
      done();
    })
    
    .catch(error => {
      console.log(`Error: ${error}`);
      done();
    });
})
