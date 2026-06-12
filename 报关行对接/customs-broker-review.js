(function () {
  document.querySelectorAll(".review-legend-hd").forEach(function (hd) {
    var box = hd.closest(".review-legend");
    if (!box) return;
    hd.addEventListener("click", function () {
      box.classList.toggle("open");
    });
  });
})();
