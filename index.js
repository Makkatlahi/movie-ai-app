/* 
     Insert movies into database [Supabase]
     Get the input from the user from all the form fields
     Combine them into one big string
     Create a vector embedding for that string
     Use openai to search the database for a match
*/
import { openai, supabase } from "./config.js";
import movies from "./content.js";

const submitBtn = document.getElementById("submit-form");

// calling the openai api to create vector embeddings for the input
async function insertMoviesIntoDatabase() {
  //Check if movies already exist
  const { data: existingMovies } = await supabase
    .from("movies")
    .select("title");

  if (existingMovies && existingMovies.length > 0) {
    console.log("Movies already inserted to database! Skipping insertion...");
    return;
  }

  console.log("Inserting movies...");

  for (const movie of movies) {
    //Create the embedding for each movie object
    const embedding = await openai.embeddings.create({
      model: "text-embedding-ada-002",
      input: movie.content,
    });

    const { data, error } = await supabase.from("movies").insert({
      title: movie.title,
      release_year: movie.releaseYear,
      content: movie.content,
      embedding: embedding.data[0].embedding,
    });

    if (error) {
      console.error("Error inserting movie: ", error);
    } else {
      console.log("Successfully inserted: ", movie.title);
      console.log("Inserted data:", data);
    }
  }
}

async function convertInputIntoEmbeddings(combinedQuestions) {
  const embedding = await openai.embeddings.create({
    model: "text-embedding-ada-002",
    input: combinedQuestions,
  });
  const { data, error } = await supabase.rpc("match_movies", {
    query_embedding: embedding.data[0].embedding,
    match_threshold: 0.5,
    match_count: 1,
  });

  if (error) console.error("Error finding match: ", error);
  return data;
}

submitBtn.addEventListener("click", async (e) => {
  e.preventDefault();
  const question1 = document.getElementById("question-1").value;
  const question2 = document.getElementById("question-2").value;
  const question3 = document.getElementById("question-3").value;
  const combinedQuestions = `${question1} ${question2} ${question3}`;
  const recommendation = await convertInputIntoEmbeddings(combinedQuestions);
  const form = document.getElementById("main__form");
  form.reset();
});

// insertMoviesIntoDatabase();
