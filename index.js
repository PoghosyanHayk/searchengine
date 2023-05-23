function initializationCallback() {
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
  }
}

function renderedCallback(name, query, promos, results, resultsDiv) {
  renderResults(results, query);

  return true;
}

function executeSearch() {
  var searchInput = document.getElementById("search-input").value;
  if (!searchInput) {
    var resultsContainer = document.getElementById("results-container");

    resultsContainer.innerHTML = "";
    document.getElementById("next-button").style.display = "none";
    document.getElementById("search-on-google-link").href = "";
    return false;
  }

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

function onItemClick(videoobject) {
  console.log("videoobject", videoobject);
  const overlay = document.createElement("div");
  overlay.className = "overlay";

  const footer = document.createElement("div");
  footer.className = "overlay-footer";

  const visit = document.createElement("button");
  visit.textContent = "Visit";
  visit.className = "overlay-footer-visit";

  const close = document.createElement("button");
  close.textContent = "Close";
  close.className = "overlay-footer-close";

  close.onclick = () => {
    overlay.remove();
  };

  visit.onclick = () => {
    overlay.remove();
    window.open(videoobject.url, "_blank");
  };

  footer.appendChild(visit);
  footer.appendChild(close);

  const video = document.createElement("iframe");
  video.className = "overlay-video";
  video.width = "360";
  video.height = "277";
  video.allowfullscreen = true;
  video.src = videoobject.embedurl;

  overlay.appendChild(video);
  overlay.appendChild(footer);

  document.getRootNode().body.prepend(overlay);
}

function renderResults(googleSearchResult, query) {
  const resultsContainer = document.getElementById("results-container");

  resultsContainer.innerHTML = "";

  const results = googleSearchResult
    .map(extractInfoFromResult)
    .filter(({ isMusic }) => isMusic)
    .sort((a, b) => b.views - a.views);

  if (!results.length) {
    resultsContainer.innerHTML = "No results found.";

    document.getElementById("next-button").style.display = "none";
    document.getElementById("search-on-google-link").href = "";
    return;
  }

  results.forEach(
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
      views.textContent = `${formatViewsCount(viewsCount)} views`;

      videoInfo.appendChild(source);
      videoInfo.appendChild(views);

      content.appendChild(span);
      content.appendChild(p);
      content.appendChild(videoInfo);

      resultItem.appendChild(image);
      resultItem.appendChild(content);

      resultItem.onclick = () => onItemClick(videoobject);

      console.log("resultItem", resultItem);

      resultsContainer.appendChild(resultItem);
    }
  );
  document.getElementById(
    "search-on-google-link"
  ).href = `https://www.google.com/search?client=ms-google-coop&q=${encodeURIComponent(
    query
  )}&cx=f3f74b91e59b545c9`;

  document.getElementById(
    "search-on-google-text"
  ).textContent = `Search ${query} on Google`;

  document.getElementById("next-button").style.display = "flex";

  document.getElementById("next-button").onclick = () => {
    console.log("Next button clicked");
  };
}

window.__gcse = {
  parsetags: "explicit",
  initializationCallback,
  searchCallbacks: {
    web: {
      ready: renderedCallback,
    },
  },
};
