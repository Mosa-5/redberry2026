import { httpClient } from "../index";
import type { Movie } from "../types";

/** Header typeahead. Returns at most 6 matches; a blank query returns []. */
export const searchMovies = async (name:string):Promise<Movie[]>  => {
    try{
    const movies = await httpClient.get<{ data: Movie[] }>("/search", {
    params: { q: name },
  })
  
   return movies.data.data;
    } catch (error) {
        console.error("Error searching for movies:", error);
        throw error;
    }
}

// {
//   "data": [
//     {
//       "id": 23,
//       "slug": "buddy-1514026",
//       "title": "Buddy",
//       "kind": "film",
//       "runtimeMinutes": 95,
//       "posterUrl": "https://image.tmdb.org/t/p/w500/szMG36D2cIxeQ7i5zRQbq0DnNDe.jpg",
//       "backdropUrl": "https://image.tmdb.org/t/p/w1280/ytoLEl5yDaxB8AtZ52uKWjaQ9ql.jpg",
//       "releaseDate": "2026-08-27",
//       "isComingSoon": false,
//       "isNotified": false,
//       "isFeatured": false,
//       "fromPrice": 12,
//       "ageRating": {
//         "code": "16+",
//         "minAge": 16,
//         "description": "Restricted to viewers aged 16 and over. Child tickets are unavailable."
//       },
//       "genres": [
//         {
//           "id": 4,
//           "slug": "horror",
//           "name": "Horror"
//         },
//         {
//           "id": 6,
//           "slug": "comedy",
//           "name": "Comedy"
//         },
//         {
//           "id": 12,
//           "slug": "fantasy",
//           "name": "Fantasy"
//         }
//       ],
//       "formats": [
//         {
//           "id": 4,
//           "slug": "panorama",
//           "name": "PANORAMA",
//           "priceUplift": 5
//         }
//       ]
//     }
//   ]
// }