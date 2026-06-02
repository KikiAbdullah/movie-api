import { database, ref, get, set, remove, push } from "./firebase-config.js";

$(document).ready(function () {
  const moviesTable = $("#movies-table").DataTable({
    columns: [
      {
        data: "poster_url",
        render: function (data) {
          return `<img src="${
            data || "https://via.placeholder.com/60x90?text=No+Poster"
          }" class="poster-thumbnail" alt="Poster">`;
        },
      },
      { data: "title" },
      { data: "synopsis" },
      {
        data: null,
        render: function (data, type, row) {
          return `
                    <div class="item-actions">
                        <button class="edit-btn" data-id="${row.id}" data-type="movies"><i class="fas fa-edit"></i> Edit</button>
                        <button class="delete delete-btn" data-id="${row.id}" data-type="movies"><i class="fas fa-trash-alt"></i> Delete</button>
                    </div>
                `;
        },
      },
    ],
  });

  const seriesTable = $("#series-table").DataTable({
    columns: [
      {
        data: "poster_url",
        render: function (data) {
          return `<img src="${
            data || "https://via.placeholder.com/60x90?text=No+Poster"
          }" class="poster-thumbnail" alt="Poster">`;
        },
      },
      { data: "title" },
      { data: "synopsis" },
      {
        data: null,
        render: function (data, type, row) {
          return `
                    <div class="item-actions">
                        <button class="edit-btn" data-id="${row.id}" data-type="series"><i class="fas fa-edit"></i> Edit</button>
                        <button class="delete delete-btn" data-id="${row.id}" data-type="series"><i class="fas fa-trash-alt"></i> Delete</button>
                    </div>
                `;
        },
      },
    ],
  });

  const itemFormModal = document.getElementById("item-form-modal");
  const closeButton = document.querySelector(".close-button");
  const itemForm = document.getElementById("item-form");
  const itemIdInput = document.getElementById("item-id");
  const itemTypeSelect = document.getElementById("item-type");
  const itemTitleInput = document.getElementById("item-title");
  const itemPosterUrlInput = document.getElementById("item-poster-url");
  const itemSynopsisTextarea = document.getElementById("item-synopsis");

  const movieStreamsSection = document.getElementById("movie-streams-section");
  const movieStreamsContainer = document.getElementById(
    "movie-streams-container"
  );
  const addMovieStreamButton = document.getElementById("add-movie-stream");

  const seriesEpisodesSection = document.getElementById(
    "series-episodes-section"
  );
  const seriesEpisodesContainer = document.getElementById(
    "series-episodes-container"
  );
  const addSeriesEpisodeButton = document.getElementById("add-series-episode");

  const showMoviesButton = document.getElementById("show-movies");
  const showSeriesButton = document.getElementById("show-series");
  const addNewButton = document.getElementById("add-new");
  const cancelFormButton = document.getElementById("cancel-form");

  // Firebase references
  const moviesRef = ref(database, "movies");
  const seriesRef = ref(database, "series");

  let currentData = { movies: [], series: [] };

  // FIX: Ambil data menggunakan Object.entries agar key Firebase tidak hilang
  const fetchData = async () => {
    const moviesSnapshot = await get(moviesRef);
    currentData.movies = moviesSnapshot.val()
      ? Object.entries(moviesSnapshot.val()).map(([key, value]) => ({
          ...value,
          id: value.id || key,
        }))
      : [];

    const seriesSnapshot = await get(seriesRef);
    currentData.series = seriesSnapshot.val()
      ? Object.entries(seriesSnapshot.val()).map(([key, value]) => ({
          ...value,
          id: value.id || key,
        }))
      : [];

    // Clear dan masukkan data baru ke DataTables
    moviesTable.clear().rows.add(currentData.movies).draw();
    seriesTable.clear().rows.add(currentData.series).draw();
  };

  // Show/Hide Sections
  const showSection = (sectionId) => {
    document.querySelectorAll(".content-section").forEach((section) => {
      section.style.display = "none";
    });
    document.getElementById(sectionId).style.display = "block";
  };

  showMoviesButton.addEventListener("click", () => showSection("movie-list"));
  showSeriesButton.addEventListener("click", () => showSection("series-list"));

  addNewButton.addEventListener("click", () => {
    itemForm.reset();
    itemIdInput.value = "";
    itemTypeSelect.value = "movies";
    toggleFormSections();
    clearStreamsAndEpisodes();
    addMovieStream();
    addSeriesEpisode();
    itemFormModal.style.display = "flex";
  });

  closeButton.addEventListener("click", () => {
    itemFormModal.style.display = "none";
  });

  cancelFormButton.addEventListener("click", () => {
    itemFormModal.style.display = "none";
  });

  window.addEventListener("click", (event) => {
    if (event.target == itemFormModal) {
      itemFormModal.style.display = "none";
    }
  });

  itemTypeSelect.addEventListener("change", toggleFormSections);

  function toggleFormSections() {
    const selectedType = itemTypeSelect.value;
    if (selectedType === "movies") {
      movieStreamsSection.style.display = "block";
      seriesEpisodesSection.style.display = "none";
    } else {
      movieStreamsSection.style.display = "none";
      seriesEpisodesSection.style.display = "block";
    }
  }

  function clearStreamsAndEpisodes() {
    movieStreamsContainer.innerHTML = "";
    seriesEpisodesContainer.innerHTML = "";
  }

  addMovieStreamButton.addEventListener("click", () => addMovieStream());

  function addMovieStream(server = "", embed = "") {
    const streamDiv = document.createElement("div");
    streamDiv.classList.add("stream-entry", "movie-stream-entry");
    streamDiv.innerHTML = `
            <label>Server Name:</label>
            <input type="text" class="movie-stream-server" value="${server}">
            <label>Embed URL:</label>
            <input type="url" class="movie-stream-embed" value="${embed}">
            <button type="button" class="remove-stream"><i class="fas fa-minus-circle"></i> Remove</button>
        `;
    movieStreamsContainer.appendChild(streamDiv);
    streamDiv
      .querySelector(".remove-stream")
      .addEventListener("click", () => streamDiv.remove());
  }

  addSeriesEpisodeButton.addEventListener("click", () => addSeriesEpisode());

  function addSeriesEpisode(
    episodeData = { episode_number: "", episode_title: "", streams: [] }
  ) {
    const episodeDiv = document.createElement("div");
    episodeDiv.classList.add("episode-entry");
    episodeDiv.innerHTML = `
            <label>Episode Number:</label>
            <input type="number" class="episode-number" value="${episodeData.episode_number}">
            <label>Episode Title:</label>
            <input type="text" class="episode-title" value="${episodeData.episode_title}">
            <div class="episode-streams-container"></div>
            <button type="button" class="add-series-stream"><i class="fas fa-plus"></i> Add Stream</button>
            <button type="button" class="remove-episode"><i class="fas fa-trash-alt"></i> Remove Episode</button>
        `;
    seriesEpisodesContainer.appendChild(episodeDiv);

    const episodeStreamsContainer = episodeDiv.querySelector(
      ".episode-streams-container"
    );
    const addSeriesStreamButton =
      episodeDiv.querySelector(".add-series-stream");

    addSeriesStreamButton.addEventListener("click", () =>
      addSeriesStream(episodeStreamsContainer)
    );

    // FIX: Konversi object ke array jika data dari Firebase berbentuk object pasangan key-value
    const streams = episodeData.streams
      ? Array.isArray(episodeData.streams)
        ? episodeData.streams
        : Object.values(episodeData.streams)
      : [];

    if (streams.length > 0) {
      streams.forEach((stream) =>
        addSeriesStream(
          episodeStreamsContainer,
          stream.server_name,
          stream.embed_url
        )
      );
    } else {
      addSeriesStream(episodeStreamsContainer);
    }

    episodeDiv
      .querySelector(".remove-episode")
      .addEventListener("click", () => episodeDiv.remove());
  }

  function addSeriesStream(container, server = "", embed = "") {
    const streamDiv = document.createElement("div");
    streamDiv.classList.add("stream-entry", "series-stream-entry");
    streamDiv.innerHTML = `
            <label>Server Name:</label>
            <input type="text" class="series-stream-server" value="${server}">
            <label>Embed URL:</label>
            <input type="url" class="series-stream-embed" value="${embed}">
            <button type="button" class="remove-stream"><i class="fas fa-minus-circle"></i> Remove</button>
        `;
    container.appendChild(streamDiv);
    streamDiv
      .querySelector(".remove-stream")
      .addEventListener("click", () => streamDiv.remove());
  }

  window.editItem = (id, type) => {
    itemFormModal.style.display = "flex";
    itemForm.reset();
    itemIdInput.value = id;
    itemTypeSelect.value = type;
    toggleFormSections();
    clearStreamsAndEpisodes();

    let itemToEdit;
    if (type === "movies") {
      itemToEdit = currentData.movies.find((item) => item.id == id);
      if (itemToEdit) {
        // FIX: Antisipasi konversi array otomatis oleh Firebase
        const streams = itemToEdit.streams
          ? Array.isArray(itemToEdit.streams)
            ? itemToEdit.streams
            : Object.values(itemToEdit.streams)
          : [];
        if (streams.length > 0) {
          streams.forEach((stream) =>
            addMovieStream(stream.server_name, stream.embed_url)
          );
        } else {
          addMovieStream();
        }
      }
    } else {
      itemToEdit = currentData.series.find((item) => item.id == id);
      if (itemToEdit) {
        // FIX: Antisipasi konversi array otomatis oleh Firebase
        const episodes = itemToEdit.episodes
          ? Array.isArray(itemToEdit.episodes)
            ? itemToEdit.episodes
            : Object.values(itemToEdit.episodes)
          : [];
        if (episodes.length > 0) {
          episodes.forEach((episode) => addSeriesEpisode(episode));
        } else {
          addSeriesEpisode();
        }
      }
    }

    if (itemToEdit) {
      itemTitleInput.value = itemToEdit.title || "";
      itemPosterUrlInput.value = itemToEdit.poster_url || "";
      itemSynopsisTextarea.value = itemToEdit.synopsis || "";
    }
  };

  window.deleteItem = async (id, type) => {
    if (confirm("Are you sure you want to delete this item?")) {
      try {
        if (type === "movies") {
          await remove(ref(database, `movies/${id}`));
        } else {
          await remove(ref(database, `series/${id}`));
        }
        fetchData();
      } catch (error) {
        console.error("Error deleting item: ", error);
        alert("Failed to delete item.");
      }
    }
  };

  itemForm.addEventListener("submit", async (e) => {
    e.preventDefault();

    const type = itemTypeSelect.value;
    const id = itemIdInput.value || push(ref(database, type)).key;
    const title = itemTitleInput.value;
    const poster_url = itemPosterUrlInput.value;
    const synopsis = itemSynopsisTextarea.value;

    let itemData = {
      id: id,
      title: title,
      type: type,
      poster_url: poster_url,
      synopsis: synopsis,
    };

    if (type === "movies") {
      const streams = [];
      document
        .querySelectorAll("#movie-streams-container .movie-stream-entry")
        .forEach((streamDiv) => {
          const server_name = streamDiv.querySelector(
            ".movie-stream-server"
          ).value;
          const embed_url = streamDiv.querySelector(
            ".movie-stream-embed"
          ).value;
          if (server_name && embed_url) {
            streams.push({ server_name, embed_url });
          }
        });
      itemData.streams = streams;
      try {
        console.log("Saving movie with data:", itemData);
        await set(ref(database, `movies/${id}`), itemData);
        alert("Movie saved successfully!");
      } catch (error) {
        console.error("Error saving movie: ", error);
        alert("Failed to save movie.");
      }
    } else {
      const episodes = [];
      document
        .querySelectorAll("#series-episodes-container .episode-entry")
        .forEach((episodeDiv) => {
          const episode_number =
            episodeDiv.querySelector(".episode-number").value;
          const episode_title =
            episodeDiv.querySelector(".episode-title").value;
          const streams = [];
          episodeDiv
            .querySelectorAll(".episode-streams-container .series-stream-entry")
            .forEach((streamDiv) => {
              const server_name = streamDiv.querySelector(
                ".series-stream-server"
              ).value;
              const embed_url = streamDiv.querySelector(
                ".series-stream-embed"
              ).value;
              if (server_name && embed_url) {
                streams.push({ server_name, embed_url });
              }
            });
          if (episode_number && episode_title) {
            episodes.push({
              episode_number: parseInt(episode_number),
              episode_title,
              streams,
            });
          }
        });
      itemData.episodes = episodes;
      try {
        await set(ref(database, `series/${id}`), itemData);
        alert("Series saved successfully!");
      } catch (error) {
        console.error("Error saving series: ", error);
        alert("Failed to save series.");
      }
    }

    itemFormModal.style.display = "none";
    fetchData();
  });

  $("#movies-table, #series-table").on("click", ".edit-btn", function () {
    const id = $(this).data("id");
    const type = $(this).data("type");
    editItem(id, type);
  });

  $("#movies-table, #series-table").on("click", ".delete-btn", function () {
    const id = $(this).data("id");
    const type = $(this).data("type");
    deleteItem(id, type);
  });

  fetchData();
  toggleFormSections();
  showSection("movie-list");
});
