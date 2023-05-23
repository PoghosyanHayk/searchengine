const myInitCallback = function () {
  if (document.readyState == "complete") {
    google.search.cse.element.render({
      gname: "gsearch",
      div: "google-search-input",
      tag: "search",
    });
  } else {
    google.setOnLoadCallback(function () {
      google.search.cse.element.render({
        gname: "gsearch",
        div: "google-search-input",
        tag: "search",
      });
    }, true);
    // google.setOnLoadCallback(function () {
    //   google.search.cse.element.render({
    //     gname: "gsearchResults",
    //     div: "gcse-searchresults-only",
    //     tag: "gcse-searchresults-only",
    //   });
    // }, true);
  }
};
var myWebResultsRenderedCallback = function bootstrapResultsReadyCallback(
  name,
  q,
  promos,
  results,
  resultsDiv
) {
  console.log("name", name);
  console.log("q", q);
  console.log("promos", promos);
  console.log("results", results);
  console.log("resultsDiv", resultsDiv);

  renderResults({ results }, "results-container");
  return true;
};
window.__gcse = {
  parsetags: "explicit",
  initializationCallback: myInitCallback,
  searchCallbacks: {
    web: {
      ready: myWebResultsRenderedCallback,
    },
  },
};
function executeSearch() {
  var searchInput = document.getElementById("search-input").value;
  // google.search.cse.element.getAllElements().gsearch.uiOptions.enableRichSnippets = true;
  google.search.cse.element.getAllElements().gsearch.execute(searchInput);
  return false;
}

function extractInfoFromResult(result) {
  return {
    title: result?.titleNoFormatting,
    description: result?.richSnippet?.metatags?.ogDescription,
    imageUrl: result?.richSnippet?.videoobject?.thumbnailurl,
    videoobject: result?.richSnippet?.videoobject,
    isMusic: result?.richSnippet?.videoobject?.genre === "Music",
    views: result?.richSnippet?.videoobject?.interactioncount,
  };
}

function formatViewsCount(views) {
  if (views >= 1000000) {
    return (views / 1000000).toFixed(1) + "m";
  } else if (views >= 1000) {
    return (views / 1000).toFixed(1) + "k";
  } else {
    return views.toString();
  }
}

function renderResults(googleSearchResultSet, callerElementId) {
  var resultsContainer = document.getElementById(callerElementId);

  resultsContainer.innerHTML = ""; // Clear previous results
  console.log("resultsContainer", resultsContainer);

  if (googleSearchResultSet) {
    googleSearchResultSet.results
      .map(extractInfoFromResult)
      .filter(({ isMusic }) => isMusic)
      .sort((a, b) => b.views - a.views)
      .forEach(
        ({ title, description, imageUrl, videoobject, views: viewsCount }) => {
          const resultItem = document.createElement("div");
          resultItem.className = "result-item";

          const image = document.createElement("img");
          image.src = imageUrl;

          const content = document.createElement("div");
          content.className = "content";

          const span = document.createElement("span");
          span.textContent = title;
          span.className = "content-title";

          const p = document.createElement("p");
          p.textContent = description;

          const videoInfo = document.createElement("div");
          videoInfo.className = "video-info";

          const source = document.createElement("span");

          source.className = "source";
          source.textContent = new URL(videoobject.url).hostname;

          const views = document.createElement("span");
          views.className = "views";
          views.textContent = `${formatViewsCount(viewsCount)} viwes`;

          videoInfo.appendChild(source);
          videoInfo.appendChild(views);

          content.appendChild(span);
          content.appendChild(p);
          content.appendChild(videoInfo);

          resultItem.appendChild(image);
          resultItem.appendChild(content);

          console.log("resultItem", resultItem);

          // resultsContainer.appendChild(result);
          resultsContainer.appendChild(resultItem);
        }
      );
  } else {
    resultsContainer.innerHTML = "No results found.";
  }
}
