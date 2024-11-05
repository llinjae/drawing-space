document.getElementById("fileInput").addEventListener("change", function (e) {
  let file = e.target.files[0];
  let reader = new FileReader();
  reader.onload = function (event) {
    let img = new Image();
    img.onload = function () {
      let canvas = document.getElementById("canvasOutput");
      let ctx = canvas.getContext("2d");
      canvas.width = img.width;
      canvas.height = img.height;
      ctx.drawImage(img, 0, 0, img.width, img.height);
      let src = cv.imread(canvas);
      let dst = new cv.Mat();
      cv.cvtColor(src, src, cv.COLOR_RGBA2GRAY, 0);
      cv.threshold(src, src, 120, 255, cv.THRESH_BINARY);
      let contours = new cv.MatVector();
      let hierarchy = new cv.Mat();
      cv.findContours(src, contours, hierarchy, cv.RETR_CCOMP, cv.CHAIN_APPROX_SIMPLE);
      for (let i = 0; i < contours.size(); ++i) {
        let cnt = contours.get(i);
        let approx = new cv.Mat();
        cv.approxPolyDP(cnt, approx, 0.02 * cv.arcLength(cnt, true), true);
        if (approx.rows == 4) {
          let rect = cv.boundingRect(approx);
          cv.rectangle(
            dst,
            new cv.Point(rect.x, rect.y),
            new cv.Point(rect.x + rect.width, rect.y + rect.height),
            [255, 0, 0, 255],
            2
          );
        }
        approx.delete();
        cnt.delete();
      }
      cv.imshow("canvasOutput", dst);
      src.delete();
      dst.delete();
      contours.delete();
      hierarchy.delete();
    };
    img.src = event.target.result;
  };
  reader.readAsDataURL(file);
});
