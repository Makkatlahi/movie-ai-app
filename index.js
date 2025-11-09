/* 
     Get the input from the user from all the form fields
     Combine them into one big string
     Create a vector embedding for that string
     Use openai to search the database for a match
*/
import { openai, supabase } from "./config.js";
import movies from "./content.js";

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

insertMoviesIntoDatabase();
