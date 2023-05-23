function renderedCallback(name, query, promos, results, resultsDiv) {
  renderResults(results, query);

  return true;
}

function resetSearch() {
  var resultsContainer = document.getElementById("results-container");

  resultsContainer.innerHTML = "";
  hideNextButton();
  hidePagination();
  hideSearchOnGoogle();
}

function executeSearch() {
  var searchInput = document.getElementById("search-input").value;
  if (!searchInput) {
    resetSearch();
    return false;
  }
  google.search.cse.element
    .getAllElements()
    ["searchresults-only0"].execute(searchInput);
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

function formatViewsCount(views = 0) {
  if (views >= 1000000) {
    return (views / 1000000).toFixed(1) + "m";
  } else if (views >= 1000) {
    return (views / 1000).toFixed(1) + "k";
  } else {
    return views.toString();
  }
}

function onItemClick(videoobject) {
  document.getElementsByClassName("overlay")?.[0]?.remove();

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
  document.getElementsByTagName("html")[0].style.overflow = "hidden";

  close.onclick = () => {
    overlay.remove();
    document.getElementsByTagName("html")[0].style.overflow = "unset";
  };

  visit.onclick = () => {
    overlay.remove();
    window.open(videoobject.url, "_blank");
    document.getElementsByTagName("html")[0].style.overflow = "unset";
  };

  footer.appendChild(visit);
  footer.appendChild(close);

  const video = document.createElement("iframe");
  video.className = "overlay-video";
  video.setAttribute("allowfullscreen", true);
  video.src = videoobject?.embedurl;

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
    resultsContainer.innerHTML = "<center>No results found.</center>";

    hideNextButton();
    hideSearchOnGoogle();
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
      source.textContent =
        videoobject?.url && new URL(videoobject?.url)?.hostname;

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
  ).innerHTML = `Search <b>${query}</b> on Google`;

  setTimeout(() => {
    const currentPageCursor = document.getElementsByClassName(
      "gsc-cursor-page gsc-cursor-current-page"
    )[0];

    let currentPage = +(currentPageCursor?.textContent ?? "1");

    if (!currentPageCursor) {
      const cursorContainer = document.getElementsByClassName(
        "gsc-cursor-container-next"
      )[0];
      const cursorNumberedPage = document.getElementsByClassName(
        "gsc-cursor-numbered-page"
      )[0];
      if (cursorNumberedPage) {
        currentPage = +cursorNumberedPage.textContent.split(" ")[1];
      } else {
        if (cursorContainer) {
          currentPage = 1;
        }
      }
    }

    if (currentPage === 1) {
      showNextButtonAndHidePagination();
    } else {
      showPaginationAndHideNextButton();
      setPagination(currentPage);
    }
  }, 1000);
}

function onNextPageClick() {
  const currentPageCursor = document.getElementsByClassName(
    "gsc-cursor-page gsc-cursor-current-page"
  )[0];
  let currentPage = +(currentPageCursor?.textContent ?? "1");

  if (!currentPageCursor) {
    document.getElementsByClassName("gsc-cursor-container-next")[0].click();

    const cursorNumberedPage = document.getElementsByClassName(
      "gsc-cursor-numbered-page"
    )[0];

    if (cursorNumberedPage) {
      currentPage = +cursorNumberedPage.textContent.split(" ")[1];
    }
  } else {
    document
      .getElementsByClassName("gsc-cursor")[0]
      .children[currentPage]?.click();
  }
  setPagination(currentPage + 1);
}

function onPrevPageClick() {
  const currentPageCursor = document.getElementsByClassName(
    "gsc-cursor-page gsc-cursor-current-page"
  )[0];

  let currentPage = +(currentPageCursor?.textContent ?? "1");

  if (!currentPageCursor) {
    document.getElementsByClassName("gsc-cursor-container-previous")[0].click();

    const cursorNumberedPage = document.getElementsByClassName(
      "gsc-cursor-numbered-page"
    )[0];
    if (cursorNumberedPage) {
      currentPage = +cursorNumberedPage.textContent.split(" ")[1];
    }
  }

  if (currentPage === 2) {
    showNextButtonAndHidePagination();
  } else {
    setPagination(currentPage - 1);
  }
  document
    .getElementsByClassName("gsc-cursor")[0]
    .children[currentPage - 2].click();
}

function onSingleNextPageClick() {
  const currentPage = +(
    document.getElementsByClassName(
      "gsc-cursor-page gsc-cursor-current-page"
    )[0]?.textContent ?? "1"
  );
  if (!currentPage) {
    document.getElementsByClassName("gsc-cursor-container-next")[0].click();
  } else {
    document
      .getElementsByClassName("gsc-cursor")[0]
      .children[currentPage]?.click();
  }

  showPaginationAndHideNextButton();

  setPagination(currentPage + 1);
}

function showNextButtonAndHidePagination() {
  showNextButton();
  hidePagination();
}

function showPaginationAndHideNextButton() {
  showPagination();
  hideNextButton();
}

function showPagination() {
  document.getElementById("pagination").style.display = "flex";
}

function showNextButton() {
  document.getElementById("next-button").style.display = "flex";
}

function hideNextButton() {
  document.getElementById("next-button").style.display = "none";
}

function hidePagination() {
  document.getElementById("pagination").style.display = "none";
}

function setPagination(page) {
  document.getElementById("current-page-pagination").textContent = page;
}

function hideSearchOnGoogle() {
  document.getElementById("search-on-google-link").href = "";
}

(function init() {
  window.__gcse = {
    searchCallbacks: {
      web: {
        ready: renderedCallback,
      },
    },
  };
})();
