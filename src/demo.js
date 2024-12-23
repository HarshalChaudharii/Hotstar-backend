const allMovies = data.map(async (item) => {
  await prisma.movie.create({
    data: {
      title: item.original_title,
      description: item.overview,
      imageUrl: item.backdrop_path,
      posterUrl: item.poster_path,
      langauge: item.original_language,
      year: item.release_date,
      genre: item.genre_ids.map(String),
      runtime: `${Math.floor(Math.random() * (max - min + 1)) + min} Min`,
      certification: "UA/16+",
      popularity: item.popularity.toString(),
      releaseDate: new Date(item.release_date),
      userId: "4aaa86ec-abe9-465c-a187-5f8ad19d57d1",
    },
  });
});

const user = await prisma.user.create({
  data: {
    name: "Prjwal",
    email: "pmandlik@gmail.com",
  },
});
