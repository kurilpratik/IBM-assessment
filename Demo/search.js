const EventEmitter = require("events");
const API = require("./mock-api");

class Search extends EventEmitter {
  searchCount(term) {
    if (term === undefined) {
      this.emit("SEARCH_ERROR", {
        message: "INVALID_TERM",
        term: term,
      });
      return;
    }

    this.emit("SEARCH_STARTED", term);

    API.countMatches(term)
      .then((count) => {
        this.emit("SEARCH_SUCCESS", {
          count: count,
          term: term,
        });
      })
      .catch((error) => {
        this.emit("SEARCH_ERROR", {
          message: error.message,
          term: term,
        });
      });
  }
}

module.exports = Search;
