/* 

We need to fetch the movies data, insert them into supabase, 
call the openai api and create vector embeddings for the data, 
then use openai to spit back the results requested by the user. 

*/
import { openai, supabase } from "./config.js";
import movies from "./content.js";

// main("The quick brown fox jumped over the lazy dog"); // test input

// Need to insert to supabase

// calling the openai api to create vector embeddings for the input
async function main(input) {
  const embedding = await openai.embeddings.create({
    model: "text-embedding-ada-002",
    input,
  });
  console.log(embedding.data[0].embedding);
}

// get user input
