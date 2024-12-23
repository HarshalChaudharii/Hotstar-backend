const port = 8000;
const express = require("express");
require("dotenv").config();
const app = express();
const { PrismaClient } = require("@prisma/client");
const upload = require("./src/middelware/multer.middleware");
app.use(express.json());
const path = require("path");
const cors = require("cors");
app.use(cors());

const prisma = new PrismaClient();

app.use("/images", express.static(path.join(__dirname, "public/images")));

app.get("/upcoming", async (req, res) => {
  try {
    const response = await prisma.movie.findMany({
      where: {
        type: "upcoming",
      },
    });

    res.status(200).json({
      data: response,
    });
  } catch (error) {
    console.log(error);
  }
});
app.get("/top_rated", async (req, res) => {
  try {
    const response = await prisma.movie.findMany({
      where: {
        type: "top_rated",
      },
    });

    res.status(200).json({
      data: response,
    });
  } catch (error) {
    console.log(error);
  }
});

app.get("/action", async (req, res) => {
  try {
    const { types } = req.query;
    const typeArray = types ? types.split(",") : [];
    console.log("typeArray;", typeArray);
    const response = await prisma.movie.findMany({
      where: {
        type: {
          hasSome: typeArray,
        },
      },
    });

    res.status(200).json({
      data: response,
    });
  } catch (error) {
    console.log(error);
    res.status(500).json({ error: "Something went wrong" });
  }
});

app.get("/now_playing", async (req, res) => {
  try {
    const response = await prisma.movie.findMany({
      where: {
        type: "now_playing",
      },
    });

    res.status(200).json({
      data: response,
    });
  } catch (error) {
    console.log(error);
  }
});

app.get("/find", async (req, res) => {
  const { query } = req.query;

  try {
    const response = await prisma.movie.findMany({
      where: {
        OR: [
          {
            title: {
              contains: query, // Use "query" here
              mode: "insensitive",
            },
          },
          {
            description: {
              contains: query,
              mode: "insensitive",
            },
          },
        ],
      },
    });

    console.log(query); // Log the query value to ensure it's coming through
    res.status(200).json({
      data: response,
    });
  } catch (error) {
    console.log(error);
    res.status(500).json({ error: "Something went wrong" });
  }
});

// app.post("/upload", upload.single("poster"), (req, res) => {
//   console.log(req.file);

//   return res.status(200).json({
//     data: req.file,
//   });
// });

app.get("/get-movie/:userId", async (req, res) => {
  try {
    const { userId } = req.params;
    const searchQuery = req.query.search || "";
    const typeArray = searchQuery ? searchQuery.split(",") : [];

    const movies = await prisma.movie.findMany({
      where: {
        AND: [
          {
            userId,
          },
          {
            OR: [
              {
                title: {
                  contains: searchQuery, // Use "query" here
                  mode: "insensitive",
                },
              },
              {
                description: {
                  contains: searchQuery,
                  mode: "insensitive",
                },
              },
              {
                type: {
                  hasSome: typeArray,
                },
              },
            ],
          },
        ],
      },
    });
    console.log(userId);
    res.status(200).json({
      data: movies,
    });
  } catch (error) {
    console.log(error);
    res.status(500).json({ error: "Error updating movie" });
  }
});

app.post(
  "/upload-movie",
  upload.fields([
    { name: "poster", maxCount: 1 }, //
    { name: "backgroundImage", maxCount: 1 },
  ]),
  async (req, res) => {
    try {
      const data = {};

      // If poster image is uploaded
      if (req.files.poster) {
        data.poster = req.files.poster[0].filename;
      }

      // If background image is uploaded
      if (req.files.backgroundImage) {
        data.backgroundImage = req.files.backgroundImage[0].filename;
      }

      console.log(data.poster);
      console.log(data.backgroundImage);
      console.log(req.files);

      const {
        type,
        title,
        description,
        langauge,
        year,
        runtime,
        certification,
        popularity,
        userId,
      } = req.body;

      const cleanedType = type.replace(/[\[\]]/g, "");
      const typeArray = cleanedType.split(",").map((t) => t.trim());
      const response = await prisma.movie.create({
        data: {
          type: typeArray,
          title,
          description,
          imageUrl: data.backgroundImage,
          posterUrl: data.poster,
          langauge,
          year,
          runtime,
          certification,
          popularity,
          userId,
        },
      });
      console.log(response);
      return res.status(200).json({
        data: response,
      });
    } catch (error) {
      console.log(error);
      res.status(500).json({
        message: "An error occurred while uploading the movie",
        error: error.message,
      });
    }
  }
);

app.put(
  "/update",
  upload.fields([
    { name: "poster", maxCount: 1 }, //
    { name: "backgroundImage", maxCount: 1 },
  ]),
  async (req, res) => {
    try {
      const data = {};

      // If poster image is uploaded
      if (req.files.poster) {
        data.poster = req.files.poster[0].filename;
      }

      // If background image is uploaded
      if (req.files.backgroundImage) {
        data.backgroundImage = req.files.backgroundImage[0].filename;
      }

      console.log(data.poster);
      console.log(data.backgroundImage);
      console.log(req.files);

      const cleanedType = type.replace(/[\[\]]/g, "");
      const typeArray = cleanedType.split(",").map((t) => t.trim());

      const { id } = req.params;
      const updatedData = req.body;
      console.log("updatedData: ", updatedData);
      const updatedMovie = await prisma.movie.update({
        where: { id: id },
        data: updatedData,
      });

      res.status(200).json(updatedMovie);
    } catch (error) {
      console.log(error);
      res.status(500).json({ error: "Error updating movie" });
    }
  }
);

app.put(
  "/update-movie/:id",
  upload.fields([
    { name: "poster", maxCount: 1 }, //
    { name: "backgroundImage", maxCount: 1 },
  ]),
  async (req, res) => {
    try {
      const { id } = req.params;

      // Fetch the current movie data
      const currentMovie = await prisma.movie.findUnique({
        where: { id: id },
      });

      if (!currentMovie) {
        return res.status(404).json({ message: "Movie not found" });
      }

      const data = {};

      // If poster image is uploaded, update the poster
      if (req.files.poster) {
        data.posterUrl = req.files.poster[0].filename;
      }

      // If background image is uploaded, update the background image
      if (req.files.backgroundImage) {
        data.imageUrl = req.files.backgroundImage[0].filename;
      }

      const {
        type,
        title,
        description,
        langauge,
        year,
        runtime,
        certification,
        popularity,
        userId,
      } = req.body;

      // Clean and split type if provided, otherwise keep the old type
      if (type) {
        const cleanedType = type.replace(/[\[\]]/g, "");
        const typeArray = cleanedType.split(",").map((t) => t.trim());
        data.type = typeArray;
      }

      // Check for other fields, only update if provided, else keep the original
      data.title = title || currentMovie.title;
      data.description = description || currentMovie.description;
      data.imageUrl = data.backgroundImage || currentMovie.imageUrl; // Use updated imageUrl or retain the old one
      data.posterUrl = data.poster || currentMovie.posterUrl; // Use updated posterUrl or retain the old one
      data.langauge = langauge || currentMovie.langauge;
      data.year = year || currentMovie.year;
      data.runtime = runtime || currentMovie.runtime;
      data.certification = certification || currentMovie.certification;
      data.popularity = popularity || currentMovie.popularity;
      // data.userId = userId;

      // Update the movie with only the fields that were sent in the request
      const updatedMovie = await prisma.movie.update({
        where: { id: id },
        data: data,
      });

      return res.status(200).json({
        message: "Movie updated successfully",
        data: updatedMovie,
      });
    } catch (error) {
      console.log(error);
      res.status(500).json({
        message: "An error occurred while updating the movie",
        error: error.message,
      });
    }
  }
);

app.get("/movie-details/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const movies = await prisma.movie.findMany({
      where: { id: id },
    });

    res.status(200).json({
      data: movies,
    });
  } catch (error) {
    console.log(error);
    res.status(500).json({ error: "Error updating movie" });
  }
});

app.delete("/movie-delete/:id", async (req, res) => {
  try {
    // Destructure and log id
    const { id } = req.params;
    console.log("Received ID:", id);

    // Ensure ID is properly checked
    if (!id) {
      return res.status(400).json({ error: "Movie ID is required" });
    }

    // Fetch the movie by its ID
    const movie = await prisma.movie.findUnique({
      where: { id: id },
    });

    // If no movie is found
    if (!movie) {
      return res.status(404).json({ error: "Movie not found" });
    }

    // Proceed with deletion
    const deletedMovie = await prisma.movie.delete({
      where: { id: id },
    });

    res
      .status(200)
      .json({ message: "Movie deleted successfully", deletedMovie });
  } catch (error) {
    console.error("Error deleting movie:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});
app.post("/create-user", async (req, res) => {
  try {
    // const { name, email } = req.body;
    const name = "prajwal";
    const email = "prajwal@gmail.com";

    if (!name || !email) {
      return res.status(400).json({ message: "Name and email are required" });
    }

    // const existingUser = await prisma.user.findUnique({
    //   where: { email: email },
    // });

    // if (existingUser) {
    //   return res
    //     .status(409)
    //     .json({ message: "User with this email already exists" });
    // }

    // Create user
    const user = await prisma.user.create({
      data: {
        name: name,
        email: email,
      },
    });

    res.status(200).json({
      user: user,
    });
  } catch (error) {
    console.log(error);

    res.status(500).json({
      message: "An error occurred while creating the user",
    });
  }
});
app.listen(port, () => {
  console.log(`Server   
 listening on port http://localhost:${port}`);
});
